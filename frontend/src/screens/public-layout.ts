/**
 * Shared public-site layout: top nav + footer wrapper.
 * Used by: public-home, public-pricing, public-features,
 *           public-blog, public-contact.
 *
 * Design: Five Elements theme (Task 75) — deep-space dark,
 * Akash-purple primary accent, clean grid.
 */

import { $app, clear } from "../dom";
import { navigate } from "../router";

// ── Public nav ──────────────────────────────────────────────────────────────

export function renderPublicNav(activeRoute: string): string {
  const links: { label: string; route: string }[] = [
    { label: "Features", route: "#/features" },
    { label: "Pricing",  route: "#/pricing"  },
    { label: "Blog",     route: "#/blog"      },
    { label: "Contact",  route: "#/contact"   },
  ];

  const navLinks = links
    .map(l => `
      <a href="${l.route}"
         class="pub-nav-link ${activeRoute === l.route ? "pub-nav-link--active" : ""}">
        ${l.label}
      </a>`)
    .join("");

  return `
    <nav class="pub-nav">
      <a href="#/home" class="pub-nav-brand">
        <span class="pub-nav-logo">☉</span>
        <span class="pub-nav-name">OCCULTVIISION</span>
      </a>
      <div class="pub-nav-links">${navLinks}</div>
      <a href="#/login" class="pub-nav-cta">Enter App →</a>
      <button class="pub-nav-hamburger" id="pub-nav-hamburger" aria-label="Menu">☰</button>
    </nav>
    <div class="pub-nav-mobile-menu" id="pub-nav-mobile-menu">
      ${links.map(l => `<a href="${l.route}" class="pub-nav-mobile-link">${l.label}</a>`).join("")}
      <a href="#/login" class="pub-nav-mobile-link pub-nav-mobile-cta">Enter App →</a>
    </div>
  `;
}

// ── Public footer ────────────────────────────────────────────────────────────

export function renderPublicFooter(): string {
  const year = new Date().getFullYear();
  return `
    <footer class="pub-footer">
      <div class="pub-footer-inner">
        <div class="pub-footer-brand">
          <span class="pub-footer-logo">☉</span>
          <span class="pub-footer-name">OCCULTVIISION</span>
          <p class="pub-footer-tagline">
            Vedic Astrology &amp; KP System — Precise timing for life's decisions.
          </p>
          <p class="pub-footer-credit">
            By Naveen K. Rai · Astronumerologist &amp; Vastu Consultant
          </p>
        </div>

        <div class="pub-footer-links">
          <div class="pub-footer-col">
            <h4>Product</h4>
            <a href="#/features">Features</a>
            <a href="#/pricing">Pricing</a>
            <a href="#/login">Login</a>
          </div>
          <div class="pub-footer-col">
            <h4>Learn</h4>
            <a href="#/blog">Blog &amp; Articles</a>
            <a href="#/blog#kp">KP System Guide</a>
            <a href="#/blog#muhurta">Muhurta Basics</a>
          </div>
          <div class="pub-footer-col">
            <h4>Contact</h4>
            <a href="tel:+919669756111">+91 96697 56111</a>
            <a href="mailto:info@occultviision.com">info@occultviision.com</a>
            <a href="#/contact">Send a Message</a>
          </div>
        </div>
      </div>
      <div class="pub-footer-bottom">
        <span>© ${year} OCCULTVIISION™. All rights reserved.</span>
        <span>Bhopal, Madhya Pradesh, India</span>
      </div>
    </footer>
  `;
}

// ── Shared page wrapper ──────────────────────────────────────────────────────

export function wrapPublicPage(activeRoute: string, bodyHtml: string): void {
  const app = $app();
  clear(app);

  app.innerHTML = `
    <div class="pub-page">
      ${renderPublicNav(activeRoute)}
      <main class="pub-main">${bodyHtml}</main>
      ${renderPublicFooter()}
    </div>
  `;

  // Mobile hamburger toggle
  const hamburger = document.getElementById("pub-nav-hamburger");
  const mobileMenu = document.getElementById("pub-nav-mobile-menu");
  hamburger?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("pub-nav-mobile-menu--open");
  });

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("pub-nav-mobile-menu--open"));
  });
}
