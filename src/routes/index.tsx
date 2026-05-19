import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Briefcase, Shield, Package, ArrowRight, ChevronRight, Train, Star, Clock, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

const HERO_IMG    = "https://as1.ftcdn.net/jpg/05/63/07/80/1000_F_563078047_gfb7Zh8EmqFuke0f3zupxdW0Lk6HxTbs.jpg";
const LUGGAGE_IMG = "https://toppng.com/uploads/preview/luggage-png-11553963415ljy0spq6os.png";
const COOLIE_IMG  = "https://images.mid-day.com/images/images/2016/jun/MD-anni-Coolie.jpg";
const PARCEL_IMG  = "https://www.assureshift.in/sites/default/files/images/blog/bike-parcel-by-train-in-india.jpg";

const SECTIONS = [
  {
    to: "/passenger",
    img: LUGGAGE_IMG,
    tag: "TRAVELLER",
    label: "Passenger",
    sublabel: "Book a Porter",
    desc: "Certified porters · OTP handoff · Escrow pay",
    icon: User,
    accent: "from-blue-900/80 via-blue-900/50 to-transparent",
    badge: "bg-blue-500",
    imgStyle: "object-contain object-center scale-110",
    bg: "bg-blue-950",
  },
  {
    to: "/coolie",
    img: COOLIE_IMG,
    tag: "PORTER",
    label: "Coolie Section",
    sublabel: "Join & Earn",
    desc: "Accept jobs · Live earnings · Station verified",
    icon: Briefcase,
    accent: "from-green-900/80 via-green-900/50 to-transparent",
    badge: "bg-green-500",
    imgStyle: "object-cover object-top",
    bg: "bg-green-950",
  },
  {
    to: "/admin",
    img: HERO_IMG,
    tag: "STATION MASTER",
    label: "Admin Panel",
    sublabel: "Command Center",
    desc: "Approve · Dispatch · Override · Monitor",
    icon: Shield,
    accent: "from-amber-900/85 via-amber-900/55 to-transparent",
    badge: "bg-amber-500",
    imgStyle: "object-cover object-center",
    bg: "bg-amber-950",
  },
  {
    to: "/parcel",
    img: PARCEL_IMG,
    tag: "FREIGHT",
    label: "Parcel Booking",
    sublabel: "Send Cargo",
    desc: "Door-to-platform · ₹15/kg · Real-time track",
    icon: Package,
    accent: "from-purple-900/80 via-purple-900/50 to-transparent",
    badge: "bg-purple-500",
    imgStyle: "object-cover object-center",
    bg: "bg-purple-950",
  },
];

const TICKER_ITEMS = [
  "🚆 NDLS — New Delhi Junction",
  "🚆 CSMT — Mumbai Chhatrapati Shivaji",
  "🚆 HWH — Howrah Junction",
  "🚆 MAS — Chennai Central",
  "🚆 SBC — KSR Bengaluru City",
  "🛄 Verified Porters Only",
  "🔒 OTP-Secured Handoff",
  "💰 Transparent Fare",
  "⚡ Real-time Dispatch",
];

function Index() {
  return (
    <div className="relative min-h-screen bg-[oklch(0.10_0.04_20)]">

      {/* ── TOP LOGO BAR ─────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.88_0.17_82)] to-[oklch(0.65_0.12_58)] shadow-[0_0_16px_oklch(0.78_0.14_75/0.5)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[oklch(0.22_0.08_22)]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v1h2a2 2 0 0 1 2 2v1H5V8a2 2 0 0 1 2-2h2V5a3 3 0 0 1 3-3z" />
              <rect x="3" y="11" width="18" height="9" rx="2" />
              <path d="M7 15h.01M12 15h.01M17 15h.01" strokeWidth={2.5} />
            </svg>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-extrabold tracking-widest text-[oklch(0.85_0.16_80)]">COOLIE</span>
              <span className="text-xl font-semibold text-white/90" style={{ fontFamily: "'Noto Sans Devanagari', serif" }}>मित्र</span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/40">Royal Railway Concierge</p>
          </div>
        </div>
        <a href="tel:7080809908" className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur">
          ☎ 7080809908
        </a>
      </header>

      {/* ── HERO — Full-screen railway photo ─────────────────────────────── */}
      <section className="relative h-[55vh] min-h-[320px] overflow-hidden md:h-[62vh]">
        <img
          src={HERO_IMG}
          alt="Indian Railway Station"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8 md:px-10 md:pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              India's First Railway Porter Platform
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-7xl">
              Coolie <span style={{ color: "oklch(0.85 0.16 80)" }}>मित्र</span>
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70 md:text-base">
              Certified railway porters · OTP-secured handoffs · Real-time dispatch
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/passenger"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-sm text-[oklch(0.22_0.08_22)] transition active:scale-95"
                style={{ background: "linear-gradient(135deg, oklch(0.88 0.17 82), oklch(0.65 0.12 58))", boxShadow: "0 4px 20px oklch(0.78 0.14 75 / 0.5)" }}>
                <Package className="h-4 w-4" /> Book a Porter
              </Link>
              <Link to="/coolie/onboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition active:scale-95 hover:bg-white/20">
                <Briefcase className="h-4 w-4" /> Join as Coolie
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:flex">
          <div className="grid grid-cols-4 w-full border-t border-white/10 bg-black/50 backdrop-blur-md">
            {[
              { icon: Train, v: "5+", l: "Major Stations" },
              { icon: Star, v: "4.9★", l: "Rating" },
              { icon: IndianRupee, v: "₹100", l: "Base Rate / Bag" },
              { icon: Clock, v: "<2 min", l: "Dispatch Time" },
            ].map(({ icon: Icon, v, l }) => (
              <div key={l} className="flex items-center justify-center gap-2 py-3 border-r border-white/10 last:border-r-0">
                <Icon className="h-4 w-4 text-[oklch(0.85_0.16_80)]" />
                <div>
                  <div className="font-display text-sm font-bold text-white">{v}</div>
                  <div className="text-[9px] uppercase tracking-widest text-white/50">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────────────────────── */}
      <div className="ticker-wrap border-y border-white/8 bg-[oklch(0.12_0.04_20)] py-2.5">
        <div className="ticker-content">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mr-10 text-xs font-medium tracking-widest" style={{ color: "oklch(0.78 0.14 75 / 0.8)" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION GRID ─────────────────────────────────────────────────── */}
      <section className="pb-24 md:pb-8">
        <div className="px-3 pt-4 pb-2 md:px-5">
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Choose Your Section</h2>
          <p className="text-xs text-white/50 mt-0.5">Tap any section to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-2 px-3 md:grid-cols-4 md:px-5">
          {SECTIONS.map(({ to, img, tag, label, sublabel, desc, icon: Icon, accent, badge, imgStyle, bg }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to={to} className="group block">
                <div className={`relative overflow-hidden rounded-2xl ${bg}`} style={{ aspectRatio: "3/4" }}>
                  {/* Image */}
                  <img
                    src={img}
                    alt={label}
                    className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105 ${imgStyle}`}
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent} opacity-95`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-3">
                    {/* Top: tag */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white ${badge}`}>
                        {tag}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>

                    {/* Bottom: name + CTA */}
                    <div>
                      <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{sublabel}</p>
                      <h3 className="font-display text-xl font-bold leading-tight text-white mt-0.5">{label}</h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-white/60 hidden sm:block">{desc}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white/90">Open →</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition">
                          <ChevronRight className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (desktop only) ─────────────────────────────────── */}
      <section className="hidden md:block px-5 pb-10">
        <h2 className="font-display text-2xl font-bold text-white mb-5">How It Works</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: "01", t: "Book Online", d: "Pick your train, platform, and number of bags. Select a verified porter." },
            { n: "02", t: "Escrow Lock", d: "Fare is held in secure escrow until your porter arrives and verifies OTP." },
            { n: "03", t: "OTP Handoff", d: "Share a 4-digit OTP with your porter. Payment releases on match." },
          ].map(({ n, t, d }) => (
            <div key={n} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-display text-4xl font-bold mb-3" style={{ color: "oklch(0.78 0.14 75 / 0.5)" }}>{n}</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{t}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="hidden md:block text-center py-6 text-xs text-white/30 border-t border-white/8">
        Coolie Mitr © 2026 · Royal Indian Railways Concierge · ☎ 7080809908
      </footer>

      {/* ── BOTTOM NAV (mobile) ───────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}

export function BottomNav() {
  const items = [
    { to: "/",          icon: "🏠", label: "Home" },
    { to: "/passenger", icon: "🧳", label: "Passenger" },
    { to: "/coolie",    icon: "👷", label: "Coolie" },
    { to: "/parcel",    icon: "📦", label: "Parcel" },
    { to: "/admin",     icon: "🛡", label: "Admin" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[oklch(0.12_0.04_20)]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      {items.map(({ to, icon, label }) => (
        <Link key={to} to={to}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-white/50 [&.active]:text-[oklch(0.85_0.16_80)] transition-colors active:scale-95">
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
