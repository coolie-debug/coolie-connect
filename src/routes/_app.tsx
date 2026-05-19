import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Satellite } from "lucide-react";

export const Route = createFileRoute("/_app")({ component: Layout });

type SectionKey = "passenger" | "coolie" | "admin" | "parcel" | "default";

const SECTION_HEADERS: Record<SectionKey, { title: string; subtitle: string; tag: string; img: string } | null> = {
  passenger: {
    title: "Passenger",
    subtitle: "Book certified coolies · Secure escrow · OTP handoff",
    tag: "TRAVELLER",
    img: "https://static.vecteezy.com/system/resources/thumbnails/004/957/869/small/bag-luggage-illustration-vector.jpg",
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

/* Gradient that goes from section colour (left/bottom) toward transparent */
const SECTION_ACCENT: Record<SectionKey, string> = {
  passenger: "from-blue-900/95 via-blue-900/60 to-transparent",
  coolie:    "from-green-900/95 via-green-900/60 to-transparent",
  admin:     "from-amber-900/95 via-amber-900/60 to-transparent",
  parcel:    "from-purple-900/95 via-purple-900/60 to-transparent",
  default:   "from-black/90 via-black/50 to-transparent",
};

/* Blur pill behind the text, one distinct colour per section */
const SECTION_TEXT_BG: Record<SectionKey, string> = {
  passenger: "bg-blue-900/75 border border-blue-500/30",
  coolie:    "bg-green-900/75 border border-green-500/30",
  admin:     "bg-amber-900/75 border border-amber-500/30",
  parcel:    "bg-purple-900/75 border border-purple-500/30",
  default:   "bg-black/75 border border-white/10",
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
  const loc       = useLocation();
  const sectionKey = getSectionKey(loc.pathname);
  const header    = SECTION_HEADERS[sectionKey];
  const accent    = SECTION_ACCENT[sectionKey];
  const textBg    = SECTION_TEXT_BG[sectionKey];

  return (
    <div className="relative min-h-screen bg-[oklch(0.10_0.04_20)]">
      <Navbar />

      {/* ── Section hero banner (real photo) ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        {header && (
          <motion.div
            key={sectionKey}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden"
            style={{ height: "clamp(110px, 24vw, 190px)" }}
          >
            {/* Background photo */}
            <img
              src={header.img}
              alt={header.title}
              className={`absolute inset-0 h-full w-full ${
                sectionKey === "passenger"
                  ? "object-cover object-center"
                  : "object-cover"
              }`}
              style={{ objectPosition: sectionKey === "coolie" ? "center top" : "center center" }}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />

            {/* Colour-washed left-to-right gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${accent}`} />
            {/* Bottom fade into page bg */}
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.04_20)] via-transparent to-black/10" />

            {/* Text with section-coloured backdrop blur */}
            <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-4 md:px-6 md:pb-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`inline-flex flex-col gap-1 rounded-xl px-4 py-3 backdrop-blur-md w-fit ${textBg}`}
              >
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {header.tag}
                </span>
                <h1 className="font-display text-2xl font-bold text-white md:text-3xl leading-none">
                  {header.title}
                </h1>
                <p className="text-[10px] text-white/60 leading-snug">{header.subtitle}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="relative z-10 px-3 pb-24 pt-4 md:px-4 md:pb-10 md:pt-5">
        <Outlet />
      </main>

      <footer className="relative z-10 hidden border-t border-white/8 py-5 text-center text-xs text-white/30 md:block">
        Coolie Mitr © 2026 · Royal Indian Railways Concierge · ☎ 7080809908
      </footer>

      {/* ── Satellite connection badge ────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loading"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-3 py-1.5 text-xs text-white/70 backdrop-blur md:bottom-4 md:right-4">
            <Loader2 className="h-3 w-3 animate-spin text-[oklch(0.85_0.16_80)]" /> Connecting…
          </motion.div>
        )}
        {!loading && dbConnected && (
          <motion.div key="connected"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-900/60 px-3 py-1.5 text-xs text-green-200 backdrop-blur md:bottom-4 md:right-4">
            <Satellite className="h-3 w-3 text-green-400" />
            <span>Satellite Live</span>
          </motion.div>
        )}
        {!loading && !dbConnected && (
          <motion.div key="offline"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-3 z-50 flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-900/60 px-3 py-1.5 text-xs text-red-200 backdrop-blur md:bottom-4 md:right-4">
            <Satellite className="h-3 w-3 text-red-400" />
            <span>Satellite Off</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
