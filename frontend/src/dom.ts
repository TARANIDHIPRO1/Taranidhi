// Tiny DOM helpers — no framework, just convenience.

import { toggleLanguage, getCurrentLanguage } from "./i18n";

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $app(): HTMLElement {
  return document.getElementById("app")!;
}

export function h(
  tag: string,
  attrs?: Record<string, string>,
  ...children: (string | HTMLElement | null)[]
): HTMLElement {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className") el.className = v;
      else if (k.startsWith("on")) {
        // Not used here — event handlers are attached separately.
      } else el.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child === null) continue;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  }
  return el;
}

export function clear(el: HTMLElement) {
  el.innerHTML = "";
}

/** Escape text before interpolating it into an innerHTML template.
 *  Required for anything that came from a user or the API (contact
 *  messages, testimonials, names) to prevent script injection. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function showToast(msg: string, isError = false) {
  let toast = document.getElementById("ov-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ov-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `ov-toast show ${isError ? "error" : "ok"}`;
  setTimeout(() => toast!.classList.remove("show"), 3000);
}

// ────────────────────────────────────────────────────────────────────────────
// Theme Management
// ────────────────────────────────────────────────────────────────────────────

export function initializeTheme(): void {
  const html = document.documentElement;
  const stored = localStorage.getItem("theme");

  if (stored === "dark" || stored === "light") {
    html.setAttribute("data-theme", stored);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.setAttribute("data-theme", "dark");
  } else {
    html.setAttribute("data-theme", "light");
  }
}

export function toggleTheme(): void {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";

  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  // Update theme toggle button text
  const themeToggle = document.getElementById("btn-theme-toggle");
  if (themeToggle) {
    const span = themeToggle.querySelector("span");
    if (span) {
      span.textContent = next === "dark" ? "☀️" : "🌙";
    }
  }
}

export function getCurrentTheme(): "light" | "dark" {
  return (document.documentElement.getAttribute("data-theme") || "light") as "light" | "dark";
}

// ────────────────────────────────────────────────────────────────────────────
// Header with Language Toggle & Dark Mode Toggle
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a standard header with brand, language toggle, theme toggle, and logout button.
 * Usage:
 *  const header = createHeader("OCCULTVIISION", () => navigate("/login"));
 *  app.appendChild(header);
 */
export function createHeader(
  brandName: string,
  onLogout?: () => void
): HTMLElement {
  const header = document.createElement("header");
  header.className = "ti-header";
  const currentTheme = getCurrentTheme();
  const themeIcon = currentTheme === "dark" ? "☀️" : "🌙";

  header.innerHTML = `
    <div class="ti-brand">
      <span class="ti-brand-name">${brandName}</span>
    </div>
    <div class="ti-header-controls">
      <button id="btn-theme-toggle" class="ti-theme-toggle"
              title="Toggle dark/light mode">
        <span>${themeIcon}</span>
      </button>
      <button id="btn-language-toggle" class="ti-lang-toggle"
              title="Toggle language">
        <span id="lang-display">${getCurrentLanguage() === "en" ? "EN" : "हि"}</span>
      </button>
      <button id="btn-logout" class="ti-logout">
        <span data-i18n="menu.logout">Logout</span>
      </button>
    </div>
  `;

  // Theme toggle handler
  const themeToggle = header.querySelector("#btn-theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Language toggle handler
  const langToggle = header.querySelector("#btn-language-toggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      toggleLanguage();
      const langDisplay = header.querySelector("#lang-display");
      if (langDisplay) {
        const newLang = getCurrentLanguage();
        langDisplay.textContent = newLang === "en" ? "EN" : "हि";
      }
    });
  }

  // Logout handler
  const logoutBtn = header.querySelector("#btn-logout");
  if (logoutBtn && onLogout) {
    logoutBtn.addEventListener("click", onLogout);
  }

  return header;
}
