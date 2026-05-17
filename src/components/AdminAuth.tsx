import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import { useAppStore, ADMIN_PASSWORD } from "@/store/app-store";

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const { adminAuthenticated, setAdminAuthenticated } = useAppStore();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const attempt = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Access denied.");
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 600);
    }
  };

  if (adminAuthenticated) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        animate={shaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="glass-gold rounded-2xl p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-gold blur-xl opacity-50" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)]">
                <Shield className="h-10 w-10 text-maroon" strokeWidth={2} />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold text-gold">Admin Section</h2>
            <p className="mt-1 text-sm text-cream/70">Restricted access · Station Master only</p>
          </div>

          {/* Lock icon row */}
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-gold/20 bg-maroon/40 px-4 py-3 text-xs text-cream/60">
            <Lock className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
            Enter Admin Password to proceed
          </div>

          {/* Password field */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && attempt()}
              placeholder="Enter admin password"
              className="w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 pr-12 text-cream outline-none placeholder:text-cream/30 focus:border-gold"
              autoFocus
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 hover:text-cream"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-900/30 px-3 py-2 text-xs text-red-200"
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={attempt}
            disabled={!password}
            className="mt-4 w-full rounded-xl bg-gradient-gold py-3 font-display text-lg font-bold text-maroon glow-gold disabled:opacity-40 hover:opacity-90 active:scale-[0.98] transition"
          >
            Unlock Admin Section
          </button>

          <p className="mt-4 text-center text-[10px] text-cream/40 uppercase tracking-widest">
            Tip: ADMIN@2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
