import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Briefcase, Shield, User } from "lucide-react";
import { useAppStore, type Role } from "@/store/app-store";
import { motion } from "framer-motion";

const ROLES: { id: Role; label: string; icon: typeof User; path: string }[] = [
  { id: "passenger", label: "Passenger", icon: User, path: "/passenger" },
  { id: "coolie", label: "Coolie", icon: Briefcase, path: "/coolie" },
  { id: "admin", label: "Admin", icon: Shield, path: "/admin" },
];

/** Bilingual porter badge icon */
function PorterBadgeIcon() {
  return (
    <div className="relative flex-shrink-0">
      <div className="absolute inset-0 rounded-full bg-gradient-gold blur-md opacity-60" />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-gold shadow-[0_0_18px_oklch(0.78_0.14_75/0.5)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-maroon" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v1H5V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3z" />
          <rect x="3" y="11" width="18" height="9" rx="2" />
          <path d="M7 15h.01M12 15h.01M17 15h.01" strokeWidth={2.5} />
          <path d="M7 11V8" strokeDasharray="2 2" />
          <path d="M17 11V8" strokeDasharray="2 2" />
        </svg>
      </div>
    </div>
  );
}

export function Navbar() {
  const { role, setRole } = useAppStore();
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 px-4 pt-4"
    >
      <div className="glass-gold mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-6 py-3">

        {/* ── Bilingual Logo ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <PorterBadgeIcon />
          <div className="leading-none">
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-display text-2xl font-extrabold tracking-wider text-gold"
                style={{ letterSpacing: "0.12em" }}
              >
                COOLIE
              </span>
              <span
                className="text-2xl font-semibold text-cream"
                style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', serif", letterSpacing: "0.04em" }}
              >
                मित्र
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60 mt-0.5">
              Royal Railway Concierge
            </p>
          </div>
        </Link>

        {/* ── Role Switcher ── */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-gold/30 bg-maroon/40 p-1">
          {ROLES.map(({ id, label, icon: Icon, path }) => {
            const active = role === id;
            return (
              <button
                key={id}
                onClick={() => { setRole(id); nav({ to: path }); }}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? "text-maroon" : "text-cream/70 hover:text-cream"}`}
              >
                {active && (
                  <motion.div layoutId="role-pill" className="absolute inset-0 rounded-full bg-gradient-gold" transition={{ type: "spring", duration: 0.5 }} />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Support number ── */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-cream/60">
          <span className="rounded-full border border-gold/30 bg-maroon/40 px-3 py-1 font-mono tracking-wider text-gold/80">
            ☎ 7080809908
          </span>
          <span className="text-cream/40">{loc.pathname}</span>
        </div>
      </div>
    </motion.header>
  );
}
