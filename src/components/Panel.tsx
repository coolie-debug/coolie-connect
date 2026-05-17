import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PanelAccent = "passenger" | "coolie" | "admin" | "parcel" | "gold" | null;

export function Panel({
  children,
  className = "",
  delay = 0,
  title,
  icon,
  glow = false,
  accent = null,
  tag,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  title?: string;
  icon?: ReactNode;
  glow?: boolean;
  accent?: PanelAccent;
  tag?: string;
}) {
  const accentClass = accent ? `panel-accent-${accent} relative` : "relative";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass ${glow ? "glow-gold" : ""} ${accentClass} overflow-hidden ${className}`}
    >
      {/* Top accent bar rendered via CSS pseudo-element via accentClass */}

      {/* Subtle inner texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 28px, oklch(0.78 0.14 75) 28px, oklch(0.78 0.14 75) 29px)",
          backgroundSize: "100% 29px",
        }}
      />

      {/* Panel glow orb (top right) */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-10"
        style={{
          background:
            accent === "passenger"
              ? "radial-gradient(circle, oklch(0.6 0.2 250) 0%, transparent 70%)"
              : accent === "coolie"
              ? "radial-gradient(circle, oklch(0.65 0.2 150) 0%, transparent 70%)"
              : accent === "admin"
              ? "radial-gradient(circle, oklch(0.78 0.14 75) 0%, transparent 70%)"
              : accent === "parcel"
              ? "radial-gradient(circle, oklch(0.65 0.2 310) 0%, transparent 70%)"
              : "radial-gradient(circle, oklch(0.78 0.14 75) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 p-6">
        {(title || tag) && (
          <div className="mb-5 flex items-center gap-3 border-b border-gold/20 pb-3">
            {icon && (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-maroon"
                style={{ background: "var(--gradient-gold)" }}
              >
                {icon}
              </div>
            )}
            {title && (
              <h2 className="font-display text-2xl font-semibold text-gold">
                {title}
              </h2>
            )}
            {tag && (
              <span className="ml-auto rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-gold/80">
                {tag}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
