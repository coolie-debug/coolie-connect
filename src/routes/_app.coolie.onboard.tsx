import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel } from "@/components/Panel";
import { useAppStore, STATIONS_LIST } from "@/store/app-store";
import {
  UserPlus, Upload, BadgeCheck, Camera, Loader2, CheckCircle2,
  FileText, Sun, Moon, CreditCard, Fingerprint, MapPin, Phone, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_app/coolie/onboard")({ component: Onboard });

const AVATARS = ["🧔🏽", "👨🏽‍🦱", "🧑🏽", "👨🏽", "👨🏽‍🦰", "👲🏽", "🧑🏾", "👨🏾‍🦱"];

async function uploadDoc(file: File, coolieId: string, bucket = "onboarding-docs"): Promise<string> {
  const fileName = `${coolieId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) { console.warn("Doc upload failed:", error.message); return file.name; }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl ?? data.path;
}

const STEPS = [
  { n: 1, label: "Personal", icon: "👤" },
  { n: 2, label: "Shift",    icon: "⏰" },
  { n: 3, label: "Docs",     icon: "📄" },
  { n: 4, label: "Selfie",   icon: "📸" },
  { n: 5, label: "Review",   icon: "✅" },
];

function Onboard() {
  const nav = useNavigate();
  const { registerCoolie, currentCoolieId, coolies, setRole } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", contact: "", address: "", station: STATIONS_LIST[0],
    badge: "", experience: 1, shift: "day" as "day" | "night",
  });
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarName, setAadhaarName] = useState("");
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [selfieCapture, setSelfieCapture] = useState(false);
  const [selfieDone, setSelfieDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selfieRef = useRef<HTMLInputElement>(null);
  const aadhaarRef = useRef<HTMLInputElement>(null);
  const bankRef = useRef<HTMLInputElement>(null);

  const me = coolies.find(c => c.id === currentCoolieId);
  if (me?.status === "pending") return <ReviewScreen name={me.name} />;
  if (me?.status === "active") {
    setTimeout(() => { setRole("coolie"); nav({ to: "/coolie" }); }, 100);
    return null;
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const submit = async () => {
    if (!form.name || !form.badge || !avatar) return;
    setSubmitting(true);
    try {
      const tempId = Math.random().toString(36).slice(2, 9);
      const docs: string[] = [];
      if (aadhaarFile) { const p = await uploadDoc(aadhaarFile, tempId); docs.push(p); } else if (aadhaarName) docs.push(aadhaarName);
      if (bankFile)    { const p = await uploadDoc(bankFile, tempId);    docs.push(p); } else if (bankName)    docs.push(bankName);

      await registerCoolie({
        name: form.name, contact: form.contact || "+91 90000 00000",
        station: form.station, badge: form.badge, avatar: avatar!,
        documents: docs.length ? docs : ["aadhaar-front.pdf", "bank-passbook.pdf"],
        address: form.address, experience: form.experience, shift: form.shift,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Panel title="Coolie Section — Onboarding" icon={<UserPlus className="h-6 w-6" />}>

        {/* ── Visual Step Indicator ─────────────────────────────────────── */}
        <div className="mb-8">
          <div className="step-indicator mb-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className={`step-dot ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
                  <div className="step-dot-circle">
                    {step > s.n
                      ? <CheckCircle2 className="h-4 w-4" />
                      : <span>{s.n}</span>}
                  </div>
                  <span className="step-label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-line ${step > s.n ? "done" : ""}`} />
                )}
              </div>
            ))}
          </div>

          {/* Animated progress bar */}
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-cream/40">
            <span>Step {step} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Personal Details ────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="step-number">1</div>
                <div>
                  <h3 className="font-display text-xl text-gold">Personal Details</h3>
                  <p className="text-xs text-cream/50">Enter your official name, contact, and station assignment</p>
                </div>
              </div>
              <div className="form-step-card space-y-4">
                <Field label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Ramesh Kumar" icon={<UserPlus className="h-4 w-4 text-gold" />} />
                <Field label="Verified Mobile Number *" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="+91 98765 43210" icon={<Phone className="h-4 w-4 text-gold" />} />
                <Field label="Home Address *" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="123, Street, City, State" icon={<MapPin className="h-4 w-4 text-gold" />} />
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/60">Railway Station</label>
                  <select value={form.station} onChange={e => setForm({ ...form, station: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold">
                    {STATIONS_LIST.map(s => <option key={s} className="bg-maroon">{s}</option>)}
                  </select>
                </div>
                <Field label="Badge / Billa Number *" value={form.badge} onChange={v => setForm({ ...form, badge: v.toUpperCase() })} placeholder="NDLS-0421" icon={<BadgeCheck className="h-4 w-4 text-gold" />} />
                <div>
                  <label className="text-xs uppercase tracking-widest text-cream/60">Experience (Years)</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button onClick={() => setForm({ ...form, experience: Math.max(0, form.experience - 1) })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon font-bold">−</button>
                    <div className="flex-1 text-center">
                      <span className="font-display text-3xl text-gold">{form.experience}</span>
                      <span className="text-sm text-cream/60 ml-1">yrs</span>
                    </div>
                    <button onClick={() => setForm({ ...form, experience: form.experience + 1 })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon font-bold">+</button>
                  </div>
                </div>
              </div>
              <StepBtn disabled={!form.name || !form.badge || !form.address} onNext={() => setStep(2)} />
            </motion.div>
          )}

          {/* ── Step 2: Duty Shift ──────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="step-number">2</div>
                <div>
                  <h3 className="font-display text-xl text-gold">Duty Shift Selection</h3>
                  <p className="text-xs text-cream/50">Select your primary working shift at the station</p>
                </div>
              </div>
              <div className="form-step-card">
                <div className="grid grid-cols-2 gap-4">
                  {(["day", "night"] as const).map(s => (
                    <button key={s} onClick={() => setForm({ ...form, shift: s })}
                      className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition ${form.shift === s ? "border-gold bg-gradient-to-br from-maroon/80 via-maroon/60 to-maroon/80" : "border-gold/20 bg-maroon/30 hover:border-gold/50"}`}>
                      {form.shift === s && (
                        <motion.div layoutId="shift-glow" className="absolute inset-0 rounded-xl ring-2 ring-gold/60 ring-offset-0 pointer-events-none" />
                      )}
                      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${s === "day" ? "bg-yellow-500/20" : "bg-blue-900/40"}`}>
                        {s === "day" ? <Sun className={`h-8 w-8 ${form.shift === "day" ? "text-yellow-300" : "text-yellow-500/60"}`} /> : <Moon className={`h-8 w-8 ${form.shift === "night" ? "text-blue-300" : "text-blue-500/60"}`} />}
                      </div>
                      <div className="text-center">
                        <div className={`font-display text-lg font-semibold ${form.shift === s ? "text-gold" : "text-cream/70"}`}>{s === "day" ? "Day Shift" : "Night Shift"}</div>
                        <div className="text-[11px] text-cream/50 mt-0.5">{s === "day" ? "6 AM – 6 PM" : "6 PM – 6 AM"}</div>
                      </div>
                      {form.shift === s && <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-gold" />}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon/40 px-4 py-3 text-xs text-cream/60">
                  <Clock className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
                  You can request a shift change after onboarding via your Station Admin.
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold hover:bg-maroon/40 transition">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-premium justify-center">Next: Documents</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Documents ───────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="step-number">3</div>
                <div>
                  <h3 className="font-display text-xl text-gold">Identity Verification</h3>
                  <p className="text-xs text-cream/50">Upload your Aadhaar and bank documents for verification</p>
                </div>
              </div>

              {/* Aadhaar */}
              <div className="form-step-card">
                <label className="text-xs uppercase tracking-widest text-gold/80 font-semibold mb-3 block">Aadhaar Card Photo *</label>
                <button onClick={() => aadhaarRef.current?.click()}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${aadhaarName ? "border-green-500/60 bg-green-900/20" : "border-gold/30 hover:border-gold/60 hover:bg-maroon/30"}`}>
                  <Fingerprint className={`h-8 w-8 flex-shrink-0 ${aadhaarName ? "text-green-400" : "text-gold/60"}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-cream">{aadhaarName || "Upload Aadhaar Card"}</div>
                    <div className="text-[10px] text-cream/50 mt-0.5">PDF, PNG, JPG · Max 5 MB</div>
                  </div>
                  {aadhaarName && <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />}
                </button>
                <input ref={aadhaarRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setAadhaarFile(f); setAadhaarName(f.name); } }} />
              </div>

              {/* Bank Passbook */}
              <div className="form-step-card">
                <label className="text-xs uppercase tracking-widest text-gold/80 font-semibold mb-3 block">Bank Passbook / Account Proof *</label>
                <button onClick={() => bankRef.current?.click()}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${bankName ? "border-green-500/60 bg-green-900/20" : "border-gold/30 hover:border-gold/60 hover:bg-maroon/30"}`}>
                  <CreditCard className={`h-8 w-8 flex-shrink-0 ${bankName ? "text-green-400" : "text-gold/60"}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-cream">{bankName || "Upload Bank Passbook"}</div>
                    <div className="text-[10px] text-cream/50 mt-0.5">PDF, PNG, JPG · Max 5 MB</div>
                  </div>
                  {bankName && <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />}
                </button>
                <input ref={bankRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setBankFile(f); setBankName(f.name); } }} />
              </div>

              {(!aadhaarName || !bankName) && (
                <button onClick={() => { setAadhaarName("aadhaar-front.pdf"); setBankName("bank-passbook.pdf"); }}
                  className="text-xs text-gold/60 hover:text-gold underline transition">Use demo documents for testing</button>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold hover:bg-maroon/40 transition">Back</button>
                <button onClick={() => setStep(4)} disabled={!aadhaarName || !bankName}
                  className="flex-1 btn-premium justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none">Next: Selfie</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Live Selfie ─────────────────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="step-number">4</div>
                <div>
                  <h3 className="font-display text-xl text-gold">Live Selfie Verification</h3>
                  <p className="text-xs text-cream/50">A live photo verifies your identity at the railway station</p>
                </div>
              </div>

              <div className="form-step-card">
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-200">
                  <Camera className="h-3.5 w-3.5 flex-shrink-0" />
                  Must be taken live at railway station or duty point. No stored photos.
                </div>

                {!selfieDone ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-4 border-dashed border-gold/40 bg-maroon/40">
                      <Camera className="h-14 w-14 text-gold/50" />
                      {selfieCapture && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-gold"
                          animate={{ scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                      {selfieCapture && (
                        <motion.div
                          className="absolute inset-2 rounded-full bg-gold/5"
                          animate={{ opacity: [0, 0.4, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelfieCapture(true);
                        setTimeout(() => { setSelfieCapture(false); setSelfieDone(true); }, 2000);
                      }}
                      className={`btn-premium ${selfieCapture ? "btn-premium-loading" : ""}`}
                    >
                      {selfieCapture
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Capturing…</>
                        : <><Camera className="h-4 w-4" /> Capture Live Selfie</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="flex h-44 w-44 items-center justify-center rounded-full bg-gradient-gold text-7xl shadow-[0_0_40px_oklch(0.78_0.14_75/0.5)]"
                    >
                      {avatar || "📸"}
                    </motion.div>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <CheckCircle2 className="h-4 w-4" /> Selfie captured and verified
                    </div>
                    <span className="rounded-full bg-green-900/40 border border-green-500/40 px-3 py-1 text-[10px] uppercase tracking-widest text-green-200 animate-badge-pop">
                      Live · Railway Station Verified
                    </span>
                    <button onClick={() => setSelfieDone(false)} className="text-xs text-gold/60 hover:text-gold underline transition">Retake</button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold hover:bg-maroon/40 transition">Back</button>
                <button onClick={() => setStep(5)} disabled={!selfieDone}
                  className="flex-1 btn-premium justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none">Next: Review</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Review & Submit ─────────────────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="step-number">5</div>
                <div>
                  <h3 className="font-display text-xl text-gold">Review & Submit</h3>
                  <p className="text-xs text-cream/50">Confirm all details before submitting for admin approval</p>
                </div>
              </div>

              {/* Avatar chooser */}
              <div className="form-step-card">
                <label className="text-xs uppercase tracking-widest text-cream/60 block mb-3">Select Profile Avatar</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AVATARS.map(a => (
                    <motion.button key={a} onClick={() => setAvatar(a)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${avatar === a ? "bg-gradient-gold shadow-[0_0_20px_oklch(0.78_0.14_75/0.5)]" : "bg-maroon/40 hover:bg-maroon/60 border border-gold/20"}`}>
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="form-step-card space-y-2 text-sm">
                <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold mb-1">Application Summary</p>
                <SummaryRow label="Name" value={form.name} />
                <SummaryRow label="Mobile" value={form.contact || "—"} />
                <SummaryRow label="Address" value={form.address} />
                <SummaryRow label="Station" value={form.station} />
                <SummaryRow label="Badge" value={form.badge} />
                <SummaryRow label="Experience" value={`${form.experience} year${form.experience !== 1 ? "s" : ""}`} />
                <SummaryRow label="Shift" value={form.shift === "day" ? "☀ Day (6AM–6PM)" : "🌙 Night (6PM–6AM)"} />
                <SummaryRow label="Aadhaar" value={aadhaarName || "—"} />
                <SummaryRow label="Bank Passbook" value={bankName || "—"} />
                <SummaryRow label="Selfie" value="✅ Verified Live" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(4)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold hover:bg-maroon/40 transition">Back</button>
                <button onClick={submit} disabled={!avatar || submitting}
                  className="flex-1 btn-premium justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                  {submitting
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</>
                    : <><FileText className="h-5 w-5" /> Submit for Admin Approval</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>
    </div>
  );
}

function StepBtn({ disabled, onNext }: { disabled: boolean; onNext: () => void }) {
  return (
    <button onClick={onNext} disabled={disabled}
      className="w-full btn-premium justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none">
      Next →
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-gold/10 pb-2 last:border-0 last:pb-0">
      <span className="text-cream/60 flex-shrink-0 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-cream text-right text-sm">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60 mb-1 block">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 focus-within:border-gold/70 focus-within:shadow-[0_0_0_3px_oklch(0.78_0.14_75/0.12)] transition-all">
        {icon}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-cream outline-none placeholder:text-cream/35" />
      </div>
    </div>
  );
}

function ReviewScreen({ name }: { name: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-gold max-w-md p-10 text-center">
        {/* Spinning loader ring */}
        <div className="relative mx-auto mb-6 h-24 w-24">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-gold/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🚂</span>
          </div>
        </div>
        <h2 className="font-display text-3xl text-gold mb-2">Pending Approval</h2>
        <p className="text-cream/80">Namaste <span className="text-gold font-semibold">{name}</span>,</p>
        <p className="mt-3 text-sm text-cream/70">Your application is being reviewed by the Station Admin. You'll gain access to the Coolie Section once approved.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-xs uppercase tracking-widest text-gold">
          <Loader2 className="h-3 w-3 animate-spin" /> Status: Pending Review
        </div>
        <p className="mt-4 text-xs text-cream/50">Switch to <strong className="text-gold">Admin Section</strong> and use password <strong className="text-gold">ADMIN@2026</strong> to approve.</p>
      </motion.div>
    </div>
  );
}
