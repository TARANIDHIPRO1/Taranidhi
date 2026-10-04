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
// Header with Language Toggle
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a standard header with brand, language toggle, and logout button.
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
  header.innerHTML = `
    <div class="ti-brand">
      <span class="ti-brand-name">${brandName}</span>
    </div>
    <div class="ti-header-controls">
      <button id="btn-language-toggle" class="ti-lang-toggle"
              title="Toggle language">
        <span id="lang-display">${getCurrentLanguage() === "en" ? "EN" : "हि"}</span>
      </button>
      <button id="btn-logout" class="ti-logout">
        <span data-i18n="menu.logout">Logout</span>
      </button>
    </div>
  `;

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
