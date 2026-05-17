import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, STATIONS_LIST } from "@/store/app-store";
import { Panel } from "@/components/Panel";
import { supabase } from "@/lib/supabase";
import {
  Package, Upload, CheckCircle2, Loader2, Phone, MapPin, Weight,
  ArrowRight, User, FileText, Camera,
} from "lucide-react";

export const Route = createFileRoute("/_app/parcel")({ component: ParcelBooking });

async function uploadToSupabase(file: File, bucket: string, folder: string): Promise<string | undefined> {
  const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (error) { console.warn("Upload failed:", error.message); return undefined; }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

const INITIAL = {
  senderName: "", senderAddress: "", receiverMobile: "",
  sourceStation: STATIONS_LIST[0], destinationStation: STATIONS_LIST[1],
  cargoDescription: "", weightKg: 1,
  senderPhotoUrl: undefined as string | undefined,
  parcelPhotoUrl: undefined as string | undefined,
};

function ParcelBooking() {
  const { submitParcel, parcelBookings } = useAppStore();
  const [form, setForm] = useState(INITIAL);
  const [senderFile, setSenderFile] = useState<File | null>(null);
  const [parcelFile, setParcelFile] = useState<File | null>(null);
  const [senderPreview, setSenderPreview] = useState<string | null>(null);
  const [parcelPreview, setParcelPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const senderRef = useRef<HTMLInputElement>(null);
  const parcelRef = useRef<HTMLInputElement>(null);

  const fareEstimate = Math.round(form.weightKg * 15);

  const handleSenderPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSenderFile(f);
    setSenderPreview(URL.createObjectURL(f));
  };

  const handleParcelPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setParcelFile(f);
    setParcelPreview(URL.createObjectURL(f));
  };

  const canSubmit = form.senderName && form.senderAddress && form.receiverMobile.length >= 10 && form.cargoDescription && form.weightKg > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const [spUrl, ppUrl] = await Promise.all([
        senderFile ? uploadToSupabase(senderFile, "sender-photos", "senders") : Promise.resolve(undefined),
        parcelFile ? uploadToSupabase(parcelFile, "parcel-photos", "parcels") : Promise.resolve(undefined),
      ]);
      const id = await submitParcel({ ...form, senderPhotoUrl: spUrl, parcelPhotoUrl: ppUrl });
      setSubmitted(id);
      setForm(INITIAL); setSenderFile(null); setSenderPreview(null); setParcelFile(null); setParcelPreview(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold shadow-[0_0_20px_oklch(0.78_0.14_75/0.4)]">
          <Package className="h-7 w-7 text-maroon" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-gold">Parcel Booking</h1>
          <p className="text-sm text-cream/60">Railway Cargo & Freight Transport · ₹15/kg</p>
        </div>
        <div className="ml-auto text-xs text-cream/50 font-mono">
          ☎ 7080809908
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Booking Form ──────────────────────────────────────────────────── */}
        <Panel title="New Parcel Booking" icon={<FileText className="h-5 w-5" />}>
          <div className="space-y-5">

            {/* Sender info */}
            <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4 space-y-4">
              <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold">Sender Details</p>

              {/* Sender photo */}
              <div className="flex items-center gap-4">
                <button onClick={() => senderRef.current?.click()} className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gold/40 bg-maroon/40 transition hover:border-gold overflow-hidden">
                  {senderPreview
                    ? <img src={senderPreview} alt="sender" className="h-full w-full object-cover" />
                    : <Camera className="h-7 w-7 text-gold/60" />}
                </button>
                <input ref={senderRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleSenderPhoto} />
                <div className="flex-1 space-y-3">
                  <Field label="Sender Name *" value={form.senderName} onChange={v => setForm({ ...form, senderName: v })} placeholder="Rajan Sharma" icon={<User className="h-3.5 w-3.5 text-gold/60" />} />
                </div>
              </div>

              <Field label="Sender Address *" value={form.senderAddress} onChange={v => setForm({ ...form, senderAddress: v })} placeholder="House 12, Sector 5, New Delhi" icon={<MapPin className="h-3.5 w-3.5 text-gold/60" />} />
            </div>

            {/* Receiver info */}
            <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4 space-y-4">
              <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold">Receiver Details</p>
              <Field label="Receiver Mobile Number *" value={form.receiverMobile} onChange={v => setForm({ ...form, receiverMobile: v.replace(/\D/g, "").slice(0, 10) })} placeholder="9876543210" icon={<Phone className="h-3.5 w-3.5 text-gold/60" />} inputMode="tel" />
            </div>

            {/* Route */}
            <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4 space-y-4">
              <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold">Route</p>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <SelectField label="Source Station" value={form.sourceStation} onChange={v => setForm({ ...form, sourceStation: v })} options={STATIONS_LIST} />
                <ArrowRight className="mt-5 h-5 w-5 text-gold/50 flex-shrink-0" />
                <SelectField label="Destination Station" value={form.destinationStation} onChange={v => setForm({ ...form, destinationStation: v })} options={STATIONS_LIST} />
              </div>
            </div>

            {/* Cargo */}
            <div className="rounded-xl border border-gold/20 bg-maroon/30 p-4 space-y-4">
              <p className="text-xs uppercase tracking-widest text-gold/70 font-semibold">Cargo Details</p>
              <Field label="Item Description *" value={form.cargoDescription} onChange={v => setForm({ ...form, cargoDescription: v })} placeholder="Electronics, books, clothes…" icon={<Package className="h-3.5 w-3.5 text-gold/60" />} />

              <div>
                <label className="text-xs uppercase tracking-widest text-cream/60">Estimated Weight (KG) *</label>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setForm({ ...form, weightKg: Math.max(0.5, form.weightKg - 0.5) })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon font-bold text-lg">−</button>
                  <div className="flex-1 text-center">
                    <span className="font-display text-3xl text-gold">{form.weightKg}</span>
                    <span className="text-sm text-cream/60 ml-1">kg</span>
                  </div>
                  <button onClick={() => setForm({ ...form, weightKg: form.weightKg + 0.5 })} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-maroon font-bold text-lg">+</button>
                  <div className="ml-2">
                    <input type="number" value={form.weightKg} min={0.5} step={0.5}
                      onChange={e => setForm({ ...form, weightKg: Math.max(0.5, Number(e.target.value)) })}
                      className="w-20 rounded-xl border border-gold/30 bg-maroon/40 px-3 py-2 text-center text-cream outline-none focus:border-gold text-sm" />
                  </div>
                </div>
              </div>

              {/* Parcel photo */}
              <div>
                <label className="text-xs uppercase tracking-widest text-cream/60">Parcel / Cargo Photo</label>
                <button onClick={() => parcelRef.current?.click()}
                  className="mt-2 relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/40 bg-maroon/30 py-6 transition hover:border-gold overflow-hidden">
                  {parcelPreview
                    ? <img src={parcelPreview} alt="parcel" className="h-32 w-auto rounded-xl object-cover" />
                    : <>
                        <Upload className="mb-2 h-8 w-8 text-gold/60" />
                        <p className="text-sm text-cream/70">Upload parcel photo</p>
                        <p className="text-xs text-cream/40 mt-1">PNG, JPG · Max 10 MB</p>
                      </>}
                </button>
                <input ref={parcelRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleParcelPhoto} />
              </div>
            </div>

            {/* Fare estimate */}
            <div className="rounded-xl border border-gold/30 bg-maroon/40 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-cream/70">
                <Weight className="h-4 w-4 text-gold" />
                <span className="text-sm">Estimated Freight Fare</span>
              </div>
              <span className="font-display text-2xl text-gold">₹{fareEstimate}</span>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!canSubmit || submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold py-4 font-display text-xl font-bold text-maroon glow-gold disabled:opacity-40 hover:opacity-95 active:scale-[0.99] transition">
              {submitting
                ? <><Loader2 className="h-5 w-5 animate-spin" /> Booking Parcel…</>
                : <><Package className="h-5 w-5" /> Book Parcel Cargo · ₹{fareEstimate}</>}
            </button>
            <p className="text-center text-[10px] text-cream/40 uppercase tracking-widest">
              ☎ Admin Support: 7080809908
            </p>
          </div>
        </Panel>

        {/* ── Right: Confirmation + History ─────────────────────────────────── */}
        <div className="space-y-6">
          {/* Success confirmation */}
          <AnimatePresence>
            {submitted && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-2xl border-2 border-green-500/60 bg-green-900/30 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
                <h3 className="font-display text-xl text-green-300">Parcel Booked!</h3>
                <p className="text-sm text-cream/80 mt-2">Tracking ID: <span className="font-mono text-gold font-bold">{submitted.toUpperCase()}</span></p>
                <p className="text-xs text-cream/60 mt-2">Admin will confirm pickup and freight details. Support: 7080809908</p>
                <button onClick={() => setSubmitted(null)} className="mt-4 rounded-xl border border-green-500/40 px-5 py-2 text-sm text-green-300 hover:bg-green-900/40">Book Another</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parcel history */}
          <Panel title="Parcel History" icon={<Package className="h-5 w-5" />}>
            {parcelBookings.length === 0
              ? <p className="text-sm text-cream/60">No parcel bookings yet.</p>
              : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {parcelBookings.map(p => (
                    <div key={p.id} className="rounded-xl border border-gold/20 bg-maroon/40 p-3">
                      <div className="flex items-start gap-3">
                        {p.parcelPhotoUrl
                          ? <img src={p.parcelPhotoUrl} alt="parcel" className="h-14 w-14 rounded-lg object-cover border border-gold/40 flex-shrink-0" />
                          : <div className="h-14 w-14 flex items-center justify-center rounded-lg border border-gold/20 bg-maroon/60 flex-shrink-0"><Package className="h-5 w-5 text-gold/40" /></div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-cream">{p.senderName}</span>
                            <ParcelStatusBadge status={p.status} />
                          </div>
                          <div className="text-xs text-cream/70 mt-0.5">
                            {p.sourceStation.split("(")[0].trim()} → {p.destinationStation.split("(")[0].trim()}
                          </div>
                          <div className="text-xs text-cream/60 mt-0.5">{p.cargoDescription} · {p.weightKg}kg</div>
                          <div className="text-xs text-gold mt-0.5">Est. ₹{p.fareEstimate}</div>
                          <div className="text-[10px] text-cream/40 mt-0.5">{new Date(p.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ParcelStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "bg-yellow-600/30 text-yellow-200",
    in_transit: "bg-blue-600/30 text-blue-200",
    delivered:  "bg-green-700/40 text-green-200",
    cancelled:  "bg-red-700/40 text-red-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${map[status] ?? "bg-maroon/60 text-cream"}`}>{status.replace("_", " ")}</span>;
}

function Field({ label, value, onChange, placeholder, icon, inputMode }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 focus-within:border-gold">
        {icon}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode}
          className="w-full bg-transparent text-cream outline-none placeholder:text-cream/30" />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold text-sm">
        {options.map(o => <option key={o} className="bg-maroon">{o}</option>)}
      </select>
    </div>
  );
}
