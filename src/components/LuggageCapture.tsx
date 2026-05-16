import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, CameraOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LuggageCapture({ value, onChange }: { value?: string; onChange: (dataUrl: string | undefined) => void }) {
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCamera = async () => {
    setCamError(null);
    setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCamError("Camera permission denied or unavailable. Use Gallery instead.");
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamOpen(false);
  };

  const snap = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    onChange(c.toDataURL("image/jpeg", 0.8));
    closeCamera();
  };

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => onChange(String(r.result));
    r.readAsDataURL(f);
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cream/60">Luggage Media Attachment</label>
      {value ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="mt-2 relative rounded-xl border border-gold/40 bg-maroon/40 p-2 overflow-hidden">
          <img src={value} alt="Luggage" className="w-full h-44 object-cover rounded-lg" />
          <button onClick={() => onChange(undefined)} type="button"
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600">
            <X className="h-3 w-3" /> Remove
          </button>
          <div className="mt-2 text-[10px] uppercase tracking-widest text-gold/80 text-center">Luggage photo attached</div>
        </motion.div>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={openCamera}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gold/30 bg-maroon/40 py-5 text-cream hover:border-gold hover:bg-maroon/60 transition">
            <Camera className="h-6 w-6 text-gold" />
            <span className="text-xs font-semibold">Take Photo</span>
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-gold/30 bg-maroon/40 py-5 text-cream hover:border-gold hover:bg-maroon/60 transition">
            <ImageIcon className="h-6 w-6 text-gold" />
            <span className="text-xs font-semibold">Upload Gallery</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
        </div>
      )}

      <AnimatePresence>
        {camOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="glass-gold w-full max-w-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl text-gold">Capture Luggage</h3>
                <button onClick={closeCamera} className="text-cream/70 hover:text-cream"><X className="h-5 w-5" /></button>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gold/40">
                {camError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-cream/80">
                    <CameraOff className="h-10 w-10 text-gold mb-2" />
                    <p className="text-sm">{camError}</p>
                  </div>
                ) : (
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                )}
              </div>
              <button onClick={snap} disabled={!!camError}
                className="mt-4 w-full rounded-xl bg-gradient-gold py-3 font-bold text-maroon glow-gold disabled:opacity-40 disabled:cursor-not-allowed">
                <Camera className="inline h-4 w-4 mr-2" /> Snap Photo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
