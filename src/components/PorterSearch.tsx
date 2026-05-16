import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, CheckCircle2, Loader2, Users } from "lucide-react";
import type { Coolie } from "@/store/app-store";

const ADMIN_SUPPORT = "7080809908";

interface Props {
  station: string;
  coolies: Coolie[];
  onSelect: (coolieId: string) => void;
  onClose: () => void;
}

export function PorterSearch({ station, coolies, onSelect, onClose }: Props) {
  const [phase, setPhase] = useState<"searching" | "found">("searching");
  const [selecting, setSelecting] = useState<string | null>(null);

  const available = coolies.filter(
    (c) => c.status === "active" && c.available && c.station === station,
  );

  useEffect(() => {
    const t = setTimeout(() => setPhase("found"), 2400);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = async (id: string) => {
    setSelecting(id);
    await new Promise((r) => setTimeout(r, 600));
    onSelect(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.55 }}
        className="glass-gold w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="font-display text-2xl text-gold">Porter Search</h3>
            <p className="text-xs text-cream/60 mt-0.5">{station}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gold/30 bg-maroon/40 p-2 text-cream/70 hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Phase 1: Radar ── */}
        <AnimatePresence mode="wait">
          {phase === "searching" && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-10 px-6"
            >
              {/* Sonar rings */}
              <div className="relative flex h-48 w-48 items-center justify-center">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border-2 border-gold/40"
                    style={{ width: 48 + i * 36, height: 48 + i * 36 }}
                    animate={{ scale: [1, 1.55, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      delay: i * 0.45,
                      ease: "easeOut",
                    }}
                  />
                ))}
                {/* Sweeping arc */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 70%, oklch(0.78 0.14 75 / 0.35) 100%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Center dot */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold shadow-[0_0_30px_oklch(0.78_0.14_75/0.6)]">
                  <Users className="h-7 w-7 text-maroon" />
                </div>
                {/* Blip dots */}
                {available.slice(0, 3).map((c, i) => {
                  const angle = (i * 120 * Math.PI) / 180;
                  const r = 60 + i * 10;
                  return (
                    <motion.div
                      key={c.id}
                      className="absolute h-3 w-3 rounded-full bg-gold shadow-[0_0_8px_oklch(0.78_0.14_75)]"
                      style={{
                        left: `calc(50% + ${Math.cos(angle) * r}px - 6px)`,
                        top: `calc(50% + ${Math.sin(angle) * r}px - 6px)`,
                      }}
                      animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4 }}
                    />
                  );
                })}
              </div>

              <motion.p
                className="mt-6 font-display text-xl text-gold text-center"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                Searching for Nearby Porters…
              </motion.p>
              <p className="mt-1 text-xs text-cream/60 text-center">
                Scanning {station}
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs text-cream/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold/60" />
                Connecting to station network
              </div>
            </motion.div>
          )}

          {/* ── Phase 2: Coolie List ── */}
          {phase === "found" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="px-6 pb-6"
            >
              {available.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-cream/80 font-semibold">No porters available</p>
                  <p className="text-sm text-cream/60 mt-1">
                    All coolies at {station} are busy. Admin will assign one.
                  </p>
                  <p className="mt-4 text-xs text-cream/50">
                    Admin support:{" "}
                    <span className="text-gold font-mono">{ADMIN_SUPPORT}</span>
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 rounded-xl border border-gold/40 px-6 py-2 text-sm text-gold hover:bg-maroon/60"
                  >
                    Close — Admin will dispatch
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-cream">
                      <span className="text-gold font-display text-lg">{available.length}</span>{" "}
                      porter{available.length !== 1 ? "s" : ""} found nearby
                    </p>
                    <span className="text-[10px] text-cream/50 uppercase tracking-widest">
                      ☎ {ADMIN_SUPPORT}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {available.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 rounded-2xl border border-gold/25 bg-maroon/40 p-4 transition hover:border-gold/60 hover:bg-maroon/60"
                      >
                        {/* Avatar */}
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-gold text-4xl shadow-[0_0_18px_oklch(0.78_0.14_75/0.4)]">
                          {c.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-lg text-gold leading-tight">
                            {c.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-maroon tracking-wider">
                              {c.badge}
                            </span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-[10px] text-green-300 uppercase tracking-widest">Verified</span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-cream/60">
                            <Phone className="h-3 w-3 text-gold/60" />
                            Admin: {ADMIN_SUPPORT}
                          </div>
                          <div className="text-[10px] text-cream/50 mt-0.5">
                            {c.documents.length} doc{c.documents.length !== 1 ? "s" : ""} verified · ₹{c.earnings} earned
                          </div>
                        </div>

                        {/* Select button */}
                        <button
                          onClick={() => handleSelect(c.id)}
                          disabled={selecting !== null}
                          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-bold text-maroon glow-gold disabled:opacity-60 hover:opacity-90 active:scale-95 transition"
                        >
                          {selecting === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Select
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <p className="mt-4 text-center text-[10px] text-cream/40 uppercase tracking-widest">
                    Tap "Select" to send a request to your chosen porter
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
