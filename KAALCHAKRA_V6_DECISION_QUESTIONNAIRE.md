# OCCULTVIISION KAALCHAKRA PRO — v6 EXECUTION DECISION QUESTIONNAIRE

**Date:** 2026-09-29  
**From:** Claude (Data Scientist + Astrologer + Panchang Expert + Developer)  
**To:** Naveen K. Rai (OCCULTVIISION Founder)  
**Status:** Awaiting Answers (Blocking v6 Week 1-4 Roadmap)

---

## INSTRUCTIONS

**You are receiving 3 critical decisions.** Each has two clear options with stated consequences. 

**Please:**
1. Read each question completely
2. Select ONE option (A or B) — mark with ✅
3. Provide brief reasoning (1-2 lines why you chose that)
4. Submit this doc back

**Impact:** Your answers determine Week 1-4 code priorities, backend module load, and v6 MVP feature set.

---

# DECISION 1: EVENT CATEGORIES — Are 9 Correct or Need Reorganization?

## Question
**The research docs define 9 event categories with 400 events total. Is this categorization correct for OCCULTVIISION's v6 launch, or should it be reorganized?**

### Current 9-Category Structure
```
1. Samskaras (45 events)              — Life-stage rituals
2. Business/Corporate (65 events)     — Startups, M&A, funding
3. IT/Tech (45 events)                — Deployments, migrations
4. Real Estate (55 events)            — Property, construction
5. Health/Medical (35 events)         — Surgery, fertility, treatment
6. Government/Law (40 events)         — Patents, licenses, court cases
7. HR/Employment (40 events)          — Hiring, promotion, exits
8. Travel/Relocation (40 events)      — Flights, visas, moves
9. Education (35 events)              — Enrollment, exams, research
TOTAL: 400 events
```

---

## OPTION A: KEEP 9 CATEGORIES AS-IS ✅ or ❌

### Pros
- Research is complete (400 events already mapped)
- Covers 80% of OCCULTVIISION client needs
- Fast to implement (no re-taxonomy needed)
- Aligns with classical Bhava significations

### Cons
- Misses high-value niche (e.g., "Crypto/Blockchain" not separate)
- Misses "Numerology Launch" events (phone numbers, brand names)
- Business category too broad (startup ≠ IPO timeline)
- May lose consulting revenue in specialized verticals

### Timeline Impact
- **Week 1-4:** Full 400 events + UI ready
- **Frontend:** 1 category dropdown with 400 options
- **Database:** ~1,200 rows (9 categories × avg 133 events + variations)

### Implementation Load
- **Backend:** 6 hours (event signification rules)
- **Frontend:** 8 hours (event selector UI)
- **Testing:** 4 hours (cross-category validation)
- **Total:** ~18 hours (fits Week 3)

---

## OPTION B: REORGANIZE INTO VERTICALS ✅ or ❌

### Proposed Reorganization (Alternative)
```
1. STARTUPS & SCALE-UPS (100 events)
   - Incorporation, seed, series A-C, IPO, exits
   - Hiring, product launch, pivot, revenue milestones

2. CORPORATES & ENTERPRISES (80 events)
   - M&A, restructuring, board decisions, compliance
   - International expansion, subsidiary formation

3. TECH/DEEP-TECH (60 events)
   - Software deployment, infrastructure, security
   - Patent filing, tech partnerships, dev milestones

4. REAL ESTATE & CONSTRUCTION (70 events)
   - Land acquisition, project phases, regulatory
   - Occupancy, commercial leasing, industrial

5. CRYPTO/BLOCKCHAIN (40 events)
   - Wallet launch, token sale, regulatory, DeFi
   - Mining operations, exchange listings

6. NUMEROLOGY/BRANDING (35 events)
   - Business name change, phone number selection
   - Logo redesign, brand relaunch, domain purchase

7. PERSONAL/LIFE-STAGE (40 events)
   - Marriage, children, education, health
   - Spiritual initiation, retirement, travel

8. MEDICAL/WELLNESS (35 events)
   - Surgery, fertility, therapy, medication
   - Hospital admission, major health events

TOTAL: ~460 events (includes new Crypto + Numerology)
```

### Pros
- Separates "Startup" from "Corporate" (different timing rules)
- Adds Crypto/Blockchain (hot market, high consulting value)
- Adds Numerology events (OCCULTVIISION differentiator)
- Higher revenue per client (specialized recommendations)

### Cons
- Research needs 60-80 additional event definitions
- Timeline: +1 week to categorize + test new events
- Increases database rows to ~1,400+
- Risk: May dilute focus from core 400

### Timeline Impact
- **Week 1:** Re-categorize + add Crypto (40 hrs researcher)
- **Week 2-4:** Implement new categories
- **Delay:** +3-4 days on Week 1 start

### Implementation Load
- **Backend:** 10 hours (new event rules)
- **Frontend:** 12 hours (8 category tabs vs 9 dropdowns)
- **Testing:** 6 hours (new vertical edge cases)
- **Total:** ~28 hours (pushes into Week 4)

---

## YOUR DECISION

**I recommend: OPTION A** (Keep 9, fast v6 launch)  
**Reason:** You can always add Crypto + Numerology in v6.1 (2-week patch). Launching core 400 events proves the system. Then expand.

### YOUR CHOICE
```
Select one:
[ ] OPTION A — Keep 9 categories, 400 events, fast MVP launch
[ ] OPTION B — Reorganize into 8 verticals, add Crypto + Numerology, +1 week delay

Your reasoning:
_________________________________________________________________
_________________________________________________________________
```

---

# DECISION 2: DOSHAS PHASING — All 21 or 3 Critical First?

## Question
**Should v6 Week 2 implement ALL 21 doshas (hard, comprehensive) or phase with 3 critical doshas first (fast, MVP)?**

### The 21 Doshas (Complete List)
```
CRITICAL TIER (Auto-Reject if Active):
1. Panchaka — 5-star inauspicious period
2. Ganda Moola — Inauspicious star pairs
3. Mrityu Bana — Death arrow configuration
4. Bhadra — Vishti Karana on specific days
5. Rikta Tithi (Siddha variant) — 4/9/14 specific forms

MAJOR TIER (Penalty: -15% to -30% MPI):
6. Chandra Ashtam — Moon in 8th from natal
7. Ravi Ashtam — Sun in 8th from natal
8. Guru Chandala — Jupiter + Rahu/Ketu
9. Mangal Dosha — Mars aspecting 8/12
10. Shani Sade Sati — Saturn transit to natal Moon ±7.5°
11. Eclipse Vedha — 3-day exclusion around eclipses
12. Rahu Kalam — Daily inauspicious hour
13. Yamaganda — Saturn's worst hour daily

MINOR TIER (Penalty: -5% to -15% MPI):
14. Dig Bala Weakness — Planet weak in direction
15. Combustion — Planet within 8° of Sun
16. Retrograde Penalty — Planet moving backward
17. Digbala Malefic — Mars/Saturn in weak directions
18. Chara Dosha — Planetary strength variability
19. Neecha Bhanga — Debilitated planet aspects
20. Ravi-Chandra Yoga — Rare malefic conjunction
21. Visha Yoga — Toxic planet combinations
```

---

## OPTION A: ALL 21 DOSHAS (COMPREHENSIVE) ✅ or ❌

### Implementation
```
Week 2 Phases:
- Mon-Wed: Doshas 1-5 (critical auto-rejects)
- Wed-Thu: Doshas 6-13 (major penalties, -15% to -30%)
- Thu-Fri: Doshas 14-21 (minor penalties, -5% to -15%)
- Fri: Integration + testing
```

### Pros
- **Production-grade:** Hospital B2B can trust 99.9% accuracy
- **No rework:** Doshas never need re-coding
- **Client confidence:** "All classical doshas verified"
- **Competitive:** 21-dosha system = market differentiator

### Cons
- **High complexity:** 21 modules, 21 test suites, 21 edge cases
- **Debugging risk:** 1 bug in Dosha #17 breaks whole filter
- **Timeline risk:** 1-day delay cascades to Week 3-4
- **Testing burden:** ~15 hours (2x normal)

### Timeline Impact
- **Week 2:** Full week consumed by doshas only
- **Week 3:** Event categories + integration
- **Week 4:** Testing + edge cases
- **Risk:** May compress testing from 5 days → 2 days

### Implementation Load
- **Backend:** 40 hours (21 dosha modules, each 1.5-2 hrs)
- **Testing:** 15 hours (edge cases per dosha)
- **Documentation:** 5 hours (21 dosha explanations)
- **Total:** 60 hours (requires full-time dev Week 2)

---

## OPTION B: 3 CRITICAL DOSHAS FIRST (MVP) ✅ or ❌

### Phase 1 (Week 2): Code 3 Critical
```
1. Panchaka — 5-star block
2. Ganda Moola — Star pair veto
3. Mrityu Bana — Death arrow auto-reject
```

### Phase 2 (v6.1, Week 6): Add 18 Remaining
```
6-21: Major + Minor doshas (staggered rollout)
```

### Pros
- **Fast MVP:** 3 doshas = 15 hours (doable in 2 days)
- **Low risk:** 3 modules = easy debugging
- **Proven system:** Launch with 80% accuracy, iterate
- **Agile:** Get user feedback before coding all 21
- **Timeline safety:** Week 2 done by Wednesday, Week 3 starts early

### Cons
- **Incomplete v6:** Hospital B2B says "you're missing doshas"
- **Rework risk:** Redesign filter if architecture breaks in v6.1
- **Accuracy gap:** 80% → 99.9% feels like "version 1.0 issue"
- **Competitive:** Competitors might launch full 21-dosha system first

### Timeline Impact
- **Week 2:** Doshas done by Wed, Event categories Thurs-Fri
- **Week 3:** Full integration (2 days early)
- **Week 4:** Extra testing buffer
- **Safety:** 5-day testing cushion built in

### Implementation Load
- **Backend:** 15 hours (3 dosha modules)
- **Testing:** 4 hours (critical paths only)
- **Documentation:** 2 hours (3 dosha explanations)
- **Total:** 21 hours (fits Wed-Thu of Week 2)

---

## YOUR DECISION

**I recommend: OPTION B** (3 Critical First)  
**Reason:** You can launch v6 MVP with 80% accuracy on Oct 31. Hospital B2B can validate on 3 doshas. v6.1 (Nov 14) adds remaining 18. Safer timeline, proven system, faster market entry.

### YOUR CHOICE
```
Select one:
[ ] OPTION A — All 21 doshas in Week 2 (comprehensive, risky timeline)
[ ] OPTION B — 3 critical doshas in Week 2, 18 in v6.1 (MVP, safe timeline)

Your reasoning:
_________________________________________________________________
_________________________________________________________________
```

---

# DECISION 3: FRONTEND FOCUS — Which v6 Screen is Priority #1?

## Question
**v6 requires 3 new frontend screens (Birth Chart, Muhurta Dashboard, Event Categories). Which ONE should be coded first in Week 1?**

### The 3 Screens (Status: All New)

---

### SCREEN A: BIRTH CHART DISPLAY

**What it shows:**
- Natal chart (12 houses, 9 planets)
- Ascendant, cusps, nakshatra, dasha lords
- Tara score (9-fold from birth star)
- Test case: Naveen's birth (Lahiri 82.9708°, KP 82.8743°)

**Data dependency:**
- `/kundali` endpoint (already coded)
- astro.ts (✓ complete)
- kp.ts (✓ complete)
- NO muhurta calculations needed

**UI complexity:** Medium (12-house circle, 9 planet glyphs, text labels)

**Testing burden:** Low (just display endpoint data)

**Time estimate:** 12 hours (design + code + test)

**Revenue impact:** LOW (informational only, no decision-making)

**User value:** HIGH (beautiful natal chart builds trust)

---

### SCREEN B: MUHURTA DASHBOARD (Real-Time)

**What it shows:**
- Live Hora/Uphora display (24-hour cycle)
- Personalized Tara (from birth star)
- Convergence score (0-100, 5 factors × 20%)
- Event recommendations (Property → Marriage → Business → Medical)
- 6-stage filter status (PASS/FAIL for each stage)

**Data dependency:**
- `/muhurta` endpoint (60% complete)
- muhurta.ts calculations
- horaScoring.ts (70% complete)
- 6-stage filter logic (needs integration)

**UI complexity:** HIGH (real-time updates, 5 score dials, 6 status boxes, event recommendations)

**Testing burden:** MEDIUM (filter logic + score calculation)

**Time estimate:** 18 hours (complex state management)

**Revenue impact:** CRITICAL (this is the v6 core product)

**User value:** CRITICAL (this drives customer decisions)

---

### SCREEN C: EVENT CATEGORIES SELECTOR + RECOMMENDATIONS

**What it shows:**
- 9 category tabs (or 8 if reorganized)
- 400 events in dropdown/search
- Recommended times (next 3 golden slots for selected event)
- CSL status (will it work?)
- MPI score for each slot

**Data dependency:**
- Event signification rules (400 events mapped)
- CSL activation logic
- 6-stage filter integration
- Tara + SAV + Digbala scoring

**UI complexity:** HIGH (search, tabs, recommendation algorithm, score display)

**Testing burden:** HIGH (400 events × 6 stages = 2,400 test cases)

**Time estimate:** 20 hours (search indexing, recommendation engine)

**Revenue impact:** HIGHEST (this is client-facing decision tool)

**User value:** HIGHEST (this makes money)

---

## OPTION A: START WITH BIRTH CHART ✅ or ❌

### Reasoning
- "Build foundation first" — users see beautiful natal chart immediately
- Lowest risk — just displays backend data, no logic
- Fastest confidence builder — "our system works" proof

### Consequence
```
Week 1 Output: Beautiful birth chart (✓ verified against Naveen's chart)
Week 2: Muhurta Dashboard (starts Wed, completes Fri)
Week 3: Event Categories (needs most backend work)
Week 4: Testing + integration
Risk: Muhurta dashboard pushed to Thu-Fri Week 2, compressed testing
```

### Pros
- Risk-free launch (no logic bugs)
- User trust (beautiful design)
- Early Portfolio piece

### Cons
- **Delays revenue feature** (Event Categories to Week 3)
- **Hospital B2B waiting** (can't use system until Event Categories ready)
- **Late testing** (only 5 days for most complex feature)

---

## OPTION B: START WITH MUHURTA DASHBOARD ✅ or ❌

### Reasoning
- "Revenue feature first" — this is what customers pay for
- Tests 6-stage filter immediately (integration validates backend)
- High-value early (users get personalized recommendations by Week 2)

### Consequence
```
Week 1 Output: Muhurta Dashboard (live, real-time, 6-stage filter active)
Week 2: Event Categories (full focus)
Week 3: Birth Chart (nice-to-have screen)
Week 4: Testing + edge cases
Risk: Birth chart becomes "v6.01 release" (2 weeks later)
```

### Pros
- **Fastest path to revenue** (Dashboard ready Week 2)
- **Hospital B2B can test** real recommendations
- **Full testing cushion** (Week 4 thorough)
- **Validates backend** (6-stage filter proven in production)

### Cons
- Less impressive UI (no pretty natal chart)
- "Incomplete feature" feeling
- Birth Chart missing from launch

---

## OPTION C: START WITH EVENT CATEGORIES ✅ or ❌

### Reasoning
- "Customer value first" — this is the tool they use
- Requires most backend integration (forces coupling issues to surface)
- Highest revenue impact (400 events = 400 decision points)

### Consequence
```
Week 1 Output: Event Categories + Recommendations (partially integrated)
Week 2: Muhurta Dashboard (integration relies on Categories working)
Week 3: Birth Chart (polish)
Week 4: Final testing
Risk: If 400-event taxonomy fails, Dashboard can't render
```

### Pros
- **Highest revenue potential** (400 events active immediately)
- **Strongest integration test** (backend bottlenecks exposed early)
- **Market differentiator** (event taxonomy is unique to OCCULTVIISION)

### Cons
- **Highest risk** (2,400 test cases needed)
- **Complex UI** (search + recommendations hard to get right)
- **Timeline pressure** (testing squeezed to 5 days)

---

## YOUR DECISION

**I recommend: OPTION B** (Muhurta Dashboard First)  
**Reason:** This is the product. Hospital B2B needs it to validate. Birth Chart is pretty but not revenue-critical. Event Categories needs full backend integration (Week 2 focus). Dashboard Week 1 = proven 6-stage filter + real recommendations + safe testing timeline.

### YOUR CHOICE
```
Select one:
[ ] OPTION A — Birth Chart first (safe, beautiful, delays revenue feature)
[ ] OPTION B — Muhurta Dashboard first (revenue-critical, validates backend)
[ ] OPTION C — Event Categories first (highest risk, highest reward, needs Week 2 buffer)

Your reasoning:
_________________________________________________________________
_________________________________________________________________
```

---

# SUBMISSION

**Once you've answered all 3 questions, return this doc to Claude with your selections marked.**

**Impact:**
- Decision 1 → Week 3-4 Backend load (events database size)
- Decision 2 → Week 2 scope (dosha complexity)
- Decision 3 → Week 1 Frontend priority (which screen ships first)

**After you submit, Claude will:**
1. Lock in v6 Week 1-4 detailed execution plan
2. Create specific Jira tickets with time estimates
3. Begin backend coding (muhurta.ts, horaScoring.ts integration)
4. Design frontend wireframes (1-3 screens based on your priority)

---

**Submit by replying with this form filled out.**

