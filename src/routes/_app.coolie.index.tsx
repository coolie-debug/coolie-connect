import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Bell, IndianRupee, AlertTriangle, CheckCircle2, MapPin, Package, Train } from "lucide-react";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/coolie/")({
  component: CoolieDashboard,
});

const EARNINGS = [
  { time: "6 AM", value: 0 }, { time: "8 AM", value: 240 }, { time: "10 AM", value: 480 },
  { time: "12 PM", value: 720 }, { time: "2 PM", value: 880 }, { time: "4 PM", value: 1100 }, { time: "6 PM", value: 1240 },
];

function CoolieDashboard() {
  const { currentCoolieId, coolies, bookings, verifyOtp, completeBooking, triggerSOS, setCurrentCoolie } = useAppStore();
  const me = coolies.find(c => c.id === currentCoolieId) || coolies.find(c => c.status === "active");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // auto-select an active coolie for demo
  if (!currentCoolieId && me) setTimeout(() => setCurrentCoolie(me.id), 0);

  if (!me) {
    return (
      <Panel title="Porter Terminal">
        <p className="text-cream/70 mb-4">No active coolie account selected.</p>
        <Link to="/coolie/onboard" className="inline-flex rounded-xl bg-gradient-gold px-5 py-3 font-semibold text-maroon">Register as Coolie</Link>
      </Panel>
    );
  }

  if (me.status === "pending") {
    return (
      <Panel title="Awaiting Approval" glow>
        <p className="text-cream/80">Your registration is under review. Switch to <strong className="text-gold">Admin</strong> role to approve yourself for testing.</p>
      </Panel>
    );
  }

  const myJob = bookings.find(b => b.assignedCoolieId === me.id && (b.status === "assigned" || b.status === "in_progress"));

  const handleVerify = () => {
    if (!myJob) return;
    if (otp.length !== 4) { setError("Enter all 4 digits"); return; }
    const ok = verifyOtp(myJob.id, otp);
    if (!ok) setError("Incorrect OTP — ask passenger again");
    else { setError(""); setOtp(""); }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {myJob && myJob.status === "assigned" && (
          <motion.div
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="animate-flash rounded-2xl border-2 border-gold p-5 text-center"
          >
            <div className="flex items-center justify-center gap-3 text-maroon">
              <Bell className="h-6 w-6" />
              <span className="font-display text-2xl font-bold">NEW JOB — PLATFORM {myJob.platform} · TRAIN {myJob.trainNumber} · {myJob.luggageCount} BAGS</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Porter Profile" icon={<Briefcase className="h-5 w-5" />} className="lg:col-span-1">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-gold text-5xl shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)]">{me.avatar}</div>
            <h3 className="mt-3 font-display text-2xl text-gold">{me.name}</h3>
            <p className="text-sm text-cream/70">{me.station}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-maroon">
              <CheckCircle2 className="h-3 w-3" /> BADGE {me.badge}
            </div>
          </div>
          <div className="mt-5 rounded-xl bg-maroon/40 p-4">
            <div className="flex items-center gap-2 text-cream/70 text-xs uppercase tracking-widest"><IndianRupee className="h-3 w-3" /> Today's Earnings</div>
            <div className="font-display text-4xl text-gold">₹{me.earnings.toLocaleString()}</div>
          </div>
        </Panel>

        <Panel title="Earnings Today" icon={<IndianRupee className="h-5 w-5" />} className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={EARNINGS}>
                <defs>
                  <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.85 0.16 80)" />
                    <stop offset="100%" stopColor="oklch(0.68 0.13 60)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.78 0.14 75 / 0.15)" />
                <XAxis dataKey="time" stroke="oklch(0.96 0.03 80 / 0.6)" fontSize={11} />
                <YAxis stroke="oklch(0.96 0.03 80 / 0.6)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.24 0.07 25)", border: "1px solid oklch(0.78 0.14 75 / 0.5)", borderRadius: 12, color: "oklch(0.96 0.03 80)" }} />
                <Line type="monotone" dataKey="value" stroke="url(#goldLine)" strokeWidth={3} dot={{ fill: "oklch(0.85 0.16 80)", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Active Job" icon={<Package className="h-5 w-5" />} className="lg:col-span-2" glow={!!myJob}>
          {!myJob ? (
            <div className="py-10 text-center text-cream/60">
              <Package className="mx-auto mb-3 h-12 w-12 text-gold/50" />
              <p>No active job. Waiting for dispatch from Command Center…</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat icon={<Train className="h-4 w-4" />} label="Train" value={`${myJob.trainNumber}`} sub={myJob.trainName} />
                <Stat icon={<MapPin className="h-4 w-4" />} label="Platform" value={`#${myJob.platform}`} sub={`Bogie ${myJob.bogie}`} />
                <Stat icon={<Package className="h-4 w-4" />} label="Luggage" value={`${myJob.luggageCount}`} sub="bags" />
                <Stat icon={<Briefcase className="h-4 w-4" />} label="Service" value={myJob.serviceMode === "bogie" ? "Bogie" : "Platform"} sub="delivery" />
              </div>

              <div className="rounded-xl bg-maroon/40 p-4">
                <div className="text-xs uppercase tracking-widest text-cream/60 mb-1">Passenger</div>
                <div className="flex items-center gap-2 text-cream">
                  <span className="text-2xl">{myJob.passengerAvatar}</span>
                  <span className="font-semibold">{myJob.passengerName}</span>
                </div>
              </div>

              {myJob.status === "assigned" && (
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest text-cream/60">OTP Handshake</div>
                    <p className="text-sm text-cream/70 mt-1">Ask passenger for the 4-digit security OTP</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 font-display text-3xl ${otp[i] ? "border-gold bg-gradient-gold text-maroon" : "border-gold/30 bg-maroon/40 text-gold"}`}>
                        {otp[i] || ""}
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <button key={n} onClick={() => otp.length < 4 && setOtp(otp + n)} className="rounded-xl border border-gold/30 bg-maroon/40 py-4 font-display text-2xl text-gold hover:bg-maroon/60 active:scale-95 transition">{n}</button>
                    ))}
                    <button onClick={() => setOtp(otp.slice(0, -1))} className="rounded-xl border border-gold/30 bg-maroon/40 py-4 text-gold hover:bg-maroon/60">⌫</button>
                    <button onClick={() => otp.length < 4 && setOtp(otp + "0")} className="rounded-xl border border-gold/30 bg-maroon/40 py-4 font-display text-2xl text-gold hover:bg-maroon/60">0</button>
                    <button onClick={handleVerify} className="rounded-xl bg-gradient-gold py-4 font-bold text-maroon active:scale-95">✓</button>
                  </div>
                  {error && <p className="text-center text-sm text-destructive">{error}</p>}
                </div>
              )}

              {myJob.status === "in_progress" && (
                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-bold text-maroon">
                    <CheckCircle2 className="h-4 w-4" /> OTP VERIFIED · IN PROGRESS
                  </div>
                  <button onClick={() => completeBooking(myJob.id)} className="block w-full rounded-2xl bg-gradient-gold py-5 font-display text-2xl font-bold text-maroon glow-gold">
                    MARK DELIVERED
                  </button>
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Emergency" icon={<AlertTriangle className="h-5 w-5" />} className="lg:col-span-1">
          <p className="text-sm text-cream/70 mb-4">Use only in case of harassment, theft, or medical emergency. Admin will be alerted immediately.</p>
          <button
            onClick={() => { triggerSOS(me.id); alert("🚨 SOS sent to Admin Command Center"); }}
            className="w-full rounded-3xl bg-gradient-to-br from-red-600 to-red-800 py-8 font-display text-3xl font-bold text-white shadow-[0_0_40px_oklch(0.6_0.22_25/0.6)] hover:opacity-90 active:scale-95 transition animate-pulse-gold"
          >
            🚨 SOS
          </button>
          <p className="mt-3 text-center text-xs text-cream/50">Press &amp; hold to confirm</p>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
      <div className="flex items-center gap-1 text-cream/60 text-[10px] uppercase tracking-widest">{icon}{label}</div>
      <div className="font-display text-2xl text-gold leading-tight">{value}</div>
      <div className="text-xs text-cream/60">{sub}</div>
    </div>
  );
}
