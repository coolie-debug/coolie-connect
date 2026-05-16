import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, XCircle, FileText, Send, AlertOctagon, Activity, Users, X, Train, MapPin, Ban, TrendingUp, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_app/admin")({
  component: Admin,
});

function Admin() {
  const { coolies, bookings, approveCoolie, rejectCoolie, assignBooking, cancelBooking, sosAlerts, clearSOS, adminWallet, transactions } = useAppStore();
  const [dispatchFor, setDispatchFor] = useState<string | null>(null);

  const pending = coolies.filter(c => c.status === "pending");
  const active = coolies.filter(c => c.status === "active");
  const activeBookings = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");

  const dispatchBooking = dispatchFor ? bookings.find(b => b.id === dispatchFor) : null;
  const eligibleCoolies = dispatchBooking ? active.filter(c => c.available && c.station === dispatchBooking.arrivalStation) : [];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {sosAlerts.map(a => {
          const c = coolies.find(x => x.id === a.coolieId);
          return (
            <motion.div key={a.id} initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400 }}
              className="rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-900/80 to-red-800/80 p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="h-6 w-6 text-red-300 animate-pulse" />
                  <div>
                    <div className="font-bold text-white">🚨 SOS from {c?.name} · Badge {c?.badge}</div>
                    <div className="text-xs text-red-200">At {c?.station} · {new Date(a.time).toLocaleTimeString()}</div>
                  </div>
                </div>
                <button onClick={() => clearSOS(a.id)} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"><X className="h-4 w-4" /></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel title="Admin Command Center" icon={<Shield className="h-5 w-5" />}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KPI label="Pending Coolies" value={pending.length} icon={<Users className="h-5 w-5" />} />
            <KPI label="Active Coolies" value={active.length} icon={<CheckCircle2 className="h-5 w-5" />} />
            <KPI label="Live Bookings" value={activeBookings.length} icon={<Activity className="h-5 w-5" />} />
            <KPI label="SOS Alerts" value={sosAlerts.length} icon={<AlertOctagon className="h-5 w-5" />} danger={sosAlerts.length > 0} />
          </div>
        </Panel>
        <WalletCard title="Platform Revenue" subtitle="20% Commission Hub" balance={adminWallet} badge="ADMIN" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Onboarding Review Queue" icon={<FileText className="h-5 w-5" />} delay={0.1}>
          {pending.length === 0 && <p className="text-cream/60 text-sm">No pending applications.</p>}
          <div className="space-y-3">
            {pending.map(c => (
              <div key={c.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold text-3xl">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg text-gold">{c.name}</h4>
                      <span className="rounded-full bg-maroon/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-cream/70">{c.badge}</span>
                    </div>
                    <div className="text-xs text-cream/60">{c.station} · {c.contact}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.documents.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 rounded bg-maroon/60 px-2 py-0.5 text-[10px] text-cream/70">
                          <FileText className="h-3 w-3" /> {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => approveCoolie(c.id)} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => rejectCoolie(c.id)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500/50 bg-red-900/40 px-4 py-2 text-sm text-red-200 hover:bg-red-900/60">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Live Luggage Booking Feed" icon={<Activity className="h-5 w-5" />} delay={0.2}>
          {activeBookings.length === 0 && <p className="text-cream/60 text-sm">No active bookings.</p>}
          <div className="space-y-3">
            {activeBookings.map(b => {
              const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
              return (
                <div key={b.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{b.passengerAvatar}</span>
                        <span className="font-semibold text-cream">{b.passengerName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                          b.status === "pending" ? "bg-yellow-600/30 text-yellow-200" :
                          b.status === "assigned" ? "bg-gradient-gold text-maroon" :
                          "bg-blue-600/30 text-blue-200"
                        }`}>{b.status.replace("_", " ")}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cream/70">
                        <span className="inline-flex items-center gap-1"><Train className="h-3 w-3 text-gold" /> {b.trainNumber}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-gold" /> P{b.platform}/{b.bogie}</span>
                        <span>{b.luggageCount} bags</span>
                      </div>
                      {coolie && <div className="mt-1 text-xs text-gold">↳ {coolie.avatar} {coolie.name} ({coolie.badge})</div>}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {b.status === "pending" && (
                      <button onClick={() => setDispatchFor(b.id)} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-gold py-2 text-sm font-semibold text-maroon glow-gold">
                        <Send className="h-4 w-4" /> Transfer Job
                      </button>
                    )}
                    {b.status === "assigned" && (
                      <button onClick={() => setDispatchFor(b.id)} className="flex-1 rounded-lg border border-gold/40 py-2 text-sm text-gold hover:bg-maroon/60">Override Allocation</button>
                    )}
                    <button onClick={() => cancelBooking(b.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200 hover:bg-red-900/50">
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Active Coolies (God Mode)" icon={<Users className="h-5 w-5" />} delay={0.3}>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {active.map(c => {
            const job = bookings.find(b => b.assignedCoolieId === c.id && (b.status === "assigned" || b.status === "in_progress"));
            return (
              <div key={c.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl">{c.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-cream truncate">{c.name}</div>
                    <div className="text-xs text-cream/60">{c.badge} · {c.station.split(" ")[0]}</div>
                  </div>
                  <span className={`h-3 w-3 rounded-full ${c.available ? "bg-green-400 shadow-[0_0_10px_oklch(0.7_0.2_140)]" : "bg-yellow-400"}`} />
                </div>
                <div className="mt-2 text-xs text-cream/70">
                  {job ? <>On job: <span className="text-gold">Train {job.trainNumber}</span></> : <span className="text-green-300">Available</span>}
                </div>
                <div className="text-xs text-cream/60 mt-1">Earnings: <span className="text-gold">₹{c.earnings}</span></div>
              </div>
            );
          })}
        </div>
      </Panel>

      <AnimatePresence>
        {dispatchFor && dispatchBooking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setDispatchFor(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="glass-gold w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-gold">Smart Dispatch</h3>
                <button onClick={() => setDispatchFor(null)} className="text-cream/60 hover:text-cream"><X className="h-5 w-5" /></button>
              </div>
              <div className="rounded-xl bg-maroon/40 p-3 mb-4 text-sm text-cream">
                <div className="text-gold">Train {dispatchBooking.trainNumber} · Platform {dispatchBooking.platform}</div>
                <div className="text-xs text-cream/70">{dispatchBooking.arrivalStation} · {dispatchBooking.luggageCount} bags</div>
              </div>
              <p className="text-xs uppercase tracking-widest text-cream/60 mb-2">Available coolies at this station</p>
              {eligibleCoolies.length === 0 && <p className="text-sm text-cream/60 py-4 text-center">No available coolies at this station.</p>}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {eligibleCoolies.map(c => (
                  <button key={c.id} onClick={() => { assignBooking(dispatchBooking.id, c.id); setDispatchFor(null); }}
                    className="flex w-full items-center gap-3 rounded-xl border border-gold/30 bg-maroon/40 p-3 text-left transition hover:border-gold hover:bg-maroon/60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-2xl">{c.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-cream">{c.name}</div>
                      <div className="text-xs text-cream/60">{c.badge} · ₹{c.earnings} today</div>
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

function KPI({ label, value, icon, danger }: { label: string; value: number; icon: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${danger ? "border-red-500/60 bg-red-900/30" : "border-gold/20 bg-maroon/40"}`}>
      <div className="flex items-center gap-2 text-cream/60 text-xs uppercase tracking-widest">{icon}{label}</div>
      <div className={`font-display text-4xl ${danger ? "text-red-300" : "text-gold"}`}>{value}</div>
    </div>
  );
}
