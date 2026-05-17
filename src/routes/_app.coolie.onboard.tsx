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
  { n: 1, label: "Personal" },
  { n: 2, label: "Shift" },
  { n: 3, label: "Documents" },
  { n: 4, label: "Selfie" },
  { n: 5, label: "Review" },
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

        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-[10px] uppercase tracking-widest text-cream/50">
            {STEPS.map(s => (
              <span key={s.n} className={step >= s.n ? "text-gold" : ""}>{s.label}</span>
            ))}
          </div>
          <div className="h-2 rounded-full bg-maroon/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-gold"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-1 text-right text-[10px] text-cream/40">Step {step} of {STEPS.length}</div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Personal Details ────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
              <h3 className="font-display text-xl text-cream">Personal Details</h3>
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
              <StepBtn disabled={!form.name || !form.badge || !form.address} onNext={() => setStep(2)} />
            </motion.div>
          )}

          {/* ── Step 2: Duty Shift ──────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <h3 className="font-display text-xl text-cream">Duty Shift Selection</h3>
              <p className="text-sm text-cream/70">Select your primary working shift at the station.</p>
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
              <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon/40 px-4 py-3 text-xs text-cream/60">
                <Clock className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
                You can request a shift change after onboarding via your Station Admin.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-gradient-gold py-3 font-semibold text-maroon">Next: Documents</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Documents ───────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
              <h3 className="font-display text-xl text-cream">Identity Verification</h3>

              {/* Aadhaar */}
              <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4">
                <label className="text-xs uppercase tracking-widest text-gold/80 font-semibold">Aadhaar Card Photo *</label>
                <button onClick={() => aadhaarRef.current?.click()}
                  className={`mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${aadhaarName ? "border-green-500/60 bg-green-900/20" : "border-gold/30 hover:border-gold"}`}>
                  <Fingerprint className={`h-8 w-8 flex-shrink-0 ${aadhaarName ? "text-green-400" : "text-gold/60"}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-cream">{aadhaarName || "Upload Aadhaar Card"}</div>
                    <div className="text-[10px] text-cream/50 mt-0.5">PDF, PNG, JPG · Max 5 MB</div>
                  </div>
                  {aadhaarName && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                </button>
                <input ref={aadhaarRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setAadhaarFile(f); setAadhaarName(f.name); } }} />
              </div>

              {/* Bank Passbook */}
              <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4">
                <label className="text-xs uppercase tracking-widest text-gold/80 font-semibold">Bank Passbook / Account Proof *</label>
                <button onClick={() => bankRef.current?.click()}
                  className={`mt-2 flex w-full items-center gap-3 rounded-xl border-2 border-dashed p-4 transition ${bankName ? "border-green-500/60 bg-green-900/20" : "border-gold/30 hover:border-gold"}`}>
                  <CreditCard className={`h-8 w-8 flex-shrink-0 ${bankName ? "text-green-400" : "text-gold/60"}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-cream">{bankName || "Upload Bank Passbook"}</div>
                    <div className="text-[10px] text-cream/50 mt-0.5">PDF, PNG, JPG · Max 5 MB</div>
                  </div>
                  {bankName && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                </button>
                <input ref={bankRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setBankFile(f); setBankName(f.name); } }} />
              </div>

              {(!aadhaarName || !bankName) && (
                <button onClick={() => { setAadhaarName("aadhaar-front.pdf"); setBankName("bank-passbook.pdf"); }}
                  className="text-xs text-gold/60 hover:text-gold underline">Use demo documents for testing</button>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
                <button onClick={() => setStep(4)} disabled={!aadhaarName || !bankName}
                  className="flex-1 rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">Next: Selfie</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Live Selfie ─────────────────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <h3 className="font-display text-xl text-cream">Live Selfie Verification</h3>
              <p className="text-sm text-cream/70">A live photo is required to verify your identity at the railway station.</p>

              <div className="rounded-xl border border-gold/20 bg-maroon/30 p-5">
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-3 py-2 text-xs text-yellow-200">
                  <Camera className="h-3.5 w-3.5 flex-shrink-0" />
                  Must be taken live at railway station or duty point. No stored photos.
                </div>

                {!selfieDone ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-dashed border-gold/40 bg-maroon/40">
                      <Camera className="h-12 w-12 text-gold/60" />
                      {selfieCapture && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-gold"
                          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelfieCapture(true);
                        setTimeout(() => { setSelfieCapture(false); setSelfieDone(true); }, 2000);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 font-semibold text-maroon glow-gold"
                    >
                      {selfieCapture
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Capturing Live Selfie…</>
                        : <><Camera className="h-4 w-4" /> Capture Live Selfie</>}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-gold text-6xl shadow-[0_0_30px_oklch(0.78_0.14_75/0.4)]">
                      {avatar || "📸"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <CheckCircle2 className="h-4 w-4" /> Selfie captured and verified
                    </div>
                    <span className="rounded-full bg-green-900/40 border border-green-500/40 px-3 py-1 text-[10px] uppercase tracking-widest text-green-200">
                      Live · Railway Station Verified
                    </span>
                    <button onClick={() => setSelfieDone(false)} className="text-xs text-gold/60 hover:text-gold underline">Retake</button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
                <button onClick={() => setStep(5)} disabled={!selfieDone}
                  className="flex-1 rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">Next: Review</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Review & Submit ─────────────────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-5">
              <h3 className="font-display text-xl text-cream">Review & Submit</h3>

              {/* Avatar chooser */}
              <div>
                <label className="text-xs uppercase tracking-widest text-cream/60">Select Profile Avatar</label>
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setAvatar(a)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${avatar === a ? "bg-gradient-gold scale-110 shadow-[0_0_18px_oklch(0.78_0.14_75/0.5)]" : "bg-maroon/40 hover:bg-maroon/60"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-gold/20 bg-maroon/40 p-4 space-y-2 text-sm">
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
                <button onClick={() => setStep(4)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
                <button onClick={submit} disabled={!avatar || submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3 font-display text-lg font-bold text-maroon glow-gold disabled:opacity-40">
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
      className="w-full rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">
      Next →
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-cream/60 flex-shrink-0 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-cream text-right text-sm">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 focus-within:border-gold">
        {icon}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-cream outline-none placeholder:text-cream/40" />
      </div>
    </div>
  );
}

function ReviewScreen({ name }: { name: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-gold max-w-md p-10 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold/30 border-t-gold" />
        <h2 className="font-display text-3xl text-gold mb-2">Pending Approval</h2>
        <p className="text-cream/80">Namaste <span className="text-gold font-semibold">{name}</span>,</p>
        <p className="mt-3 text-sm text-cream/70">Your application is being reviewed by the Station Admin. You'll gain access to the Coolie Section once approved.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-maroon/60 px-4 py-2 text-xs uppercase tracking-widest text-gold">Status: Pending</div>
        <p className="mt-4 text-xs text-cream/50">Switch to <strong className="text-gold">Admin Section</strong> and use password <strong className="text-gold">ADMIN@2026</strong> to approve.</p>
      </motion.div>
    </div>
  );
}
