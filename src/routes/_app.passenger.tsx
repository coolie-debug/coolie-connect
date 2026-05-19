import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, STATIONS_LIST } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { LuggageCapture } from "@/components/LuggageCapture";
import { WalletCard, TransactionLedger } from "@/components/Wallet";
import { PorterSearch } from "@/components/PorterSearch";
import { motion, AnimatePresence } from "framer-motion";
import { playCancelTone } from "@/lib/sound";
import {
  User, CreditCard, Crown, Train, Package, Plus, Minus,
  ShieldCheck, Sparkles, Lock, Phone, Clock, History, Zap,
  XCircle, AlertCircle, CheckCircle2, Loader2, IndianRupee, MapPin,
} from "lucide-react";

export const Route = createFileRoute("/_app/passenger")({ component: Passenger });

const TRAINS = [
  { num: "12951", name: "Mumbai Rajdhani" }, { num: "12181", name: "Dayodaya Express" },
  { num: "12423", name: "Dibrugarh Rajdhani" }, { num: "12002", name: "Bhopal Shatabdi" },
  { num: "CUSTOM", name: "Other / Custom Train" },
];

const TABS = [
  { id: "current",  label: "Current",  icon: Zap },
  { id: "upcoming", label: "Upcoming", icon: Clock },
  { id: "past",     label: "Past",     icon: History },
] as const;
type TabId = typeof TABS[number]["id"];

const ADMIN_SUPPORT = "7080809908";

function Passenger() {
  const {
    passengerProfile, bookWithCoolie, cancelBooking,
    coolies, bookings, passengerWallet, passengerEscrow,
    addPassengerMoney, transactions, dynamicFarePerBag,
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fare = form.luggageCount * dynamicFarePerBag;

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
    setCancellingId(id);
    playCancelTone();
    await cancelBooking(id, "passenger");
    setCancellingId(null);
  };

  return (
    <div className="space-y-6">

      {/* ── Profile + Wallet ─────────────────────────────────────────────── */}
      <Panel title="Passenger Only" icon={<User className="h-5 w-5" />}>
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-5xl shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)]"
          >
            {passengerProfile.avatar}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-2xl text-gold">{passengerProfile.name}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-maroon animate-badge-pop">
                <Crown className="h-3 w-3" /> {passengerProfile.tier}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-cream/70">
              {passengerProfile.payments.map(p => (
                <span key={p} className="inline-flex items-center gap-1 rounded-full bg-maroon/40 px-3 py-1 border border-gold/15">
                  <CreditCard className="h-3 w-3 text-gold" /> {p}
                </span>
              ))}
            </div>
            {passengerEscrow > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-700/30 border border-yellow-500/25 px-3 py-1 text-xs text-yellow-200">
                <Lock className="h-3 w-3" /> ₹{passengerEscrow} locked in escrow
              </div>
            )}
            <div className="mt-2 flex items-center gap-1 text-xs text-cream/50">
              <Phone className="h-3 w-3 text-gold/50" /> Admin Support: <span className="font-mono text-gold/70 ml-1">{ADMIN_SUPPORT}</span>
            </div>
          </div>
          <WalletCard title="Passenger Wallet" subtitle="Yatri Pay Balance"
            balance={passengerWallet} onTopUp={addPassengerMoney} badge="LIVE" />
        </div>
      </Panel>

      {/* Dynamic fare notice */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-gold/25 bg-maroon/30 px-5 py-3"
        style={{ background: "linear-gradient(135deg, oklch(0.28 0.1 22 / 0.6), oklch(0.2 0.07 20 / 0.7))" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold flex-shrink-0">
          <IndianRupee className="h-4 w-4 text-maroon" />
        </div>
        <div>
          <span className="text-sm text-cream/80">Platform rate: </span>
          <span className="font-bold text-gold">₹{dynamicFarePerBag}/bag</span>
        </div>
        <span className="ml-auto text-cream/40 text-xs">set by Admin · may change</span>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Booking Form ────────────────────────────────────────────────── */}
        <Panel title="Book a Coolie" icon={<Package className="h-5 w-5" />} delay={0.1}>
          <div className="space-y-5">

            {/* Section A: Train Details */}
            <div className="form-step-card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-maroon text-xs font-bold">A</div>
                <span className="text-xs uppercase tracking-widest text-cream/50">Train Details</span>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-cream/60 mb-1 block">Train</label>
                <select value={form.trainNumber}
                  onChange={e => { const t = TRAINS.find(x => x.num === e.target.value)!; setForm({ ...form, trainNumber: t.num, trainName: t.name }); }}
                  className="w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold/70 transition">
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
            </div>

            {/* Section B: Luggage */}
            <div className="form-step-card space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-maroon text-xs font-bold">B</div>
                <span className="text-xs uppercase tracking-widest text-cream/50">Luggage Details</span>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-cream/60">Number of Bags</label>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-gold/30 bg-maroon/40 p-3">
                  <button onClick={() => setForm({ ...form, luggageCount: Math.max(1, form.luggageCount - 1) })}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon shadow-[0_0_12px_oklch(0.78_0.14_75/0.4)] active:scale-95 transition">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <div className="font-display text-4xl text-gold leading-none">{form.luggageCount}</div>
                    <div className="text-[10px] uppercase tracking-widest text-cream/60 mt-1">bags · ₹{fare} fare</div>
                  </div>
                  <button onClick={() => setForm({ ...form, luggageCount: Math.min(10, form.luggageCount + 1) })}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon shadow-[0_0_12px_oklch(0.78_0.14_75/0.4)] active:scale-95 transition">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <LuggageCapture value={form.luggagePhoto} onChange={p => setForm({ ...form, luggagePhoto: p })} />
            </div>

            {/* Section C: Service Mode */}
            <div className="form-step-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-gold text-maroon text-xs font-bold">C</div>
                <span className="text-xs uppercase tracking-widest text-cream/50">Service Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-gold/30 bg-maroon/40 p-1">
                {(["platform", "bogie"] as const).map(m => (
                  <button key={m} onClick={() => setForm({ ...form, serviceMode: m })}
                    className={`relative rounded-lg py-2.5 text-sm font-medium transition ${form.serviceMode === m ? "text-maroon" : "text-cream/70 hover:text-cream"}`}>
                    {form.serviceMode === m && <motion.div layoutId="svc-pill" className="absolute inset-0 rounded-lg bg-gradient-gold shadow-[0_0_12px_oklch(0.78_0.14_75/0.4)]" />}
                    <span className="relative">{m === "platform" ? "🚉 Platform Pickup" : "🚃 Inside Bogie"}</span>
                  </button>
                ))}
              </div>
            </div>

            {bookingError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-200"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {bookingError}
              </motion.div>
            )}

            <button onClick={() => setShowSearch(true)}
              className="btn-premium w-full justify-center text-lg">
              <Sparkles className="h-5 w-5" /> Book Coolie Now · ₹{fare}
            </button>
            <p className="text-center text-[10px] text-cream/40 uppercase tracking-widest">
              <Lock className="inline h-3 w-3 mr-1" /> Amount held in escrow · Admin: {ADMIN_SUPPORT}
            </p>
          </div>
        </Panel>

        {/* ── Right Column ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* OTP / Fare Status Card */}
          <AnimatePresence>
            {lastBooking && ["requested", "assigned", "in_progress"].includes(lastBooking.status) && (
              <motion.div key="otp" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", duration: 0.7 }}>
                <Panel title="Booking Status" icon={<ShieldCheck className="h-5 w-5" />} glow>
                  {/* Fare Status */}
                  <div className={`mb-4 rounded-xl border px-4 py-3 text-center ${lastBooking.fareConfirmed ? "border-green-500/40 bg-green-900/20" : "border-yellow-500/30 bg-yellow-900/20"}`}>
                    {lastBooking.fareConfirmed ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-green-300 text-xs uppercase tracking-widest">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Final Rate Confirmed
                        </div>
                        <div className="font-display text-3xl text-gold">
                          ₹{lastBooking.customFare ?? lastBooking.fare}
                        </div>
                        <div className="text-xs text-cream/50">Final Rate for Booking</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-yellow-200 text-xs uppercase tracking-widest">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rate Calculating
                        </div>
                        <div className="font-display text-2xl text-cream/80">Please Wait…</div>
                        <div className="text-xs text-cream/50">Est. ₹{lastBooking.fare} · Admin will confirm final rate</div>
                      </div>
                    )}
                  </div>

                  {/* Coolie info */}
                  {assignedCoolie && (
                    <div className="mb-4">
                      {lastBooking.status === "requested" ? (
                        <p className="text-center text-sm text-yellow-200">⏳ Waiting for <span className="text-gold font-semibold">{assignedCoolie.name}</span> to accept…</p>
                      ) : (
                        <div className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
                          <p className="text-xs uppercase tracking-widest text-cream/60 mb-2">Assigned Porter</p>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{assignedCoolie.avatar}</span>
                            <div>
                              <div className="font-semibold text-cream">{assignedCoolie.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-maroon">{assignedCoolie.badge}</span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                              </div>
                            </div>
                            <div className="ml-auto text-right">
                              <div className="text-[10px] text-cream/50 uppercase tracking-widest">Need help?</div>
                              <div className="font-mono text-xs text-gold">{ADMIN_SUPPORT}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OTP Display */}
                  {lastBooking.status === "assigned" && (
                    <div className="text-center">
                      <p className="text-xs text-cream/70 mb-3">Share this 4-digit OTP with your porter</p>
                      <div className="flex justify-center gap-3">
                        {lastBooking.otp.split("").map((d, i) => (
                          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                            className="flex h-20 w-16 items-center justify-center rounded-2xl bg-gradient-gold font-display text-5xl font-bold text-maroon shadow-[0_0_30px_oklch(0.85_0.16_80/0.6)]">
                            {d}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {["requested", "assigned"].includes(lastBooking.status) && (
                    <button onClick={() => handleCancel(lastBooking.id)} disabled={cancellingId === lastBooking.id}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-900/30 px-5 py-2 text-sm text-red-200 hover:bg-red-900/50 transition">
                      {cancellingId === lastBooking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Cancel Deal
                    </button>
                  )}
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 3-Tab Booking History ──────────────────────────────────────── */}
          <Panel title="My Bookings" icon={<Train className="h-5 w-5" />} delay={0.2}>
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

            {activeTab === "current" && (
              <BookingList bookings={currentBookings} coolies={coolies} emptyMsg="No active bookings." onCancel={handleCancel} cancellingId={cancellingId} showCancel showOtp showFareStatus />
            )}
            {activeTab === "upcoming" && (
              <BookingList bookings={upcomingBookings} coolies={coolies} emptyMsg="No upcoming bookings awaiting dispatch." onCancel={handleCancel} cancellingId={cancellingId} showCancel />
            )}
            {activeTab === "past" && (
              <BookingList bookings={pastBookings} coolies={coolies} emptyMsg="No past bookings yet." showFareBreakdown />
            )}
          </Panel>

          <Panel title="Wallet Activity" delay={0.3}>
            <TransactionLedger txns={transactions} perspective="passenger" />
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <PorterSearch station={form.arrivalStation} coolies={coolies} onSelect={handlePorterSelect} onClose={() => setShowSearch(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingList({ bookings, coolies, emptyMsg, onCancel, cancellingId, showCancel, showOtp, showFareBreakdown, showFareStatus }: {
  bookings: ReturnType<typeof useAppStore>["bookings"];
  coolies:  ReturnType<typeof useAppStore>["coolies"];
  emptyMsg: string; onCancel?: (id: string) => void; cancellingId?: string | null;
  showCancel?: boolean; showOtp?: boolean; showFareBreakdown?: boolean; showFareStatus?: boolean;
}) {
  if (bookings.length === 0) return (
    <div className="py-6 text-center">
      <div className="text-3xl mb-2 opacity-50">📭</div>
      <p className="text-sm text-cream/50">{emptyMsg}</p>
    </div>
  );
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {bookings.map(b => {
        const coolie = b.assignedCoolieId ? coolies.find(c => c.id === b.assignedCoolieId) : null;
        const effectiveFare = b.customFare ?? b.fare;
        const adminShare = Math.round(effectiveFare * 0.2);
        const coolieShare = effectiveFare - adminShare;
        return (
          <div key={b.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-3 hover:border-gold/35 transition">
            <div className="flex items-start gap-3">
              {b.luggagePhoto
                ? <img src={b.luggagePhoto} alt="" className="h-14 w-14 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                : <div className="h-14 w-14 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 flex-shrink-0"><Package className="h-5 w-5 text-gold/40" /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Train className="h-4 w-4 text-gold" />
                  <span className="font-semibold text-cream">{b.trainNumber}</span>
                  <span className="text-xs text-cream/60">P{b.platform} · {b.luggageCount}bg</span>
                  <StatusBadge status={b.status} />
                </div>
                {showFareStatus && (
                  <div className="mt-1">
                    {b.fareConfirmed
                      ? <span className="text-xs text-green-300 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Final Rate: ₹{effectiveFare}</span>
                      : <span className="text-xs text-yellow-200 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Rate Calculating: Please Wait…</span>}
                  </div>
                )}
                {coolie && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-cream/70">
                    <span>{coolie.avatar} {coolie.name}</span>
                    <span className="rounded-full bg-maroon/60 px-1.5 py-0.5 text-gold text-[9px]">{coolie.badge}</span>
                    <Phone className="h-3 w-3 text-gold/40" />
                    <span className="text-gold/70 font-mono">{ADMIN_SUPPORT}</span>
                  </div>
                )}
                {showOtp && b.status === "assigned" && (
                  <div className="mt-1 text-xs text-cream/70">OTP: <span className="font-mono font-bold text-gold tracking-widest">{b.otp}</span></div>
                )}
                {showFareBreakdown && b.status === "completed" && (
                  <div className="mt-1 text-[10px] text-cream/50">₹{effectiveFare} total · Admin ₹{adminShare} · Porter ₹{coolieShare}</div>
                )}
                <div className="mt-1 text-[10px] text-cream/40">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
            </div>
            {showCancel && onCancel && ["requested", "assigned", "pending"].includes(b.status) && (
              <button onClick={() => onCancel(b.id)} disabled={cancellingId === b.id}
                className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-900/50 transition">
                {cancellingId === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Cancel Deal
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
    requested: "bg-yellow-600/30 text-yellow-200", pending: "bg-maroon/60 text-gold",
    assigned: "bg-gradient-gold text-maroon", in_progress: "bg-blue-600/30 text-blue-200",
    completed: "bg-green-700/40 text-green-200", cancelled: "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60 mb-1 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="input-royal" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60 mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold/70 transition">
        {options.map(o => <option key={o} className="bg-maroon">{o}</option>)}
      </select>
    </div>
  );
}
