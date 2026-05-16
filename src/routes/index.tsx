import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Train, User, Briefcase, Shield, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { role } = useAppStore();
  const nav = useNavigate();
  useEffect(() => {
    // Don't auto-redirect; let user see landing
  }, [role]);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-maroon/40 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-gold">
            <Sparkles className="h-3 w-3" /> Premium Railway Concierge
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-bold leading-tight">
            <span className="bg-gradient-gold bg-clip-text text-transparent">Coolie Mitr</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/80">
            A royal, isometric terminal connecting passengers, certified porters, and station administrators
            in one seamless luggage-handling experience.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/passenger" className="rounded-full bg-gradient-gold px-6 py-3 font-semibold text-maroon shadow-[0_0_30px_oklch(0.78_0.14_75/0.5)] hover:opacity-90 transition">Book Luggage</Link>
            <Link to="/coolie/onboard" className="rounded-full border border-gold/50 bg-maroon/40 px-6 py-3 font-semibold text-gold backdrop-blur hover:bg-maroon/60 transition">Join as Coolie</Link>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { to: "/passenger", icon: User, title: "Passenger Hub", desc: "Book trusted porters, track in real-time, secure OTP handoff.", delay: 0 },
            { to: "/coolie", icon: Briefcase, title: "Porter Terminal", desc: "Receive jobs, verify with OTP, track earnings, panic SOS.", delay: 0.15 },
            { to: "/admin", icon: Shield, title: "Command Center", desc: "Approve coolies, dispatch jobs, monitor station-wide ops.", delay: 0.3 },
          ].map(({ to, icon: Icon, title, desc, delay }) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 40, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.7, delay: 0.3 + delay }}
            >
              <Link to={to} className="glass group block p-7 transition hover:glow-gold">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold">
                  <Icon className="h-7 w-7 text-maroon" />
                </div>
                <h3 className="mb-2 font-display text-2xl text-gold">{title}</h3>
                <p className="mb-4 text-sm text-cream/70">{desc}</p>
                <div className="flex items-center gap-2 text-gold text-sm font-medium">
                  Enter <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-cream/40 text-xs uppercase tracking-widest"
        >
          <span>🚆 NDLS</span> · <span>CSMT</span> · <span>HWH</span> · <span>MAS</span> · <span>SBC</span>
        </motion.div>
      </main>
    </div>
  );
}
