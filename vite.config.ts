import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Used when `VITE_SITE_ORIGIN` is unset (local builds); replace in `.env` or rely on CI. */
const PLACEHOLDER_SITE_ORIGIN = "https://YOUR_GITHUB_USER.github.io/YOUR_REPO";

export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), "");
  const raw = loaded.VITE_SITE_ORIGIN || process.env.VITE_SITE_ORIGIN || "";
  const siteOrigin = (raw || PLACEHOLDER_SITE_ORIGIN).replace(/\/?$/, "");

  return {
    plugins: [
      react(),
      {
        name: "inject-site-origin",
        transformIndexHtml(html: string) {
          return html.replaceAll("%SITE_ORIGIN%", siteOrigin);
        },
      },
    ],
    base: "./",
    worker: { format: "es" },
    /** Dev default avoids clashing with other Vite apps on 5173. Production build ignores this. */
    server: {
      port: 5274,
      strictPort: true,
    },
    /**
     * Optional dev-only proxy for SEC JSON (avoids browser CORS; still needs fair User-Agent on the server).
     * Uncomment and set headers in a small middleware if you call `fetch("/api/sec/...")` from the app.
     *
     * server: {
     *   proxy: {
     *     "/api/sec": {
     *       target: "https://data.sec.gov",
     *       changeOrigin: true,
     *       rewrite: (p) => p.replace(/^\/api\/sec/, ""),
     *     },
     *   },
     * },
     */
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  };
});
