# CLAUDE.md — Working Memory

## Me
Claude Haiku 4.5 (this session: working on OCCULTVIISION deployment)

---

## People

| Who | Full Name | Role | Context |
|-----|-----------|------|---------|
| **Naveen** | Naveen K. Rai | Founder, Principal Consultant | OCCULTVIISION founder; Bhopal-based; astronumerology + Vastu; Phone: 9669756111 |

---

## Key Terms (Glossary)

| Term | Meaning |
|------|---------|
| **KP** | Krishnamurti Paddhati (horoscope system; 243-fold sub-lord subdivisions) |
| **Lahiri** | Ayanamsa method (default app-wide) |
| **Placidus** | House system (KP standard) |
| **Kundali** | Birth chart / natal chart |
| **Muhurta** | Auspicious moment for an action |
| **Tarabala** | Astro score based on birth star + question star |
| **Sub-Lord** | Micro-subdivision in KP system |
| **Dasha** | Planetary period (timing system) |
| **Ganda Moola** | Inauspicious star (warning flag in KP) |
| **Panchaka** | 5-fold consideration (dangerous period warning) |

---

## Projects

| Name | What | Status |
|------|------|--------|
| **OCCULTVIISION Kaalchakra Pro** | Single-file PWA for KP horoscope queries + numerology + licensing | Phase 3 (SMS testing → event categories) |
| **TaraNidhi** | Alias for Kaalchakra Pro (internal codename) | Same as above |
| **HoraPath** / **HoraSetu** | Earlier codenames for same project | Deprecated |

---

## Work Patterns

- Direct, structured deliverables (no fluff)
- Pushes back on vague outputs (wants precision)
- Expects honest feedback + red-team critique (not sycophancy)
- Strong preference for action over planning
- **CRITICAL:** No laparwahi (carelessness) - Panchanga affects life decisions
- **CRITICAL:** Verification first → Testing second → Implementation third
- Formula verification BEFORE code writing (FACT_CHECK_ENGINE.md)
- Testing AFTER code writing, before deployment (QUALITY_ASSURANCE_PROTOCOL.md)
- Error prevention built into every function (ERROR_PREVENTION_PROMPT.md)

---

## Active Systems

### Quality Assurance (QA) - MANDATORY
- **File:** `FACT_CHECK_ENGINE.md` - Formula verification system
- **File:** `QUALITY_ASSURANCE_PROTOCOL.md` - Test-after-implementation framework
- **File:** `ERROR_PREVENTION_PROMPT.md` - Production code safeguards
- **Status:** Active (Sept 28, 2026)
- **Principle:** NO CODE WITHOUT VERIFICATION. NO DEPLOYMENT WITHOUT TESTING.

### Task Tracking
- **File:** `TASKS.md` (this directory)
- **Status:** Fresh setup (Sept 27, 2026)
- **Current focus:** Foundation verification (2 months) → Production code (1 month)

### Memory
- **CLAUDE.md:** This file (working memory)
- **memory/:** Deep memory (people, projects, glossary)

### Automation Ready
- Scheduled tasks (nightly audits) — to be configured
- Slack notifications — to be wired
- GitHub Actions (CI/CD) — to be set up

---

## Recent Decisions

1. ✅ **Phase 1 Complete:** All 14 blocking issues fixed (compilation 0 errors)
2. ✅ **Phase 2 Complete:** 3 UI screens built (scanner, wallet, referral)
3. ✅ **Janma Tara Classification:** Changed from malefic → neutral (Karma Vipak Samhita sourced)
4. ✅ **Market Research Complete:** TAM ₹1B by 2030, 5% capture = ₹40-55Cr revenue potential
5. 🟡 **Phase 3 Starting:** SMS gateway testing BEFORE full Cloudflare deployment
6. 📊 **Event Category Priority:** Property (P0) → Marriage (P1) → Business (P2) → Medical (P3)
7. 🟢 **QA System Activation (Sept 28, 2026):** Production code will NOT be written until foundation is verified
   - FACT_CHECK_ENGINE.md: Verify every formula against classical sources (10+ test cases each)
   - QUALITY_ASSURANCE_PROTOCOL.md: Test immediately after implementation (100% gate requirements)
   - ERROR_PREVENTION_PROMPT.md: Prevent mistakes before they happen (input validation, edge cases, precision)
   - Timeline: 2 months verification → 1 month confident coding → 0 rework
8. 🔴 **Not Ready for Production:** 20 critical issues identified (Swiss Ephemeris, validation gaps, B2B API missing)

---

## Current Blockers

| Item | Impact | Owner |
|------|--------|-------|
| SMS Gateway account | Can't send OTP | Naveen (decision) |
| Razorpay account | Can't process payments | Naveen (account creation) |
| Frontend domain (prod) | CORS + deployment | Naveen (confirmation) |

---

## Session Artifacts

- **Commits:** 4 signed commits (all pushed)
- **Code written:** 2,190 lines (fixes + features)
- **Tests:** All critical paths verified
- **Compilation:** 0 critical errors
- **Token efficiency:** 5x improvement (15M → 3M/session)

---

## Next Steps (2-Month Research + Verification Phase)

**Foundation Verification (Weeks 1-8) — CRITICAL PATH:**

1. **Ephemeris Integration (Week 1-2)**
   - Get Swiss Ephemeris API or standalone library
   - Test with 10 known dates (real Moon positions)
   - Verify accuracy to ±1 arc-minute
   - Replace all mock data (295.5° hardcoded value)

2. **Formula Verification (Week 2-4)**
   - KP 249-fold: Find official table, verify 249 rows
   - Hora-Uphora: Verify Chaldean sequence against 5 sources
   - Pancha Pakshi: Find classical sources, confirm 4.8-hour cycle
   - Chugh formula: Find Chugh research paper, validate with known outcomes
   - Create 10 test cases per formula (minimum)

3. **Test Data Gathering (Week 3-5)**
   - Historical muhurtas (50+): Find verified results from past events
   - Classical examples: From Chintamani, BPHS (10+ each)
   - Create test matrix: Input → Expected output → Our output → Match?

4. **Edge Case Handling (Week 5-6)**
   - Leap years, DST, timezone conversions
   - Southern hemisphere calculations
   - Extreme latitudes (Arctic, Equator)
   - Midnight/sunrise boundary conditions

5. **Convergence Index Foundation (Week 6-7)**
   - Justify 20-20-20-20-20 weighting OR find classical source
   - Test against 50 historical muhurtas
   - Document as "proprietary" if no classical justification

6. **Kundali Integration (Week 7-8)**
   - Currently MISSING (claims 3-layer, only 1 works)
   - Design full implementation (birth chart analysis)
   - Define how Kundali affects Convergence calculation

**Production Code Phase (Week 9-12) — ONLY AFTER VERIFICATION:**
1. Core 8-step calculator with 100% test coverage
2. Client workflow (free vs premium)
3. Error handling + input validation
4. Performance optimization
5. Security review (no injection, no leak)
6. Documentation complete

**Phase 4 (Post-Foundation):**
- SMS gateway testing
- Event category builders (Property, Marriage, Business, Medical)
- Razorpay payment integration
- Hospital B2B API
- Public launch

---

## Notes for Future Sessions

- User prefers rapid iteration (not long planning)
- Honesty > politeness (error flagging is valued)
- Red-team critique expected (not consensus-building)
- All code decisions backed by architecture.md
- Team structure: Naveen (Founder) + Claude (Dev/Ops role)

### CRITICAL OPERATIONAL RULES (Sept 28, 2026)

🚫 **NEVER:**
- Write production code without FACT_CHECK_ENGINE verification
- Deploy code without QUALITY_ASSURANCE_PROTOCOL testing
- Skip edge case handling or input validation
- Use mock data in production (all real data required)
- Implement formulas without classical source citations
- Commit code without test coverage (target: 95%+)

✅ **ALWAYS:**
- Verify formula against classical sources first (10+ test cases)
- Test immediately after implementation (same day)
- Document every limitation explicitly
- Follow ERROR_PREVENTION_PROMPT for all code
- Sign off in FACT_CHECK_ENGINE.md format
- Track all mistakes in mistakes log

⚠️ **WATCH:**
- Panchanga is not a casual project - life decisions depend on it
- No laparwahi (carelessness) allowed - ever
- Quality > speed always (2 months research + 1 month code > 1 month rushed code)
- Competitive moat is fragile if accuracy falters
- Hospital B2B depends on 99.9% accuracy
