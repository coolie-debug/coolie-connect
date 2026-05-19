import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({ component: Layout });

type SectionKey = "passenger" | "coolie" | "admin" | "parcel" | "default";

const SECTION_HEADERS: Record<SectionKey, { title: string; subtitle: string; tag: string; img: string } | null> = {
  passenger: {
    title: "Passenger",
    subtitle: "Book certified porters · Secure escrow · OTP handoff",
    tag: "TRAVELLER",
    img: "https://toppng.com/uploads/preview/luggage-png-11553963415ljy0spq6os.png",
  },
  coolie: {
    title: "Coolie Section",
    subtitle: "Accept jobs · Track earnings · Duty shift management",
    tag: "PORTER",
    img: "https://images.mid-day.com/images/images/2016/jun/MD-anni-Coolie.jpg",
  },
  admin: {
    title: "Admin Panel",
    subtitle: "Station Master Command Center · Password Protected",
    tag: "STATION MASTER",
    img: "https://as1.ftcdn.net/jpg/05/63/07/80/1000_F_563078047_gfb7Zh8EmqFuke0f3zupxdW0Lk6HxTbs.jpg",
  },
  parcel: {
    title: "Parcel Booking",
    subtitle: "Railway Cargo & Freight Transport · ₹15 per kg",
    tag: "FREIGHT",
    img: "https://www.assureshift.in/sites/default/files/images/blog/bike-parcel-by-train-in-india.jpg",
  },
  default: null,
};

const SECTION_ACCENT: Record<SectionKey, string> = {
  passenger: "from-blue-900/90 via-blue-900/50 to-transparent",
  coolie:    "from-green-900/90 via-green-900/50 to-transparent",
  admin:     "from-amber-900/90 via-amber-900/50 to-transparent",
  parcel:    "from-purple-900/90 via-purple-900/50 to-transparent",
  default:   "from-black/80 via-black/40 to-transparent",
};

function getSectionKey(pathname: string): SectionKey {
  if (pathname.includes("/passenger")) return "passenger";
  if (pathname.includes("/coolie"))    return "coolie";
  if (pathname.includes("/admin"))     return "admin";
  if (pathname.includes("/parcel"))    return "parcel";
  return "default";
}

function Layout() {
  useRealtimeSync();
  const { dbConnected, loading } = useAppStore();
  const loc = useLocation();
  const sectionKey = getSectionKey(loc.pathname);
  const header = SECTION_HEADERS[sectionKey];
  const accent  = SECTION_ACCENT[sectionKey];

  return (
    <div className="relative min-h-screen bg-[oklch(0.10_0.04_20)]">
      {/* ── Very subtle white grid bg overlay ─────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <Navbar />

      {/* ── Section hero banner (real image) ──────────────────────────── */}
      <AnimatePresence mode="wait">
        {header && (
          <motion.div
            key={sectionKey}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden"
            style={{ height: "clamp(100px, 22vw, 180px)" }}
          >
            {/* Background image */}
            <img
              src={header.img}
              alt={header.title}
              className={`absolute inset-0 h-full w-full ${sectionKey === "passenger" ? "object-contain object-right scale-150 translate-x-8" : "object-cover"}`}
              style={{ objectPosition: sectionKey === "coolie" ? "center top" : "center center" }}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />
            {/* Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-r ${accent}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.04_20)] via-transparent to-black/20" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-4 md:px-6 md:pb-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="mb-1.5 inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                  {header.tag}
                </span>
                <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{header.title}</h1>
                <p className="text-[11px] text-white/50 mt-0.5">{header.subtitle}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="relative z-10 px-3 pb-24 pt-4 md:px-4 md:pb-10 md:pt-5">
        <Outlet />
      </main>

      <footer className="relative z-10 hidden border-t border-white/8 py-5 text-center text-xs text-white/30 md:block">
        Coolie Mitr © 2026 · Royal Indian Railways Concierge · ☎ 7080809908
      </footer>

      {/* ── DB connection badge ──────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-xs text-white/70 backdrop-blur md:bottom-4 md:right-4">
            <Loader2 className="h-3 w-3 animate-spin text-[oklch(0.85_0.16_80)]" /> Connecting…
          </motion.div>
        )}
        {!loading && dbConnected && (
          <motion.div key="connected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-900/60 px-3 py-1.5 text-xs text-green-200 backdrop-blur md:bottom-4 md:right-4">
            <Wifi className="h-3 w-3 text-green-400" /> Supabase Live
          </motion.div>
        )}
        {!loading && !dbConnected && (
          <motion.div key="offline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-900/60 px-3 py-1.5 text-xs text-yellow-200 backdrop-blur md:bottom-4 md:right-4">
            <WifiOff className="h-3 w-3 text-yellow-400" /> Offline
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
