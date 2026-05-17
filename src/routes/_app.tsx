import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: Layout,
});

/* ─── Section-specific backdrop config ─────────────────────────────────────── */
type SectionKey = "passenger" | "coolie" | "admin" | "parcel" | "default";

const SECTION_CONFIG: Record<SectionKey, {
  orbs: { cx: string; cy: string; color: string; size: number; delay: number }[];
  trackColor: string;
}> = {
  passenger: {
    orbs: [
      { cx: "10%",  cy: "20%", color: "oklch(0.55 0.2 250 / 0.14)", size: 500, delay: 0 },
      { cx: "80%",  cy: "60%", color: "oklch(0.65 0.18 220 / 0.1)",  size: 400, delay: 2 },
      { cx: "50%",  cy: "90%", color: "oklch(0.78 0.14 75 / 0.08)",  size: 300, delay: 1 },
    ],
    trackColor: "oklch(0.55 0.2 250 / 0.3)",
  },
  coolie: {
    orbs: [
      { cx: "5%",   cy: "40%", color: "oklch(0.65 0.22 150 / 0.14)", size: 500, delay: 0 },
      { cx: "85%",  cy: "20%", color: "oklch(0.55 0.18 140 / 0.1)",  size: 400, delay: 1.5 },
      { cx: "45%",  cy: "80%", color: "oklch(0.78 0.14 75 / 0.07)",  size: 300, delay: 0.8 },
    ],
    trackColor: "oklch(0.65 0.22 150 / 0.3)",
  },
  admin: {
    orbs: [
      { cx: "15%",  cy: "15%", color: "oklch(0.78 0.14 75 / 0.18)",  size: 600, delay: 0 },
      { cx: "75%",  cy: "50%", color: "oklch(0.65 0.12 58 / 0.12)",  size: 450, delay: 2 },
      { cx: "40%",  cy: "85%", color: "oklch(0.78 0.14 75 / 0.08)",  size: 350, delay: 1 },
    ],
    trackColor: "oklch(0.78 0.14 75 / 0.35)",
  },
  parcel: {
    orbs: [
      { cx: "8%",   cy: "30%", color: "oklch(0.65 0.2 310 / 0.14)", size: 480, delay: 0 },
      { cx: "78%",  cy: "55%", color: "oklch(0.55 0.18 290 / 0.1)", size: 380, delay: 1.8 },
      { cx: "45%",  cy: "90%", color: "oklch(0.78 0.14 75 / 0.06)", size: 280, delay: 0.9 },
    ],
    trackColor: "oklch(0.65 0.2 310 / 0.3)",
  },
  default: {
    orbs: [
      { cx: "15%",  cy: "20%", color: "oklch(0.78 0.14 75 / 0.12)", size: 500, delay: 0 },
      { cx: "80%",  cy: "60%", color: "oklch(0.78 0.14 75 / 0.08)", size: 400, delay: 2 },
    ],
    trackColor: "oklch(0.78 0.14 75 / 0.25)",
  },
};

function getSectionKey(pathname: string): SectionKey {
  if (pathname.includes("/passenger")) return "passenger";
  if (pathname.includes("/coolie"))    return "coolie";
  if (pathname.includes("/admin"))     return "admin";
  if (pathname.includes("/parcel"))    return "parcel";
  return "default";
}

/* ─── Section hero header ────────────────────────────────────────────────────── */
const SECTION_HEADERS: Record<SectionKey, { title: string; subtitle: string; svgBg: React.ReactNode } | null> = {
  passenger: {
    title: "Passenger Only",
    subtitle: "Book certified porters · Secure escrow · OTP handoff",
    svgBg: <PassengerBg />,
  },
  coolie: {
    title: "Coolie Section",
    subtitle: "Accept jobs · Track earnings · Duty shift management",
    svgBg: <CoolieBg />,
  },
  admin: {
    title: "Admin Section",
    subtitle: "Station Master Command Center · Password Protected",
    svgBg: <AdminBg />,
  },
  parcel: {
    title: "Parcel Booking",
    subtitle: "Railway Cargo & Freight Transport · ₹15 per kg",
    svgBg: <ParcelBg />,
  },
  default: null,
};

/* ─── Section background SVGs ────────────────────────────────────────────────── */
function PassengerBg() {
  return (
    <svg viewBox="0 0 600 160" fill="none" className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      {/* Train silhouette */}
      <rect x="80" y="50" width="300" height="80" rx="12" fill="oklch(0.55 0.2 250)" />
      <path d="M380 50 L420 72 L420 130 L380 130 Z" fill="oklch(0.55 0.2 250)" />
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={90 + i * 40} y="60" width="30" height="22" rx="4" fill="oklch(0.7 0.2 220)" />
      ))}
      {[120,200,280,400].map(x => (
        <circle key={x} cx={x} cy="130" r="14" fill="oklch(0.4 0.15 240)" />
      ))}
      {/* Track */}
      <line x1="0" y1="145" x2="600" y2="145" stroke="oklch(0.55 0.2 250)" strokeWidth="3" />
      <line x1="0" y1="155" x2="600" y2="155" stroke="oklch(0.55 0.2 250)" strokeWidth="3" />
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
        <rect key={i} x={i * 50} y="139" width="34" height="22" rx="2" fill="oklch(0.4 0.12 240)" />
      ))}
      {/* Platform lights */}
      {[50,150,250,350,450,550].map(x => (
        <g key={x}>
          <circle cx={x} cy="20" r="6" fill="oklch(0.85 0.2 85)" />
          <line x1={x} y1="26" x2={x} y2="50" stroke="oklch(0.85 0.2 85)" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function CoolieBg() {
  return (
    <svg viewBox="0 0 600 160" fill="none" className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      {/* Porter figures */}
      {[80, 220, 370, 500].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="50" r="14" fill="oklch(0.65 0.22 150)" />
          <path d={`M${x-16} 68 Q${x} 64 ${x+16} 68 L${x+18} 110 Q${x} 114 ${x-18} 110 Z`} fill="oklch(0.5 0.18 145)" />
          {/* Bags */}
          <rect x={x + 18} y="60" width="22" height="18" rx="3" fill={i % 2 === 0 ? "oklch(0.6 0.16 60)" : "oklch(0.55 0.15 30)"} />
          <rect x={x + 18} y="80" width="18" height="14" rx="3" fill={i % 2 === 0 ? "oklch(0.5 0.14 40)" : "oklch(0.65 0.16 70)"} />
        </g>
      ))}
      {/* Station platform */}
      <rect x="0" y="120" width="600" height="40" fill="oklch(0.45 0.16 145)" />
      <rect x="0" y="118" width="600" height="4" fill="oklch(0.65 0.22 150)" />
      {/* Earning coins */}
      {[140, 290, 440].map(x => (
        <g key={x}>
          <circle cx={x} cy="95" r="10" fill="oklch(0.78 0.14 75)" />
          <text x={x} y="99" textAnchor="middle" fontSize="9" fill="oklch(0.2 0.05 20)">₹</text>
        </g>
      ))}
    </svg>
  );
}

function AdminBg() {
  return (
    <svg viewBox="0 0 600 160" fill="none" className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      {/* Control room panels */}
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={20 + i * 116} y="20" width="100" height="100" rx="6"
          fill="oklch(0.78 0.14 75)" />
      ))}
      {/* Screen lines */}
      {[0, 1, 2, 3, 4].map(i =>
        [0,1,2,3].map(j => (
          <rect key={`${i}-${j}`} x={30 + i * 116} y={32 + j * 22} width={80} height="10" rx="2"
            fill="oklch(0.35 0.1 22)" />
        ))
      )}
      {/* Status dots */}
      {[0, 1, 2, 3, 4].map(i =>
        [0,1,2].map(j => (
          <circle key={`${i}-${j}`}
            cx={30 + i * 116 + j * 14} cy="108"
            r="4"
            fill={j === 0 ? "oklch(0.7 0.22 150)" : j === 1 ? "oklch(0.78 0.14 75)" : "oklch(0.6 0.22 25)"} />
        ))
      )}
      {/* Shield icon */}
      <path d="M280 10 L310 20 L310 50 Q310 70 280 80 Q250 70 250 50 L250 20 Z"
        fill="oklch(0.78 0.14 75)" opacity="0.8" />
    </svg>
  );
}

function ParcelBg() {
  return (
    <svg viewBox="0 0 600 160" fill="none" className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
      {/* Cargo boxes */}
      {[40, 150, 260, 370, 480].map((x, i) => (
        <g key={x}>
          <rect x={x} y={50 - i * 5} width={70 + i * 4} height={60 + i * 4} rx="4"
            fill="oklch(0.65 0.2 310)" />
          {/* Box tape */}
          <line x1={x} y1={80 - i * 5 + 2} x2={x + 70 + i * 4} y2={80 - i * 5 + 2}
            stroke="oklch(0.78 0.14 75)" strokeWidth="3" />
          <line x1={x + 35 + i * 2} y1={50 - i * 5} x2={x + 35 + i * 2} y2={110 + i * 4}
            stroke="oklch(0.78 0.14 75)" strokeWidth="3" />
        </g>
      ))}
      {/* Conveyor belt */}
      <rect x="0" y="130" width="600" height="30" rx="4" fill="oklch(0.5 0.16 300)" />
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <rect key={i} x={i * 62} y="130" width="50" height="30" rx="2"
          fill="oklch(0.55 0.17 305)" />
      ))}
      {/* Route arrows */}
      {[100, 250, 400].map(x => (
        <path key={x} d={`M${x} 25 L${x + 40} 25 L${x + 35} 20 M${x + 40} 25 L${x + 35} 30`}
          stroke="oklch(0.78 0.14 75)" strokeWidth="2" fill="none" />
      ))}
    </svg>
  );
}

/* ─── Layout ─────────────────────────────────────────────────────────────────── */
function Layout() {
  useRealtimeSync();
  const { dbConnected, loading } = useAppStore();
  const loc = useLocation();
  const sectionKey = getSectionKey(loc.pathname);
  const config = SECTION_CONFIG[sectionKey];
  const header = SECTION_HEADERS[sectionKey];

  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* ── Section-specific atmosphere orbs ────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sectionKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none fixed inset-0 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {config.orbs.map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: orb.cx, top: orb.cy,
                width: orb.size, height: orb.size,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                filter: "blur(60px)",
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 5 + orb.delay, repeat: Infinity, delay: orb.delay, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <main className="relative px-4 py-6" style={{ zIndex: 2 }}>
        <div className="mx-auto max-w-7xl">

          {/* ── Section hero banner ──────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {header && (
              <motion.div
                key={sectionKey + "-header"}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="relative mb-6 overflow-hidden rounded-2xl"
                style={{
                  background: "linear-gradient(145deg, oklch(0.2 0.08 22 / 0.92), oklch(0.12 0.04 18 / 0.96))",
                  border: `1px solid ${config.trackColor}`,
                  boxShadow: `0 8px 40px oklch(0 0 0 / 0.5), inset 0 1px 0 oklch(0.78 0.14 75 / 0.1)`,
                  minHeight: 100,
                }}
              >
                {/* Section SVG backdrop */}
                {header.svgBg}

                {/* Gradient overlay for readability */}
                <div className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(90deg, oklch(0.14 0.05 20 / 0.7) 0%, transparent 60%)" }} />

                {/* Content */}
                <div className="relative z-10 px-8 py-7">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="badge-royal mb-2 inline-flex" style={{ borderColor: config.trackColor, color: config.trackColor.replace("0.3", "0.9") }}>
                      {sectionKey.toUpperCase()}
                    </div>
                    <h1 className="font-display text-4xl font-bold text-gold md:text-5xl">
                      {header.title}
                    </h1>
                    <p className="mt-1.5 text-sm text-cream/60">{header.subtitle}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main content ─────────────────────────────────────────── */}
          <Outlet />
        </div>
      </main>

      <footer className="relative z-10 mx-auto mt-12 max-w-7xl px-4 py-6 text-center text-xs text-cream/30">
        <div className="track-divider mx-auto mb-4 max-w-xs" />
        Coolie Mitr © 2026 · Royal Indian Railways Concierge · ☎ 7080809908
      </footer>

      {/* ── DB connection badge ──────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-gold/30 bg-maroon/90 px-4 py-2 text-xs text-cream/80 shadow-xl backdrop-blur">
            <Loader2 className="h-3 w-3 animate-spin text-gold" /> Connecting to Supabase…
          </motion.div>
        )}
        {!loading && dbConnected && (
          <motion.div key="connected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-green-500/40 bg-green-900/60 px-4 py-2 text-xs text-green-200 shadow-xl backdrop-blur">
            <Wifi className="h-3 w-3 text-green-400" /> Supabase Live
          </motion.div>
        )}
        {!loading && !dbConnected && (
          <motion.div key="offline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-900/60 px-4 py-2 text-xs text-yellow-200 shadow-xl backdrop-blur">
            <WifiOff className="h-3 w-3 text-yellow-400" /> Offline (seed data)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
