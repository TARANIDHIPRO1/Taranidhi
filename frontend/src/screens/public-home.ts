/**
 * Public Homepage — Hero, Value Props, How It Works, CTA, Testimonials
 */

import { wrapPublicPage } from "./public-layout";

export function renderPublicHome(): void {
  const html = `
    <!-- ── Hero ── -->
    <section class="pub-hero">
      <div class="pub-hero-inner">
        <div class="pub-hero-badge">Krishnamurti Paddhati · Lahiri Ayanamsa</div>
        <h1 class="pub-hero-title">
          Know the <em>exact</em> moment<br>
          to act — before you act.
        </h1>
        <p class="pub-hero-sub">
          OccultViision combines KP astrology, Muhurta timing, and Vedic numerology
          into one precision tool — verified against classical texts, not guesswork.
        </p>
        <div class="pub-hero-actions">
          <a href="#/login" class="pub-btn pub-btn--primary">Start for Free →</a>
          <a href="#/features" class="pub-btn pub-btn--ghost">See How It Works</a>
        </div>
        <div class="pub-hero-proof">
          <span>✓ 22/22 sub-lord matches verified</span>
          <span>✓ KP + Panchanga + Hora integrated</span>
          <span>✓ No subscription required to start</span>
        </div>
      </div>
      <div class="pub-hero-visual" aria-hidden="true">
        <div class="pub-chart-preview">
          <div class="pub-chart-ring pub-chart-ring--1"></div>
          <div class="pub-chart-ring pub-chart-ring--2"></div>
          <div class="pub-chart-ring pub-chart-ring--3"></div>
          <div class="pub-chart-center">☉</div>
          <div class="pub-chart-label pub-chart-label--n">Muhurta</div>
          <div class="pub-chart-label pub-chart-label--e">KP Sub-Lords</div>
          <div class="pub-chart-label pub-chart-label--s">Numerology</div>
          <div class="pub-chart-label pub-chart-label--w">Tarabala</div>
        </div>
      </div>
    </section>

    <!-- ── Value Props ── -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <h2 class="pub-section-title">Five systems. One answer.</h2>
        <p class="pub-section-sub">
          Most apps give you one system. OccultViision layers five,
          weighted and cross-verified to give a single confidence score.
        </p>
        <div class="pub-props-grid">
          <div class="pub-prop-card pub-prop-card--akash">
            <div class="pub-prop-icon">♈</div>
            <h3>KP Sub-Lords</h3>
            <p>243-fold subdivision of the zodiac. The most precise timing
               system in Vedic astrology — verified against Krishnamurti's
               original tables.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--agni">
            <div class="pub-prop-icon">⏱</div>
            <h3>Muhurta Timing</h3>
            <p>8-layer confidence index: Panchanga, Hora, Dosha, Tarabala,
               Chandrabala, Gochar, Dasha, and Ashtakavarga — all scored
               and weighted.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--jal">
            <div class="pub-prop-icon">🔢</div>
            <h3>Numerology</h3>
            <p>Pythagorean, Chaldean, and Kabalah methods applied to name,
               birth date, and business queries. Cross-checked for consistency.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--vayu">
            <div class="pub-prop-icon">⭐</div>
            <h3>Tarabala & Hora</h3>
            <p>Birth-star compatibility scored against the query star.
               Hora chart for money, business, and deal-timing questions.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--prithvi">
            <div class="pub-prop-icon">🏠</div>
            <h3>Birth Chart (Kundali)</h3>
            <p>Full KP chart with Placidus houses, Lahiri ayanamsa,
               Dasha timeline, and sub-lord table for all 12 houses.</p>
          </div>
          <div class="pub-prop-card pub-prop-card--neutral">
            <div class="pub-prop-icon">📊</div>
            <h3>Event Categories</h3>
            <p>Dedicated scoring for Property, Marriage, Business, and
               Medical decisions — each with domain-specific rules and
               classical references.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How It Works ── -->
    <section class="pub-section">
      <div class="pub-container">
        <h2 class="pub-section-title">From birth details to confident timing</h2>
        <div class="pub-steps">
          <div class="pub-step">
            <div class="pub-step-num">1</div>
            <div class="pub-step-body">
              <h3>Enter your birth chart</h3>
              <p>Date, time, and place of birth. The app calculates your Kundali
                 instantly using Lahiri ayanamsa and Placidus houses.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">2</div>
            <div class="pub-step-body">
              <h3>Ask your question</h3>
              <p>Choose an event category — property, marriage, business, or medical.
                 Specify the window of dates you're considering.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">3</div>
            <div class="pub-step-body">
              <h3>Get the confidence score</h3>
              <p>OccultViision returns a 0–100 score with per-layer breakdown,
                 the best Muhurta within your window, and a plain-language verdict.</p>
            </div>
          </div>
          <div class="pub-step">
            <div class="pub-step-num">4</div>
            <div class="pub-step-body">
              <h3>Act with confidence</h3>
              <p>Share the report with your consultant, save it to PDF, or
                 use it directly to schedule the signing, ceremony, or launch.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Social Proof ── -->
    <section class="pub-section pub-section--alt">
      <div class="pub-container">
        <h2 class="pub-section-title">Used by consultants and families across India</h2>
        <div class="pub-testimonials">
          <div class="pub-testi">
            <p class="pub-testi-quote">
              "I've cross-checked the sub-lord outputs against onlinejyotish.com
              and my own manual calculations. 22 out of 22 match. That's the
              benchmark I set — it passed."
            </p>
            <div class="pub-testi-author">
              <span class="pub-testi-name">Naveen K. Rai</span>
              <span class="pub-testi-role">Founder, Astronumerologist · Bhopal</span>
            </div>
          </div>
          <div class="pub-testi">
            <p class="pub-testi-quote">
              "The Muhurta scanner saved us three weeks of back-and-forth.
              We picked the registration date, the banker confirmed the slot,
              and everything aligned."
            </p>
            <div class="pub-testi-author">
              <span class="pub-testi-name">Property client</span>
              <span class="pub-testi-role">Bhopal, MP</span>
            </div>
          </div>
          <div class="pub-testi">
            <p class="pub-testi-quote">
              "As a KP practitioner I was skeptical of any app claiming
              sub-lord accuracy. The 243-fold table and Placidus houses
              are correct — this is the real system."
            </p>
            <div class="pub-testi-author">
              <span class="pub-testi-name">Consulting astrologer</span>
              <span class="pub-testi-role">Mumbai</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Final CTA ── -->
    <section class="pub-section pub-cta-section">
      <div class="pub-container pub-cta-inner">
        <h2>Start free. Upgrade when you need more.</h2>
        <p>No subscription required to begin. New accounts receive trial points
           to explore Muhurta timing, KP queries, and numerology.</p>
        <a href="#/login" class="pub-btn pub-btn--primary pub-btn--lg">
          Create Free Account →
        </a>
        <a href="#/pricing" class="pub-btn pub-btn--ghost">View Plans</a>
      </div>
    </section>
  `;

  wrapPublicPage("#/home", html);
}
