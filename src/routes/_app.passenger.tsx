import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, STATIONS_LIST, FARE_PER_BAG } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { LuggageCapture } from "@/components/LuggageCapture";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { motion, AnimatePresence } from "framer-motion";
import { User, CreditCard, Crown, Train, Package, Plus, Minus, ShieldCheck, Sparkles, Lock } from "lucide-react";

export const Route = createFileRoute("/_app/passenger")({
  component: Passenger,
});

const TRAINS = [
  { num: "12951", name: "Mumbai Rajdhani" }, { num: "12181", name: "Dayodaya Express" },
  { num: "12423", name: "Dibrugarh Rajdhani" }, { num: "12002", name: "Bhopal Shatabdi" },
];

function Passenger() {
  const { passengerProfile, createBooking, bookings, cancelBooking, coolies, passengerWallet, passengerEscrow, addPassengerMoney, transactions } = useAppStore();
  const [form, setForm] = useState({
    trainNumber: TRAINS[0].num, trainName: TRAINS[0].name,
    arrivalStation: STATIONS_LIST[0], departureStation: STATIONS_LIST[1],
    platform: "4", bogie: "B3", luggageCount: 2,
    serviceMode: "bogie" as "platform" | "bogie",
    luggagePhoto: undefined as string | undefined,
  });
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const lastBooking = bookings.find(b => b.id === lastBookingId);
  const assignedCoolie = lastBooking?.assignedCoolieId ? coolies.find(c => c.id === lastBooking.assignedCoolieId) : null;
  const fare = form.luggageCount * FARE_PER_BAG;

  const submit = () => {
    setBookingError(null);
    const res = createBooking(form);
    if (res.error) { setBookingError(res.error); return; }
    setLastBookingId(res.id);
  };

  return (
    <div className="space-y-6">
      <Panel title="Passenger Booking & Profile Hub" icon={<User className="h-5 w-5" />}>
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-5xl shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)]">
            {passengerProfile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-2xl text-gold">{passengerProfile.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-maroon">
                <Crown className="h-3 w-3" /> {passengerProfile.tier}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-cream/70">
              {passengerProfile.payments.map(p => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-maroon/40 px-3 py-1">
                  <CreditCard className="h-3 w-3 text-gold" /> {p}
                </span>
              ))}
            </div>
            {passengerEscrow > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-700/30 px-3 py-1 text-xs text-yellow-200">
                <Lock className="h-3 w-3" /> ₹{passengerEscrow} locked in escrow
              </div>
            )}
          </div>
          <WalletCard
            title="Passenger Wallet" subtitle="Yatri Pay Balance"
            balance={passengerWallet} onTopUp={addPassengerMoney}
            badge="LIVE"
          />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Book a Coolie" icon={<Package className="h-5 w-5" />} delay={0.15}>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Train</label>
              <select
                value={form.trainNumber}
                onChange={e => {
                  const t = TRAINS.find(x => x.num === e.target.value)!;
                  setForm({ ...form, trainNumber: t.num, trainName: t.name });
                }}
                className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold"
              >
                {TRAINS.map(t => <option key={t.num} className="bg-maroon">{t.num} · {t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Arrival Station" value={form.arrivalStation} onChange={v => setForm({ ...form, arrivalStation: v })} options={STATIONS_LIST} />
              <SelectField label="Departure Station" value={form.departureStation} onChange={v => setForm({ ...form, departureStation: v })} options={STATIONS_LIST} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="Platform #" value={form.platform} onChange={v => setForm({ ...form, platform: v })} />
              <InputField label="Bogie #" value={form.bogie} onChange={v => setForm({ ...form, bogie: v })} />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Number of Bags</label>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-gold/30 bg-maroon/40 p-3">
                <button onClick={() => setForm({ ...form, luggageCount: Math.max(1, form.luggageCount - 1) })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon"><Minus className="h-4 w-4" /></button>
                <div className="text-center">
                  <div className="font-display text-4xl text-gold leading-none">{form.luggageCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-cream/60 mt-1">bags · ₹{fare} fare</div>
                </div>
                <button onClick={() => setForm({ ...form, luggageCount: Math.min(10, form.luggageCount + 1) })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            <LuggageCapture value={form.luggagePhoto} onChange={(p) => setForm({ ...form, luggagePhoto: p })} />

            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Service Mode</label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-gold/30 bg-maroon/40 p-1">
                {(["platform", "bogie"] as const).map(m => (
                  <button key={m} onClick={() => setForm({ ...form, serviceMode: m })} className={`relative rounded-lg py-2 text-sm font-medium transition ${form.serviceMode === m ? "text-maroon" : "text-cream/70"}`}>
                    {form.serviceMode === m && <motion.div layoutId="svc-pill" className="absolute inset-0 rounded-lg bg-gradient-gold" />}
                    <span className="relative">{m === "platform" ? "Platform Pickup" : "Inside Bogie Delivery"}</span>
                  </button>
                ))}
              </div>
            </div>

            {bookingError && (
              <div className="rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-200">{bookingError}</div>
            )}

            <button onClick={submit} className="w-full rounded-xl bg-gradient-gold py-4 font-display text-xl font-bold text-maroon glow-gold hover:opacity-95">
              <Sparkles className="inline h-5 w-5 mr-2" /> Book Coolie Now · ₹{fare}
            </button>
            <p className="text-center text-[10px] text-cream/50 uppercase tracking-widest">
              <Lock className="inline h-3 w-3 mr-1" /> Amount held in escrow until OTP verification
            </p>
          </div>
        </Panel>

        <div className="space-y-6">
          <AnimatePresence>
            {lastBooking && lastBooking.status !== "pending" && lastBooking.status !== "completed" && assignedCoolie && (
              <motion.div
                key="otp"
                initial={{ scale: 0.8, opacity: 0, rotateY: -20 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ opacity: 0 }}
                transition={{ type: "spring", duration: 0.7 }}
              >
                <Panel title="Security OTP" icon={<ShieldCheck className="h-5 w-5" />} glow>
                  <div className="text-center">
                    <p className="text-sm text-cream/80">Share this 4-digit code with your assigned coolie</p>
                    <div className="mt-2 flex items-center justify-center gap-2 text-cream/70">
                      <span className="text-2xl">{assignedCoolie.avatar}</span>
                      <span className="font-medium">{assignedCoolie.name}</span>
                      <span className="rounded-full bg-maroon/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">{assignedCoolie.badge}</span>
                    </div>
                    <div className="mt-5 flex justify-center gap-3">
                      {lastBooking.otp.split("").map((d, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                          className="flex h-20 w-16 items-center justify-center rounded-2xl bg-gradient-gold font-display text-5xl font-bold text-maroon shadow-[0_0_30px_oklch(0.85_0.16_80/0.6)]"
                        >{d}</motion.div>
                      ))}
                    </div>
                    <p className="mt-4 text-xs text-cream/50 uppercase tracking-widest">Status: {lastBooking.status.replace("_", " ")}</p>
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>

          <Panel title="My Bookings" icon={<Train className="h-5 w-5" />} delay={0.3}>
            {bookings.filter(b => b.passengerName === passengerProfile.name).length === 0 && (
              <p className="text-cream/60 text-sm">No bookings yet. Submit a request to begin.</p>
            )}
            <div className="space-y-2">
              {bookings.filter(b => b.passengerName === passengerProfile.name).map(b => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl border border-gold/20 bg-maroon/40 p-3">
                  {b.luggagePhoto && <img src={b.luggagePhoto} alt="" className="h-12 w-12 rounded-lg object-cover border border-gold/40" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-cream">
                      <Train className="h-4 w-4 text-gold" />
                      <span className="font-semibold">{b.trainNumber}</span>
                      <span className="text-xs text-cream/60">· P{b.platform} · {b.luggageCount} bags · ₹{b.fare}</span>
                    </div>
                    <div className="text-xs text-cream/50 mt-0.5">OTP: <span className="text-gold font-bold">{b.otp}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${
                      b.status === "completed" ? "bg-green-700/40 text-green-200" :
                      b.status === "cancelled" ? "bg-red-700/40 text-red-200" :
                      b.status === "in_progress" ? "bg-gradient-gold text-maroon" :
                      "bg-maroon/60 text-gold"
                    }`}>{b.status.replace("_", " ")}</span>
                    {(b.status === "pending" || b.status === "assigned") && (
                      <button onClick={() => cancelBooking(b.id)} className="text-xs text-red-300 hover:text-red-200">Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Wallet Activity" delay={0.4}>
            <TransactionLedger txns={transactions} perspective="passenger" />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold">
        {options.map(o => <option key={o} className="bg-maroon">{o}</option>)}
      </select>
    </div>
  );
}
