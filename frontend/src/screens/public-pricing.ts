/**
 * Pricing Page — Freemium model: Free Basic Panchang / Demo / TaraNidhi Intelligence
 *
 * Business model (Naveen directive, Oct 2026):
 *   FREE  — Basic Panchang for all, ad-supported (Google AdSense)
 *   DEMO  — Limited TaraNidhi queries, ad-supported
 *   PAID  — TaraNidhi Intelligence, no ads
 *
 * ⚠️  PRICING VALUES — Naveen must confirm 6-month + yearly before launch:
 *    INTRO_PRICE      = ₹99/month  (first 15 days early-bird, locked in)
 *    SIXMONTH_PRICE   = TBD        (Naveen to confirm)
 *    YEARLY_PRICE     = TBD        (Naveen to confirm)
 */

import { wrapPublicPage } from "./public-layout";

// ── Naveen: update these before launch ─────────────────────────────────────
const INTRO_MONTHLY_PRICE   = "₹99";
const INTRO_6MONTH_PRICE    = "₹TBD";   // TODO: confirm (suggest ~₹499 = ~17% saving)
const INTRO_YEARLY_PRICE    = "₹TBD";   // TODO: confirm (suggest ~₹799 = ~33% saving)
const INTRO_CUTOFF_DAYS     = 15;       // early-bird window in days
// ──────────────────────────────────────────────────────────────────────────

interface PricingPeriod {
  label: string;
  price: string;
  sub: string;
  savings: string | null;
}

const PERIODS: Record<string, PricingPeriod> = {
  monthly: {
    label: "Monthly",
    price: INTRO_MONTHLY_PRICE,
    sub: "per month · introductory price",
    savings: null,
  },
  "6month": {
    label: "6 Months",
    price: INTRO_6MONTH_PRICE,
    sub: "every 6 months · final price TBD",
    savings: "Save vs monthly · final price TBD",
  },
  yearly: {
    label: "Yearly",
    price: INTRO_YEARLY_PRICE,
    sub: "per year · best value · final price TBD",
    savings: "Save vs monthly · final price TBD",
  },
};

function periodToggle(): string {
  return `
    <div class="price-period-wrap">
      <div class="price-period-toggle" id="period-toggle">
        ${Object.entries(PERIODS).map(([key, p], i) => `
          <button
            class="period-btn${i === 0 ? " active" : ""}"
            data-period="${key}"
            onclick="setPricingPeriod('${key}', this)"
          >${p.label}</button>
        `).join("")}
      </div>
      <div class="price-period-savings" id="period-savings"></div>
    </div>
  `;
}

export function renderPublicPricing(): void {
  const html = `
    <!-- Intro offer banner -->
    <div class="pricing-intro-banner">
      <span class="pricing-intro-fire">🔥</span>
      <strong>Early-Bird Offer — First ${INTRO_CUTOFF_DAYS} Days Only:</strong>
      TaraNidhi Intelligence at <strong>${INTRO_MONTHLY_PRICE}/month</strong>, locked in forever at sign-up price.
    </div>

    <section class="pub-section pub-pricing-hero">
      <div class="pub-container">
        <h1 class="pub-section-title">Free forever. Intelligent when you upgrade.</h1>
        <p class="pub-section-sub">
          Basic Panchang is <strong>free for everyone</strong>, always.
          Unlock Naveen's proprietary TaraNidhi intelligence engine for KP Astrology, precise Muhurta, and Numerology.
        </p>

        <!-- What's free vs paid -->
        <div class="pricing-split-explain">
          <div class="pricing-split-col pricing-split--free">
            <div class="pricing-split-label">FREE — Always</div>
            <div class="pricing-split-title">Basic Panchang</div>
            <ul>
              <li>✓ Daily Tithi, Nakshatra, Yoga, Karana</li>
              <li>✓ Sunrise / Sunset times</li>
              <li>✓ Rahu Kaal, Gulika Kaal, Abhijit Muhurta</li>
              <li>✓ Auspicious colour, direction of the day</li>
              <li class="note">Ad-supported (like all Panchang apps)</li>
            </ul>
          </div>
          <div class="pricing-split-col pricing-split--paid">
            <div class="pricing-split-label">PAID — TaraNidhi Intelligence</div>
            <div class="pricing-split-title">KP Astrology + Muhurta + Numerology</div>
            <ul>
              <li>✓ Full KP Kundali (22/22 sub-lords, Lahiri, Placidus)</li>
              <li>✓ Precision Muhurta for Property, Marriage, Business, Medical</li>
              <li>✓ 8-layer Confidence Index (KP + Hora + Tara + Panchaka)</li>
              <li>✓ Chaldean + Pythagorean Numerology</li>
              <li>✓ Muhurta Scanner (bulk window scan)</li>
              <li class="highlight">✓ No ads</li>
            </ul>
          </div>
        </div>

      </div>
    </section>

    <section class="pub-section">
      <div class="pub-container">

        ${periodToggle()}

        <div class="pub-tiers">

          <!-- FREE — Basic Panchang -->
          <div class="pub-tier pub-tier--free">
            <div class="pub-tier-badge">Free</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">₹0</span>
              <span class="pub-tier-price-sub">forever free · ad-supported</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Daily Tithi, Nakshatra, Yoga, Karana</li>
              <li>✓ Sunrise/Sunset, Rahu Kaal, Gulika Kaal</li>
              <li>✓ Auspicious colour + direction</li>
              <li>✓ Abhijit Muhurta window</li>
              <li class="pub-tier-no">✗ KP Kundali / birth chart</li>
              <li class="pub-tier-no">✗ Precision Muhurta</li>
              <li class="pub-tier-no">✗ Numerology report</li>
              <li class="pub-tier-no">✗ Muhurta Scanner</li>
              <li>
                <span class="ad-label-inline">Ad-supported</span>
                <span class="ad-label-note">Google AdSense</span>
              </li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--outline pub-btn--full">
              Use Free Panchang
            </a>
          </div>

          <!-- DEMO — Try TaraNidhi -->
          <div class="pub-tier pub-tier--demo">
            <div class="pub-tier-badge">Demo</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">Free</span>
              <span class="pub-tier-price-sub">limited queries · ad-supported</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Free</li>
              <li>✓ 3 Muhurta queries (lifetime demo)</li>
              <li>✓ 1 KP Kundali generation</li>
              <li>✓ 5 Numerology reports</li>
              <li class="pub-tier-no">✗ Muhurta Scanner</li>
              <li class="pub-tier-no">✗ 8-layer Confidence Index</li>
              <li class="pub-tier-no">✗ Unlimited queries</li>
              <li>
                <span class="ad-label-inline">Ad-supported</span>
                <span class="ad-label-note">Splash ad on open</span>
              </li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--ghost pub-btn--full">
              Try Demo Free
            </a>
          </div>

          <!-- TaraNidhi Intelligence — highlighted -->
          <div class="pub-tier pub-tier--taranidhi pub-tier--featured">
            <div class="pub-tier-popular">⭐ Early Bird — First ${INTRO_CUTOFF_DAYS} Days</div>
            <div class="pub-tier-badge">TaraNidhi Intelligence</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main" id="tier-main-price">${INTRO_MONTHLY_PRICE}</span>
              <span class="pub-tier-price-sub" id="tier-price-sub">per month · introductory price</span>
            </div>
            <div class="intro-badge">
              🔒 Price locked at sign-up · Never increases
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Demo, unlimited</li>
              <li>✓ Full KP Kundali (22/22 sub-lords verified)</li>
              <li>✓ Precision Muhurta — Property, Marriage, Business, Medical</li>
              <li>✓ 8-layer Confidence Index</li>
              <li>✓ Chaldean + Pythagorean Numerology</li>
              <li>✓ Muhurta Scanner (bulk time windows)</li>
              <li>✓ Tarabala, Panchaka, Hora Scoring</li>
              <li>✓ Referral programme</li>
              <li class="highlight">✓ <strong>Zero ads</strong></li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--primary pub-btn--full">
              🔥 Get TaraNidhi Intelligence
            </a>
            <div class="tier-no-ads-note">No ads. No interruptions. Pure Vedic intelligence.</div>
          </div>

        </div><!-- /pub-tiers -->

        <!-- What is TaraNidhi Intelligence -->
        <div class="pub-taranidhi-explain">
          <h3>What is TaraNidhi Intelligence?</h3>
          <p>
            <strong>TaraNidhi</strong> (Sanskrit: "Treasure of Stars") is Naveen K. Rai's proprietary Vedic
            intelligence engine built on 20+ years of consultancy and rigorous formula verification.
          </p>
          <p>
            Unlike generic Panchang apps that show only the day's basic parameters, TaraNidhi runs
            the full <strong>Krishnamurti Paddhati (KP)</strong> system — 243-fold sub-lord subdivisions,
            Lahiri ayanamsa, Placidus houses — cross-referenced with Hora scoring, Tarabala star
            strength, and Panchaka warnings, generating an <strong>8-layer Confidence Index</strong> for
            every Muhurta window.
          </p>
          <p>
            Verified against classical texts. Validated on Naveen's own birth chart (22/22 sub-lords
            matched against onlinejyotish.com). <strong>No rounding. No compromises.</strong>
          </p>
        </div>

        <!-- Ad transparency -->
        <div class="pub-ad-transparency">
          <h4>About Ads</h4>
          <p>
            Free and Demo tiers are funded by advertising (Google AdSense / similar).
            A brief splash ad appears when the app opens; the X close button activates after 5 seconds.
            TaraNidhi Intelligence subscribers see <strong>zero ads</strong>.
          </p>
          <p>
            Ad revenue allows us to keep Basic Panchang free for everyone, forever — just like
            every other Panchang app on the market.
          </p>
        </div>

        <!-- FAQ -->
        <div class="pub-faq">
          <h3>Pricing FAQ</h3>
          <div class="pub-faq-item">
            <h4>What is the early-bird price?</h4>
            <p>
              For the first ${INTRO_CUTOFF_DAYS} days after launch, TaraNidhi Intelligence is available at
              ${INTRO_MONTHLY_PRICE}/month. This price is <strong>locked in permanently</strong> for
              everyone who subscribes during this window — your price never increases.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Can I keep Basic Panchang free forever?</h4>
            <p>
              Yes. Basic Panchang is free for everyone, always. It is ad-supported (the same model
              used by every major Panchang app). There is no time limit and no credit system.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>What happens when Demo queries run out?</h4>
            <p>
              The app will show you how many queries remain and prompt you to upgrade to TaraNidhi
              Intelligence. You retain access to Free Basic Panchang regardless.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>
              All major UPI apps, debit cards, credit cards, and net banking via Razorpay.
              100% secure — no card data stored by OccultViision.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Can I cancel anytime?</h4>
            <p>
              Yes. Cancel before the next billing date and you will not be charged again. Your
              TaraNidhi access continues until the end of the paid period. Contact Naveen directly
              at +91 96697 56111 for billing queries.
            </p>
          </div>
          <div class="pub-faq-item">
            <h4>Is there a B2B / hospital plan?</h4>
            <p>
              Yes — custom pricing for hospitals scheduling surgical procedures, corporate firms
              timing major contracts, and consulting astrologers needing white-label reports.
              <a href="#/contact">Contact us</a> for a quote.
            </p>
          </div>
        </div>

      </div>
    </section>
  `;

  wrapPublicPage("#/pricing", html);

  // Wire up period toggle after DOM insertion
  (window as any).setPricingPeriod = (period: string, btn: HTMLElement) => {
    // Update active button
    document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const p = PERIODS[period];
    const priceEl  = document.getElementById("tier-main-price");
    const subEl    = document.getElementById("tier-price-sub");
    const savEl    = document.getElementById("period-savings");

    if (priceEl) priceEl.textContent = p.price;
    if (subEl)   subEl.textContent   = p.sub;
    if (savEl)   savEl.textContent   = p.savings ?? "";
  };
}
