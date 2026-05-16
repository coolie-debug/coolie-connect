import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, STATIONS_LIST, FARE_PER_BAG } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { LuggageCapture } from "@/components/LuggageCapture";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { PorterSearch } from "@/components/PorterSearch";
import { motion, AnimatePresence } from "framer-motion";
import { playCancelTone } from "@/lib/sound";
import {
  User, CreditCard, Crown, Train, Package, Plus, Minus,
  ShieldCheck, Sparkles, Lock, Phone, Clock, History, Zap, XCircle,
} from "lucide-react";

export const Route = createFileRoute("/_app/passenger")({ component: Passenger });

const TRAINS = [
  { num: "12951", name: "Mumbai Rajdhani" }, { num: "12181", name: "Dayodaya Express" },
  { num: "12423", name: "Dibrugarh Rajdhani" }, { num: "12002", name: "Bhopal Shatabdi" },
];

const TABS = [
  { id: "current",  label: "Current",  icon: Zap },
  { id: "upcoming", label: "Upcoming", icon: Clock },
  { id: "past",     label: "Past",     icon: History },
] as const;
type TabId = typeof TABS[number]["id"];

function Passenger() {
  const {
    passengerProfile, bookWithCoolie, cancelBooking,
    coolies, bookings, passengerWallet, passengerEscrow,
    addPassengerMoney, transactions,
  } = useAppStore();

  const [form, setForm] = useState({
    trainNumber: TRAINS[0].num, trainName: TRAINS[0].name,
    arrivalStation: STATIONS_LIST[0], departureStation: STATIONS_LIST[1],
    platform: "4", bogie: "B3", luggageCount: 2,
    serviceMode: "bogie" as "platform" | "bogie",
    luggagePhoto: undefined as string | undefined,
  });
  const [showSearch, setShowSearch] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("current");

  const fare = form.luggageCount * FARE_PER_BAG;

  // ── Booking groups for 3-tab ledger ────────────────────────────────────────
  const myBookings = bookings.filter(b => b.passengerName === passengerProfile.name);
  const currentBookings  = myBookings.filter(b => ["requested", "assigned", "in_progress"].includes(b.status));
  const upcomingBookings = myBookings.filter(b => b.status === "pending");
  const pastBookings     = myBookings.filter(b => ["completed", "cancelled"].includes(b.status));

  const lastBooking = bookings.find(b => b.id === lastBookingId);
  const assignedCoolie = lastBooking?.assignedCoolieId
    ? coolies.find(c => c.id === lastBooking.assignedCoolieId) : null;

  const handlePorterSelect = async (coolieId: string) => {
    setShowSearch(false);
    setBookingError(null);
    const res = await bookWithCoolie(form, coolieId);
    if (res.error) { setBookingError(res.error); return; }
    setLastBookingId(res.id);
    setActiveTab("current");
  };

  const handleCancel = async (id: string) => {
    playCancelTone();
    await cancelBooking(id, "passenger");
  };

  return (
    <div className="space-y-6">

      {/* ── Profile + Wallet ───────────────────────────────────────────────── */}
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
            <div className="mt-2 flex items-center gap-2 text-xs text-cream/50">
              <Phone className="h-3 w-3 text-gold/50" /> Admin Support: <span className="font-mono text-gold/70 ml-1">7080809908</span>
            </div>
          </div>
          <WalletCard title="Passenger Wallet" subtitle="Yatri Pay Balance"
            balance={passengerWallet} onTopUp={addPassengerMoney} badge="LIVE" />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Booking Form ────────────────────────────────────────────────── */}
        <Panel title="Book a Coolie" icon={<Package className="h-5 w-5" />} delay={0.15}>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Train</label>
              <select value={form.trainNumber}
                onChange={e => {
                  const t = TRAINS.find(x => x.num === e.target.value)!;
                  setForm({ ...form, trainNumber: t.num, trainName: t.name });
                }}
                className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold">
                {TRAINS.map(t => <option key={t.num} className="bg-maroon">{t.num} · {t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Arrival Station" value={form.arrivalStation}
                onChange={v => setForm({ ...form, arrivalStation: v })} options={STATIONS_LIST} />
              <SelectField label="Departure Station" value={form.departureStation}
                onChange={v => setForm({ ...form, departureStation: v })} options={STATIONS_LIST} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Platform #" value={form.platform} onChange={v => setForm({ ...form, platform: v })} />
              <InputField label="Bogie #" value={form.bogie} onChange={v => setForm({ ...form, bogie: v })} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Number of Bags</label>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-gold/30 bg-maroon/40 p-3">
                <button onClick={() => setForm({ ...form, luggageCount: Math.max(1, form.luggageCount - 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon">
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <div className="font-display text-4xl text-gold leading-none">{form.luggageCount}</div>
                  <div className="text-[10px] uppercase tracking-widest text-cream/60 mt-1">bags · ₹{fare} fare</div>
                </div>
                <button onClick={() => setForm({ ...form, luggageCount: Math.min(10, form.luggageCount + 1) })}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <LuggageCapture value={form.luggagePhoto} onChange={p => setForm({ ...form, luggagePhoto: p })} />
            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Service Mode</label>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-gold/30 bg-maroon/40 p-1">
                {(["platform", "bogie"] as const).map(m => (
                  <button key={m} onClick={() => setForm({ ...form, serviceMode: m })}
                    className={`relative rounded-lg py-2 text-sm font-medium transition ${form.serviceMode === m ? "text-maroon" : "text-cream/70"}`}>
                    {form.serviceMode === m && <motion.div layoutId="svc-pill" className="absolute inset-0 rounded-lg bg-gradient-gold" />}
                    <span className="relative">{m === "platform" ? "Platform Pickup" : "Inside Bogie Delivery"}</span>
                  </button>
                ))}
              </div>
            </div>
            {bookingError && (
              <div className="rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-200">{bookingError}</div>
            )}
            <button onClick={() => setShowSearch(true)}
              className="w-full rounded-xl bg-gradient-gold py-4 font-display text-xl font-bold text-maroon glow-gold hover:opacity-95">
              <Sparkles className="inline h-5 w-5 mr-2" /> Book Coolie Now · ₹{fare}
            </button>
            <p className="text-center text-[10px] text-cream/50 uppercase tracking-widest">
              <Lock className="inline h-3 w-3 mr-1" /> Amount held in escrow until OTP verification
            </p>
          </div>
        </Panel>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* OTP Card */}
          <AnimatePresence>
            {lastBooking && ["requested", "assigned"].includes(lastBooking.status) && assignedCoolie && (
              <motion.div key="otp"
                initial={{ scale: 0.8, opacity: 0, rotateY: -20 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0 }} transition={{ type: "spring", duration: 0.7 }}>
                <Panel title="Security OTP" icon={<ShieldCheck className="h-5 w-5" />} glow>
                  <div className="text-center">
                    {lastBooking.status === "requested" ? (
                      <p className="text-sm text-yellow-200">⏳ Waiting for <span className="text-gold font-semibold">{assignedCoolie.name}</span> to accept…</p>
                    ) : (
                      <p className="text-sm text-cream/80">Share this 4-digit code with your assigned coolie</p>
                    )}
                    <div className="mt-2 flex items-center justify-center gap-2 text-cream/70">
                      <span className="text-2xl">{assignedCoolie.avatar}</span>
                      <span className="font-medium">{assignedCoolie.name}</span>
                      <span className="rounded-full bg-maroon/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">{assignedCoolie.badge}</span>
                    </div>
                    {lastBooking.status === "assigned" && (
                      <div className="mt-5 flex justify-center gap-3">
                        {lastBooking.otp.split("").map((d, i) => (
                          <motion.div key={i}
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex h-20 w-16 items-center justify-center rounded-2xl bg-gradient-gold font-display text-5xl font-bold text-maroon shadow-[0_0_30px_oklch(0.85_0.16_80/0.6)]">
                            {d}
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-cream/50">
                      <Phone className="h-3 w-3 text-gold/50" /> Admin: 7080809908
                    </div>
                    {/* Cancel Deal button for active booking */}
                    {["requested", "assigned"].includes(lastBooking.status) && (
                      <button onClick={() => handleCancel(lastBooking.id)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-900/30 px-5 py-2 text-sm text-red-200 hover:bg-red-900/50">
                        <XCircle className="h-4 w-4" /> Cancel Deal
                      </button>
                    )}
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 3-Tab Booking History ─────────────────────────────────────── */}
          <Panel title="My Bookings" icon={<Train className="h-5 w-5" />} delay={0.3}>
            {/* Tab bar */}
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-gold/30 bg-maroon/40 p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`relative flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${activeTab === id ? "text-maroon" : "text-cream/60 hover:text-cream"}`}>
                  {activeTab === id && (
                    <motion.div layoutId="booking-tab" className="absolute inset-0 rounded-lg bg-gradient-gold" transition={{ type: "spring", duration: 0.4 }} />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{label}</span>
                  {id === "current" && currentBookings.length > 0 && (
                    <span className="relative ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold">
                      {currentBookings.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab 1: Current */}
            {activeTab === "current" && (
              <BookingList
                bookings={currentBookings}
                coolies={coolies}
                emptyMsg="No active bookings."
                onCancel={handleCancel}
                showCancel
                showOtp
              />
            )}

            {/* Tab 2: Upcoming (pending admin dispatch) */}
            {activeTab === "upcoming" && (
              <BookingList
                bookings={upcomingBookings}
                coolies={coolies}
                emptyMsg="No upcoming bookings awaiting dispatch."
                onCancel={handleCancel}
                showCancel
              />
            )}

            {/* Tab 3: Past */}
            {activeTab === "past" && (
              <BookingList
                bookings={pastBookings}
                coolies={coolies}
                emptyMsg="No past bookings yet."
                showFareBreakdown
              />
            )}
          </Panel>

          {/* Wallet Activity */}
          <Panel title="Wallet Activity" delay={0.4}>
            <TransactionLedger txns={transactions} perspective="passenger" />
          </Panel>
        </div>
      </div>

      {/* ── Porter Search Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSearch && (
          <PorterSearch
            station={form.arrivalStation}
            coolies={coolies}
            onSelect={handlePorterSelect}
            onClose={() => setShowSearch(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Booking list sub-component ─────────────────────────────────────────────────
function BookingList({
  bookings, coolies, emptyMsg, onCancel, showCancel, showOtp, showFareBreakdown,
}: {
  bookings: ReturnType<typeof useAppStore>["bookings"];
  coolies:  ReturnType<typeof useAppStore>["coolies"];
  emptyMsg: string;
  onCancel?: (id: string) => void;
  showCancel?: boolean;
  showOtp?: boolean;
  showFareBreakdown?: boolean;
}) {
  if (bookings.length === 0) return <p className="text-sm text-cream/60">{emptyMsg}</p>;
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {bookings.map(b => {
        const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
        const adminShare = Math.round(b.fare * 0.2);
        const coolieShare = b.fare - adminShare;
        return (
          <div key={b.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
            <div className="flex items-start gap-3">
              {b.luggagePhoto
                ? <img src={b.luggagePhoto} alt="" className="h-14 w-14 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                : <div className="h-14 w-14 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 flex-shrink-0">
                    <Package className="h-5 w-5 text-gold/40" />
                  </div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Train className="h-4 w-4 text-gold" />
                  <span className="font-semibold text-cream">{b.trainNumber}</span>
                  <span className="text-xs text-cream/60">· P{b.platform} · {b.luggageCount} bags · ₹{b.fare}</span>
                  <StatusBadge status={b.status} />
                </div>
                {coolie && (
                  <div className="mt-1 text-xs text-cream/70">
                    {coolie.avatar} {coolie.name} · <span className="text-gold">{coolie.badge}</span>
                  </div>
                )}
                {showOtp && b.status === "assigned" && (
                  <div className="mt-1 text-xs text-cream/70">
                    OTP: <span className="font-mono font-bold text-gold tracking-widest">{b.otp}</span>
                  </div>
                )}
                {showFareBreakdown && b.status === "completed" && (
                  <div className="mt-1 text-[10px] text-cream/50">
                    Paid ₹{b.fare} · Admin cut ₹{adminShare} · Porter earned ₹{coolieShare}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-cream/40">
                  {new Date(b.createdAt).toLocaleString()}
                </div>
                {/* Admin support number on current bookings */}
                {["requested", "assigned", "in_progress"].includes(b.status) && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-cream/40">
                    <Phone className="h-2.5 w-2.5" /> Admin Help: 7080809908
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Deal for active bookings */}
            {showCancel && onCancel && ["requested", "assigned", "pending"].includes(b.status) && (
              <button onClick={() => onCancel(b.id)}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-900/50 transition">
                <XCircle className="h-3.5 w-3.5" /> Cancel Deal
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    requested: "bg-yellow-600/30 text-yellow-200",
    pending:    "bg-maroon/60 text-gold",
    assigned:   "bg-gradient-gold text-maroon",
    in_progress:"bg-blue-600/30 text-blue-200",
    completed:  "bg-green-700/40 text-green-200",
    cancelled:  "bg-red-700/40 text-red-200",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold">
        {options.map(o => <option key={o} className="bg-maroon">{o}</option>)}
      </select>
    </div>
  );
}
