import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { AdminAuth } from "@/components/AdminAuth";
import { Panel } from "@/components/Panel";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { motion, AnimatePresence } from "framer-motion";
import { playNewJobChime, playAlertBeep, playCancelTone } from "@/lib/sound";
import {
  Shield, CheckCircle2, XCircle, FileText, Send, AlertOctagon,
  Activity, Users, X, Train, MapPin, Ban, TrendingUp, Image as ImageIcon,
  Phone, Sliders, Package, IndianRupee, Loader2, Zap,
} from "lucide-react";

export const Route = createFileRoute("/_app/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <AdminAuth>
      <Admin />
    </AdminAuth>
  );
}

/* ── KPI stat card ─────────────────────────────────────────────────────────── */
function KPI({ label, value, icon, danger = false, accent }: {
  label: string; value: number | string; icon: React.ReactNode; danger?: boolean; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="stat-card relative overflow-hidden"
    >
      {danger && value > 0 && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-500/60 pointer-events-none animate-pulse" />
      )}
      <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
        danger && (typeof value === "number" ? value : 0) > 0
          ? "bg-red-900/50 text-red-300"
          : "bg-gradient-gold text-maroon"
      }`}>
        {icon}
      </div>
      <div className={`font-display text-3xl font-bold ${danger && (typeof value === "number" ? value : 0) > 0 ? "text-red-300" : "text-gold"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-cream/50">{label}</div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    requested: "bg-yellow-600/30 text-yellow-200", pending: "bg-maroon/60 text-gold",
    assigned: "bg-gradient-gold text-maroon", in_progress: "bg-blue-600/30 text-blue-200",
    completed: "bg-green-700/40 text-green-200", cancelled: "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function ParcelBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-200", in_transit: "bg-blue-600/30 text-blue-200",
    delivered: "bg-green-700/40 text-green-200", cancelled: "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function Admin() {
  const {
    coolies, bookings, approveCoolie, rejectCoolie, assignBooking,
    acceptBooking, cancelBooking, sosAlerts, clearSOS,
    adminWallet, transactions, parcelBookings,
    dynamicFarePerBag, setDynamicFare,
    setCustomFare, coolieWallets,
  } = useAppStore();

  const [dispatchFor, setDispatchFor] = useState<string | null>(null);
  const [fareInput, setFareInput] = useState(String(dynamicFarePerBag));
  const [savingFare, setSavingFare] = useState(false);
  const [customQuotes, setCustomQuotes] = useState<Record<string, string>>({});
  const [savingQuote, setSavingQuote] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pending = coolies.filter(c => c.status === "pending");
  const active = coolies.filter(c => c.status === "active");
  const activeBookings = bookings.filter(b => !["completed", "cancelled"].includes(b.status));
  const requestedBookings = activeBookings.filter(b => b.status === "requested");

  const prevRequestedCount = useRef(requestedBookings.length);
  useEffect(() => {
    if (requestedBookings.length > prevRequestedCount.current) playNewJobChime();
    prevRequestedCount.current = requestedBookings.length;
  }, [requestedBookings.length]);

  const dispatchBooking = dispatchFor ? bookings.find(b => b.id === dispatchFor) : null;
  const eligibleCoolies = dispatchBooking ? active.filter(c => c.available && c.station === dispatchBooking.arrivalStation) : [];

  const handleSaveFare = async () => {
    const v = Number(fareInput);
    if (!v || v < 10) return;
    setSavingFare(true);
    await setDynamicFare(v);
    setSavingFare(false);
  };

  const handleSaveQuote = async (bookingId: string) => {
    const amount = Number(customQuotes[bookingId]);
    if (!amount || amount < 1) return;
    setSavingQuote(bookingId);
    await setCustomFare(bookingId, amount);
    setSavingQuote(null);
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    playCancelTone();
    await cancelBooking(id, "admin");
    setCancellingId(null);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    await approveCoolie(id);
    setApprovingId(null);
  };

  return (
    <div className="space-y-6">

      {/* ── SOS Alerts ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sosAlerts.map(a => {
          const c = coolies.find(x => x.id === a.coolieId);
          return (
            <motion.div key={a.id} initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border-2 border-red-500 p-4"
              style={{ background: "linear-gradient(135deg, oklch(0.3 0.15 18 / 0.9), oklch(0.22 0.12 15 / 0.95))" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at right, oklch(0.55 0.22 20 / 0.3) 0%, transparent 60%)" }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertOctagon className="h-7 w-7 text-red-300" />
                  </motion.div>
                  <div>
                    <div className="font-bold text-white text-lg">🚨 SOS — {c?.name} · {c?.badge}</div>
                    <div className="text-xs text-red-200">At {c?.station} · {new Date(a.time).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-red-200 font-mono hidden sm:block">☎ 7080809908</span>
                  <button onClick={() => { playAlertBeep(); clearSOS(a.id); }}
                    className="rounded-full bg-white/15 border border-white/25 p-2 text-white hover:bg-white/25 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Command Center Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gold/30 p-6"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 22 / 0.95), oklch(0.15 0.05 20 / 0.98))" }}
      >
        {/* Scan line overlay */}
        <div className="scan-overlay" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 50%, oklch(0.78 0.14 75 / 0.12) 0%, transparent 55%)" }} />

        <div className="relative flex items-center gap-5">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)] flex-shrink-0"
          >
            <Shield className="h-8 w-8 text-maroon" />
          </motion.div>
          <div className="flex-1">
            <div className="badge-royal mb-1 inline-flex">STATION MASTER</div>
            <h1 className="font-display text-3xl font-bold text-gold">Admin Command Center</h1>
            <p className="text-xs text-cream/50 mt-0.5">Approve coolies · Dispatch bookings · Override pricing · Monitor SOS</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-cream/50">
            <Zap className="h-3 w-3 text-gold/60 animate-pulse" />
            <span>Live System</span>
            <span className="font-mono text-gold/70 ml-2">☎ 7080809908</span>
          </div>
        </div>
      </motion.div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="glass p-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPI label="Pending Coolies"  value={pending.length}       icon={<Users className="h-5 w-5" />} />
            <KPI label="Active Coolies"   value={active.length}        icon={<CheckCircle2 className="h-5 w-5" />} />
            <KPI label="Live Bookings"    value={activeBookings.length} icon={<Activity className="h-5 w-5" />} />
            <KPI label="SOS Alerts"       value={sosAlerts.length}     icon={<AlertOctagon className="h-5 w-5" />} danger={sosAlerts.length > 0} />
          </div>
        </div>
        <WalletCard title="Platform Revenue" subtitle="20% Commission Hub" balance={adminWallet} badge="ADMIN" />
      </div>

      {/* ── Live Price Override ──────────────────────────────────────────── */}
      <Panel title="Live Price Override" icon={<Sliders className="h-5 w-5" />} glow accent="admin">
        <p className="text-sm text-cream/70 mb-5">
          Change the platform fare per bag. This instantly reflects on both Passenger and Coolie panels.
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-cream/60 mb-2 block">Fare per Bag (₹)</label>
            <div className="flex items-center gap-2 rounded-xl border border-gold/40 bg-maroon/40 px-4 py-3 focus-within:border-gold transition">
              <IndianRupee className="h-4 w-4 text-gold/60 flex-shrink-0" />
              <input
                type="number" min={10} step={10}
                value={fareInput}
                onChange={e => setFareInput(e.target.value)}
                className="w-full bg-transparent text-cream outline-none text-lg font-semibold"
              />
            </div>
          </div>
          <button onClick={handleSaveFare} disabled={savingFare || !fareInput}
            className="btn-premium h-[54px] px-6 disabled:opacity-50">
            {savingFare ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="h-4 w-4" /> Update Live</>}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon/40 px-4 py-2.5 text-xs text-cream/70">
          <Activity className="h-3.5 w-3.5 text-gold/60" />
          Current platform rate: <span className="font-bold text-gold ml-1">₹{dynamicFarePerBag}/bag</span>
          <span className="ml-auto text-[10px] text-cream/40 uppercase tracking-widest">Platform-wide</span>
        </div>
      </Panel>

      {/* ── Incoming Requests ────────────────────────────────────────────── */}
      {requestedBookings.length > 0 && (
        <Panel title="Incoming Requests — Awaiting Acceptance" icon={<AlertOctagon className="h-5 w-5" />} glow accent="admin">
          <div className="space-y-3">
            {requestedBookings.map(b => {
              const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
              const effectiveFare = b.customFare ?? b.fare;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-gold/40 bg-maroon/50 p-4 space-y-3 hover:border-gold/60 transition">
                  <div className="flex items-start gap-3">
                    {b.luggagePhoto
                      ? <img src={b.luggagePhoto} alt="luggage" className="h-16 w-16 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                      : <div className="h-16 w-16 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 text-gold/40 flex-shrink-0"><ImageIcon className="h-6 w-6" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{b.passengerAvatar}</span>
                        <span className="font-semibold text-cream">{b.passengerName}</span>
                        <StatusBadge status={b.status} />
                        <span className="rounded-full bg-gold/20 border border-gold/30 px-2 py-0.5 text-[10px] text-gold">₹{effectiveFare} {b.fareConfirmed ? "✓ Confirmed" : "est."}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cream/70">
                        <span><Train className="inline h-3 w-3 text-gold mr-0.5" />{b.trainNumber}</span>
                        <span><MapPin className="inline h-3 w-3 text-gold mr-0.5" />P{b.platform}/{b.bogie} · {b.luggageCount} bags</span>
                      </div>
                      {coolie && <div className="text-xs text-gold mt-1">Selected: {coolie.avatar} {coolie.name} ({coolie.badge})</div>}
                    </div>
                  </div>
                  {!b.fareConfirmed && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-3 py-2 focus-within:border-gold transition">
                        <IndianRupee className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
                        <input type="number" min={50} placeholder="Set final rate…"
                          value={customQuotes[b.id] ?? ""}
                          onChange={e => setCustomQuotes(q => ({ ...q, [b.id]: e.target.value }))}
                          className="w-full bg-transparent text-cream outline-none text-sm placeholder:text-cream/30" />
                      </div>
                      <button onClick={() => handleSaveQuote(b.id)} disabled={!customQuotes[b.id] || savingQuote === b.id}
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-semibold text-maroon disabled:opacity-50 glow-gold">
                        {savingQuote === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Confirm Rate
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => acceptBooking(b.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon glow-gold">
                      <Send className="h-4 w-4" /> Force Accept
                    </button>
                    <button onClick={() => setDispatchFor(b.id)}
                      className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-maroon/60 transition">Re-Assign</button>
                    <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200 hover:bg-red-900/50 transition">
                      {cancellingId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Onboarding Review ─────────────────────────────────────────── */}
        <Panel title="Onboarding Review Queue" icon={<FileText className="h-5 w-5" />} delay={0.1} accent="coolie">
          {pending.length === 0 && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400 opacity-50" />
              <p className="text-cream/50 text-sm">No pending applications.</p>
            </div>
          )}
          <div className="space-y-3">
            {pending.map(c => (
              <div key={c.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4 hover:border-gold/35 transition">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-3xl flex-shrink-0 shadow-[0_0_20px_oklch(0.78_0.14_75/0.4)]">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg text-gold">{c.name}</h4>
                      <span className="rounded-full bg-maroon/60 border border-gold/20 px-2 py-0.5 text-[10px] uppercase text-cream/70">{c.badge}</span>
                    </div>
                    <div className="text-xs text-cream/60 mt-0.5">{c.station} · {c.contact}</div>
                    {c.address && <div className="text-xs text-cream/50">{c.address}</div>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.experience != null && <span className="text-[10px] text-gold/70 rounded bg-maroon/60 border border-gold/15 px-1.5 py-0.5">{c.experience}yr exp · {c.shift ?? "day"}</span>}
                      {c.documents.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 rounded bg-maroon/60 border border-gold/15 px-1.5 py-0.5 text-[10px] text-cream/70">
                          <FileText className="h-2.5 w-2.5" />{d.split("/").pop()?.slice(0, 20)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleApprove(c.id)} disabled={approvingId === c.id}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon glow-gold">
                    {approvingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {approvingId === c.id ? "Approving…" : "Approve"}
                  </button>
                  <button onClick={() => rejectCoolie(c.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500/50 bg-red-900/40 px-4 py-2 text-sm text-red-200 hover:bg-red-900/60 transition">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── Live Booking Feed ─────────────────────────────────────────── */}
        <Panel title="Live Luggage Booking Feed" icon={<Activity className="h-5 w-5" />} delay={0.2} accent="passenger">
          {activeBookings.length === 0 && (
            <div className="py-6 text-center">
              <Activity className="mx-auto mb-2 h-8 w-8 text-gold/30" />
              <p className="text-cream/50 text-sm">No active bookings.</p>
            </div>
          )}
          <div className="space-y-3">
            {activeBookings.map(b => {
              const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
              const effectiveFare = b.customFare ?? b.fare;
              return (
                <div key={b.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4 space-y-2 hover:border-gold/35 transition">
                  <div className="flex items-start gap-3">
                    {b.luggagePhoto
                      ? <img src={b.luggagePhoto} alt="luggage" className="h-14 w-14 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                      : <div className="h-14 w-14 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 text-gold/40 flex-shrink-0"><ImageIcon className="h-5 w-5" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{b.passengerAvatar}</span>
                        <span className="font-semibold text-cream">{b.passengerName}</span>
                        <StatusBadge status={b.status} />
                        <span className="text-xs text-gold">₹{effectiveFare}{b.fareConfirmed ? " ✓" : " est."}</span>
                      </div>
                      <div className="text-xs text-cream/70 mt-0.5">
                        <Train className="inline h-3 w-3 text-gold mr-0.5" />{b.trainNumber} · P{b.platform} · {b.luggageCount}bg
                      </div>
                      {coolie && <div className="text-xs text-gold mt-0.5">↳ {coolie.avatar} {coolie.name} ({coolie.badge})</div>}
                    </div>
                  </div>
                  {!b.fareConfirmed && ["pending","requested","assigned"].includes(b.status) && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-lg border border-gold/20 bg-maroon/30 px-3 py-1.5 focus-within:border-gold transition">
                        <IndianRupee className="h-3 w-3 text-gold/50 flex-shrink-0" />
                        <input type="number" placeholder="Custom rate…" value={customQuotes[b.id] ?? ""}
                          onChange={e => setCustomQuotes(q => ({ ...q, [b.id]: e.target.value }))}
                          className="w-full bg-transparent text-cream outline-none text-xs placeholder:text-cream/30" />
                      </div>
                      <button onClick={() => handleSaveQuote(b.id)} disabled={!customQuotes[b.id] || savingQuote === b.id}
                        className="rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-bold text-maroon disabled:opacity-50 glow-gold">
                        {savingQuote === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set"}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {["pending","requested"].includes(b.status) && (
                      <button onClick={() => setDispatchFor(b.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-1.5 text-xs font-semibold text-maroon glow-gold">
                        <Send className="h-3.5 w-3.5" /> Assign Coolie
                      </button>
                    )}
                    <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-2 py-1.5 text-xs text-red-200 hover:bg-red-900/50 transition">
                      {cancellingId === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ── Active Coolies ────────────────────────────────────────────────── */}
      <Panel title="Active Coolies — God Mode" icon={<Users className="h-5 w-5" />} delay={0.3} accent="admin">
        {active.length === 0 && (
          <div className="py-4 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-gold/30" />
            <p className="text-cream/50 text-sm">No active coolies.</p>
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {active.map(c => {
            const job = bookings.find(b => b.assignedCoolieId === c.id && ["requested","assigned","in_progress"].includes(b.status));
            return (
              <motion.div key={c.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-gold/20 bg-maroon/40 p-3 hover:border-gold/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl flex-shrink-0 shadow-[0_0_12px_oklch(0.78_0.14_75/0.3)]">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-cream truncate">{c.name}</div>
                    <div className="text-xs text-cream/60">{c.badge} · {c.station.split(" ")[0]}</div>
                  </div>
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${c.available ? "bg-green-400 shadow-[0_0_10px_oklch(0.7_0.2_140)]" : "bg-yellow-400 shadow-[0_0_8px_oklch(0.78_0.2_90)]"}`} />
                </div>
                <div className="mt-2 text-xs text-cream/70">
                  {job ? <>On job: <span className="text-gold">Train {job.trainNumber}</span> <StatusBadge status={job.status} /></> : <span className="text-green-300">✓ Available</span>}
                </div>
                <div className="text-xs text-cream/60 mt-0.5 flex justify-between">
                  <span>Earnings: <span className="text-gold font-semibold">₹{c.earnings}</span></span>
                  <span>Wallet: <span className="text-gold font-semibold">₹{coolieWallets[c.id] ?? 0}</span></span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Panel>

      {/* ── Parcel Bookings ────────────────────────────────────────────────── */}
      <Panel title="Parcel Bookings Ledger" icon={<Package className="h-5 w-5" />} delay={0.35} accent="parcel">
        {parcelBookings.length === 0
          ? (
            <div className="py-4 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-gold/30" />
              <p className="text-sm text-cream/60">No parcel bookings yet.</p>
            </div>
          )
          : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parcelBookings.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-maroon/40 p-3 hover:border-gold/35 transition">
                  {p.parcelPhotoUrl
                    ? <img src={p.parcelPhotoUrl} alt="parcel" className="h-12 w-12 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                    : <div className="h-12 w-12 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 flex-shrink-0"><Package className="h-4 w-4 text-gold/40" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-cream">{p.senderName}</span>
                      <ParcelBadge status={p.status} />
                    </div>
                    <div className="text-xs text-cream/60">{p.sourceStation.split("(")[0]} → {p.destinationStation.split("(")[0]} · {p.weightKg}kg</div>
                    <div className="text-xs text-gold flex items-center gap-1"><IndianRupee className="h-3 w-3" />Est. ₹{p.fareEstimate}</div>
                  </div>
                  <div className="text-[10px] text-cream/40 text-right flex-shrink-0">{new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
      </Panel>

      {/* ── Revenue Ledger ────────────────────────────────────────────────── */}
      <Panel title="Platform Revenue Ledger" icon={<TrendingUp className="h-5 w-5" />} delay={0.4} accent="admin">
        <TransactionLedger txns={transactions} perspective="admin" />
      </Panel>

      {/* ── Dispatch Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {dispatchFor && dispatchBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setDispatchFor(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-gold w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-gold">Assign Porter</h3>
                <button onClick={() => setDispatchFor(null)}
                  className="rounded-full border border-gold/30 bg-maroon/40 p-2 text-cream/70 hover:text-cream transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-cream/60 mb-3">
                Booking: <span className="text-gold font-semibold">{dispatchBooking.trainNumber}</span> · Platform {dispatchBooking.platform} · {dispatchBooking.luggageCount} bags
              </p>
              {eligibleCoolies.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-cream/70">No available coolies at {dispatchBooking.arrivalStation}</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {eligibleCoolies.map(c => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gold/25 bg-maroon/40 p-3 hover:border-gold/60 transition">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl flex-shrink-0">{c.avatar}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-cream">{c.name}</div>
                        <div className="text-xs text-cream/60">{c.badge} · {c.earnings} earned</div>
                      </div>
                      <button
                        onClick={() => { assignBooking(dispatchFor!, c.id); setDispatchFor(null); }}
                        className="rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-maroon glow-gold hover:opacity-90 transition">
                        Dispatch
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
