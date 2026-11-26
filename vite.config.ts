import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// transformers.js contains an unused fallback reference to its WebAssembly
// runtime, which makes Vite emit a 27 MB copy into dist/assets. We always load
// the runtime from /ort/ (see scripts/copy-ort.mjs and whisper.worker.ts), so
// drop the dead copy to keep deploys and Docker images small.
function dropBundledOrtWasm(): Plugin {
  return {
    name: "panga:drop-bundled-ort-wasm",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const name of Object.keys(bundle)) {
        if (/ort-wasm-simd-threaded.*\.wasm$/.test(name)) delete bundle[name];
      }
    },
  };
}

// The service worker is off in `npm run dev` (it makes hot-reload confusing and
// browsers will not offer "Install" without one). Run `npm run dev:pwa` to turn
// it on locally, or test the production build with `npm run build && npm start`.
const pwaInDev = process.env.VITE_PWA_DEV === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dropBundledOrtWasm(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      devOptions: { enabled: pwaInDev, type: "module" },
      manifest: {
        id: "/",
        name: "Panga",
        short_name: "Panga",
        description: "Catch your train of thought and tick off tasks. Offline-first.",
        lang: "en",
        categories: ["productivity", "business"],
        theme_color: "#111111",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/home",
        shortcuts: [
          { name: "Quick capture", short_name: "Capture", url: "/home?capture=1", icons: [{ src: "icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
          { name: "Clipboard", url: "/home?tab=Clipboard", icons: [{ src: "icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
          { name: "Tasks", url: "/home", icons: [{ src: "icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
        ],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        // The speech runtime (WebAssembly) is ~40 MB. Never precache it at
        // install time; it is cached the first time voice input is used.
        globIgnores: ["ort/**"],
        // The speech-model worker bundle is larger than Workbox's 2 MB default.
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: "index.html",
        // Never serve the SPA shell for the vanilla Puter edition or API routes.
        navigateFallbackDenylist: [/^\/api\//, /^\/health/, /^\/ort\//, /^\/privacy\.html/],
        // makes the SW fetch() the request itself, and that fetch is governed by the
        // With no matching route, the browser loads cross-origin requests natively.
        //
        // The one route below is SAME-ORIGIN only (our self-hosted speech runtime),
        // so it is not affected by that problem. Speech MODEL files come from
        // huggingface.co and are cached by transformers.js itself (Cache Storage),
        // not by this service worker.
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
              sameOrigin && url.pathname.startsWith("/ort/"),
            handler: "CacheFirst",
            options: {
              cacheName: "panga-speech-runtime",
              expiration: { maxEntries: 6 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});
