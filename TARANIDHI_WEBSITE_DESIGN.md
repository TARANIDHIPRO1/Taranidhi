# TaraNidhi Website — Design & Content Package

**Status:** v1 draft, built while API deployment/testing was on pause.
**Live prototype:** published as an artifact (see chat) — built from `frontend/dist` brand colors already in the PWA (`--color-primary: #5b21b6` etc. — confirm this matches, I approximated).

---

## 1. Site Map

```
/ (Home)
  - Hero + CTA
  - What is TaraNidhi (6 feature cards)
  - How It Works (3 steps)
  - Why OCCULTVIISION (credibility)
  - Pricing (3 tiers)
  - Testimonials
  - Final CTA
  - Footer

/about        -- Naveen's background, OCCULTVIISION story, philosophy
/features     -- Deep-dive per feature (Scanner, KP, Numerology, Wallet, Referral)
/pricing      -- Same as home pricing section, standalone for direct linking
/blog         -- Future: SEO content (muhurta guides, numerology explainers)
/contact      -- Sign-up form, WhatsApp CTA, email capture
```

---

## 2. RED-TEAM NOTES (things I'm flagging, not glossing over)

1. **Pricing numbers are invented.** ₹299 / ₹999 / Custom are placeholders I picked to look plausible — I have no real cost basis, competitor pricing, or margin analysis behind them. Don't ship these without a real pricing decision from you.
2. **Testimonials are fabricated placeholder names/quotes** ("Priya & Raj, Bangalore" etc.). These are NOT real — replace before this goes anywhere public. Publishing fake testimonials as if real is a legal/trust risk, not just a design gap.
3. **"Trusted by thousands"** — no evidence for this claim in what I have access to. Either get a real number or cut the line.
4. **No astrology disclaimer.** A site making claims about auspicious timing for weddings/business/health should carry a disclaimer (entertainment/guidance purposes, not a substitute for professional/medical/legal decisions) — I did not add one, and I think you need one given India's evolving stance on astrology-service advertising claims.
5. This is a **marketing site**, separate from the PWA app (which is what's actually deployed at occultviision-api.occultviision.workers.dev). They are not yet linked — the site's "Start Free Trial" button currently just scrolls down; it does not connect to the real signup/auth flow.

---

## 3. Brand Voice / Copy Principles

- Confident, not mystical-vague. Say what the product *does* (scans dates, scores compatibility) before invoking tradition.
- Lead with the practical use case (wedding date, business launch) — not the underlying system name (KP, Ashtakavarga) — in headlines. System names belong in the "Why OCCULTVIISION" credibility section for people who already know to look for them.
- No absolute guarantees ("this WILL bring success") — score/probability framing only, consistent with how the app itself works (percentage scores, not promises).

---

## 4. Visual System

| Token | Value | Use |
|---|---|---|
| Primary | `#5b21b6` (deep violet) | Headlines, primary buttons, links |
| Secondary | `#ec4899` (pink) | Gradient accent, hover states |
| Accent | `#f59e0b` (amber) | Stars/ratings, highlights |
| Text | `#111827` | Body copy |
| Text muted | `#6b7280` | Secondary copy |
| Background | `#f9fafb` | Alternating section backgrounds |

Typography: system font stack (fast load, no web font dependency for v1).

---

## 5. Next Steps (your calls, not mine to assume)

1. Confirm or replace the pricing tiers with real numbers.
2. Provide real testimonials (or explicitly approve launching without any, rather than fake ones).
3. Decide on a disclaimer wording — I can draft options if you want, but the legal register needs your sign-off, not mine.
4. Decide whether "Start Free Trial" should link to the actual TaraNidhi PWA (occultviision-api.occultviision.workers.dev) once that's stable, or to a waitlist form first.
5. Domain: this can be deployed at www.occultviision.com root, with the PWA app living at a subpath (e.g. /app) or subdomain (app.occultviision.com) — worth deciding now rather than after both are live, since it affects routing.
