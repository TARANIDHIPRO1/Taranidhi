# OCCULTVIISION KAALCHAKRA PRO — ADDITIONAL CLARIFICATIONS QUESTIONNAIRE

**From:** Claude (Development Team)  
**To:** Naveen K. Rai  
**Purpose:** Technical specifications needed BEFORE Week 1 coding starts  
**Status:** Non-blocking but Important (answers help finalize architecture)

---

## SECTION 1: BACKEND INFRASTRUCTURE

### Q1.1: Database Choice
**Question:** Which database for v6 MVP?

```
[ ] SQLite (fast prototyping, single-file, no server needed)
    — Pros: Zero setup, file-based, works offline
    — Cons: Not suitable for multi-user concurrent access
    
[ ] MySQL (traditional, reliable, proven with panchang data)
    — Pros: Robust, good for 400-event taxonomy, widely hosted
    — Cons: Needs server, more setup
    
[ ] PostgreSQL (modern, JSON support for Ashtakavarga arrays)
    — Pros: Advanced features, better for complex types
    — Cons: Heavier resource overhead
```

**Your choice:** _______________________

---

### Q1.2: API Framework
**Question:** Which backend framework for `/kundali`, `/muhurta`, `/events` endpoints?

```
[ ] Express.js (Node.js, fast prototyping, JavaScript ecosystem)
    — Pros: Matches frontend (if React), fastest iteration
    — Cons: Single-threaded (may need clustering for 1000s users)
    
[ ] FastAPI (Python, async, auto-documentation)
    — Pros: Python easier for data scientist team, async scaling
    — Cons: Different language from current astro.ts (which is TypeScript)
    
[ ] Go (compiled, extremely fast, production-grade)
    — Pros: Fastest execution, best concurrency, low memory
    — Cons: Needs Go expertise, slower development cycle
```

**Your choice:** _______________________

---

### Q1.3: Deployment Target (v6 MVP)
**Question:** Where should v6 MVP be hosted?

```
[ ] Heroku (simple, free tier available, good for MVP)
    — Pros: One-click deploy, easy scaling, built-in monitoring
    — Cons: Slower than bare metal, costs scale quickly
    
[ ] AWS (EC2 + RDS, production-grade, scalable)
    — Pros: Unlimited scaling, industry standard, cheap on low usage
    — Cons: Complex setup, IAM/security requires expertise
    
[ ] DigitalOcean (App Platform, middle ground between Heroku and AWS)
    — Pros: Simple like Heroku, cheaper, good documentation
    — Cons: Less mature than AWS, fewer features
    
[ ] Self-hosted (VPS like Linode/Vultr + Docker)
    — Pros: Full control, cheaper at scale, OCCULTVIISION IP on your server
    — Cons: You manage infra, monitoring, backups, security
```

**Your choice:** _______________________

---

## SECTION 2: FRONTEND STACK CONFIRMATION

### Q2.1: Frontend Framework (Already Assumed React, Confirming)
**Question:** Confirm React for v6 frontend?

```
[ ] Yes, React (assumed in research docs, modern, component-based)
    — Viability: High (matches backend, good for real-time Muhurta Dashboard)
    
[ ] No, use Vue.js (lighter, more opinionated, easier learning curve)
    — Viability: High (also modern, different ecosystem)
    
[ ] No, use Vanilla JS (no build tools, faster for simple app)
    — Viability: Medium (doable but harder for 3 screens + real-time updates)
```

**Your choice:** _______________________

---

### Q2.2: UI Component Library
**Question:** Which component library for Birth Chart, Dashboard, Event Selector?

```
[ ] shadcn/ui (Tailwind + Radix, headless, beautiful)
    — Pros: Customizable, modern, great for financial dashboards
    — Cons: Needs Tailwind CSS setup
    
[ ] Material-UI (MUI, comprehensive, Google Material Design)
    — Pros: Complete out-of-box, great docs, professional look
    — Cons: Heavier, less customizable, "looks like Material"
    
[ ] Ant Design (enterprise-grade, huge component library)
    — Pros: Excellent for complex UIs (like 400-event tables)
    — Cons: Heavy, overkill for 3-screen MVP
    
[ ] Tailwind only (utility-first, minimal, build your own)
    — Pros: Lightest, most customizable, modern workflow
    — Cons: More CSS to write, need good designer
```

**Your choice:** _______________________

---

### Q2.3: State Management
**Question:** How to manage real-time Muhurta Dashboard updates?

```
[ ] React Context API (built-in, no dependencies)
    — Pros: Sufficient for 3 screens, no new library to learn
    — Cons: Can get complex if data flows grow
    
[ ] Redux (predictable state, time-travel debugging)
    — Pros: Professional, scales well, good for complex apps
    — Cons: Verbose, overkill for MVP
    
[ ] Zustand (modern, simple, minimal boilerplate)
    — Pros: Best of both worlds, easy learning curve
    — Cons: Newer, smaller community than Redux
```

**Your choice:** _______________________

---

## SECTION 3: CLIENT INTEGRATION & SLAs

### Q3.1: Hospital B2B Integration (Reference: Early Section of Research)
**Question:** What's the hospital B2B's expected accuracy SLA for muhurta timing?

```
[ ] ±5 minutes acceptable (standard astrology, good enough for daily scheduling)
    — Implication: Topocentric Moon parallax correction is "nice-to-have"
    
[ ] ±2 minutes required (precise, matches onlinejyotish.com accuracy)
    — Implication: Must implement full topocentric + New KP Ayanamsha
    
[ ] ±30 seconds required (ultra-precise, for specific rituals)
    — Implication: Must implement SSL (sub-sub-lord) nano-timing (8-88 seconds)
```

**Your choice:** _______________________

**Explanation:** This determines if astro.ts calculation is "good enough" or needs enhancement.

---

### Q3.2: Concurrent User Load (v6 MVP)
**Question:** How many concurrent users should v6 handle?

```
[ ] < 50 concurrent users (initial pilot, friends/family test)
    — Implication: Cheap hosting (Heroku hobby tier), no caching needed
    
[ ] 50-500 concurrent users (hospital B2B + early customers)
    — Implication: Need caching layer (Redis), monitor performance
    
[ ] 500-5000 concurrent users (regional launch, heavy usage)
    — Implication: AWS auto-scaling, CDN for frontend, DB optimization
```

**Your choice:** _______________________

---

### Q3.3: Hospital B2B Testing Phase
**Question:** Will hospital B2B test on staging first or production immediately?

```
[ ] Staging first (1-2 week validation, then production)
    — Implication: Need separate DB, staging domain (staging.occultviision.com)
    
[ ] Production immediately (high confidence, direct go-live)
    — Implication: Backup strategy critical, zero downtime deployment required
```

**Your choice:** _______________________

---

## SECTION 4: FORMULA DETAILS & EDGE CASES

### Q4.1: Tara Calculation Precision
**Question:** When calculating Tara (9-fold star match), should I use:

```
[ ] Exact nakshatra degrees from topocentric Moon
    — Pros: Most accurate, matches advanced astrologers
    — Cons: Small rounding difference can flip result (e.g., Sampat ↔ Vipat)
    
[ ] Rounded to nearest nakshatra (ignore degrees within nakshaatra)
    — Pros: Simpler, more forgiving, matches basic calculators
    — Cons: May miss actual micro-variations
```

**Your choice:** _______________________

---

### Q4.2: House System Failover (Polar Regions)
**Question:** For users in polar regions (|latitude| ≥ 60°N), when Placidus fails:

```
[ ] Use Porphyry (as documented in research)
    — Verified in: COMPLETE_DEEP_EXTRACTION_FILES_1-16.md, Section 4.3
    
[ ] Use Koch system (alternative failover)
    — Less documented, but some astrologers prefer it
    
[ ] Use Equal House (simplest fallback)
    — Least accurate, but mathematically guaranteed to work
```

**Your choice:** _______________________

---

### Q4.3: MPI Weights Finality
**Question:** Are these MPI weights final or tunable for v6.1?

```
Current weights (from File 11):
  KP_CSL: 0.30
  KP_SSL: 0.15
  Uphora: 0.15
  Panchang: 0.15
  Tara: 0.10
  SAV: 0.08
  Digbala: 0.07

[ ] FINAL (hard-code these, no experiments in v6)
    — Implication: I code these as constants
    
[ ] TUNABLE (make them config parameters for A/B testing)
    — Implication: I add weights to config file, can adjust without code change
    — Cost: +2 hours backend setup, +1 hour testing
```

**Your choice:** _______________________

---

## SECTION 5: TESTING & REFERENCE DATA

### Q5.1: Reference Data for Testing
**Question:** Which birth charts should I use for validation testing?

```
[ ] Naveen's chart only (08/04/1973, 11:45 AM, Bhopal)
    — Pros: Founder validation, known reference
    — Cons: Only 1 data point, may miss edge cases
    
[ ] Naveen's chart + 10 sample charts (varied latitudes, birth times)
    — Pros: Better edge-case coverage, geographic diversity
    — Cons: Need to source/verify 10 additional charts
    
[ ] Naveen's chart + Property case chart (Oct 16, 2026, Bhopal)
    — Pros: Tests real event (property deed), matches research
    — Cons: Only 2 data points
```

**Your choice:** _______________________

---

### Q5.2: Property Case (Oct 16, 2026)
**Question:** Is the property deed case real or hypothetical?

```
[ ] REAL (actual property deed happening Oct 16, will test live)
    — Implication: I validate predictions against actual outcome
    
[ ] HYPOTHETICAL (test case only, won't test against reality)
    — Implication: I validate internal logic, not real-world accuracy
```

**Your choice:** _______________________

---

### Q5.3: Hospital B2B Test Events
**Question:** Does hospital B2B have specific events they want tested in v6?

```
Your answer: _________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Examples (if applicable):
- "Surgery scheduling for 50 patients in Oct-Nov 2026"
- "Fertility treatment timings for 20 couples"
- "Staff hiring for new department"
```

---

## SECTION 6: SCOPE & TIMELINE CONFIRMATIONS

### Q6.1: SMS Gateway & Payment (v6 or v6.1?)
**Question:** Should v6 MVP include SMS/Payment or defer to v6.1?

```
[ ] v6 MUST include SMS (OTP for user registration)
    — Implication: Need Twilio/AWS SNS setup, Week 1 time overhead
    
[ ] v6.1 will add SMS (skip in MVP)
    — Implication: Use email-based registration for v6, migrate in v6.1
    
[ ] v6 MUST include Razorpay (payments for premium features)
    — Implication: Payment flow, licensing logic, Week 2-3 overhead
    
[ ] v6.1 will add Razorpay (skip in MVP)
    — Implication: Free tier only for v6, paid features in v6.1
```

**Your choices:**
- SMS: ___________________
- Razorpay: ___________________

---

### Q6.2: Multilingual Support (v6 or v6.1?)
**Question:** Should v6 be bilingual (Hindi + English) or English-only MVP?

```
[ ] v6 MUST be bilingual (research mentions "bilingual deliverables")
    — Implication: i18n setup (react-i18next), +3-4 hours, all 3 screens translated
    
[ ] v6 English-only, bilingual in v6.1
    — Implication: Faster MVP, non-Hindi users can still use, bilingual later
```

**Your choice:** _______________________

---

### Q6.3: Admin Dashboard (v6 or v6.1?)
**Question:** Should v6 include admin panel for event/dosha management?

```
[ ] v6 includes admin (can edit 400 events, configure doshas)
    — Implication: +10-15 hours development, Week 3-4 compression
    
[ ] v6.1 adds admin (v6 has hardcoded 400 events only)
    — Implication: Faster v6 MVP, admin panel later
```

**Your choice:** _______________________

---

## SUBMISSION

**Once you've answered all clarification questions, return this doc to Claude.**

**These answers will:**
1. Finalize backend architecture (database, framework, deployment)
2. Confirm frontend tech stack (React version, UI lib, state mgmt)
3. Set SLA expectations (timing accuracy, user load)
4. Resolve formula edge cases (Tara precision, house system failover)
5. Define testing scope (reference data, real events)
6. Lock scope boundaries (v6 vs v6.1 features)

**After you submit both questionnaires (3 blocking decisions + these clarifications):**
- Week 1 architecture finalized
- Jira tickets created with exact time estimates
- Backend coding begins immediately
- Frontend wireframes designed and approved

---

**Return with answers filled in.**

