# OCCULTVIISION / TaraNidhi — Architecture & Business Rules
**Version 1 — derived from Session 5 planning conversation. This file is the single
source of truth. If a rule here conflicts with anything said elsewhere, this file wins
unless explicitly amended and re-committed.**

---

## 1. System Architecture (4 layers)

| Layer | Components |
|---|---|
| Client | PWA (web, launch-first, mobile+desktop responsive — mandatory, not optional). Native wrapper later (Android TWA, then iOS via Capacitor). |
| App/API | Cloudflare Workers — Auth, Subscription/Entitlement, Astrology-Engine, Report-Generator, Notification-Service, Payment-Service, Admin-API |
| Data | Cloudflare D1 (users/subscriptions/kundalis/query-logs/activations/device-fingerprints), KV (sessions/rate-limits/trial-tracking), R2 (reports/images) |
| External | SMS/OTP gateway, WhatsApp Business API (Interakt — default, unconfirmed), Email, Razorpay (payment) |

Design principle: modular + feature-flagged, not a monolith. A new feature = a new
independent module + a DB flag. Existing code must not need to change when a new
feature ships.

Distribution: **no Play Store dependency.** PWA link via WhatsApp/SMS/Email/QR code →
"Add to Home Screen." Avoids Play Store commission, review delay, and policy risk.
Android-first; iOS PWA support is weaker (Safari limitations) — cover iOS via native
wrapper later if needed.

Repo/hosting: private GitHub (source of truth for code) + Cloudflare (Workers/D1/KV/R2,
on the account owner's own Cloudflare account — not shared credentials with any
third party). Access control: least-privilege, scoped tokens per collaborator, never
shared master logins. See Section 9.

---

## 2. Query-Processing Pipeline (methodology)

1. User picks an activity from a category picker (not free-text in v1 — see Section 3).
2. **House-Activity Mapping Table** (`docs/HOUSE_ACTIVITY_MAPPING.md`) resolves the
   relevant house(s) for that activity.
3. User's natal chart is loaded from D1.
4. **Universal KP Engine** runs: house-cusp nakshatra -> sub-lord -> sub-lord's Navtara
   relation (reuses existing Navtara logic, applied to the sub-lord planet instead of
   just a nakshatra) -> current Mahadasha/Antardasha check -> Gochar (transit) check.
5. Verdict returned: Promised / Denied + confidence label.
6. In parallel, the existing Muhurta engine (Hora/Uphora/Tarabala/Chandrabala) computes
   a continuous general-favorability percentage for the same moment.
7. **The two outputs are shown as separate cards. They are never merged into one
   number.** No classical or KP source supports blending a discrete verdict system
   with a continuous weighted score — attempting to do so would be a bigger
   unsourced invention than anything else in this app. (Verified via web research,
   Session 5 — no source found that numerically blends KP Horary judgement into a
   general muhurta percentage.)
8. Query + result are logged to D1 for future analytics / admin panel.

**Key design correction (do not deviate from this):** 50,000 real-life questions do
NOT require 50,000 hand-written rules. They require one Universal Engine (step 4)
plus one taxonomy table (Section 3) that maps arbitrary activities down to a small
set of houses. Building the engine once, parameterized by house number, solves all
questions that map to that house.

---

## 3. Question Intake Design

- v1: **category-picker / dropdown**, not free-text NLP. A wrong house-match from
  ambiguous free text would silently produce a wrong verdict — too risky to ship first.
- Free-text search can be layered on top later as a convenience feature that still
  resolves down to the same canonical activity list.
- Some activities map to more than one house (e.g. "propose to partner" = 5th
  (romance) + 7th (partnership)). The mapping table must support multi-house entries.

---

## 4. Astrology Engine — Technical Decisions

| Decision | Status |
|---|---|
| Ayanamsa | **Lahiri = app-wide default** for everything (Hora, Tarabala, Lagna, Panchang, Navtara, Dasha, Chandrabala, Gochar for the main Muhurta engine). **Krishnamurti ayanamsa is scoped ONLY to the KP/Query-Window module** — it must never leak into or override the app-wide default. Implementation note: pass ayanamsa as an explicit parameter into every calculation function; never rely on a single global constant. |
| House system for KP | Placidus (confirmed KP-standard; Krishnamurti's own choice). Cusps are computable from RAMC + obliquity + latitude via iterative solve — same input tier as the existing Lagna formula, no full ephemeris needed for cusps alone. |
| Planetary longitudes | Needed for sub-lords of planets, significators, and gochar-for-KP. Requires a real ephemeris-grade library — `astronomy-engine` (JS, VSOP87-based, arcminute accuracy) recommended; this is a genuine new dependency, not previously part of the architecture. |
| Sub-lord table | 243 natal sub-divisions (9 per nakshatra, each proportional to Vimshottari dasha years). 249 is a different, narrower number: it refers to the horary-number table specifically (243 base entries + 6 that get split because they straddle a sign boundary). Do not conflate the two numbers in code or documentation. |
| Query Window (KP Horary) | **Same-day / current-moment only.** A KP Horary number (1-249) sets the Ascendant for the exact moment the question is asked. It is not classically valid for a past or future date — the UI must not offer a date-picker on this screen. |
| Date/Muhurta Scanner | A **separate module** from Query Window. Scans a date range (past 30 days, future up to 1 year) using the Hora/Navtara/Gochar election-style engine (continuous score, not a KP verdict) to find the best window in that range. |
| Karyesh-Bala (6th/8th/12th purpose-flip) | The core mechanism is confirmed correct: when the muhurta's purpose matches a normally-malefic house's domain (e.g. blood test/surgery -> 8th, litigation/service -> 6th, foreign travel/hospitalization -> 12th), the scoring for that house should flip from penalty to reward. **Unresolved:** which of 6th/8th/12th is most severe when the purpose does NOT match any of them. Two independent research passes gave contradictory answers (one ranked 8th worst, the other ranked 6th worst). Do not hard-code either ranking as "confirmed" — treat both houses as flagged/equal-weight until a primary classical source resolves it, or ask the domain owner for a judgment call. |
| Dasha weighting (Mahadasha/Antardasha/Gochar split) | The qualitative hierarchy is classical and well-documented: Dasha determines what is *promised*; transit (Gochar) can only trigger what the dasha framework already permits — a favorable transit cannot produce a result the dasha doesn't support. A specific numeric split (e.g. "30% / 50% / 20%") was proposed by the domain owner but could not be found in any researched source. If used, it must be labeled explicitly as an OccultVIISION proprietary weighting in code comments, not presented as a classical rule. |
| Panchaka Dosha | Nakshatra-window check (last 2 padas of Dhanishtha through Revati). Note the Monday exception: "Raj Panchak" is actually auspicious for government/property work — do not treat all 5 weekday variants as uniformly inauspicious. |
| Ganda Moola | Nakshatra-based check: Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati. Distinct from Panchaka (different 6 nakshatras, different rule). |
| Chandrabala | Rashi-count check: transiting Moon's rashi counted from natal Moon rashi. 1,2,3,5,7,9,10,11 = present (favorable); 4,6,8,12 = absent. 8th position ("Ashtama Chandra") is considered the worst. Exception noted in research: for women, marriage on one's own janma nakshatra is considered auspicious (context: establishing a new household) — flag this exception rather than silently overriding the general Tarabala rule. |
| Combustion (Ast) | Requires real planetary longitudes relative to the Sun (same ephemeris dependency as sub-lords). Orbs vary by planet and by direct/retrograde state (e.g. Venus 10 deg direct / 8 deg retrograde). Classically prohibits Venus/Jupiter-ruled sanskaras (marriage, upanayan, etc.) when either planet is combust. Not yet implemented; blocked on the same ephemeris dependency as the KP module — consider building both together rather than twice. |
| Dishashool | Weekday-based travel-direction table. Low effort, no ephemeris dependency, not yet on the build schedule but cheap to add. |
| Pancha Pakshi | Explicitly **out of scope** for now — a full separate subsystem (birth bird + 5-yama activity engine + friend/enemy matrix), not a small addition. Do not build without an explicit decision to add it as its own project phase. |

---

## 5. Business Model — Tiers

| | Basic | Premium | Ultra |
|---|---|---|---|
| General lookups (Hora/Panchang/etc.) | Pay-per-use, 1 point/query | Unlimited (subscription) | Unlimited |
| KP Query Window | Pay-per-use, 1 point/query — **allowed for everyone**, not tier-locked | Unlimited/included | Unlimited/included |
| Date/Muhurta Scanner (30d past / 1yr future) | **Not available** | Included | Included |
| Multi-kundali | 1 | 3 | Unlimited |
| Numerology suite | No | Yes | Yes |
| Matchmaking / business-partner matching / one-time life-event muhurtas (marriage, griha-pravesh, vehicle) / business astrology | No | No | Yes |

Pricing (draft placeholders — not finalized, do not treat as locked):
- Basic: Rs 199/month -> 200 points, Rs 1999/year -> 2000 points.
- Premium/Ultra numbers not yet fixed.

---

## 6. Wallet / Points System

- **Free trial:** 25 points granted on first signup. Valid for 3 days only, then
  expires. No refund on unused trial points.
- **Subscription package points:** do NOT expire at the end of the billing cycle
  (this reverses an earlier draft decision — confirmed final). Instead, **each
  point-batch has its own maximum validity of 1 year from its grant date.**
- Consequence for implementation: this is **not** a single balance integer. It must
  be a **FIFO ledger of batches**, each with its own source, grant date, and expiry
  date. A simple `wallet_balance` column on the users table is insufficient and will
  need to be replaced/supplemented with a ledger table — build the ledger from the
  start rather than retrofitting it. See `db/schema.sql`.
- **Payment unification:** every chargeable action (new-ID activation, renewal,
  top-up) creates an `orders` row first. It can be funded by Razorpay (gateway rail),
  by wallet-ledger debit (internal rail), or a **split of both** in one order. The
  activation/entitlement logic checks only "is this order fully paid" — it must never
  branch on which rail funded it.
- **Concurrency requirement:** wallet debits must happen inside a single atomic
  transaction (row lock or serializable isolation). A "check balance, then deduct"
  pattern implemented as two separate steps is a known double-spend vulnerability
  (see Section 8) and must not be used.

---

## 7. Referral System — Final Locked Rules

- **Single-level only.** A referrer earns commission on their direct referral's
  purchase. The referred person's own future referrals earn nothing for the original
  referrer — no chain, no downline, no multi-level structure of any kind.
- **Commission trigger:** the referred person's actual paid recharge/subscription
  purchase — never mere signup or enrollment. This is the specific test (per the
  Amway v. Union of India precedent under the Prize Chits and Money Circulation
  Schemes (Banning) Act, 1978) that keeps this outside the legal definition of an
  illegal "money circulation scheme": *payment for genuine product sales is legal;
  payment for the act of enrolling a new member is not.*
- **Commission is always in-app points. Never cash. Never directly transferable
  to another person or account.**
- **Exactly two permitted uses of commission points (final, no other option):**
  1. Personal consumption — any query, any report (astrology, numerology, and any
     future feature), anywhere in the platform.
  2. New-ID activation — activating a new account, either for the referrer's own
     second account or for a different real person.
- **Explicitly prohibited:** transferring points to any other person or account,
  and using points to recharge/top-up an account that already exists and belongs
  to someone else.
- **No entry fee** is required to become eligible to refer — anyone can generate a
  referral link/code for free. (This is the second condition of the legal test above.)
- **Chargeback protection:** commission should not be immediately spendable. A
  holding period (proposed default: 15 days) should elapse before a commission
  batch becomes usable, so that a chargeback/dispute on the triggering payment can
  claw the commission back before it's spent. Exact number of days is a business
  decision, not yet finally confirmed.

**The two lines that must never be crossed to stay in the legal safe zone:**
1. Never introduce a second commission tier (referrer-of-a-referrer).
2. Never require a purchase to become eligible to refer.

Separate, smaller open item: non-cash commission points may still have income-tax
implications (Section 194H commission/TDS) once volumes are meaningful — flagged for
CA consultation, not resolved in this document.

---

## 8. Anti-Abuse Design

| Risk | Mitigation |
|---|---|
| Free-trial cycling (multiple phone numbers / devices) | Phone number (OTP-verified) + device fingerprint, combined, required for a fresh trial. Card/UPI micro-verification considered but not adopted for v1 — revisit if abuse data justifies the added signup friction. |
| Referral + chargeback fraud | Commission holding period (Section 7) before spendable; automatic clawback if the triggering payment is refunded/disputed within the holding window. |
| Wallet double-spend (race condition) | All wallet debits in one atomic DB transaction with row-level locking or serializable isolation. Never a separate "read balance" step followed by a separate "write deduction" step. |
| Card testing / carding | Velocity limiting on repeated small transactions from the same card or account. |
| API scraping to reverse-engineer the proprietary scoring formula | Per-account and per-IP rate limiting; CAPTCHA triggered past a velocity threshold. The scoring logic itself should never be exposed to the client — all scoring happens server-side in Workers, the client only receives the final result. |
| Referral-code hijacking / attribution theft | Referral codes must be cryptographically random, not sequential/guessable. Attribution locked on first touch, not last click. |
| Deactivate-and-rejoin trial abuse | Phone number and device fingerprint remain permanently blacklisted for trial eligibility even after account deletion. |
| Point-batch expiry manipulation | Batches are immutable once granted; no user action (login, small top-up) may reset or extend an existing batch's expiry clock. |

---

## 9. Access Control (for any external tech team / collaborators)

Principle: least privilege. No one besides the account owner ever holds a master
credential for GitHub, Cloudflare, or the payment gateway.

- **GitHub:** collaborators get "Write" access to the repo, never "Admin." Owner
  retains sole Admin/Owner role.
- **Cloudflare:** collaborators get scoped API tokens (e.g. "deploy this one Worker,"
  "read this one D1 database") rather than the account login. Cloudflare supports
  fine-grained token permissions natively.
- **Razorpay:** use Razorpay's own team-member roles; never share the account owner's
  login. No collaborator needs full dashboard access for day-to-day development.
- **Production database access:** minimize to only the people who genuinely need it,
  read-only where possible. This also matters for DPDP Act 2023 compliance, since
  the database holds personal data (phone numbers, birth details, payment history).
- **Environment separation:** a development/staging environment with test data,
  separate from production. Day-to-day development happens in dev; changes are
  reviewed before deploying to prod.
- **Offboarding:** access revocation for any departing collaborator should happen
  same-day, per-service (not "change everyone's password").

---

## 10. Explicitly Dropped Features (legal risk — do not reintroduce without re-litigating the legal analysis)

| Feature | Reason dropped |
|---|---|
| Betting / cricket-gambling group targeting, including fantasy-sports "best time to bet" framing | Real-money betting is illegal in most Indian states; fantasy sports carries adjacent risk; Razorpay's own merchant policy restricts the gambling category outright, risking the entire platform's payment processing. |
| Stock-specific investment advice ("buy X," specific entry/exit timing) | SEBI (Investment Advisers) Regulations, 2013. Multiple 2023-2025 enforcement actions for exactly this pattern (e.g. Avadhut Sathe Trading Academy, Rs 546 crore recovery order; Sharepati.com, barred + fined). |

**Not dropped, but on hold pending an explicit decision to reinstate:** a
non-security-specific "general financial risk-taking temperament today" feature,
modeled on how medical astrology gives general house-strength guidance without
diagnosing or prescribing. This framing is understood to be legally safer than the
dropped version, but has not been explicitly approved for build yet.

---

## 11. Deployment

- **GitHub:** private repo (this repo) is the source of truth for all application
  code. `docs/` in this repo is the source of truth for architecture and business
  rules — code should not silently diverge from what's written here.
- **Cloudflare:** Workers (API), D1 (database), KV (sessions/rate-limits), R2
  (file storage), Pages (frontend hosting) — all on the project owner's own
  Cloudflare account.
- **Migration note:** the current production artifact is a single-file HTML PWA
  with no backend, no database, and no multi-user support. This repo is a **new
  build** that reuses the existing calculation logic (Hora/Uphora/Navtara/Tarabala
  formulas) but is not an incremental upgrade of the artifact file itself.

---

## 12. Open Decisions (not yet finally settled)

1. Final Rs pricing for Premium and Ultra tiers.
2. Whether to reinstate the general (non-security-specific) financial-timing feature.
3. Karyesh-Bala 6th/8th/12th severity ranking when purpose doesn't match any of them.
4. WhatsApp provider final contract (Interakt assumed default, not signed).
5. Exact chargeback holding-period length for referral commissions (15 days assumed
   default).
6. Whether card/UPI micro-verification should be added to the trial-abuse defenses
   later.

Do not resolve these silently in code. Flag back to the project owner when a build
step depends on one of them.
