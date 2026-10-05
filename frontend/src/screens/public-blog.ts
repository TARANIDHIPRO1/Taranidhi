/**
 * Blog / Resources — Articles, guides, FAQ
 * MVP: 4 static articles + FAQ accordion
 */

import { wrapPublicPage } from "./public-layout";

interface Article {
  id: string;
  tag: string;
  title: string;
  summary: string;
  readTime: string;
  date: string;
}

const ARTICLES: Article[] = [
  {
    id: "kp",
    tag: "KP System",
    title: "What is Krishnamurti Paddhati? The 243-fold zodiac explained.",
    summary: `KP astrology divides each of the 27 Nakshatras into 9 sub-lords,
      creating 243 micro-zones of the zodiac. This granularity allows timing
      predictions accurate to days — not months. We explain the Star Lord →
      Sub-Lord → Sub-Sub-Lord chain and how OccultViision implements it.`,
    readTime: "8 min",
    date: "Oct 2026",
  },
  {
    id: "muhurta",
    tag: "Muhurta",
    title: "Why Muhurta matters for property decisions: a practical guide.",
    summary: `Choosing an auspicious date for a property registration or
      possession isn't superstition — it's timing science. We walk through
      the five Panchanga elements, Tarabala, and Chandrabala and show exactly
      how OccultViision scores a candidate date. Real example included.`,
    readTime: "10 min",
    date: "Oct 2026",
  },
  {
    id: "numerology",
    tag: "Numerology",
    title: "Pythagorean vs. Chaldean vs. Kabalah: which numerology system to use?",
    summary: `Naveen uses all three in combination. Each has different letter
      mappings and different strengths. Chaldean is older and considered more
      precise for name analysis; Pythagorean is simpler and widely used in the
      West. We compare all three with worked examples for business names.`,
    readTime: "7 min",
    date: "Sep 2026",
  },
  {
    id: "tarabala",
    tag: "Tara & Hora",
    title: "Tarabala and Chandrabala: the two overlooked timing factors.",
    summary: `Most people focus on Tithi and Nakshatra when picking a Muhurta.
      Tarabala (birth-star compatibility with the query star) and Chandrabala
      (Moon's position from natal Moon) are equally important. Here's how to
      read and interpret them — and why OccultViision weights them at 15% and
      10% respectively in the confidence index.`,
    readTime: "6 min",
    date: "Sep 2026",
  },
];

const FAQS = [
  {
    q: "What is the difference between Tropical and Sidereal zodiac?",
    a: `Western astrology uses the Tropical zodiac, fixed to the Sun's position
        at the March equinox. Vedic astrology uses the Sidereal zodiac, aligned
        to the actual star constellations. The difference is the Ayanamsa —
        currently about 23.9° (Lahiri). OccultViision uses Lahiri Ayanamsa as
        the default for all calculations.`,
  },
  {
    q: "What is Ayanamsa and which one should I use?",
    a: `Ayanamsa is the difference between the Tropical and Sidereal zodiac.
        Lahiri (also called Chitrapaksha) is the official Government of India
        standard and is used by the majority of KP practitioners.
        OccultViision defaults to Lahiri app-wide.`,
  },
  {
    q: "What is the Placidus house system?",
    a: `Placidus divides the houses based on time taken by a degree to travel
        from the horizon to the meridian. It is the KP standard — Krishnamurti
        used Placidus exclusively for cusps. OccultViision uses Placidus for
        all house cusp calculations.`,
  },
  {
    q: "How accurate is the birth time required for KP?",
    a: `KP is sensitive to birth time because house cusps shift quickly — the
        Ascendant moves about 1° every 4 minutes. For reliable sub-lord analysis
        a birth time accurate to within 5–10 minutes is needed. If you don't
        know your exact time, use the Muhurta features (which don't require a
        birth chart) first.`,
  },
  {
    q: "What is Ganda Moola?",
    a: `Ganda Moola (also Gandanta) refers to the six Nakshatras that fall at
        the junction of fire-water Rashi pairs: Ashwini, Ashlesha, Magha, Jyeshtha,
        Moola, and Revati. Birth under these Nakshatras is traditionally considered
        inauspicious for certain events. OccultViision flags Ganda Moola with a
        warning and cites the classical source (Karma Vipak Samhita).`,
  },
];

export function renderPublicBlog(): void {
  const articleCards = ARTICLES.map(a => `
    <div class="pub-article-card" id="${a.id}">
      <div class="pub-article-tag">${a.tag}</div>
      <h3 class="pub-article-title">${a.title}</h3>
      <p class="pub-article-summary">${a.summary}</p>
      <div class="pub-article-meta">
        <span>${a.date}</span>
        <span>${a.readTime} read</span>
      </div>
    </div>
  `).join("");

  const faqItems = FAQS.map((f, i) => `
    <div class="pub-faq-item pub-faq-accordion" id="faq-${i}">
      <button class="pub-faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
        ${f.q}
        <span class="pub-faq-icon" aria-hidden="true">+</span>
      </button>
      <div class="pub-faq-a" id="faq-a-${i}" hidden>
        <p>${f.a}</p>
      </div>
    </div>
  `).join("");

  const html = `
    <section class="pub-section">
      <div class="pub-container">
        <h1 class="pub-section-title">Articles &amp; Guides</h1>
        <p class="pub-section-sub">
          Methodology notes, system explanations, and practical guides
          from the OCCULTVIISION practice.
        </p>
        <div class="pub-articles-grid">
          ${articleCards}
        </div>
      </div>
    </section>

    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <h2 class="pub-section-title">Frequently Asked Questions</h2>
        <div class="pub-faq pub-faq--full">
          ${faqItems}
        </div>
      </div>
    </section>

    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Questions not answered here?</h2>
        <p>Naveen answers personally. Use the contact form or call directly.</p>
        <a href="#/contact" class="pub-btn pub-btn--primary">Contact Naveen →</a>
      </div>
    </section>
  `;

  wrapPublicPage("#/blog", html);

  // Wire FAQ accordion after DOM renders
  requestAnimationFrame(() => {
    document.querySelectorAll<HTMLButtonElement>(".pub-faq-q").forEach(btn => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const answerId = btn.getAttribute("aria-controls");
        const answer = answerId ? document.getElementById(answerId) : null;
        const icon = btn.querySelector(".pub-faq-icon");

        btn.setAttribute("aria-expanded", String(!expanded));
        if (answer) {
          if (expanded) {
            answer.setAttribute("hidden", "");
          } else {
            answer.removeAttribute("hidden");
          }
        }
        if (icon) icon.textContent = expanded ? "+" : "−";
      });
    });
  });
}
