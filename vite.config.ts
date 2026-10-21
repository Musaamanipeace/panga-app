import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Panga",
        short_name: "Panga",
        description: "Personal, offline-first project & resource planner.",
        theme_color: "#111111",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "index.html",
        // Never serve the SPA shell for the vanilla Puter edition or API routes.
        navigateFallbackDenylist: [/^\/puter\//, /^\/api\//, /^\/health/],
        // NOTE: no runtimeCaching for puter.com on purpose. Any route registered here
        // makes the SW fetch() the request itself, and that fetch is governed by the
        // SW's own CSP connect-src (not script-src) -> js.puter.com gets blocked.
        // With no matching route, the browser loads cross-origin requests natively.
      },
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
});