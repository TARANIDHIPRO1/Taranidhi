/**
 * Pricing Page — Tier comparison: Basic / Premium / Ultra
 *
 * ⚠️  PRICING VALUES — Naveen must confirm before launch:
 *    PREMIUM_PRICE_INR  = 499   (monthly)
 *    ULTRA_PRICE_INR    = 999   (monthly)
 * These are placeholders from market benchmarks. Update before going live.
 */

import { wrapPublicPage } from "./public-layout";

// ── Naveen: update these two values before launch ──────────────────────────
const PREMIUM_PRICE = "₹499";   // TODO: confirm
const ULTRA_PRICE   = "₹999";   // TODO: confirm
// ──────────────────────────────────────────────────────────────────────────

export function renderPublicPricing(): void {
  const html = `
    <section class="pub-section pub-pricing-hero">
      <div class="pub-container">
        <h1 class="pub-section-title">Simple, transparent pricing</h1>
        <p class="pub-section-sub">
          Start free with trial points. Top up your wallet when you need more.
          Upgrade for unlimited access — no expiry, no hidden charges.
        </p>
      </div>
    </section>

    <section class="pub-section">
      <div class="pub-container">
        <div class="pub-tiers">

          <!-- Basic -->
          <div class="pub-tier pub-tier--basic">
            <div class="pub-tier-badge">Basic</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">Free to start</span>
              <span class="pub-tier-price-sub">Top up as you go · ₹1 = 1 point</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Full KP birth chart (Kundali)</li>
              <li>✓ Muhurta timing — 1 point per query</li>
              <li>✓ KP sub-lord queries — 1 point per query</li>
              <li>✓ Numerology — 1 point per query</li>
              <li>✓ Free trial points on signup</li>
              <li>✓ Wallet top-up via Razorpay</li>
              <li class="pub-tier-no">✗ Unlimited queries</li>
              <li class="pub-tier-no">✗ Muhurta Scanner</li>
              <li class="pub-tier-no">✗ Professional PDF reports</li>
              <li class="pub-tier-no">✗ Referral bonuses</li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--outline pub-btn--full">
              Start Free
            </a>
          </div>

          <!-- Premium — highlighted -->
          <div class="pub-tier pub-tier--premium pub-tier--featured">
            <div class="pub-tier-popular">Most Popular</div>
            <div class="pub-tier-badge">Premium</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">${PREMIUM_PRICE}</span>
              <span class="pub-tier-price-sub">per month · billed monthly</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Basic</li>
              <li>✓ <strong>Unlimited</strong> Muhurta queries</li>
              <li>✓ <strong>Unlimited</strong> KP sub-lord queries</li>
              <li>✓ <strong>Unlimited</strong> Numerology</li>
              <li>✓ Muhurta Scanner (bulk window scan)</li>
              <li>✓ 8-layer Confidence Index</li>
              <li>✓ Property / Marriage / Business / Medical modes</li>
              <li>✓ Referral programme access</li>
              <li class="pub-tier-no">✗ B2B API access</li>
              <li class="pub-tier-no">✗ White-label reports</li>
            </ul>
            <a href="#/login" class="pub-btn pub-btn--primary pub-btn--full">
              Get Premium →
            </a>
          </div>

          <!-- Ultra -->
          <div class="pub-tier pub-tier--ultra">
            <div class="pub-tier-badge">Ultra</div>
            <div class="pub-tier-price">
              <span class="pub-tier-price-main">${ULTRA_PRICE}</span>
              <span class="pub-tier-price-sub">per month · billed monthly</span>
            </div>
            <ul class="pub-tier-features">
              <li>✓ Everything in Premium</li>
              <li>✓ B2B API access (hospital / corporate)</li>
              <li>✓ White-label PDF reports</li>
              <li>✓ Bulk Kundali import</li>
              <li>✓ Priority support (Naveen direct)</li>
              <li>✓ Custom event categories</li>
              <li>✓ Dasha timeline full export</li>
              <li>✓ Ashtakavarga full tables</li>
              <li>✓ Dedicated consultant onboarding</li>
              <li>✓ SLA: 99.9% accuracy commitment</li>
            </ul>
            <a href="#/contact" class="pub-btn pub-btn--outline pub-btn--full">
              Contact for Ultra
            </a>
          </div>

        </div><!-- /pub-tiers -->

        <!-- Wallet top-up table -->
        <div class="pub-wallet-table">
          <h3>Basic tier: wallet top-up options</h3>
          <p>Points never expire while your account is active.
             Each query costs 1 point (= ₹1).</p>
          <table class="pub-table">
            <thead>
              <tr><th>Top-up Amount</th><th>Points</th><th>Good For</th></tr>
            </thead>
            <tbody>
              <tr><td>₹100</td><td>100 pts</td><td>~100 Muhurta queries</td></tr>
              <tr><td>₹500</td><td>500 pts</td><td>~500 queries over 6 months</td></tr>
              <tr><td>₹1,000</td><td>1,000 pts</td><td>Full year of regular use</td></tr>
              <tr><td>₹5,000</td><td>5,000 pts</td><td>High-volume / family plan</td></tr>
            </tbody>
          </table>
        </div>

        <!-- FAQ -->
        <div class="pub-faq">
          <h3>Pricing FAQ</h3>
          <div class="pub-faq-item">
            <h4>Do trial points expire?</h4>
            <p>Trial points are valid for 30 days from signup. Purchased wallet
               points are valid indefinitely while your account is active.</p>
          </div>
          <div class="pub-faq-item">
            <h4>Can I switch tiers?</h4>
            <p>Yes. Upgrade or downgrade any time. Unused wallet points carry over
               to your new plan.</p>
          </div>
          <div class="pub-faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>All major UPI apps, debit cards, credit cards, and net banking via
               Razorpay. 100% secure — no card data stored by OccultViision.</p>
          </div>
          <div class="pub-faq-item">
            <h4>Is there a refund policy?</h4>
            <p>Unused wallet points can be refunded within 7 days of purchase.
               Contact Naveen directly at +91 96697 56111 for billing queries.</p>
          </div>
          <div class="pub-faq-item">
            <h4>What is the B2B / Ultra use case?</h4>
            <p>Hospitals scheduling surgical procedures, corporate firms timing
               major contracts, and consulting astrologers who need white-label
               reports for their own clients. Contact us for a custom quote.</p>
          </div>
        </div>

      </div>
    </section>
  `;

  wrapPublicPage("#/pricing", html);
}
