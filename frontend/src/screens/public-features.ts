/**
 * Features Page — Detailed capability breakdown by Five Elements
 */

import { wrapPublicPage } from "./public-layout";

export function renderPublicFeatures(): void {
  const html = `
    <section class="pub-section pub-features-hero">
      <div class="pub-container">
        <h1 class="pub-section-title">Every feature. Every system. One place.</h1>
        <p class="pub-section-sub">
          OccultViision is built around the five classical pillars of Vedic timing science —
          Panchanga, KP, Hora, Tara, and Numerology. Each is implemented from first
          principles, not reverse-engineered from other apps.
        </p>
      </div>
    </section>

    <!-- Kundali / Birth Chart -->
    <section class="pub-section">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--akash">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Birth Chart · Kundali</div>
            <h2>KP-accurate Kundali in seconds</h2>
            <p>Enter birth date, time, and place. OccultViision computes:</p>
            <ul class="pub-feature-list">
              <li>Sidereal longitudes (Lahiri ayanamsa, default app-wide)</li>
              <li>Placidus house cusps — the KP standard</li>
              <li>Planet positions, retrograde status, combustion</li>
              <li>Full sub-lord table for all 12 houses (243-fold subdivision)</li>
              <li>Moon Nakshatra, Pada, Tarabala score</li>
              <li>Ganda Moola flag with classical source citation</li>
            </ul>
            <p class="pub-feature-proof">
              Verified: 22/22 sub-lord matches against onlinejyotish.com
              for reference birth chart (Naveen K. Rai, 08/04/1973, 11:45 IST, Bhopal).
            </p>
          </div>
          <div class="pub-feature-visual pub-feature-visual--chart">
            <div class="pub-mini-chart">
              <div class="pub-mc-grid">
                <div class="pub-mc-cell">12</div><div class="pub-mc-cell">1</div>
                <div class="pub-mc-cell">2</div><div class="pub-mc-cell">3</div>
                <div class="pub-mc-cell">11</div><div class="pub-mc-cell pub-mc-center">☉</div>
                <div class="pub-mc-cell pub-mc-center-r">KP</div><div class="pub-mc-cell">4</div>
                <div class="pub-mc-cell">10</div><div class="pub-mc-cell pub-mc-center-b">⬛</div>
                <div class="pub-mc-cell pub-mc-center-bl">⬜</div><div class="pub-mc-cell">5</div>
                <div class="pub-mc-cell">9</div><div class="pub-mc-cell">8</div>
                <div class="pub-mc-cell">7</div><div class="pub-mc-cell">6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Muhurta -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--agni pub-feature-block--reverse">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Muhurta Timing · Agni</div>
            <h2>8-layer confidence index for every moment</h2>
            <p>OccultViision's Muhurta engine weights eight independent systems
               and returns a single score (0–100) with a CONVERGENT / PARTIAL /
               DIVERGENT convergence grade.</p>
            <div class="pub-feature-layers">
              <div class="pub-layer"><span class="pub-layer-w">22%</span> Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana)</div>
              <div class="pub-layer"><span class="pub-layer-w">15%</span> Tarabala (birth-star compatibility)</div>
              <div class="pub-layer"><span class="pub-layer-w">12%</span> Dosha analysis (Bhadra, Panchaka, Ganda Moola)</div>
              <div class="pub-layer"><span class="pub-layer-w">12%</span> Gochar (transits of malefics/benefics)</div>
              <div class="pub-layer"><span class="pub-layer-w">11%</span> Ashtakavarga (aggregate planetary strength)</div>
              <div class="pub-layer"><span class="pub-layer-w">10%</span> Chandrabala (Moon's position from natal Moon)</div>
              <div class="pub-layer"><span class="pub-layer-w">10%</span> Dasha (ruling period harmony)</div>
              <div class="pub-layer"><span class="pub-layer-w">8%</span>  Hora (planetary hour for the event type)</div>
            </div>
          </div>
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Muhurta Scanner</div>
            <h2>Scan weeks of dates automatically</h2>
            <p>Don't pick a date manually — let the scanner find the best
               Muhurta inside any date window for your event type.</p>
            <ul class="pub-feature-list">
              <li>Property registration, possession, agreement</li>
              <li>Marriage ceremony, engagement, roka</li>
              <li>Business launch, partnership deed, incorporation</li>
              <li>Surgery scheduling (medical)</li>
              <li>Results ranked by confidence score — top 5 returned</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- KP Sub-Lords -->
    <section class="pub-section">
      <div class="pub-container">
        <div class="pub-feature-block">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">KP System · Krishnamurti Paddhati</div>
            <h2>Sub-lord queries with house signification</h2>
            <p>KP works by ruling the 243 sub-divisions of the zodiac.
               OccultViision implements the full system:</p>
            <ul class="pub-feature-list">
              <li>Sub-lord for any house cusp or planet</li>
              <li>Star lord and sub-lord chain (3 levels)</li>
              <li>House signification based on occupant + owner + aspects</li>
              <li>Ruling planets at the moment of query (KP method)</li>
              <li>KP question analysis: "Will the matter come to pass?"</li>
            </ul>
          </div>
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Dasha Timeline</div>
            <h2>Vimsottari Dasha with sub-periods</h2>
            <ul class="pub-feature-list">
              <li>Full 120-year Vimsottari Dasha sequence</li>
              <li>Mahadasha → Antardasha → Pratyantardasha</li>
              <li>Current Dasha highlighted with start/end dates</li>
              <li>Export timeline for any birth chart</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Numerology -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <div class="pub-feature-block pub-feature-block--jal">
          <div class="pub-feature-content">
            <div class="pub-feature-tag">Numerology · Jal (Water)</div>
            <h2>Three systems. Cross-verified.</h2>
            <p>Naveen uses Pythagorean, Chaldean, and Kabalah numerology in
               combination. OccultViision computes all three and flags
               where they agree (signal) or diverge (uncertainty).</p>
            <ul class="pub-feature-list">
              <li>Life Path, Destiny, Soul Urge, Personality numbers</li>
              <li>Business name number + compatibility with owner's numbers</li>
              <li>Auspicious dates from numerology (combined with Muhurta)</li>
              <li>Name correction suggestions (Chaldean method)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Accuracy -->
    <section class="pub-section">
      <div class="pub-container">
        <h2 class="pub-section-title">Accuracy is the product</h2>
        <div class="pub-accuracy-grid">
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">22/22</div>
            <div class="pub-accuracy-label">Sub-lord matches vs. reference calculator</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">243</div>
            <div class="pub-accuracy-label">KP sub-divisions implemented</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">8</div>
            <div class="pub-accuracy-label">Muhurta layers scored independently</div>
          </div>
          <div class="pub-accuracy-item">
            <div class="pub-accuracy-num">0</div>
            <div class="pub-accuracy-label">TypeScript compilation errors in production build</div>
          </div>
        </div>
        <p class="pub-accuracy-note">
          Every formula is verified against classical sources before code is written.
          See our <a href="#/blog">methodology articles</a> for the source citations.
        </p>
      </div>
    </section>

    <!-- CTA -->
    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Ready to try it?</h2>
        <p>Start with trial points. No subscription required.</p>
        <a href="#/login" class="pub-btn pub-btn--primary pub-btn--lg">Create Free Account →</a>
        <a href="#/pricing" class="pub-btn pub-btn--ghost">See Pricing</a>
      </div>
    </section>
  `;

  wrapPublicPage("#/features", html);
}
