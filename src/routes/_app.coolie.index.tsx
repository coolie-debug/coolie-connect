import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { motion, AnimatePresence } from "framer-motion";
import { playNewJobChime, playSuccessChime, playCancelTone } from "@/lib/sound";
import {
  Briefcase, Bell, IndianRupee, AlertTriangle, CheckCircle2,
  MapPin, Package, Train, Image as ImageIcon, XCircle, Phone, Loader2,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/coolie/")({ component: CoolieDashboard });

const EARNINGS = [
  { time: "6 AM", value: 0 }, { time: "8 AM", value: 240 }, { time: "10 AM", value: 480 },
  { time: "12 PM", value: 720 }, { time: "2 PM", value: 880 }, { time: "4 PM", value: 1100 }, { time: "6 PM", value: 1240 },
];

function CoolieDashboard() {
  const {
    currentCoolieId, coolies, bookings, verifyOtp, triggerSOS,
    setCurrentCoolie, coolieWallets, transactions,
    acceptBooking, rejectBooking, cancelBooking, setCustomFare,
  } = useAppStore();

  const me = coolies.find(c => c.id === currentCoolieId) || coolies.find(c => c.status === "active");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [customFareInput, setCustomFareInput] = useState("");
  const [savingFare, setSavingFare] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!currentCoolieId && me) setTimeout(() => setCurrentCoolie(me.id), 0);

  const incomingRequest = me
    ? bookings.find(b => b.assignedCoolieId === me.id && b.status === "requested")
    : undefined;

  const myJob = me
    ? bookings.find(b => b.assignedCoolieId === me.id && ["assigned", "in_progress"].includes(b.status))
    : undefined;

  // ── Sound on new request ─────────────────────────────────────────────────
  const prevRequestId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (incomingRequest && incomingRequest.id !== prevRequestId.current) {
      playNewJobChime();
    }
    prevRequestId.current = incomingRequest?.id;
  }, [incomingRequest?.id]);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    setAccepting(true);
    await acceptBooking(incomingRequest.id);
    playSuccessChime();
    setAccepting(false);
  };

  const handleReject = async () => {
    if (!incomingRequest) return;
    setRejecting(true);
    playCancelTone();
    await rejectBooking(incomingRequest.id);
    setRejecting(false);
  };

  const handleCancelDeal = async () => {
    if (!myJob) return;
    setCancelling(true);
    playCancelTone();
    await cancelBooking(myJob.id, "coolie");
    setCancelling(false);
  };

  const handleVerify = async () => {
    if (!myJob) return;
    if (otp.length !== 4) { setOtpError("Enter all 4 digits"); return; }
    const ok = await verifyOtp(myJob.id, otp);
    if (!ok) setOtpError("Incorrect OTP — ask passenger again");
    else { setOtpError(""); setOtp(""); playSuccessChime(); }
  };

  const handleSaveFare = async () => {
    if (!myJob) return;
    const amount = Number(customFareInput);
    if (!amount || amount < 1) return;
    setSavingFare(true);
    await setCustomFare(myJob.id, amount);
    setCustomFareInput("");
    setSavingFare(false);
  };

  if (!me) {
    return (
      <Panel title="Coolie Section">
        <p className="text-cream/70 mb-4">No active coolie account. Register first.</p>
        <Link to="/coolie/onboard" className="inline-flex rounded-xl bg-gradient-gold px-5 py-3 font-semibold text-maroon">Register as Coolie</Link>
      </Panel>
    );
  }
  if (me.status === "pending") {
    return (
      <Panel title="Awaiting Approval" glow>
        <p className="text-cream/80">Your registration is under admin review. Switch to <strong className="text-gold">Admin Section</strong> (password: ADMIN@2026) to approve.</p>
      </Panel>
    );
  }

  const effectiveFare = myJob ? (myJob.customFare ?? myJob.fare) : 0;

  return (
    <div className="space-y-6">

      {/* ── Incoming Request Alert ───────────────────────────────────────── */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div key="incoming" initial={{ y: -60, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", duration: 0.55 }}
            className="relative overflow-hidden rounded-2xl border-2 border-gold bg-gradient-to-r from-maroon/90 to-maroon/70 p-5">
            {[0, 1].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-2xl border-2 border-gold/60"
                animate={{ scale: [1, 1.04, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.6 }} />
            ))}
            <div className="relative flex items-start gap-4">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-gold shadow-[0_0_30px_oklch(0.78_0.14_75/0.7)]">
                <Bell className="h-8 w-8 text-maroon" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-2xl font-bold text-gold">🔔 Incoming Request!</div>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-cream/90">
                  <span><Train className="inline h-3.5 w-3.5 text-gold mr-0.5" />{incomingRequest.trainNumber}</span>
                  <span><MapPin className="inline h-3.5 w-3.5 text-gold mr-0.5" />Platform {incomingRequest.platform} · {incomingRequest.bogie}</span>
                  <span><Package className="inline h-3.5 w-3.5 text-gold mr-0.5" />{incomingRequest.luggageCount} bags</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-cream/80">
                  <span className="text-2xl">{incomingRequest.passengerAvatar}</span>
                  <span>{incomingRequest.passengerName}</span>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold font-bold">
                    ₹{incomingRequest.fare} est. · You earn ₹{Math.round(incomingRequest.fare * 0.8)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-cream/50">
                  <Phone className="h-2.5 w-2.5" /> Admin: 7080809908
                </div>
              </div>
              {incomingRequest.luggagePhoto && (
                <img src={incomingRequest.luggagePhoto} alt="luggage" className="h-20 w-20 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
              )}
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <button onClick={handleAccept} disabled={accepting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-display text-lg font-bold text-maroon glow-gold disabled:opacity-60">
                {accepting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                {accepting ? "Accepting…" : "Accept Job"}
              </button>
              <button onClick={handleReject} disabled={rejecting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-900/40 py-3 font-display text-lg font-semibold text-red-200 disabled:opacity-60">
                {rejecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                {rejecting ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Job Banner ────────────────────────────────────────────── */}
      <AnimatePresence>
        {myJob?.status === "assigned" && !incomingRequest && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-gold p-4 text-center bg-gradient-to-r from-maroon/80 to-maroon/60">
            <div className="flex items-center justify-center gap-2 text-gold font-display text-lg font-bold">
              <Bell className="h-5 w-5" /> ON JOB · PLATFORM {myJob.platform} · TRAIN {myJob.trainNumber}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Profile + Wallet ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Coolie Section" icon={<Briefcase className="h-5 w-5" />} className="lg:col-span-1">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-gold text-5xl shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)]">{me.avatar}</div>
            <h3 className="mt-3 font-display text-2xl text-gold">{me.name}</h3>
            <p className="text-sm text-cream/70">{me.station}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-maroon">
              <CheckCircle2 className="h-3 w-3" /> BADGE {me.badge}
            </div>
            {me.experience != null && (
              <div className="mt-1 text-xs text-cream/50">{me.experience}yr exp · {me.shift === "night" ? "🌙 Night" : "☀ Day"} shift</div>
            )}
          </div>
          <div className="mt-5">
            <WalletCard title="Partner Wallet" subtitle="80% Earnings Hub" balance={coolieWallets[me.id] || 0} badge="PARTNER" />
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

      {/* ── Active Job Panel ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Active Job" icon={<Package className="h-5 w-5" />} className="lg:col-span-2" glow={!!myJob}>
          {!myJob ? (
            <div className="py-10 text-center text-cream/60">
              <Package className="mx-auto mb-3 h-12 w-12 text-gold/50" />
              <p>{incomingRequest ? "Respond to the incoming request above." : "Waiting for a booking request…"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat icon={<Train className="h-4 w-4" />} label="Train" value={myJob.trainNumber} sub={myJob.trainName} />
                <Stat icon={<MapPin className="h-4 w-4" />} label="Platform" value={`#${myJob.platform}`} sub={`Bogie ${myJob.bogie}`} />
                <Stat icon={<Package className="h-4 w-4" />} label="Luggage" value={`${myJob.luggageCount}`} sub="bags" />
                <Stat icon={<Briefcase className="h-4 w-4" />} label="Service" value={myJob.serviceMode === "bogie" ? "Bogie" : "Platform"} sub="delivery" />
              </div>

              {/* Fare status */}
              <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${myJob.fareConfirmed ? "border-green-500/40 bg-green-900/20" : "border-yellow-500/30 bg-yellow-900/20"}`}>
                <div className="text-sm text-cream/80">
                  {myJob.fareConfirmed
                    ? <span className="flex items-center gap-1 text-green-300"><CheckCircle2 className="h-4 w-4" /> Final Rate Confirmed</span>
                    : <span className="flex items-center gap-1 text-yellow-200"><Loader2 className="h-4 w-4 animate-spin" /> Rate Calculating…</span>}
                </div>
                <div className="font-display text-2xl text-gold">₹{effectiveFare}</div>
              </div>

              {/* Custom fare input for coolie */}
              {!myJob.fareConfirmed && (
                <div className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
                  <p className="text-xs text-cream/60 mb-2">Set a custom rate for this booking:</p>
                  <div className="flex gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-3 py-2 focus-within:border-gold">
                      <IndianRupee className="h-4 w-4 text-gold/60 flex-shrink-0" />
                      <input type="number" min={50} placeholder="Enter custom rate…"
                        value={customFareInput}
                        onChange={e => setCustomFareInput(e.target.value)}
                        className="w-full bg-transparent text-cream outline-none placeholder:text-cream/30" />
                    </div>
                    <button onClick={handleSaveFare} disabled={!customFareInput || savingFare}
                      className="inline-flex items-center gap-1 rounded-xl bg-gradient-gold px-4 py-2 font-semibold text-maroon disabled:opacity-50">
                      {savingFare ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {savingFare ? "Saving…" : "Confirm Rate"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl bg-maroon/40 p-4">
                {myJob.luggagePhoto
                  ? <img src={myJob.luggagePhoto} alt="luggage" className="h-24 w-24 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                  : <div className="h-24 w-24 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 text-gold/40 flex-shrink-0"><ImageIcon className="h-8 w-8" /></div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-cream">
                    <span className="text-2xl">{myJob.passengerAvatar}</span>
                    <span className="font-semibold">{myJob.passengerName}</span>
                  </div>
                  <div className="mt-1 text-xs text-cream/60">Identify these bags on the ground.</div>
                  <div className="mt-1 text-xs text-gold">You earn ₹{Math.round(effectiveFare * 0.8)}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-cream/40">
                    <Phone className="h-2.5 w-2.5" /> Admin: 7080809908
                  </div>
                </div>
              </div>

              {/* OTP verification */}
              {myJob.status === "assigned" && (
                <div className="space-y-3">
                  <div className="text-center text-xs text-cream/70">Enter passenger OTP to verify &amp; complete</div>
                  <div className="flex justify-center gap-2">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 font-display text-3xl transition ${otp[i] ? "border-gold bg-gradient-gold text-maroon" : "border-gold/30 bg-maroon/40 text-gold"}`}>
                        {otp[i] || ""}
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <button key={n} onClick={() => otp.length < 4 && setOtp(otp + n)}
                        className="rounded-xl border border-gold/30 bg-maroon/40 py-4 font-display text-2xl text-gold hover:bg-maroon/60 active:scale-95 transition">{n}</button>
                    ))}
                    <button onClick={() => setOtp(otp.slice(0, -1))} className="rounded-xl border border-gold/30 bg-maroon/40 py-4 text-gold hover:bg-maroon/60">⌫</button>
                    <button onClick={() => otp.length < 4 && setOtp(otp + "0")} className="rounded-xl border border-gold/30 bg-maroon/40 py-4 font-display text-2xl text-gold hover:bg-maroon/60">0</button>
                    <button onClick={handleVerify} className="rounded-xl bg-gradient-gold py-4 font-bold text-maroon active:scale-95">✓</button>
                  </div>
                  <button onClick={handleVerify} className="w-full rounded-xl bg-gradient-gold py-3 font-display text-lg font-bold text-maroon glow-gold">
                    Verify &amp; Complete Ride
                  </button>
                  {otpError && <p className="text-center text-sm text-red-300">{otpError}</p>}
                </div>
              )}

              {/* Cancel Deal */}
              {["assigned", "requested"].includes(myJob.status) && (
                <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4">
                  <p className="text-xs text-red-300/80 mb-3">Ground-level dispute? Cancel here — escrowed fare refunded to passenger.</p>
                  <button onClick={handleCancelDeal} disabled={cancelling}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-900/50 py-3 font-semibold text-red-200 hover:bg-red-900/70 disabled:opacity-60 transition">
                    {cancelling ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                    {cancelling ? "Cancelling Deal…" : "Cancel Deal"}
                  </button>
                </div>
              )}
            </div>
          )}
        </Panel>

        {/* ── SOS Panel ──────────────────────────────────────────────────── */}
        <Panel title="Emergency" icon={<AlertTriangle className="h-5 w-5" />} className="lg:col-span-1">
          <p className="text-sm text-cream/70 mb-2">Use for harassment, theft, or medical emergency.</p>
          <div className="mb-4 text-xs text-cream/50 flex items-center gap-1">
            <Phone className="h-3 w-3 text-gold/50" /> Admin: 7080809908
          </div>
          <button onClick={() => { triggerSOS(me.id); alert("🚨 SOS sent to Admin Command Center!"); }}
            className="w-full rounded-3xl bg-gradient-to-br from-red-600 to-red-800 py-8 font-display text-3xl font-bold text-white shadow-[0_0_40px_oklch(0.6_0.22_25/0.6)] hover:opacity-90 active:scale-95 transition animate-pulse">
            🚨 SOS
          </button>
          <p className="mt-3 text-center text-xs text-cream/50">Press once to alert admin</p>
        </Panel>
      </div>

      {/* ── Earnings History ─────────────────────────────────────────────── */}
      <Panel title="Earning Tracker · History" icon={<IndianRupee className="h-5 w-5" />} delay={0.4}>
        <TransactionLedger txns={transactions} perspective="coolie" coolieId={me.id} />
      </Panel>
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
