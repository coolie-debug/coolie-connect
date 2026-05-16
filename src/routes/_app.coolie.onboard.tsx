import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Panel } from "@/components/Panel";
import { useAppStore, STATIONS_LIST } from "@/store/app-store";
import { UserPlus, Upload, BadgeCheck, Camera, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/coolie/onboard")({
  component: Onboard,
});

const AVATARS = ["🧔🏽", "👨🏽‍🦱", "🧑🏽", "👨🏽", "👨🏽‍🦰"];

function Onboard() {
  const nav = useNavigate();
  const { registerCoolie, currentCoolieId, coolies, setRole } = useAppStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", contact: "", station: STATIONS_LIST[0], badge: "" });
  const [docs, setDocs] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);

  const me = coolies.find(c => c.id === currentCoolieId);

  if (me && me.status === "pending") return <ReviewScreen name={me.name} />;
  if (me && me.status === "active") {
    setTimeout(() => { setRole("coolie"); nav({ to: "/coolie" }); }, 100);
    return null;
  }

  const submit = () => {
    if (!form.name || !form.badge || !avatar) return;
    registerCoolie({ ...form, avatar, documents: docs, contact: form.contact || "+91 90000 00000" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Panel title="Coolie Onboarding Station" icon={<UserPlus className="h-6 w-6" />}>
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full transition ${step >= n ? "bg-gradient-gold" : "bg-maroon/60"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-display text-xl text-cream">Personal Details</h3>
            <Field label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Ramesh Kumar" />
            <Field label="Contact Number" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="+91 98765 43210" />
            <div>
              <label className="text-xs uppercase tracking-widest text-cream/60">Preferred Railway Station</label>
              <select value={form.station} onChange={e => setForm({ ...form, station: e.target.value })} className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold">
                {STATIONS_LIST.map(s => <option key={s} className="bg-maroon">{s}</option>)}
              </select>
            </div>
            <Field label="Badge / Billa Number" value={form.badge} onChange={v => setForm({ ...form, badge: v.toUpperCase() })} placeholder="NDLS-0421" icon={<BadgeCheck className="h-4 w-4 text-gold" />} />
            <button onClick={() => setStep(2)} disabled={!form.name || !form.badge} className="w-full rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">Next: Documents</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-display text-xl text-cream">Identity Verification</h3>
            <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-gold/40 bg-maroon/30 p-10 text-center transition hover:border-gold hover:bg-maroon/50">
              <Upload className="mx-auto mb-3 h-10 w-10 text-gold" />
              <p className="font-medium text-cream">Drop Aadhaar & Police Verification</p>
              <p className="text-xs text-cream/60 mt-1">PDF, PNG, JPG · Max 5 MB</p>
              <input type="file" multiple className="hidden" onChange={e => {
                const names = Array.from(e.target.files || []).map(f => f.name);
                setDocs(prev => [...prev, ...names]);
              }} />
            </label>
            {docs.length === 0 && (
              <button onClick={() => setDocs(["aadhaar-front.pdf", "police-verification.pdf"])} className="text-xs text-gold/70 hover:text-gold underline">Use demo documents</button>
            )}
            {docs.length > 0 && (
              <div className="space-y-2">
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-maroon/40 px-3 py-2 text-sm text-cream">
                    <BadgeCheck className="h-4 w-4 text-gold" /> {d}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
              <button onClick={() => setStep(3)} disabled={docs.length === 0} className="flex-1 rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">Next: Profile Photo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-display text-xl text-cream">Profile Picture</h3>
            <div className="flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold bg-gradient-gold text-6xl shadow-[0_0_40px_oklch(0.78_0.14_75/0.5)]">
                {avatar || <Camera className="h-10 w-10 text-maroon" />}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${avatar === a ? "bg-gradient-gold scale-110" : "bg-maroon/40 hover:bg-maroon/60"}`}>{a}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="rounded-xl border border-gold/40 px-5 py-3 text-gold">Back</button>
              <button onClick={submit} disabled={!avatar} className="flex-1 rounded-xl bg-gradient-gold py-3 font-semibold text-maroon disabled:opacity-40">Submit for Approval</button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 focus-within:border-gold">
        {icon}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent text-cream outline-none placeholder:text-cream/40" />
      </div>
    </div>
  );
}

function ReviewScreen({ name }: { name: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-gold max-w-md p-10 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gold/30 border-t-gold">
          <Loader2 className="hidden" />
        </motion.div>
        <h2 className="font-display text-3xl text-gold mb-2">Review in Progress</h2>
        <p className="text-cream/80">Namaste <span className="text-gold font-semibold">{name}</span>,</p>
        <p className="mt-3 text-sm text-cream/70">
          Your application is being verified by the Station Master. You'll receive access to the Porter Terminal once an Admin approves your badge.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-maroon/60 px-4 py-2 text-xs uppercase tracking-widest text-gold">
          Status: Pending Approval
        </div>
        <p className="mt-6 text-xs text-cream/50">Tip: switch to <strong className="text-gold">Admin</strong> role from the top bar to approve yourself for testing.</p>
      </motion.div>
    </div>
  );
}
