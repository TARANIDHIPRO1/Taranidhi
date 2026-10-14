# 🚀 TARANIDHI PRODUCTION LAUNCH - PRIORITY LIST

**Target Date:** Oct 20, 2026 (6 days)  
**Owner:** Claude (Dev/Ops)  
**Status:** ACTIVE EXECUTION

---

## PHASE 1: PREP & DOCS (Days 1-2) 🔴 CRITICAL

### P1.1: Create D1-D12 Decisions Document 
- **Status:** ✅ DONE
- **Time:** 2 hours
- **File:** `/memory/decisions/architecture-d1-d12.md`
- **Deliverable:** All 12 architecture decisions with recommendations + approval email template
- **Next:** Send to Naveen for sign-off

### P1.2: Create Production Deployment Checklist
- **Status:** ✅ DONE
- **Time:** 1.5 hours
- **File:** `DEPLOYMENT_CHECKLIST.md`
- **Deliverable:** Complete pre-launch, launch-day, and post-launch checklists with SLOs

### P1.3: Setup Production Config Files
- **Status:** ✅ DONE
- **Time:** 1 hour
- **Files Created:**
  - `wrangler.production.toml` — Cloudflare Workers prod config
  - `.env.production.template` — Environment variables template
  - `SECRETS_SETUP_GUIDE.md` — Step-by-step secrets setup (for Naveen)
- **Deliverable:** Production-ready infrastructure configs

---

## PHASE 2: BUG FIXES & CODE (Days 2-3) ✅ COMPLETE

### P2.1: Fix BUG-01 (Absolute Degree Calculation)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 1.5 hours
- **File:** astro.ts:226
- **Impact:** HIGH - Breaks KP accuracy
- **Actions:**
  - [x] Read astro.ts:220-230
  - [x] Identify degree calculation error
  - [x] Write fix + test
  - [x] Verify against test cases
- **Fix:** Added NAK_SIZE = 360/27, proper normalization with ((deg % 360) + 360) % 360

### P2.2: Fix BUG-02 (Kundali Chart Validation)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 1 hour
- **File:** kundaliChart.ts:98
- **Impact:** HIGH - Chart rendering fails
- **Actions:**
  - [x] Read kundaliChart.ts:90-105
  - [x] Add bounds checking
  - [x] Convert nullable to safe assertions
  - [x] Verify validation works
- **Fix:** Added explicit Rashi (0-11) and Nakshatra (0-26) validation with error throws

### P2.3: Fix BUG-03 (calcLagna Verification)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 0.5 hours
- **File:** lagna.ts
- **Impact:** MEDIUM - Ascendant calculation
- **Actions:**
  - [x] Review lagna.ts implementation
  - [x] Verify against Naveen's chart
  - [x] Document verification
  - [x] No changes needed - already verified
- **Result:** Formula already verified in Session 5 against Naveen (08/04/1973)

### P2.4: Fix BUG-04 (Karana Index Bounds)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 1 hour
- **File:** muhurta.ts getKarana()
- **Impact:** MEDIUM - Array overflow prevention
- **Actions:**
  - [x] Add position bounds (1-60)
  - [x] Add fixed karana index validation
  - [x] Add error throws
  - [x] Document 60-element cycle
- **Fix:** Added explicit bounds checking with validation for movable and fixed karanas

### P2.5: Fix BUG-05 (TITHI_NAMES)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 0.5 hours
- **File:** astro.ts
- **Impact:** LOW - Display names
- **Actions:**
  - [x] Add all 30 tithi names
  - [x] Verify Shukla + Krishna Paksha
  - [x] Add classical source citations
  - [x] Export constant
- **Fix:** Added TITHI_NAMES with all 30 days (0-29): Shukla (0-14) + Krishna (15-29)

### P2.6: Fix BUG-06 (Hardcoded Configuration)
- **Status:** ✅ DONE (Oct 14)
- **Time:** 1 hour
- **File:** astro.ts (new config section)
- **Impact:** HIGH - Production configurability
- **Actions:**
  - [x] Create AYANAMSA_TYPE (lahiri, fagan, deluce)
  - [x] Create HOUSE_SYSTEM (placidus, equal, whole-sign)
  - [x] Create DASHA_SYSTEM (vimshottari, ashtottari)
  - [x] Add environment variable support
  - [x] Add validation with clear errors
- **Fix:** Made all config values environment-aware with defaults and validation

**PHASE 2 SUMMARY:** All 6 bugs fixed and committed. Ready for Phase 3 (migrations) and Phase 4 (testing).

---

## PHASE 3: DATABASE & MIGRATIONS (Days 3-4) 🟡 IMPORTANT

### P3.1: Create Migration 0006 (Events Table)
- **Status:** 🔴 TODO
- **Time:** 1.5 hours
- **Actions:**
  - [ ] Create worker/migrations/0006_events_table.sql
  - [ ] Define schema (user_id, event_type, muhurta_id, date_time)
  - [ ] Add indexes
  - [ ] Test migration

### P3.2: Create Migration 0007 (Saved Muhurtas)
- **Status:** 🔴 TODO
- **Time:** 1.5 hours
- **Actions:**
  - [ ] Create worker/migrations/0007_saved_muhurtas.sql
  - [ ] Define schema (user_id, query, result, created_at)
  - [ ] Add indexes
  - [ ] Test migration

### P3.3: Verify KP 249-Fold Boundaries
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Test sub-lord boundaries against onlinejyotish.com
  - [ ] Verify all 249 sub-lords calculate correctly
  - [ ] Document any discrepancies
  - [ ] Create 20+ test cases

---

## PHASE 4: TESTING & QA (Days 4-5) 🟡 IMPORTANT

### P4.1: Run Full Test Suite
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Run all 11 existing tests
  - [ ] Add tests for all bug fixes
  - [ ] Achieve 95%+ code coverage
  - [ ] Document test results

### P4.2: Load Testing Setup
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Create load test script (k6 or Artillery)
  - [ ] Test with 100 concurrent users
  - [ ] Test with 1000 concurrent users
  - [ ] Document bottlenecks

### P4.3: Performance Optimization
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Profile KP calculations
  - [ ] Implement caching if needed
  - [ ] Optimize database queries
  - [ ] Target <500ms response time

### P4.4: Security Audit Checklist
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Check CORS configuration
  - [ ] Review authentication flow
  - [ ] Check rate limiting
  - [ ] Verify secret handling
  - [ ] Document security gaps

---

## PHASE 5: OPS & INFRASTRUCTURE (Days 5-6) 🟡 IMPORTANT

### P5.1: Setup GitHub Actions CI/CD
- **Status:** 🔴 TODO
- **Time:** 2 hours
- **Actions:**
  - [ ] Create .github/workflows/test.yml
  - [ ] Create .github/workflows/deploy.yml
  - [ ] Auto-run tests on PR
  - [ ] Auto-deploy to staging on merge
  - [ ] Document deployment process

### P5.2: Setup Monitoring (Sentry)
- **Status:** 🔴 TODO
- **Time:** 1.5 hours
- **Dependencies:** Sentry account
- **Actions:**
  - [ ] Create free Sentry account
  - [ ] Integrate SDK into backend
  - [ ] Integrate SDK into frontend
  - [ ] Setup error alerts
  - [ ] Test error reporting

### P5.3: Setup Analytics
- **Status:** 🔴 TODO
- **Time:** 1 hour
- **Dependencies:** Analytics service choice
- **Actions:**
  - [ ] Choose analytics service (Plausible/Mixpanel)
  - [ ] Integrate into frontend
  - [ ] Setup dashboard
  - [ ] Define key metrics

### P5.4: Setup Backup Strategy
- **Status:** 🔴 TODO
- **Time:** 1 hour
- **Actions:**
  - [ ] Create automated backup script
  - [ ] Test restore procedure
  - [ ] Document recovery steps
  - [ ] Set backup frequency (daily)

---

## PHASE 6: LAUNCH PREP (Days 5-6) 🟡 IMPORTANT

### P6.1: Create Launch Checklist
- **Status:** 🔴 TODO
- **Time:** 1 hour
- **Actions:**
  - [ ] Document all pre-launch steps
  - [ ] Create rollback procedures
  - [ ] Define SLOs (uptime, response time)
  - [ ] Create on-call runbook

### P6.2: Create User Documentation
- **Status:** 🔴 TODO
- **Time:** 1.5 hours
- **Actions:**
  - [ ] Write getting started guide
  - [ ] Create FAQ
  - [ ] Document pricing tiers
  - [ ] Create support contact page

### P6.3: Setup Monitoring Dashboard
- **Status:** 🔴 TODO
- **Time:** 1 hour
- **Actions:**
  - [ ] Create monitoring dashboard
  - [ ] Add key metrics (uptime, latency, errors)
  - [ ] Setup alert thresholds
  - [ ] Document dashboard

### P6.4: Create Incident Response Plan
- **Status:** 🔴 TODO
- **Time:** 1 hour
- **Actions:**
  - [ ] Document outage response steps
  - [ ] Create escalation matrix
  - [ ] Define communication plan
  - [ ] Setup Slack/email alerts

---

## BLOCKED BY NAVEEN (Can't Start Until Approved)

| Item | Impact | Need From Naveen |
|------|--------|------------------|
| **Deployment** | 🔴 CRITICAL | Prod domain confirmation |
| **SMS Gateway** | 🔴 CRITICAL | Twilio account + API key |
| **Razorpay** | 🔴 CRITICAL | Razorpay account + API key |
| **Architecture Approval** | 🔴 CRITICAL | D1-D12 sign-off |

**These must be done before final launch but can be done in parallel with other work.**

---

## TIMELINE BREAKDOWN

```
Today (Oct 14):  P1.1, P1.2, P1.3 (3 hours)
Oct 15-16:       P2.1-P2.6 (9 hours) ← Bug fixes
Oct 17:          P3.1-P3.3 (5 hours) ← Migrations
Oct 18-19:       P4.1-P4.4 (8 hours) ← Testing
Oct 19-20:       P5.1-P5.4 + P6.1-P6.4 (7 hours) ← Ops
Oct 20:          Final checklist + deploy

TOTAL: ~36 hours of work
= 4-5 days of focused development
```

---

## SUCCESS CRITERIA

- ✅ All bugs fixed + tested
- ✅ All migrations created + tested
- ✅ Load tests passing (1000 users)
- ✅ CI/CD pipeline working
- ✅ Monitoring setup + working
- ✅ Security audit completed
- ✅ 95%+ test coverage
- ✅ Documentation complete
- ✅ Ready for production launch

---

---

## PHASE 1 STATUS: ✅ 100% COMPLETE (Oct 14, 3:45 PM)

**All prep & docs complete!**
- ✅ D1-D12 Decisions document created
- ✅ Production Deployment Checklist created  
- ✅ wrangler.production.toml configured
- ✅ .env.production.template created
- ✅ Secrets Setup Guide created

**Deliverables ready:**
1. `/memory/decisions/architecture-d1-d12.md` — Ready for Naveen approval
2. `DEPLOYMENT_CHECKLIST.md` — Ready for launch
3. `SECRETS_SETUP_GUIDE.md` — Ready for Naveen to execute
4. `wrangler.production.toml` — Production config ready
5. `.env.production.template` — Template ready to populate

**Blocker Status:**
- 🟡 **Waiting on Naveen:** D1-D12 sign-off, Account creation (Twilio, Razorpay, NEON)
- 🟢 **Not blocked:** Phase 2 bug fixes can start immediately
- 🟢 **Not blocked:** Phase 3 migrations can start immediately

**⏭️ NEXT ACTIONS:**

**For Naveen (send approval email now):**
```
Subject: Urgent: Architecture Decisions + Secrets Setup (D1-D12 Ready)

Hi Naveen,

Phase 1 prep docs are complete. Need your approval on:

1. D1-D12 Architecture Decisions → /memory/decisions/architecture-d1-d12.md
2. Secrets Setup → SECRETS_SETUP_GUIDE.md (account creation needed)

Please review and confirm:
- All 12 decisions OK? (or modifications needed?)
- Can you create accounts this week? (Twilio, Razorpay, NEON, Slack, S3)

Timeline:
- Phase 2 (bug fixes): Can start Oct 15 (no blocker)
- Phase 3 (migrations): Can start Oct 17 (no blocker)
- Final launch prep: Oct 19-20 (needs your secrets)

Thanks,
Claude
```

**For Claude (ready to execute immediately):**
- Start Phase 2: Bug fixes (BUG-01 through BUG-06) → Oct 15-16
- Start Phase 3: Database migrations (0006, 0007) → Oct 17
- Continue with testing, CI/CD, monitoring setup → Oct 18-20

**Status Update:** Phase 1 COMPLETE. Phase 2 ready to start. 🚀
