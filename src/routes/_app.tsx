import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useAppStore } from "@/store/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: Layout,
});

function Layout() {
  useRealtimeSync();
  const { dbConnected, loading } = useAppStore();

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="relative z-10 mx-auto mt-12 max-w-7xl px-4 py-6 text-center text-xs text-cream/40">
        Coolie Mitr © 2026 · A Royal Indian Railways Concierge Experience
      </footer>

      {/* DB connection status badge */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-gold/30 bg-maroon/90 px-4 py-2 text-xs text-cream/80 shadow-lg backdrop-blur"
          >
            <Loader2 className="h-3 w-3 animate-spin text-gold" />
            Connecting to Supabase…
          </motion.div>
        )}
        {!loading && dbConnected && (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-green-500/40 bg-green-900/60 px-4 py-2 text-xs text-green-200 shadow-lg backdrop-blur"
          >
            <Wifi className="h-3 w-3 text-green-400" />
            Supabase Live
          </motion.div>
        )}
        {!loading && !dbConnected && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-900/60 px-4 py-2 text-xs text-yellow-200 shadow-lg backdrop-blur"
          >
            <WifiOff className="h-3 w-3 text-yellow-400" />
            Offline (seed data)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
