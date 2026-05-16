import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Wallet, Plus, X, ArrowDownRight, ArrowUpRight, ScrollText, IndianRupee } from "lucide-react";
import type { Txn } from "@/store/app-store";

export function AnimatedBalance({ value, className = "" }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => `₹${Math.round(v).toLocaleString("en-IN")}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, mv]);
  return <motion.span className={className}>{rounded}</motion.span>;
}

export function WalletCard({
  title, subtitle, balance, accent = "gold", onTopUp, badge,
}: {
  title: string;
  subtitle?: string;
  balance: number;
  accent?: "gold" | "maroon" | "emerald";
  onTopUp?: (amt: number) => void;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-maroon/70 via-maroon/40 to-maroon/70 p-5 relative overflow-hidden glow-gold">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-gold opacity-20 blur-2xl" />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cream/70">
            <Wallet className="h-3.5 w-3.5 text-gold" /> {title}
          </div>
          {subtitle && <div className="text-[11px] text-cream/50 mt-0.5">{subtitle}</div>}
        </div>
        {badge && <span className="rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-maroon">{badge}</span>}
      </div>
      <div className="mt-3 font-display text-4xl text-gold flex items-center gap-1">
        <AnimatedBalance value={balance} />
      </div>
      {onTopUp && (
        <button onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-bold text-maroon glow-gold hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Add Money
        </button>
      )}

      {open && onTopUp && <TopUpModal onClose={() => setOpen(false)} onAdd={(a) => { onTopUp(a); setOpen(false); }} />}
    </div>
  );
}

function TopUpModal({ onClose, onAdd }: { onClose: () => void; onAdd: (a: number) => void }) {
  const [amt, setAmt] = useState(500);
  const presets = [200, 500, 1000, 2000];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-gold w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl text-gold">Add Money</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-cream/70" /></button>
        </div>
        <div className="text-center mb-4">
          <div className="text-xs uppercase tracking-widest text-cream/60">Amount</div>
          <div className="font-display text-5xl text-gold">₹{amt}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {presets.map(p => (
            <button key={p} onClick={() => setAmt(p)}
              className={`rounded-lg py-2 text-sm font-semibold transition ${amt === p ? "bg-gradient-gold text-maroon" : "border border-gold/30 bg-maroon/40 text-cream hover:bg-maroon/60"}`}>
              ₹{p}
            </button>
          ))}
        </div>
        <input type="number" value={amt} onChange={(e) => setAmt(Math.max(0, +e.target.value))}
          className="w-full rounded-xl border border-gold/30 bg-maroon/40 px-4 py-3 text-cream outline-none focus:border-gold mb-4" />
        <button onClick={() => onAdd(amt)} disabled={amt <= 0}
          className="w-full rounded-xl bg-gradient-gold py-3 font-bold text-maroon glow-gold disabled:opacity-40">
          Confirm Top-Up
        </button>
      </motion.div>
    </motion.div>
  );
}

export function TransactionLedger({ txns, perspective, coolieId }: {
  txns: Txn[]; perspective: "passenger" | "admin" | "coolie"; coolieId?: string;
}) {
  const filtered = txns.filter(t => {
    if (perspective === "coolie") return t.coolieId === coolieId;
    return true;
  });
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-cream/60">
        <ScrollText className="h-3.5 w-3.5 text-gold" /> Transaction History
      </div>
      {filtered.length === 0 && <p className="text-sm text-cream/60">No transactions yet.</p>}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filtered.map(t => {
          const amount =
            perspective === "admin" ? t.adminShare :
            perspective === "coolie" ? t.coolieShare :
            t.total;
          const positive =
            (perspective === "admin" && t.type === "release") ||
            (perspective === "coolie" && t.type === "release") ||
            (perspective === "passenger" && (t.type === "refund" || t.type === "topup"));
          return (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-gold/15 bg-maroon/30 px-3 py-2">
              <div>
                <div className="text-sm text-cream font-semibold flex items-center gap-2">
                  Trip ID #{t.tripId}
                  <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                    t.type === "release" ? "bg-green-700/40 text-green-200" :
                    t.type === "escrow" ? "bg-yellow-600/30 text-yellow-200" :
                    t.type === "refund" ? "bg-blue-700/40 text-blue-200" :
                    "bg-gold/30 text-gold"
                  }`}>{t.type}</span>
                </div>
                <div className="text-[11px] text-cream/60">
                  {t.type === "release"
                    ? `Total ₹${t.total} · Admin ₹${t.adminShare} · Partner ₹${t.coolieShare}`
                    : t.type === "topup" ? `Wallet top-up`
                    : t.type === "refund" ? `Refunded to passenger`
                    : `Escrow locked ₹${t.total}`}
                </div>
                <div className="text-[10px] text-cream/40">{new Date(t.time).toLocaleTimeString()}</div>
              </div>
              <div className={`flex items-center gap-1 font-display text-xl ${positive ? "text-green-300" : t.type === "escrow" ? "text-yellow-300" : "text-gold"}`}>
                {positive ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                <IndianRupee className="h-3 w-3" />{amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
