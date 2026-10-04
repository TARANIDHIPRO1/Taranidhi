/**
 * i18next Configuration & Initialization
 * - Loads translation files from CDN (docs/)
 * - Detects browser language (en, hi, fallback en)
 * - Persists language choice to localStorage
 * - Provides i18n.t() for key-based translations
 */

declare global {
  interface Window {
    i18next: any;
    i18nextHttpBackend: any;
    i18nextBrowserLanguageDetector: any;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = ["en", "hi"];
const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "language";

// ────────────────────────────────────────────────────────────────────────────
// Initialize i18next
// ────────────────────────────────────────────────────────────────────────────

export async function initI18n(): Promise<void> {
  if (!window.i18next) {
    console.error("[i18n] i18next library not loaded");
    return;
  }

  const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;

  try {
    await window.i18next
      .use(window.i18nextHttpBackend)
      .use(window.i18nextBrowserLanguageDetector)
      .init({
        fallbackLng: DEFAULT_LANGUAGE,
        lng: savedLang,
        supportedLngs: SUPPORTED_LANGUAGES,
        ns: ["common"], // Namespaces (can be extended: common, kundali, muhurta, etc.)
        defaultNS: "common",
        backend: {
          loadPath: "/docs/{{lng}}-{{ns}}.json",
          // Fallback: if specific namespace not found, try common
          addPath: "/docs/{{lng}}-{{ns}}.json",
        },
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
        },
        interpolation: {
          escapeValue: false, // React already does this
        },
      });

    console.log(
      `[i18n] Initialized with language: ${window.i18next.language}`
    );

    // Trigger language change event for UI updates
    window.i18next.on("languageChanged", (lng: string) => {
      localStorage.setItem(STORAGE_KEY, lng);
      document.documentElement.lang = lng;
      // Dispatch custom event for screens to re-render if needed
      window.dispatchEvent(
        new CustomEvent("i18n-language-changed", { detail: { language: lng } })
      );
    });
  } catch (error) {
    console.error("[i18n] Initialization failed:", error);
    // Fallback to default language
    window.i18next.changeLanguage(DEFAULT_LANGUAGE);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Language Toggle
// ────────────────────────────────────────────────────────────────────────────

export function toggleLanguage(): void {
  if (!window.i18next) {
    console.error("[i18n] i18next not initialized");
    return;
  }

  const current = window.i18next.language;
  const next = current === "en" ? "hi" : "en";

  window.i18next.changeLanguage(next);
  console.log(`[i18n] Language toggled: ${current} → ${next}`);
}

export function getCurrentLanguage(): string {
  return window.i18next?.language || DEFAULT_LANGUAGE;
}

// ────────────────────────────────────────────────────────────────────────────
// Translation Helper
// ────────────────────────────────────────────────────────────────────────────

export function t(key: string, defaultValue?: string): string {
  if (!window.i18next) {
    console.warn(`[i18n] i18next not initialized, returning key: ${key}`);
    return defaultValue || key;
  }

  const translated = window.i18next.t(key);
  // If key was not translated (returns the key itself), use default or key
  return translated !== key ? translated : defaultValue || key;
}

// ────────────────────────────────────────────────────────────────────────────
// DOM Translation (data-i18n attributes)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Translates all elements with data-i18n attribute.
 * Call after route change or language toggle.
 *
 * Usage:
 *  <button data-i18n="button.submit">Submit</button>
 *  <h1 data-i18n="nav.kundali">Birth Chart</h1>
 */
export function translateDOM(): void {
  if (!window.i18next) {
    console.warn("[i18n] i18next not initialized, skipping DOM translation");
    return;
  }

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const translated = window.i18next.t(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        (el as HTMLInputElement).placeholder = translated;
      } else {
        el.textContent = translated;
      }
    }
  });

  console.log(`[i18n] Translated ${elements.length} DOM elements`);
}
