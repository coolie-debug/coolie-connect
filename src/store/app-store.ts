import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type Role = "passenger" | "coolie" | "admin";
export type CoolieStatus = "pending" | "active" | "rejected";
export type BookingStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

export const FARE_PER_BAG = 100;
export const ADMIN_CUT = 0.2;

export interface Coolie {
  id: string;
  name: string;
  contact: string;
  station: string;
  badge: string;
  status: CoolieStatus;
  available: boolean;
  avatar: string;
  documents: string[];
  earnings: number;
}

export interface Booking {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  trainNumber: string;
  trainName: string;
  arrivalStation: string;
  departureStation: string;
  platform: string;
  bogie: string;
  luggageCount: number;
  serviceMode: "platform" | "bogie";
  status: BookingStatus;
  assignedCoolieId?: string;
  otp: string;
  createdAt: number;
  fare: number;
  luggagePhoto?: string;
}

export interface Txn {
  id: string;
  tripId: string;
  time: number;
  total: number;
  adminShare: number;
  coolieShare: number;
  passengerName: string;
  coolieId?: string;
  coolieName?: string;
  type: "escrow" | "release" | "refund" | "topup";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));
const uid = () => Math.random().toString(36).slice(2, 9);

// Map DB row → app Booking
function rowToBooking(r: Record<string, unknown>): Booking {
  return {
    id: r.id as string,
    passengerName: r.passenger_name as string,
    passengerAvatar: r.passenger_avatar as string,
    trainNumber: r.train_number as string,
    trainName: r.train_name as string,
    arrivalStation: r.arrival_station as string,
    departureStation: r.departure_station as string,
    platform: r.platform as string,
    bogie: r.bogie as string,
    luggageCount: r.luggage_count as number,
    serviceMode: r.service_mode as "platform" | "bogie",
    status: r.status as BookingStatus,
    otp: r.otp as string,
    createdAt: new Date(r.created_at as string).getTime(),
    fare: Number(r.fare),
    assignedCoolieId: (r.assigned_coolie_id as string) ?? undefined,
    luggagePhoto: (r.luggage_photo_url as string) ?? undefined,
  };
}

// Map DB row → app Coolie
function rowToCoolie(r: Record<string, unknown>): Coolie {
  return {
    id: r.id as string,
    name: r.name as string,
    contact: (r.contact as string) ?? "",
    station: (r.station as string) ?? "",
    badge: (r.badge as string) ?? "",
    status: (r.coolie_status as CoolieStatus) ?? "pending",
    available: r.available as boolean,
    avatar: r.avatar as string,
    documents: (r.documents as string[]) ?? [],
    earnings: Number(r.earnings ?? 0),
  };
}

// Map DB row → app Txn
function rowToTxn(r: Record<string, unknown>): Txn {
  return {
    id: r.id as string,
    tripId: r.trip_id as string,
    time: new Date(r.created_at as string).getTime(),
    total: Number(r.total),
    adminShare: Number(r.admin_share),
    coolieShare: Number(r.coolie_share),
    passengerName: r.passenger_name as string,
    coolieId: (r.coolie_id as string) ?? undefined,
    coolieName: (r.coolie_name as string) ?? undefined,
    type: r.type as Txn["type"],
  };
}

// ─── Seed data (used as fallback when DB is empty) ────────────────────────────
const STATIONS = ["New Delhi (NDLS)", "Mumbai CST (CSMT)", "Howrah Junction (HWH)", "Chennai Central (MAS)", "Bengaluru City (SBC)"];

const SEED_COOLIES: Coolie[] = [
  { id: "coolie-c1", name: "Ramesh Kumar", contact: "+91 98765 43210", station: STATIONS[0], badge: "NDLS-0421", status: "active", available: true, avatar: "🧔🏽", documents: ["aadhaar.pdf", "police-verify.pdf"], earnings: 1240 },
  { id: "coolie-c2", name: "Suresh Yadav", contact: "+91 98123 11122", station: STATIONS[0], badge: "NDLS-0518", status: "active", available: true, avatar: "👨🏽‍🦱", documents: ["aadhaar.pdf"], earnings: 980 },
  { id: "coolie-c3", name: "Manoj Singh", contact: "+91 99887 76655", station: STATIONS[0], badge: "NDLS-0623", status: "pending", available: false, avatar: "🧑🏽", documents: ["aadhaar.pdf", "police-verify.pdf"], earnings: 0 },
  { id: "coolie-c4", name: "Vikram Patel", contact: "+91 90011 22334", station: STATIONS[1], badge: "CSMT-1102", status: "active", available: false, avatar: "👨🏽", documents: ["aadhaar.pdf"], earnings: 1560 },
];

// Use fixed timestamps to avoid SSR/client hydration mismatch
const BASE_TS = 1747584000000; // 2025-05-18 fixed reference
const SEED_BOOKINGS: Booking[] = [
  { id: "b1", passengerName: "Anita Sharma", passengerAvatar: "👩🏽", trainNumber: "12951", trainName: "Mumbai Rajdhani", arrivalStation: STATIONS[0], departureStation: STATIONS[1], platform: "4", bogie: "B3", luggageCount: 3, serviceMode: "bogie", status: "pending", otp: "4821", createdAt: BASE_TS - 60000, fare: 300 },
  { id: "b2", passengerName: "Rajiv Mehta", passengerAvatar: "👨🏽‍💼", trainNumber: "12181", trainName: "Dayodaya Express", arrivalStation: STATIONS[0], departureStation: STATIONS[3], platform: "7", bogie: "A1", luggageCount: 2, serviceMode: "platform", status: "pending", otp: "7193", createdAt: BASE_TS - 30000, fare: 200 },
];

// ─── Store interface ───────────────────────────────────────────────────────────
interface AppState {
  role: Role;
  currentCoolieId: string | null;
  passengerProfile: { name: string; tier: string; avatar: string; payments: string[] };
  passengerWallet: number;
  passengerEscrow: number;
  adminWallet: number;
  coolieWallets: Record<string, number>;
  transactions: Txn[];
  coolies: Coolie[];
  bookings: Booking[];
  sosAlerts: { id: string; coolieId: string; time: number }[];

  // loading / sync state
  loading: boolean;
  dbConnected: boolean;

  // init
  initFromSupabase: () => Promise<void>;

  setRole: (r: Role) => void;
  setCurrentCoolie: (id: string | null) => void;

  // Coolie management
  registerCoolie: (c: Omit<Coolie, "id" | "status" | "available" | "earnings">) => Promise<string>;
  approveCoolie: (id: string) => Promise<void>;
  rejectCoolie: (id: string) => Promise<void>;

  // Booking management
  createBooking: (b: Omit<Booking, "id" | "status" | "otp" | "createdAt" | "passengerName" | "passengerAvatar" | "fare">) => Promise<{ id: string; error?: string }>;
  assignBooking: (bookingId: string, coolieId: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  verifyOtp: (bookingId: string, otp: string) => Promise<boolean>;
  completeBooking: (id: string) => Promise<void>;

  // Wallet
  addPassengerMoney: (amount: number) => Promise<void>;

  // SOS
  triggerSOS: (coolieId: string) => Promise<void>;
  clearSOS: (id: string) => Promise<void>;

  // Realtime patch helpers (called by useRealtimeSync)
  _patchBooking: (booking: Booking) => void;
  _patchCoolie: (coolie: Coolie) => void;
  _addTransaction: (txn: Txn) => void;
  _addSOS: (alert: { id: string; coolieId: string; time: number }) => void;
  _removeSOS: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  role: "passenger",
  currentCoolieId: null,
  passengerProfile: {
    name: "Priya Verma",
    tier: "Platinum Yatri",
    avatar: "👩🏽‍💼",
    payments: ["•••• 4821 (HDFC)", "UPI: priya@okhdfc"],
  },
  passengerWallet: 2500,
  passengerEscrow: 0,
  adminWallet: 8420,
  coolieWallets: { "coolie-c1": 1240, "coolie-c2": 980, "coolie-c4": 1560 },
  transactions: [],
  coolies: SEED_COOLIES,
  bookings: SEED_BOOKINGS,
  sosAlerts: [],
  loading: false,
  dbConnected: false,

  // ── Init: load all data from Supabase ──────────────────────────────────────
  initFromSupabase: async () => {
    set({ loading: true });
    try {
      const [profilesRes, bookingsRes, txnsRes, sosRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("transactions").select("*").order("created_at", { ascending: false }),
        supabase.from("sos_alerts").select("*").eq("resolved", false).order("created_at", { ascending: false }),
      ]);

      if (profilesRes.error || bookingsRes.error || txnsRes.error || sosRes.error) {
        console.warn("Supabase load failed, using seed data", profilesRes.error ?? bookingsRes.error ?? txnsRes.error ?? sosRes.error);
        set({ loading: false, dbConnected: false });
        return;
      }

      const profiles = (profilesRes.data ?? []) as Record<string, unknown>[];
      const coolies = profiles
        .filter(p => p.role === "coolie")
        .map(rowToCoolie);

      const adminProfile = profiles.find(p => p.role === "admin");
      const passengerProfile = profiles.find(p => p.id === "passenger-priya");

      const coolieWallets: Record<string, number> = {};
      coolies.forEach(c => {
        const row = profiles.find(p => p.id === c.id);
        if (row) coolieWallets[c.id] = Number(row.wallet_balance ?? 0);
      });

      const bookings = (bookingsRes.data ?? []).map(r => rowToBooking(r as Record<string, unknown>));
      const transactions = (txnsRes.data ?? []).map(r => rowToTxn(r as Record<string, unknown>));
      const sosAlerts = (sosRes.data ?? []).map(r => ({
        id: r.id as string,
        coolieId: r.coolie_id as string,
        time: new Date(r.created_at as string).getTime(),
      }));

      set({
        coolies: coolies.length > 0 ? coolies : SEED_COOLIES,
        bookings: bookings.length > 0 ? bookings : SEED_BOOKINGS,
        transactions,
        sosAlerts,
        coolieWallets: Object.keys(coolieWallets).length > 0 ? coolieWallets : { "coolie-c1": 1240, "coolie-c2": 980, "coolie-c4": 1560 },
        adminWallet: adminProfile ? Number(adminProfile.wallet_balance ?? 8420) : 8420,
        passengerWallet: passengerProfile ? Number(passengerProfile.wallet_balance ?? 2500) : 2500,
        passengerEscrow: passengerProfile ? Number(passengerProfile.escrow_balance ?? 0) : 0,
        loading: false,
        dbConnected: true,
      });
    } catch (err) {
      console.warn("Supabase init error, using seed data:", err);
      set({ loading: false, dbConnected: false });
    }
  },

  // ── Role / Coolie selection ────────────────────────────────────────────────
  setRole: (role) => set({ role }),
  setCurrentCoolie: (id) => set({ currentCoolieId: id }),

  // ── Realtime patch helpers ─────────────────────────────────────────────────
  _patchBooking: (booking) => set((s) => {
    const idx = s.bookings.findIndex(b => b.id === booking.id);
    if (idx === -1) return { bookings: [booking, ...s.bookings] };
    const next = [...s.bookings];
    next[idx] = booking;
    return { bookings: next };
  }),
  _patchCoolie: (coolie) => set((s) => {
    const idx = s.coolies.findIndex(c => c.id === coolie.id);
    if (idx === -1) return { coolies: [...s.coolies, coolie] };
    const next = [...s.coolies];
    next[idx] = coolie;
    return { coolies: next };
  }),
  _addTransaction: (txn) => set((s) => ({ transactions: [txn, ...s.transactions] })),
  _addSOS: (alert) => set((s) => ({ sosAlerts: [alert, ...s.sosAlerts] })),
  _removeSOS: (id) => set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) })),

  // ── Register Coolie ────────────────────────────────────────────────────────
  registerCoolie: async (c) => {
    const id = uid();
    const newCoolie: Coolie = { ...c, id, status: "pending", available: false, earnings: 0 };

    // Optimistic update
    set((s) => ({
      coolies: [...s.coolies, newCoolie],
      coolieWallets: { ...s.coolieWallets, [id]: 0 },
      currentCoolieId: id,
    }));

    const { error } = await supabase.from("profiles").insert({
      id,
      role: "coolie",
      name: c.name,
      avatar: c.avatar,
      contact: c.contact,
      station: c.station,
      badge: c.badge,
      coolie_status: "pending",
      available: false,
      wallet_balance: 0,
      escrow_balance: 0,
      earnings: 0,
      documents: c.documents,
    });

    if (error) console.warn("registerCoolie DB error:", error.message);
    return id;
  },

  // ── Approve Coolie ─────────────────────────────────────────────────────────
  approveCoolie: async (id) => {
    set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "active", available: true } : c) }));
    const { error } = await supabase.from("profiles").update({ coolie_status: "active", available: true }).eq("id", id);
    if (error) console.warn("approveCoolie DB error:", error.message);
  },

  // ── Reject Coolie ──────────────────────────────────────────────────────────
  rejectCoolie: async (id) => {
    set((s) => ({ coolies: s.coolies.map(c => c.id === id ? { ...c, status: "rejected" } : c) }));
    const { error } = await supabase.from("profiles").update({ coolie_status: "rejected" }).eq("id", id);
    if (error) console.warn("rejectCoolie DB error:", error.message);
  },

  // ── Create Booking ─────────────────────────────────────────────────────────
  createBooking: async (b) => {
    const fare = b.luggageCount * FARE_PER_BAG;
    const { passengerWallet, passengerProfile } = get();

    if (passengerWallet < fare) {
      return { id: "", error: `Insufficient wallet balance. Need ₹${fare}, have ₹${passengerWallet}.` };
    }

    const id = uid();
    const otp = genOtp();
    const booking: Booking = {
      ...b,
      id,
      status: "pending",
      otp,
      createdAt: Date.now(),
      fare,
      passengerName: passengerProfile.name,
      passengerAvatar: passengerProfile.avatar,
    };

    // Optimistic update
    set((s) => ({
      bookings: [booking, ...s.bookings],
      passengerWallet: s.passengerWallet - fare,
      passengerEscrow: s.passengerEscrow + fare,
      transactions: [{
        id: uid(), tripId: id.slice(0, 4).toUpperCase(), time: Date.now(),
        total: fare, adminShare: 0, coolieShare: 0,
        passengerName: passengerProfile.name, type: "escrow",
      }, ...s.transactions],
    }));

    // Persist booking
    const { error: bErr } = await supabase.from("bookings").insert({
      id,
      passenger_id: "passenger-priya",
      passenger_name: passengerProfile.name,
      passenger_avatar: passengerProfile.avatar,
      train_number: b.trainNumber,
      train_name: b.trainName,
      arrival_station: b.arrivalStation,
      departure_station: b.departureStation,
      platform: b.platform,
      bogie: b.bogie,
      luggage_count: b.luggageCount,
      service_mode: b.serviceMode,
      status: "pending",
      otp,
      fare,
      luggage_photo_url: b.luggagePhoto ?? null,
    });

    // Persist escrow transaction
    await supabase.from("transactions").insert({
      id: uid(),
      trip_id: id.slice(0, 4).toUpperCase(),
      booking_id: id,
      passenger_id: "passenger-priya",
      passenger_name: passengerProfile.name,
      total: fare,
      admin_share: 0,
      coolie_share: 0,
      type: "escrow",
    });

    // Update passenger wallet in DB
    await supabase.from("profiles")
      .update({ wallet_balance: passengerWallet - fare, escrow_balance: get().passengerEscrow })
      .eq("id", "passenger-priya");

    if (bErr) console.warn("createBooking DB error:", bErr.message);
    return { id };
  },

  // ── Assign Booking ─────────────────────────────────────────────────────────
  assignBooking: async (bookingId, coolieId) => {
    set((s) => ({
      bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status: "assigned", assignedCoolieId: coolieId } : b),
      coolies: s.coolies.map(c => c.id === coolieId ? { ...c, available: false } : c),
    }));

    await Promise.all([
      supabase.from("bookings").update({ status: "assigned", assigned_coolie_id: coolieId }).eq("id", bookingId),
      supabase.from("profiles").update({ available: false }).eq("id", coolieId),
    ]);
  },

  // ── Cancel Booking ─────────────────────────────────────────────────────────
  cancelBooking: async (id) => {
    const { bookings, passengerProfile } = get();
    const b = bookings.find(x => x.id === id);
    if (!b || (b.status !== "pending" && b.status !== "assigned")) return;

    set((s) => ({
      bookings: s.bookings.map(x => x.id === id ? { ...x, status: "cancelled" } : x),
      passengerWallet: s.passengerWallet + b.fare,
      passengerEscrow: s.passengerEscrow - b.fare,
      transactions: [{
        id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(),
        total: b.fare, adminShare: 0, coolieShare: 0,
        passengerName: b.passengerName, type: "refund",
      }, ...s.transactions],
    }));

    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    await supabase.from("transactions").insert({
      id: uid(),
      trip_id: b.id.slice(0, 4).toUpperCase(),
      booking_id: id,
      passenger_id: "passenger-priya",
      passenger_name: passengerProfile.name,
      total: b.fare,
      admin_share: 0,
      coolie_share: 0,
      type: "refund",
    });
    await supabase.from("profiles").update({
      wallet_balance: get().passengerWallet,
      escrow_balance: get().passengerEscrow,
    }).eq("id", "passenger-priya");
  },

  // ── Verify OTP ─────────────────────────────────────────────────────────────
  verifyOtp: async (bookingId, otp) => {
    const b = get().bookings.find(x => x.id === bookingId);
    if (!b || b.otp !== otp) return false;

    set((s) => ({
      bookings: s.bookings.map(x => x.id === bookingId ? { ...x, status: "in_progress" } : x),
    }));

    await supabase.from("bookings").update({ status: "in_progress" }).eq("id", bookingId);
    await get().completeBooking(bookingId);
    return true;
  },

  // ── Complete Booking + Wallet Split ────────────────────────────────────────
  completeBooking: async (id) => {
    const s = get();
    const b = s.bookings.find(x => x.id === id);
    if (!b || !b.assignedCoolieId || b.status === "completed") return;

    const adminShare = Math.round(b.fare * ADMIN_CUT);
    const coolieShare = b.fare - adminShare;
    const coolieId = b.assignedCoolieId;
    const coolie = s.coolies.find(c => c.id === coolieId);

    set((state) => ({
      bookings: state.bookings.map(x => x.id === id ? { ...x, status: "completed" } : x),
      coolies: state.coolies.map(c => c.id === coolieId ? { ...c, available: true, earnings: c.earnings + coolieShare } : c),
      passengerEscrow: state.passengerEscrow - b.fare,
      adminWallet: state.adminWallet + adminShare,
      coolieWallets: { ...state.coolieWallets, [coolieId]: (state.coolieWallets[coolieId] || 0) + coolieShare },
      transactions: [{
        id: uid(), tripId: b.id.slice(0, 4).toUpperCase(), time: Date.now(),
        total: b.fare, adminShare, coolieShare,
        passengerName: b.passengerName, coolieId, coolieName: coolie?.name, type: "release",
      }, ...state.transactions],
    }));

    const txnId = uid();
    await Promise.all([
      supabase.from("bookings").update({ status: "completed" }).eq("id", id),
      supabase.from("profiles").update({ available: true, earnings: (coolie?.earnings ?? 0) + coolieShare, wallet_balance: (s.coolieWallets[coolieId] ?? 0) + coolieShare }).eq("id", coolieId),
      supabase.from("profiles").update({ wallet_balance: s.adminWallet + adminShare }).eq("id", "admin-main"),
      supabase.from("profiles").update({ escrow_balance: s.passengerEscrow - b.fare }).eq("id", "passenger-priya"),
      supabase.from("transactions").insert({
        id: txnId,
        trip_id: b.id.slice(0, 4).toUpperCase(),
        booking_id: id,
        passenger_id: "passenger-priya",
        coolie_id: coolieId,
        passenger_name: b.passengerName,
        coolie_name: coolie?.name ?? null,
        total: b.fare,
        admin_share: adminShare,
        coolie_share: coolieShare,
        type: "release",
      }),
    ]);
  },

  // ── Top Up Passenger Wallet ────────────────────────────────────────────────
  addPassengerMoney: async (amount) => {
    const { passengerProfile, passengerWallet } = get();
    set((s) => ({
      passengerWallet: s.passengerWallet + amount,
      transactions: [{
        id: uid(), tripId: "TOPUP", time: Date.now(),
        total: amount, adminShare: 0, coolieShare: 0,
        passengerName: passengerProfile.name, type: "topup",
      }, ...s.transactions],
    }));

    await supabase.from("profiles").update({ wallet_balance: passengerWallet + amount }).eq("id", "passenger-priya");
    await supabase.from("transactions").insert({
      id: uid(),
      trip_id: "TOPUP",
      passenger_id: "passenger-priya",
      passenger_name: passengerProfile.name,
      total: amount,
      admin_share: 0,
      coolie_share: 0,
      type: "topup",
    });
  },

  // ── SOS ───────────────────────────────────────────────────────────────────
  triggerSOS: async (coolieId) => {
    const coolie = get().coolies.find(c => c.id === coolieId);
    const id = uid();
    set((s) => ({ sosAlerts: [{ id, coolieId, time: Date.now() }, ...s.sosAlerts] }));

    const { error } = await supabase.from("sos_alerts").insert({
      id,
      coolie_id: coolieId,
      coolie_name: coolie?.name ?? "Unknown",
      station: coolie?.station ?? "Unknown",
      resolved: false,
    });
    if (error) console.warn("triggerSOS DB error:", error.message);
  },

  clearSOS: async (id) => {
    set((s) => ({ sosAlerts: s.sosAlerts.filter(a => a.id !== id) }));
    await supabase.from("sos_alerts").update({ resolved: true }).eq("id", id);
  },
}));

export const STATIONS_LIST = STATIONS;
