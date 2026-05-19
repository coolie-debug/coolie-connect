import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Briefcase, Shield, User, Package, Home } from "lucide-react";
import { useAppStore, type Role } from "@/store/app-store";
import { motion } from "framer-motion";

const ROLES: { id: Role; label: string; icon: typeof User; path: string }[] = [
  { id: "passenger", label: "Passenger",  icon: User,     path: "/passenger" },
  { id: "coolie",    label: "Coolie",     icon: Briefcase, path: "/coolie" },
  { id: "admin",     label: "Admin",      icon: Shield,    path: "/admin" },
];

const BOTTOM_NAV = [
  { to: "/",          label: "Home",      emoji: "🏠", icon: Home },
  { to: "/passenger", label: "Passenger", emoji: "🧳", icon: User },
  { to: "/coolie",    label: "Coolie",    emoji: "👷", icon: Briefcase },
  { to: "/parcel",    label: "Parcel",    emoji: "📦", icon: Package },
  { to: "/admin",     label: "Admin",     emoji: "🛡", icon: Shield },
];

export function Navbar() {
  const { role, setRole } = useAppStore();
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <>
      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50"
      >
        <div className="flex items-center justify-between border-b border-white/8 bg-[oklch(0.12_0.04_20)]/95 px-4 py-3 backdrop-blur-xl md:px-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg, oklch(0.88 0.17 82), oklch(0.65 0.12 58))", boxShadow: "0 0 14px oklch(0.78 0.14 75 / 0.4)" }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[oklch(0.22_0.08_22)]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v1H5V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3z" />
                <rect x="3" y="11" width="18" height="9" rx="2" />
                <path d="M7 15h.01M12 15h.01M17 15h.01" strokeWidth={2.5} />
              </svg>
            </div>
            <div className="leading-none">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-xl font-extrabold tracking-wider" style={{ color: "oklch(0.85 0.16 80)", letterSpacing: "0.1em" }}>COOLIE</span>
                <span className="text-xl font-semibold text-white/90" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>मित्र</span>
              </div>
              <p className="hidden text-[9px] uppercase tracking-[0.25em] text-white/40 md:block">Royal Railway Concierge</p>
            </div>
          </Link>

          {/* Desktop role switcher */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {ROLES.map(({ id, label, icon: Icon, path }) => {
              const active = role === id && loc.pathname.includes(id === "coolie" ? "coolie" : path.slice(1));
              return (
                <button
                  key={id}
                  onClick={() => { setRole(id); nav({ to: path }); }}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${active ? "text-[oklch(0.22_0.08_22)]" : "text-white/60 hover:text-white"}`}
                >
                  {active && (
                    <motion.div layoutId="role-pill" className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(135deg, oklch(0.88 0.17 82), oklch(0.65 0.12 58))" }}
                      transition={{ type: "spring", duration: 0.5 }} />
                  )}
                  <Icon className="relative h-4 w-4" />
                  <span className="relative">{label}</span>
                </button>
              );
            })}
            <Link
              to="/parcel"
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${loc.pathname === "/parcel" ? "text-[oklch(0.22_0.08_22)]" : "text-white/60 hover:text-white"}`}
            >
              {loc.pathname === "/parcel" && (
                <motion.div layoutId="role-pill" className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg, oklch(0.88 0.17 82), oklch(0.65 0.12 58))" }}
                  transition={{ type: "spring", duration: 0.5 }} />
              )}
              <Package className="relative h-4 w-4" />
              <span className="relative">Parcel</span>
            </Link>
          </div>

          {/* Support number (desktop) */}
          <a href="tel:7080809908" className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white transition">
            ☎ 7080809908
          </a>

          {/* Mobile: current section label */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="text-xs text-white/50">{loc.pathname === "/" ? "Home" : loc.pathname.replace("/", "").split("/")[0]}</div>
          </div>
        </div>
      </motion.header>

      {/* ── BOTTOM NAV (mobile only) ─────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[oklch(0.10_0.04_20)]/98 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {BOTTOM_NAV.map(({ to, label, emoji }) => {
          const isActive = to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-all active:scale-90"
            >
              <span className={`text-xl leading-none transition-all ${isActive ? "scale-110" : "opacity-50"}`}>
                {emoji}
              </span>
              <span className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${isActive ? "text-[oklch(0.85_0.16_80)]" : "text-white/40"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute top-0 h-0.5 w-8 rounded-full"
                  style={{ background: "linear-gradient(90deg, oklch(0.88 0.17 82), oklch(0.65 0.12 58))" }}
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
