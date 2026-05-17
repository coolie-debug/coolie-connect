/**
 * preview-server.ts
 * Production preview server for Replit autoscale deployment.
 *
 * The vite build (Cloudflare adapter) emits:
 *   dist/server/index.js  — WinterCG fetch-handler Workers bundle
 *   dist/client/assets/   — hashed static assets
 *
 * vite preview looks for dist/server/server.js (wrong name) → crash.
 * This server loads the correct entry and adapts it to Bun's HTTP server.
 */

import { resolve, extname } from "node:path";
import { existsSync }       from "node:fs";

const PORT = Number(process.env.PORT ?? 5000);
const HOST = "0.0.0.0";
const ROOT = import.meta.dir;
const DIST_CLIENT = resolve(ROOT, "dist/client");
const DIST_SERVER = resolve(ROOT, "dist/server/index.js");

/* ── Static asset MIME map ─────────────────────────────────────────────── */
const MIME: Record<string, string> = {
  ".html":  "text/html; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".mjs":   "application/javascript; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".json":  "application/json",
  ".svg":   "image/svg+xml",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".gif":   "image/gif",
  ".webp":  "image/webp",
  ".ico":   "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".otf":   "font/otf",
  ".map":   "application/json",
  ".txt":   "text/plain",
};

/* ── Load the Workers SSR bundle ─────────────────────────────────────────── */
type WorkerModule = { default: { fetch: (req: Request, env: unknown, ctx: unknown) => Promise<Response> | Response } };
let workerEntry: WorkerModule | null = null;

try {
  workerEntry = await import(DIST_SERVER) as WorkerModule;
  console.log("[preview-server] SSR worker entry loaded ✓");
} catch (err) {
  console.error("[preview-server] ⚠ Could not load dist/server/index.js:", err);
  console.error("  → Run `bun run build` first.");
}

/* ── Minimal ctx stub for WinterCG handler ───────────────────────────────── */
const CTX_STUB = {
  waitUntil:              (_p: Promise<unknown>) => {},
  passThroughOnException: () => {},
};
const ENV_STUB = {};

/* ── Try serving a static file from dist/client ──────────────────────────── */
function tryStatic(pathname: string): Response | null {
  const filePath = resolve(DIST_CLIENT, "." + pathname);
  if (!existsSync(filePath)) return null;

  const file = Bun.file(filePath);
  if (!file.size) return null;

  const ext  = extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const isImmutable = pathname.startsWith("/assets/");

  return new Response(file, {
    headers: {
      "Content-Type":  mime,
      "Cache-Control": isImmutable
        ? "public, max-age=31536000, immutable"
        : "no-cache, no-store, must-revalidate",
    },
  });
}

/* ── HTTP server ─────────────────────────────────────────────────────────── */
Bun.serve({
  port: PORT,
  hostname: HOST,

  async fetch(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url);

    /* 1 · Static assets (hashed, e.g. /assets/foo-abc123.js) */
    if (pathname.startsWith("/assets/")) {
      const s = tryStatic(pathname);
      if (s) return s;
    }

    /* 2 · Other well-known static files (favicon, robots, etc.) */
    if (pathname !== "/" && !pathname.startsWith("/_")) {
      const s = tryStatic(pathname);
      if (s) return s;
    }

    /* 3 · SSR — delegate to the Workers handler */
    if (workerEntry?.default?.fetch) {
      try {
        return await workerEntry.default.fetch(req, ENV_STUB, CTX_STUB);
      } catch (err) {
        console.error("[preview-server] SSR error:", err);
        return new Response(
          `<html><body style="font-family:sans-serif;padding:2rem">
            <h2>⚠ Server Error</h2>
            <pre>${String(err)}</pre>
          </body></html>`,
          { status: 500, headers: { "Content-Type": "text/html" } },
        );
      }
    }

    /* 4 · No SSR bundle — serve assets-only SPA shell if available */
    const shell = tryStatic("/index.html");
    if (shell) return shell;

    return new Response("Build not found. Run `bun run build` first.", { status: 503 });
  },

  error(err: Error): Response {
    console.error("[preview-server] Unhandled:", err);
    return new Response("Internal Server Error", { status: 500 });
  },
});

console.log(`🚂 Coolie Mitr preview server → http://${HOST}:${PORT}`);
