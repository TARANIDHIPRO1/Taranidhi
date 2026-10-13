# CLAUDE.md — Working Memory

## Me
Claude Haiku 4.5 (this session: Task 76 complete, Task 75 complete, Task 74 COMPLETE)

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

## Active Status (Oct 14, 2026 - 3:45 PM)

✅ **PHASE 1 COMPLETE** — All prep docs, configs, bug analysis done (3+ hours)
✅ **Architecture v1.0 Complete** — 16 sections, all filled, awaiting Naveen sign-off
✅ **Tasks 74-76 Complete** — i18n, Theme System, Admin Panel all done
✅ **D1-D12 Decisions Complete** — Full document in `/memory/decisions/architecture-d1-d12.md` + approval email template
✅ **Production Configs Ready** — wrangler.production.toml, .env.production.template, SECRETS_SETUP_GUIDE.md
✅ **Bug Analysis Complete** — All 6 bugs identified with fix strategies in BUG_ANALYSIS_REPORT.md

🟡 **PHASE 2 READY** — Bug fixes (BUG-01 through BUG-06) ready to start Oct 15
🟡 **Blockers:** D1-D12 approval (Naveen), SMS gateway, Razorpay, NEON accounts

**Next Session Brief (Oct 15):**
1. Verify Naveen approvals on D1-D12 + account creation progress
2. Fix BUG-01 + BUG-02 (astro.ts:226, kundaliChart.ts:98) — absolute degree + chart validation
3. Fix BUG-03 through BUG-06
4. Create migrations 0006 + 0007
5. Run full test suite

---

## Current Blockers

| Item | Impact | Owner |
|------|--------|-------|
| SMS Gateway account | Can't send OTP | Naveen (decision) |
| Razorpay account | Can't process payments | Naveen (account creation) |
| Frontend domain (prod) | CORS + deployment | Naveen (confirmation) |

---

## Immediate Pipeline (Oct 15 - Oct 20)

**STATUS:** Phase 1 complete. Phase 2 ready to start. Can proceed in parallel with Naveen's work.

**BLOCKER:** Naveen sign-off on D1–D12 + account creation (don't block Phase 2)

### Phase 2: Bug Fixes (Oct 15-16, ~8.5 hours)
1. Fix BUG-01 (astro.ts:226) — absolute degree calculation (2 hrs)
2. Fix BUG-02 (kundaliChart.ts:98) — chart validation (1.5 hrs)
3. Fix BUG-03 (calcLagna) — Lagna verification (2 hrs)
4. Fix BUG-04 (karana index) — array bounds (1 hr)
5. Fix BUG-05 (TITHI_NAMES) — dark half tithis (1 hr)
6. Fix BUG-06 (hardcoded keys) — env-aware config (1 hr)

### Phase 3: Migrations (Oct 17, ~5 hours)
1. Create migration 0006 (events table) (1.5 hrs)
2. Create migration 0007 (saved_muhurtas) (1.5 hrs)
3. Verify KP 249-fold boundaries vs onlinejyotish.com (2 hrs)

### Phase 4: Testing & QA (Oct 18-19, ~8 hours)
1. Full test suite execution (2 hrs)
2. Load testing (100-1000 concurrent) (2 hrs)
3. Performance optimization (2 hrs)
4. Security audit (2 hrs)

### Phase 5: Ops & Infrastructure (Oct 19-20, ~7 hours)
1. GitHub Actions CI/CD setup (2 hrs)
2. Sentry monitoring setup (1.5 hrs)
3. Analytics configuration (1 hr)
4. Backup strategy implementation (1 hr)
5. Final launch prep (1.5 hrs)

**Available for Dev Team (ready to build):**
- i18n: Phase 2 templates for 7 screens
- Theme System: WAFES CSS ready to apply
- Admin Panel: All backend APIs wired, ready for screens

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
