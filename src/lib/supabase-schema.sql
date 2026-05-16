-- ============================================================
-- Coolie Mitr — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ── 1. PROFILES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role            TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'coolie', 'admin')),
  name            TEXT NOT NULL,
  avatar          TEXT NOT NULL DEFAULT '👤',
  contact         TEXT,
  station         TEXT,
  badge           TEXT,
  coolie_status   TEXT CHECK (coolie_status IN ('pending', 'active', 'rejected')),
  available       BOOLEAN NOT NULL DEFAULT false,
  wallet_balance  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  escrow_balance  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  earnings        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tier            TEXT DEFAULT 'Yatri',
  documents       TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 2. BOOKINGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  passenger_id        TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passenger_name      TEXT NOT NULL,
  passenger_avatar    TEXT NOT NULL DEFAULT '👤',
  train_number        TEXT NOT NULL,
  train_name          TEXT NOT NULL,
  arrival_station     TEXT NOT NULL,
  departure_station   TEXT NOT NULL,
  platform            TEXT NOT NULL,
  bogie               TEXT NOT NULL,
  luggage_count       INTEGER NOT NULL CHECK (luggage_count > 0),
  service_mode        TEXT NOT NULL CHECK (service_mode IN ('platform', 'bogie')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  otp                 TEXT NOT NULL,
  fare                NUMERIC(10, 2) NOT NULL,
  assigned_coolie_id  TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  luggage_photo_url   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Realtime on bookings
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- ── 3. TRANSACTIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trip_id         TEXT NOT NULL,
  booking_id      TEXT REFERENCES public.bookings(id) ON DELETE SET NULL,
  passenger_id    TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  coolie_id       TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  passenger_name  TEXT NOT NULL,
  coolie_name     TEXT,
  total           NUMERIC(10, 2) NOT NULL,
  admin_share     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  coolie_share    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  type            TEXT NOT NULL CHECK (type IN ('escrow', 'release', 'refund', 'topup')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime on transactions
ALTER TABLE public.transactions REPLICA IDENTITY FULL;

-- ── 4. SOS ALERTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  coolie_id   TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coolie_name TEXT NOT NULL,
  station     TEXT NOT NULL,
  resolved    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Realtime on sos_alerts
ALTER TABLE public.sos_alerts REPLICA IDENTITY FULL;

-- ── 5. STORAGE BUCKETS ─────────────────────────────────────
-- Run these separately in the Supabase Storage UI or via the API:

INSERT INTO storage.buckets (id, name, public)
VALUES ('luggage-photos', 'luggage-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-docs', 'onboarding-docs', false)
ON CONFLICT (id) DO NOTHING;

-- ── 6. STORAGE POLICIES ────────────────────────────────────

-- luggage-photos: anyone can read, anyone can upload (anon)
CREATE POLICY "luggage photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'luggage-photos');

CREATE POLICY "luggage photos anon upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'luggage-photos');

CREATE POLICY "luggage photos anon delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'luggage-photos');

-- onboarding-docs: admin/anon can upload, not publicly readable
CREATE POLICY "onboarding docs anon upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'onboarding-docs');

CREATE POLICY "onboarding docs anon read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'onboarding-docs');

-- ── 7. ROW LEVEL SECURITY ──────────────────────────────────
-- For this app we use anon key with open policies (no auth yet).
-- All tables: allow full anon access.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access profiles"   ON public.profiles   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access bookings"   ON public.bookings   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access txns"       ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access sos"        ON public.sos_alerts FOR ALL USING (true) WITH CHECK (true);

-- ── 8. ENABLE REALTIME IN SUPABASE DASHBOARD ───────────────
-- Go to Database > Replication > supabase_realtime publication
-- and add tables: bookings, transactions, sos_alerts
-- OR run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;

-- ── 9. SEED DATA (optional demo) ───────────────────────────
INSERT INTO public.profiles (id, role, name, avatar, contact, station, badge, coolie_status, available, wallet_balance, escrow_balance, earnings, tier, documents)
VALUES
  ('passenger-priya', 'passenger', 'Priya Verma',  '👩🏽‍💼', NULL, NULL, NULL, NULL, false, 2500, 0, 0, 'Platinum Yatri', '{}'),
  ('admin-main',      'admin',     'Station Master','🛡️',    NULL, NULL, NULL, NULL, false, 8420, 0, 0, 'Admin', '{}'),
  ('coolie-c1', 'coolie', 'Ramesh Kumar', '🧔🏽', '+91 98765 43210', 'New Delhi (NDLS)',    'NDLS-0421', 'active',  true,  1240, 0, 1240, NULL, ARRAY['aadhaar.pdf','police-verify.pdf']),
  ('coolie-c2', 'coolie', 'Suresh Yadav', '👨🏽‍🦱', '+91 98123 11122', 'New Delhi (NDLS)',    'NDLS-0518', 'active',  true,  980,  0, 980,  NULL, ARRAY['aadhaar.pdf']),
  ('coolie-c3', 'coolie', 'Manoj Singh',  '🧑🏽',   '+91 99887 76655', 'New Delhi (NDLS)',    'NDLS-0623', 'pending', false, 0,    0, 0,    NULL, ARRAY['aadhaar.pdf','police-verify.pdf']),
  ('coolie-c4', 'coolie', 'Vikram Patel', '👨🏽',   '+91 90011 22334', 'Mumbai CST (CSMT)',  'CSMT-1102', 'active',  false, 1560, 0, 1560, NULL, ARRAY['aadhaar.pdf'])
ON CONFLICT (id) DO NOTHING;
