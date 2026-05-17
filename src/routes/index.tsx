import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
  User, Briefcase, Shield, Sparkles, ArrowRight, Package,
  CheckCircle2, Train, IndianRupee, Clock, Star, Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

/* ─── Inline SVG Illustrations ─────────────────────────────────────────────── */

function TrainSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Track rails */}
      <line x1="0" y1="130" x2="320" y2="130" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="3" />
      <line x1="0" y1="138" x2="320" y2="138" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="3" />
      {/* Track ties */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={i * 42} y="124" width="28" height="20" rx="2"
          fill="oklch(0.5 0.1 30 / 0.5)" />
      ))}
      {/* Train body */}
      <rect x="30" y="55" width="200" height="68" rx="10" fill="oklch(0.22 0.08 22 / 0.9)"
        stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" />
      {/* Cabin front */}
      <path d="M230 55 L264 72 L264 123 L230 123 Z" fill="oklch(0.25 0.09 22 / 0.95)"
        stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" />
      {/* Headlight */}
      <circle cx="258" cy="95" r="8" fill="oklch(0.85 0.16 80 / 0.9)" />
      <circle cx="258" cy="95" r="4" fill="oklch(0.95 0.2 86)" />
      {[0,1].map(i => (
        <line key={i} x1="266" y1={91 + i * 8} x2={280 + i * 4} y2={89 + i * 10}
          stroke="oklch(0.88 0.18 82 / 0.7)" strokeWidth="1.5" />
      ))}
      {/* Windows */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x={38 + i * 38} y="65" width="28" height="22" rx="4"
          fill="oklch(0.65 0.15 220 / 0.4)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1" />
      ))}
      {/* Door */}
      <rect x="176" y="82" width="18" height="41" rx="3"
        fill="oklch(0.3 0.1 22 / 0.8)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1" />
      {/* Wheels */}
      {[60, 130, 200, 246].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="126" r="12" fill="oklch(0.2 0.07 22)" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="2" />
          <circle cx={cx} cy="126" r="5" fill="oklch(0.78 0.14 75 / 0.6)" />
        </g>
      ))}
      {/* Smoke puffs */}
      {[0,1,2].map(i => (
        <motion.ellipse key={i} cx={85 + i * 18} cy={30 - i * 10}
          rx={8 + i * 3} ry={6 + i * 2}
          fill="oklch(0.6 0.05 30 / 0.3)"
          animate={{ y: [0, -12 - i * 4], opacity: [0.4, 0] }}
          transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}
      {/* Pantograph */}
      <path d="M100 55 L95 30 L115 30 L110 55" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" fill="none" />
      <line x1="90" y1="28" x2="120" y2="28" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="2" />
    </svg>
  );
}

function PorterSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="22" r="14" fill="oklch(0.65 0.12 50 / 0.8)" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" />
      {/* Uniform body */}
      <path d="M32 42 Q50 38 68 42 L72 82 Q50 86 28 82 Z"
        fill="oklch(0.3 0.12 20 / 0.9)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1.5" />
      {/* Badge */}
      <rect x="42" y="50" width="16" height="10" rx="2"
        fill="oklch(0.78 0.14 75)" opacity="0.9" />
      {/* Arms */}
      <path d="M32 46 L18 60" stroke="oklch(0.65 0.12 50 / 0.8)" strokeWidth="6" strokeLinecap="round" />
      <path d="M68 46 L80 58" stroke="oklch(0.65 0.12 50 / 0.8)" strokeWidth="6" strokeLinecap="round" />
      {/* Legs */}
      <path d="M40 82 L36 112" stroke="oklch(0.3 0.12 20 / 0.8)" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 82 L64 112" stroke="oklch(0.3 0.12 20 / 0.8)" strokeWidth="7" strokeLinecap="round" />
      {/* Luggage bags */}
      <rect x="4" y="56" width="20" height="16" rx="3"
        fill="oklch(0.55 0.15 50 / 0.85)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1" />
      <rect x="76" y="48" width="22" height="18" rx="3"
        fill="oklch(0.45 0.14 30 / 0.85)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1" />
      <rect x="78" y="66" width="18" height="14" rx="3"
        fill="oklch(0.6 0.16 60 / 0.85)" stroke="oklch(0.78 0.14 75 / 0.4)" strokeWidth="1" />
      {/* Hat */}
      <ellipse cx="50" cy="9" rx="16" ry="5"
        fill="oklch(0.3 0.12 20)" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" />
      <rect x="44" y="5" width="12" height="8" rx="2"
        fill="oklch(0.3 0.12 20)" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1" />
      {/* Hat band */}
      <line x1="37" y1="9" x2="63" y2="9" stroke="oklch(0.78 0.14 75)" strokeWidth="1.5" />
    </svg>
  );
}

function StationPlatformSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Platform base */}
      <rect x="0" y="130" width="400" height="50" fill="oklch(0.22 0.07 22 / 0.7)" />
      <rect x="0" y="128" width="400" height="4" fill="oklch(0.78 0.14 75 / 0.4)" />
      {/* Yellow safety line */}
      <rect x="0" y="132" width="400" height="4" fill="oklch(0.85 0.2 90 / 0.5)"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(0.85 0.2 90/0.6) 0 20px, transparent 20px 28px)" }} />
      {/* Platform roof pillars */}
      {[30, 100, 170, 240, 310, 370].map(x => (
        <rect key={x} x={x} y="10" width="8" height="120" rx="2"
          fill="oklch(0.35 0.1 22 / 0.7)" stroke="oklch(0.78 0.14 75 / 0.2)" strokeWidth="1" />
      ))}
      {/* Roof */}
      <rect x="20" y="8" width="360" height="12" rx="3"
        fill="oklch(0.28 0.09 22 / 0.85)" stroke="oklch(0.78 0.14 75 / 0.3)" strokeWidth="1" />
      {/* Roof lights */}
      {[60, 140, 220, 300, 355].map(x => (
        <g key={x}>
          <circle cx={x} cy="14" r="5" fill="oklch(0.88 0.2 86 / 0.5)" />
          <circle cx={x} cy="14" r="2" fill="oklch(0.95 0.2 88)" />
          <line x1={x} y1="19" x2={x} y2="60" stroke="oklch(0.85 0.16 82 / 0.08)" strokeWidth="20" strokeLinecap="round" />
        </g>
      ))}
      {/* Platform bench */}
      <rect x="50" y="110" width="60" height="20" rx="4"
        fill="oklch(0.28 0.09 22 / 0.8)" stroke="oklch(0.78 0.14 75 / 0.3)" strokeWidth="1" />
      {/* Station signage */}
      <rect x="160" y="24" width="80" height="24" rx="4"
        fill="oklch(0.28 0.09 22 / 0.9)" stroke="oklch(0.78 0.14 75 / 0.5)" strokeWidth="1.5" />
      <text x="200" y="41" textAnchor="middle" fill="oklch(0.88 0.16 80)" fontSize="11" fontFamily="serif">
        NEW DELHI
      </text>
    </svg>
  );
}

/* ─── Feature cards data ────────────────────────────────────────────────────── */
const FEATURES = [
  {
    to: "/passenger",
    label: "Passenger Only",
    tag: "TRAVELLER",
    icon: User,
    accentFrom: "oklch(0.55 0.2 250)",
    accentTo:   "oklch(0.45 0.18 230)",
    desc: "Book certified porters instantly. Real-time OTP handoff, escrow-backed payments, and privacy-shielded contact.",
    perks: ["Live porter radar", "Secure escrow payment", "OTP-verified handoff"],
    stat: { value: "₹100", label: "Base fare / bag" },
  },
  {
    to: "/coolie",
    label: "Coolie Section",
    tag: "PORTER",
    icon: Briefcase,
    accentFrom: "oklch(0.65 0.22 150)",
    accentTo:   "oklch(0.5 0.18 140)",
    desc: "Receive job requests, accept or bid on fares, verify with OTP, and track earnings in real time.",
    perks: ["Live job alerts + sound", "80% earnings share", "Shift selection & SOS"],
    stat: { value: "80%", label: "Earnings share" },
  },
  {
    to: "/admin",
    label: "Admin Section",
    tag: "STATION MASTER",
    icon: Shield,
    accentFrom: "oklch(0.78 0.14 75)",
    accentTo:   "oklch(0.62 0.12 58)",
    desc: "Approve coolies, override live pricing, dispatch jobs, and monitor station-wide operations.",
    perks: ["Live price override", "Smart coolie dispatch", "SOS command center"],
    stat: { value: "20%", label: "Platform commission" },
  },
];

const STATS = [
  { icon: Train,        value: "5",      label: "Major Stations" },
  { icon: CheckCircle2, value: "100%",   label: "OTP Verified" },
  { icon: IndianRupee,  value: "₹100",   label: "Transparent Pricing" },
  { icon: Clock,        value: "< 2 min",label: "Avg. Dispatch Time" },
  { icon: Star,         value: "4.9★",   label: "Passenger Rating" },
  { icon: Zap,          value: "Live",   label: "Realtime Sync" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Book Online", desc: "Choose your train, platform, and number of bags. Select a porter from our verified roster." },
  { step: "02", title: "Escrow Lock", desc: "Fare is securely held in escrow until your porter arrives and verifies with OTP." },
  { step: "03", title: "OTP Handoff", desc: "Share a 4-digit OTP with your porter. On match, payment releases automatically." },
];

const TICKER_ITEMS = [
  "🚆 NDLS — New Delhi Junction",
  "🚆 CSMT — Mumbai Chhatrapati Shivaji",
  "🚆 HWH — Howrah Junction",
  "🚆 MAS — Chennai Central",
  "🚆 SBC — KSR Bengaluru City",
  "🛄 Verified Porters Only",
  "🔒 OTP-Secured Handoff",
  "💰 Transparent Fare System",
  "⚡ Real-time Dispatch",
];

/* ─── Index Page ─────────────────────────────────────────────────────────────── */
function Index() {
  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* ── Global spotlight orbs ───────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="spotlight absolute" style={{
          width: 600, height: 600, left: "-15%", top: "-10%",
          background: "radial-gradient(circle, oklch(0.78 0.14 75 / 0.18) 0%, transparent 70%)",
          animationDelay: "0s",
        }} />
        <div className="spotlight absolute" style={{
          width: 500, height: 500, right: "-10%", top: "30%",
          background: "radial-gradient(circle, oklch(0.55 0.18 250 / 0.14) 0%, transparent 70%)",
          animationDelay: "2.5s",
        }} />
        <div className="spotlight absolute" style={{
          width: 400, height: 400, left: "30%", bottom: "0%",
          background: "radial-gradient(circle, oklch(0.65 0.2 150 / 0.1) 0%, transparent 70%)",
          animationDelay: "1.5s",
        }} />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-10" style={{ zIndex: 2 }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative mb-16 overflow-hidden rounded-3xl" style={{
          background: "linear-gradient(145deg, oklch(0.2 0.08 20 / 0.95) 0%, oklch(0.12 0.04 18 / 0.98) 100%)",
          border: "1px solid oklch(0.78 0.14 75 / 0.22)",
          boxShadow: "0 20px 80px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(0.78 0.14 75 / 0.15)",
        }}>
          {/* Hero inner glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-full w-2/3" style={{
              background: "radial-gradient(ellipse at 20% 50%, oklch(0.78 0.14 75 / 0.1) 0%, transparent 60%)",
            }} />
            <div className="absolute right-0 top-0 h-full w-1/2" style={{
              background: "radial-gradient(ellipse at 80% 50%, oklch(0.55 0.18 250 / 0.08) 0%, transparent 60%)",
            }} />
          </div>

          <div className="relative grid min-h-[460px] items-center gap-8 px-8 py-12 md:grid-cols-[1fr_380px] lg:px-16">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="badge-royal mb-5 animate-badge-pop inline-flex">
                <Sparkles className="h-3 w-3" />
                Premium Railway Concierge · Est. 2026
              </div>

              <h1 className="font-display text-6xl font-bold leading-[1.02] md:text-7xl lg:text-8xl">
                <span className="block text-cream/90">India's First</span>
                <span
                  className="block bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-gold)" }}
                >
                  Coolie Mitr
                </span>
                <span className="block text-cream/70 text-4xl md:text-5xl lg:text-6xl">Platform</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/70">
                Connecting millions of passengers with certified, badged porters across every major Indian railway station — with OTP security, live tracking, and zero hidden fees.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/passenger" className="btn-premium">
                  <Package className="h-5 w-5" />
                  Book a Porter Now
                </Link>
                <Link to="/coolie/onboard" className="btn-outline">
                  <Briefcase className="h-5 w-5" />
                  Join as Coolie
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { n: "4+", l: "Active Coolies" },
                  { n: "₹100", l: "Flat Base Rate" },
                  { n: "100%", l: "OTP Secured" },
                ].map(({ n, l }) => (
                  <div key={l} className="text-center">
                    <div className="font-display text-3xl font-bold" style={{ color: "oklch(0.85 0.16 80)" }}>{n}</div>
                    <div className="text-xs uppercase tracking-widest text-cream/50">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex flex-col items-center gap-4"
            >
              {/* Station platform illustration */}
              <div className="relative w-full">
                <StationPlatformSVG className="w-full opacity-80" />
                {/* Porter overlay */}
                <motion.div
                  className="absolute bottom-8 right-8"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <PorterSVG className="h-32 w-24" />
                </motion.div>
              </div>

              {/* Train illustration below */}
              <TrainSVG className="w-full opacity-75" />
            </motion.div>
          </div>

          {/* Bottom track divider */}
          <div className="track-divider" />
        </section>

        {/* ── STATION TICKER ────────────────────────────────────────────── */}
        <div className="ticker-wrap mb-16 rounded-2xl py-3">
          <div className="ticker-content">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="mr-12 text-sm font-medium tracking-widest" style={{ color: "oklch(0.78 0.14 75 / 0.8)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURE CARDS ─────────────────────────────────────────────── */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 text-center"
          >
            <div className="badge-royal mb-3 inline-flex">Three Dashboards · One Platform</div>
            <h2 className="font-display text-4xl text-cream md:text-5xl">Built for Everyone</h2>
            <p className="mt-3 text-cream/60">Passenger, Porter, or Station Master — every role has a dedicated workspace.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ to, label, tag, icon: Icon, accentFrom, accentTo, desc, perks, stat }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: 50, rotateY: -8 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="card-3d"
              >
                <Link to={to} className="group block h-full">
                  <div className="relative h-full overflow-hidden rounded-2xl" style={{
                    background: "linear-gradient(145deg, oklch(0.22 0.08 22 / 0.85), oklch(0.14 0.05 20 / 0.9))",
                    border: "1px solid oklch(0.78 0.14 75 / 0.2)",
                    boxShadow: "0 8px 32px oklch(0 0 0 / 0.45)",
                  }}>

                    {/* Top gradient accent banner */}
                    <div className="relative h-36 overflow-hidden" style={{
                      background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
                    }}>
                      {/* Atmosphere overlay */}
                      <div className="absolute inset-0" style={{
                        background: "linear-gradient(to bottom, transparent 50%, oklch(0.14 0.05 20) 100%)",
                      }} />
                      {/* Large faded icon */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                        <Icon className="h-24 w-24 text-white" />
                      </div>
                      {/* Tag badge */}
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
                          {tag}
                        </span>
                      </div>
                      {/* Icon circle */}
                      <div className="absolute bottom-0 left-5 translate-y-1/2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl" style={{
                          background: "var(--gradient-gold)",
                          boxShadow: "0 4px 20px oklch(0.78 0.14 75 / 0.5)",
                        }}>
                          <Icon className="h-7 w-7 text-maroon" strokeWidth={2.2} />
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 pt-10">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display text-2xl font-bold text-gold group-hover:text-[oklch(0.92_0.18_84)] transition">
                          {label}
                        </h3>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-gold">{stat.value}</div>
                          <div className="text-[10px] uppercase tracking-wider text-cream/50">{stat.label}</div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-cream/70">{desc}</p>

                      <ul className="mt-4 space-y-2">
                        {perks.map(p => (
                          <li key={p} className="flex items-center gap-2 text-xs text-cream/65">
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-gold/70" />
                            {p}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex items-center gap-2 font-display text-sm font-semibold text-gold group-hover:gap-3 transition-all">
                        Enter Dashboard
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PARCEL CTA BANNER ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mb-20"
        >
          <Link to="/parcel">
            <div className="group relative overflow-hidden rounded-2xl p-8 md:p-10" style={{
              background: "linear-gradient(135deg, oklch(0.22 0.06 290 / 0.85), oklch(0.15 0.04 280 / 0.9))",
              border: "1px solid oklch(0.65 0.18 310 / 0.35)",
              boxShadow: "0 12px 48px oklch(0 0 0 / 0.45)",
            }}>
              <div className="absolute right-0 top-0 h-full w-1/2 opacity-10" style={{
                background: "radial-gradient(ellipse at right, oklch(0.65 0.2 310) 0%, transparent 70%)",
              }} />
              <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.2 310), oklch(0.5 0.18 290))",
                    boxShadow: "0 4px 20px oklch(0.6 0.18 300 / 0.4)",
                  }}>
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="badge-royal mb-1 inline-flex" style={{ borderColor: "oklch(0.65 0.18 310 / 0.5)", color: "oklch(0.75 0.18 310)" }}>
                      NEW MODULE
                    </div>
                    <h3 className="font-display text-3xl font-bold text-white">Parcel Booking</h3>
                    <p className="mt-1 text-sm text-white/60">Railway Cargo & Freight Transport · ₹15/kg · Door-to-platform delivery</p>
                  </div>
                </div>
                <div className="btn-premium group-hover:scale-105 transition-transform" style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.2 310), oklch(0.5 0.18 290))",
                  boxShadow: "0 4px 20px oklch(0.6 0.18 300 / 0.4)",
                }}>
                  <Package className="h-5 w-5" />
                  Book Parcel Now
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-10 text-center"
          >
            <div className="badge-royal mb-3 inline-flex">Simple · Secure · Fast</div>
            <h2 className="font-display text-4xl text-cream md:text-5xl">How It Works</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.15, duration: 0.6 }}
                className="relative"
              >
                {/* Connector line */}
                {i < 2 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 md:block" style={{
                    background: "linear-gradient(90deg, oklch(0.78 0.14 75 / 0.5), transparent)",
                  }} />
                )}
                <div className="relative overflow-hidden rounded-2xl p-6" style={{
                  background: "linear-gradient(145deg, oklch(0.22 0.08 22 / 0.7), oklch(0.14 0.04 20 / 0.8))",
                  border: "1px solid oklch(0.78 0.14 75 / 0.18)",
                }}>
                  <div className="mb-4 font-display text-6xl font-bold" style={{
                    backgroundImage: "var(--gradient-gold)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    opacity: 0.5,
                  }}>
                    {step}
                  </div>
                  <h3 className="font-display text-xl text-gold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/65">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── STATS GRID ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + i * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="stat-card"
              >
                <Icon className="mx-auto mb-2 h-6 w-6 text-gold/70" />
                <div className="font-display text-2xl font-bold text-gold">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-cream/50">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── FOOTER CTA ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-8 text-center"
        >
          <div className="track-divider mx-auto mb-8 max-w-sm" />
          <p className="text-xs uppercase tracking-[0.35em] text-cream/40">
            🚆 NDLS · CSMT · HWH · MAS · SBC · All Major Junctions
          </p>
          <p className="mt-2 text-[11px] text-cream/30">
            Coolie Mitr © 2026 · A Royal Indian Railways Concierge Experience
          </p>
        </motion.div>
      </main>
    </div>
  );
}
