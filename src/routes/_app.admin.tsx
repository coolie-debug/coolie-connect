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
  Phone, Sliders, Package, IndianRupee, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_app/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <AdminAuth>
      <Admin />
    </AdminAuth>
  );
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

  // ── Sound: chime on new "requested" booking ──────────────────────────────
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
              className="rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-900/80 to-red-800/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="h-6 w-6 text-red-300 animate-pulse" />
                  <div>
                    <div className="font-bold text-white">🚨 SOS — {c?.name} · {c?.badge}</div>
                    <div className="text-xs text-red-200">At {c?.station} · {new Date(a.time).toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-200 font-mono">☎ 7080809908</span>
                  <button onClick={() => { playAlertBeep(); clearSOS(a.id); }} className="rounded-full bg-white/20 p-2 text-white"><X className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── KPI + Wallet ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel title="Admin Command Center" icon={<Shield className="h-5 w-5" />}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPI label="Pending Coolies" value={pending.length} icon={<Users className="h-5 w-5" />} />
            <KPI label="Active Coolies" value={active.length} icon={<CheckCircle2 className="h-5 w-5" />} />
            <KPI label="Live Bookings" value={activeBookings.length} icon={<Activity className="h-5 w-5" />} />
            <KPI label="SOS Alerts" value={sosAlerts.length} icon={<AlertOctagon className="h-5 w-5" />} danger={sosAlerts.length > 0} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-cream/50">
            <Phone className="h-3 w-3 text-gold/50" /> Admin Support: <span className="font-mono text-gold/70 ml-1">7080809908</span>
          </div>
        </Panel>
        <WalletCard title="Platform Revenue" subtitle="20% Commission Hub" balance={adminWallet} badge="ADMIN" />
      </div>

      {/* ── Live Price Override ──────────────────────────────────────────── */}
      <Panel title="Live Price Override" icon={<Sliders className="h-5 w-5" />} glow>
        <p className="text-sm text-cream/70 mb-4">
          Change the platform fare per bag. This instantly reflects on both Passenger and Coolie panels for new bookings.
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-cream/60">Fare per Bag (₹)</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-gold/40 bg-maroon/40 px-4 py-3 focus-within:border-gold">
              <IndianRupee className="h-4 w-4 text-gold/60" />
              <input
                type="number" min={10} step={10}
                value={fareInput}
                onChange={e => setFareInput(e.target.value)}
                className="w-full bg-transparent text-cream outline-none text-lg font-semibold"
              />
            </div>
          </div>
          <button onClick={handleSaveFare} disabled={savingFare || !fareInput}
            className="inline-flex h-[54px] items-center gap-2 rounded-xl bg-gradient-gold px-6 font-bold text-maroon glow-gold disabled:opacity-50">
            {savingFare ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {savingFare ? "Saving…" : "Update Live"}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon/40 px-4 py-2 text-xs text-cream/70">
          <Activity className="h-3 w-3 text-gold/60" />
          Current platform rate: <span className="font-bold text-gold ml-1">₹{dynamicFarePerBag}/bag</span>
        </div>
      </Panel>

      {/* ── Incoming Requests ────────────────────────────────────────────── */}
      {requestedBookings.length > 0 && (
        <Panel title="Incoming Requests — Awaiting Coolie Acceptance" icon={<AlertOctagon className="h-5 w-5" />} glow>
          <div className="space-y-3">
            {requestedBookings.map(b => {
              const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
              const effectiveFare = b.customFare ?? b.fare;
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-gold/40 bg-maroon/50 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {b.luggagePhoto
                      ? <img src={b.luggagePhoto} alt="luggage" className="h-16 w-16 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                      : <div className="h-16 w-16 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 text-gold/40 flex-shrink-0"><ImageIcon className="h-6 w-6" /></div>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{b.passengerAvatar}</span>
                        <span className="font-semibold text-cream">{b.passengerName}</span>
                        <StatusBadge status={b.status} />
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold">₹{effectiveFare} {b.fareConfirmed ? "✓ Confirmed" : "est."}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cream/70">
                        <span><Train className="inline h-3 w-3 text-gold mr-0.5" />{b.trainNumber}</span>
                        <span><MapPin className="inline h-3 w-3 text-gold mr-0.5" />P{b.platform}/{b.bogie} · {b.luggageCount} bags</span>
                      </div>
                      {coolie && <div className="text-xs text-gold mt-1">Selected: {coolie.avatar} {coolie.name} ({coolie.badge})</div>}
                    </div>
                  </div>
                  {/* Custom quote input */}
                  {!b.fareConfirmed && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-3 py-2 focus-within:border-gold">
                        <IndianRupee className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
                        <input type="number" min={50} placeholder="Set final rate…"
                          value={customQuotes[b.id] ?? ""}
                          onChange={e => setCustomQuotes(q => ({ ...q, [b.id]: e.target.value }))}
                          className="w-full bg-transparent text-cream outline-none text-sm placeholder:text-cream/30" />
                      </div>
                      <button onClick={() => handleSaveQuote(b.id)} disabled={!customQuotes[b.id] || savingQuote === b.id}
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-gold px-3 py-2 text-sm font-semibold text-maroon disabled:opacity-50">
                        {savingQuote === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Confirm Rate
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => acceptBooking(b.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon">
                      <Send className="h-4 w-4" /> Force Accept
                    </button>
                    <button onClick={() => setDispatchFor(b.id)}
                      className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold hover:bg-maroon/60">Re-Assign</button>
                    <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
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
        <Panel title="Onboarding Review Queue" icon={<FileText className="h-5 w-5" />} delay={0.1}>
          {pending.length === 0 && <p className="text-cream/60 text-sm">No pending applications.</p>}
          <div className="space-y-3">
            {pending.map(c => (
              <div key={c.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-3xl flex-shrink-0">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg text-gold">{c.name}</h4>
                      <span className="rounded-full bg-maroon/60 px-2 py-0.5 text-[10px] uppercase text-cream/70">{c.badge}</span>
                    </div>
                    <div className="text-xs text-cream/60">{c.station} · {c.contact}</div>
                    {c.address && <div className="text-xs text-cream/50">{c.address}</div>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.experience != null && <span className="text-[10px] text-gold/70 rounded bg-maroon/60 px-1.5 py-0.5">{c.experience}yr exp · {c.shift ?? "day"}</span>}
                      {c.documents.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 rounded bg-maroon/60 px-1.5 py-0.5 text-[10px] text-cream/70">
                          <FileText className="h-2.5 w-2.5" />{d.split("/").pop()?.slice(0, 20)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleApprove(c.id)} disabled={approvingId === c.id}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon">
                    {approvingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {approvingId === c.id ? "Approving…" : "Approve"}
                  </button>
                  <button onClick={() => rejectCoolie(c.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500/50 bg-red-900/40 px-4 py-2 text-sm text-red-200">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* ── Live Booking Feed ─────────────────────────────────────────── */}
        <Panel title="Live Luggage Booking Feed" icon={<Activity className="h-5 w-5" />} delay={0.2}>
          {activeBookings.length === 0 && <p className="text-cream/60 text-sm">No active bookings.</p>}
          <div className="space-y-3">
            {activeBookings.map(b => {
              const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
              const effectiveFare = b.customFare ?? b.fare;
              return (
                <div key={b.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4 space-y-2">
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
                  {/* Custom fare for unconfirmed bookings */}
                  {!b.fareConfirmed && ["pending","requested","assigned"].includes(b.status) && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-1 items-center gap-2 rounded-lg border border-gold/20 bg-maroon/30 px-3 py-1.5 focus-within:border-gold">
                        <IndianRupee className="h-3 w-3 text-gold/50" />
                        <input type="number" placeholder="Custom rate…" value={customQuotes[b.id] ?? ""}
                          onChange={e => setCustomQuotes(q => ({ ...q, [b.id]: e.target.value }))}
                          className="w-full bg-transparent text-cream outline-none text-xs placeholder:text-cream/30" />
                      </div>
                      <button onClick={() => handleSaveQuote(b.id)} disabled={!customQuotes[b.id] || savingQuote === b.id}
                        className="rounded-lg bg-gradient-gold px-2 py-1.5 text-xs font-bold text-maroon disabled:opacity-50">
                        {savingQuote === b.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set"}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {["pending","requested"].includes(b.status) && (
                      <button onClick={() => setDispatchFor(b.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-1.5 text-xs font-semibold text-maroon">
                        <Send className="h-3.5 w-3.5" /> Assign Coolie
                      </button>
                    )}
                    <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-2 py-1.5 text-xs text-red-200">
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
      <Panel title="Active Coolies — God Mode" icon={<Users className="h-5 w-5" />} delay={0.3}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {active.map(c => {
            const job = bookings.find(b => b.assignedCoolieId === c.id && ["requested","assigned","in_progress"].includes(b.status));
            return (
              <div key={c.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl flex-shrink-0">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-cream truncate">{c.name}</div>
                    <div className="text-xs text-cream/60">{c.badge} · {c.station.split(" ")[0]}</div>
                  </div>
                  <span className={`h-3 w-3 rounded-full flex-shrink-0 ${c.available ? "bg-green-400 shadow-[0_0_10px_oklch(0.7_0.2_140)]" : "bg-yellow-400"}`} />
                </div>
                <div className="mt-2 text-xs text-cream/70">
                  {job ? <>On job: <span className="text-gold">Train {job.trainNumber}</span> <StatusBadge status={job.status} /></> : <span className="text-green-300">Available</span>}
                </div>
                <div className="text-xs text-cream/60 mt-0.5 flex justify-between">
                  <span>Earnings: <span className="text-gold">₹{c.earnings}</span></span>
                  <span>Wallet: <span className="text-gold">₹{coolieWallets[c.id] ?? 0}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ── Parcel Bookings ────────────────────────────────────────────────── */}
      <Panel title="Parcel Bookings Ledger" icon={<Package className="h-5 w-5" />} delay={0.35}>
        {parcelBookings.length === 0
          ? <p className="text-sm text-cream/60">No parcel bookings yet.</p>
          : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {parcelBookings.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-maroon/40 p-3">
                  {p.parcelPhotoUrl
                    ? <img src={p.parcelPhotoUrl} alt="parcel" className="h-12 w-12 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                    : <div className="h-12 w-12 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 flex-shrink-0"><Package className="h-4 w-4 text-gold/40" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-cream">{p.senderName}</span>
                      <ParcelBadge status={p.status} />
                    </div>
                    <div className="text-xs text-cream/60">{p.sourceStation.split("(")[0]} → {p.destinationStation.split("(")[0]} · {p.weightKg}kg</div>
                    <div className="text-xs text-gold">Est. ₹{p.fareEstimate}</div>
                  </div>
                  <div className="text-[10px] text-cream/40 text-right flex-shrink-0">{new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
      </Panel>

      {/* ── Revenue Ledger ────────────────────────────────────────────────── */}
      <Panel title="Platform Revenue Ledger" icon={<TrendingUp className="h-5 w-5" />} delay={0.4}>
        <TransactionLedger txns={transactions} perspective="admin" />
      </Panel>

      {/* ── Dispatch Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {dispatchFor && dispatchBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setDispatchFor(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="glass-gold w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-gold">Smart Dispatch</h3>
                <button onClick={() => setDispatchFor(null)} className="text-cream/60"><X className="h-5 w-5" /></button>
              </div>
              <p className="text-xs uppercase tracking-widest text-cream/60 mb-2">Available coolies at {dispatchBooking.arrivalStation.split("(")[0]}</p>
              {eligibleCoolies.length === 0 && <p className="text-sm text-cream/60 py-4 text-center">No available coolies at this station.</p>}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {eligibleCoolies.map(c => (
                  <button key={c.id}
                    onClick={async () => { await assignBooking(dispatchBooking.id, c.id); setDispatchFor(null); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-gold/30 bg-maroon/40 p-3 text-left hover:border-gold hover:bg-maroon/60 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl">{c.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-cream">{c.name}</div>
                      <div className="text-xs text-cream/60">{c.badge} · ₹{c.earnings} earned</div>
                    </div>
                    <Send className="h-4 w-4 text-gold" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    requested: "bg-yellow-600/30 text-yellow-200", pending: "bg-maroon/60 text-gold",
    assigned: "bg-gradient-gold text-maroon", in_progress: "bg-blue-600/30 text-blue-200",
    completed: "bg-green-700/40 text-green-200", cancelled: "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function ParcelBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-600/30 text-yellow-200", in_transit: "bg-blue-600/30 text-blue-200",
    delivered: "bg-green-700/40 text-green-200", cancelled: "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function KPI({ label, value, icon, danger }: { label: string; value: number; icon: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${danger ? "border-red-500/60 bg-red-900/30" : "border-gold/20 bg-maroon/40"}`}>
      <div className="flex items-center gap-2 text-cream/60 text-xs uppercase tracking-widest">{icon}{label}</div>
      <div className={`font-display text-4xl ${danger ? "text-red-300" : "text-gold"}`}>{value}</div>
    </div>
  );
}
