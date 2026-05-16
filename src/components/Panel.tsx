import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Panel({ children, className = "", delay = 0, title, icon, glow = false }: {
  children: ReactNode; className?: string; delay?: number; title?: string; icon?: ReactNode; glow?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass p-6 ${glow ? "glow-gold" : ""} ${className}`}
    >
      {title && (
        <div className="mb-5 flex items-center gap-3 border-b border-gold/20 pb-3">
          {icon && <div className="text-gold">{icon}</div>}
          <h2 className="font-display text-2xl font-semibold text-gold">{title}</h2>
        </div>
      )}
      {children}
    </motion.div>
  );
}
