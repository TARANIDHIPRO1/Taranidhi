// Business contact settings, loaded from GET /public/config (D1 app_settings).
// Admins change these in the admin panel; nothing is hardcoded in pages.
// The defaults below are only used until the request returns, or if it fails.

import { getPublicConfig } from "./api";

export interface SiteConfig {
  whatsapp_number: string; // wa.me format: 91XXXXXXXXXX
  contact_phone: string;   // 91XXXXXXXXXX
  contact_email: string;
}

const DEFAULTS: SiteConfig = {
  whatsapp_number: "919669756111",
  contact_phone: "919669756111",
  contact_email: "info@occultviision.com",
};

let cached: SiteConfig | null = null;
let inflight: Promise<SiteConfig> | null = null;

export function siteConfigSync(): SiteConfig {
  return cached ?? DEFAULTS;
}

export function loadSiteConfig(): Promise<SiteConfig> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = getPublicConfig()
      .then((r) => {
        const d = r.ok && r.data ? r.data : {};
        cached = {
          whatsapp_number: /^91[6-9]\d{9}$/.test(d.whatsapp_number) ? d.whatsapp_number : DEFAULTS.whatsapp_number,
          contact_phone: /^91[6-9]\d{9}$/.test(d.contact_phone) ? d.contact_phone : DEFAULTS.contact_phone,
          contact_email: typeof d.contact_email === "string" && d.contact_email.includes("@") ? d.contact_email : DEFAULTS.contact_email,
        };
        return cached;
      })
      .catch(() => DEFAULTS)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

/** Forget the cached copy (after an admin changes settings). */
export function resetSiteConfig(): void {
  cached = null;
}

/** "919669756111" -> "+91 96697 56111" */
export function formatIndianPhone(intl: string): string {
  const ten = intl.replace(/^91/, "");
  return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
}

export function whatsappLink(text?: string, cfg: SiteConfig = siteConfigSync()): string {
  return `https://wa.me/${cfg.whatsapp_number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Fill any element marked data-cfg="phone|email|whatsapp" with live values. */
export function applySiteConfig(root: ParentNode, cfg: SiteConfig): void {
  root.querySelectorAll<HTMLElement>("[data-cfg]").forEach((el) => {
    const kind = el.dataset.cfg;
    if (kind === "phone") {
      el.textContent = formatIndianPhone(cfg.contact_phone);
      if (el instanceof HTMLAnchorElement) el.href = `tel:+${cfg.contact_phone}`;
    } else if (kind === "email") {
      el.textContent = cfg.contact_email;
      if (el instanceof HTMLAnchorElement) el.href = `mailto:${cfg.contact_email}`;
    } else if (kind === "whatsapp" && el instanceof HTMLAnchorElement) {
      el.href = whatsappLink(undefined, cfg);
    }
  });
}
