import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/_app")({
  component: Layout,
});

function Layout() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="relative z-10 mx-auto mt-12 max-w-7xl px-4 py-6 text-center text-xs text-cream/40">
        Coolie Mitr © 2026 · A Royal Indian Railways Concierge Experience
      </footer>
    </div>
  );
}
