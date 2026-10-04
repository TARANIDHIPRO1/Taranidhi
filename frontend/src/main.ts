/**
 * OccultViision PWA — Main Entry Point
 * - Service Worker registration
 * - Theme initialization
 * - Router bootstrap
 * - Error boundary
 */

import { Router } from "./router";
import { navigate } from "./router";
import { showToast } from "./dom";
import { initI18n, toggleLanguage, translateDOM } from "./i18n";

// ────────────────────────────────────────────────────────────────────────────
// Global Error Handling
// ────────────────────────────────────────────────────────────────────────────

interface ErrorEvent extends Event {
  error?: Error;
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}

window.addEventListener("error", (event: ErrorEvent) => {
  const message = event.error?.message || event.message || "Unknown error";
  console.error("Global error:", message, event);
  logErrorToServer({
    type: "uncaught-error",
    message,
    filename: event.filename,
    lineno: event.lineno,
    stack: event.error?.stack,
  });
  showToast("An error occurred. Please refresh.", true);
});

window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const message = event.reason?.message || String(event.reason) || "Unhandled promise rejection";
  console.error("Unhandled rejection:", message, event.reason);
  logErrorToServer({
    type: "unhandled-rejection",
    message,
    stack: event.reason?.stack,
  });
  // Don't show toast for promise rejections — they may be handled silently
});

async function logErrorToServer(errorData: any): Promise<void> {
  try {
    // Attempt to send error log to backend (optional, non-critical)
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silent fail — don't chain errors
      console.log("Error log endpoint not available");
    });
  } catch (e) {
    // Swallow
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Theme Initialization
// ────────────────────────────────────────────────────────────────────────────

function initTheme(): void {
  // Check localStorage for theme preference
  const saved = localStorage.getItem("theme") || "auto";
  const root = document.documentElement;

  let theme = saved;
  if (saved === "auto") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  root.setAttribute("data-theme", theme);

  // Listen for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (localStorage.getItem("theme") === "auto") {
      const newTheme = e.matches ? "dark" : "light";
      root.setAttribute("data-theme", newTheme);
    }
  });
}

function toggleTheme(): void {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// ────────────────────────────────────────────────────────────────────────────
// Service Worker Registration
// ────────────────────────────────────────────────────────────────────────────

async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported");
    return;
  }

  try {
    // vite-plugin-pwa auto-generates the SW at /sw.js
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("Service Worker registered:", registration);

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New SW installed, show "refresh" toast
          showToast("Update available — refresh to get the latest version", false);
        }
      });
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Router Initialization + App Bootstrap
// ────────────────────────────────────────────────────────────────────────────

async function initApp(): Promise<void> {
  // Initialize theme
  initTheme();

  // Initialize i18n (translations)
  await initI18n();

  // Register Service Worker (non-blocking)
  registerServiceWorker();

  // Expose toggles globally (optional, for dev/debug)
  (window as any).toggleTheme = toggleTheme;
  (window as any).toggleLanguage = toggleLanguage;

  // Initialize router
  const router = new Router();

  // Handle route changes
  window.addEventListener("hashchange", async () => {
    await router.route();
    // Translate DOM after route change
    translateDOM();
  });

  // Listen for language changes
  window.addEventListener("i18n-language-changed", () => {
    // Re-translate DOM when language changes
    translateDOM();
  });

  // Initial route
  await router.route();
  // Translate initial DOM
  translateDOM();

  console.log("OccultViision PWA initialized");
}

// ────────────────────────────────────────────────────────────────────────────
// Startup
// ────────────────────────────────────────────────────────────────────────────

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// Export for testing/external use
export { toggleTheme, logErrorToServer };
