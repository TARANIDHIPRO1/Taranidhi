import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// PWA: this manifest is the ONLY one (public/manifest.webmanifest was removed;
// two manifests with different colours/icons were being shipped).
// Install paths: Android Chrome "Install app", iPhone Safari "Add to Home
// Screen", desktop Chrome/Edge install icon. No app store needed.
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "OccultViision",
        short_name: "OccultViision",
        description: "Vedic astrology — Muhurta, KP, Hora and numerology timing",
        lang: "en-IN",
        theme_color: "#1a1a2e",
        background_color: "#1a1a2e",
        display: "standalone",
        // "any" (not "portrait"): a portrait lock stops the installed app
        // rotating, which also blocks landscape testing on tablets.
        orientation: "any",
        start_url: "/#/home",
        scope: "/",
        categories: ["lifestyle", "productivity"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Muhurta Now", short_name: "Muhurta", url: "/#/muhurta", icons: [{ src: "icon-192.png", sizes: "192x192" }] },
          { name: "KP Query", short_name: "KP Query", url: "/#/kp-query", icons: [{ src: "icon-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        // Never serve API responses from the service-worker cache.
        navigateFallbackDenylist: [/^\/(public|admin|auth|wallet|orders|kp|kundali|muhurta|numerology|referral|knowledge|webhooks|api|health)\b/],
      },
    }),
  ],
  build: {
    outDir: "dist",
    target: "es2022",
  },
});
