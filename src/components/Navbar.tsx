import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Train, Crown, Briefcase, Shield, User } from "lucide-react";
import { useAppStore, type Role } from "@/store/app-store";
import { motion } from "framer-motion";

const ROLES: { id: Role; label: string; icon: typeof User; path: string }[] = [
  { id: "passenger", label: "Passenger", icon: User, path: "/passenger" },
  { id: "coolie", label: "Coolie", icon: Briefcase, path: "/coolie" },
  { id: "admin", label: "Admin", icon: Shield, path: "/admin" },
];

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
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-gold blur-md opacity-60" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-gold">
              <Train className="h-6 w-6 text-maroon" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-none text-gold tracking-wide">Coolie Mitr</h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/70">Royal Railway Concierge</p>
          </div>
        </Link>

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

        <div className="hidden lg:flex items-center gap-2 text-xs text-cream/60">
          <Crown className="h-4 w-4 text-gold" />
          <span>{loc.pathname}</span>
        </div>
      </div>
    </motion.header>
  );
}
