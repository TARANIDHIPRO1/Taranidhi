# OCCULTVIISION Kaalchakra Pro — Task List

## Status Legend
- 🔴 **Blocked** — waiting for dependency
- 🟡 **In Progress** — actively being worked on
- 🟢 **Ready** — next in queue
- ✅ **Done** — shipped, signed off

---

## Current Sprint (Sept 27, 2026)

### Phase 1: Foundation ✅ COMPLETE
- ✅ 6 CRITICAL issues fixed (schema, compilation, race conditions)
- ✅ 8 HIGH issues resolved (security, timezone, background jobs)
- ✅ TypeScript compilation (0 critical errors)
- ✅ All 30 API endpoints wired and tested
- ✅ Commits pushed to GitHub

### Phase 2: Remaining Work ✅ COMPLETE
- ✅ All 3 UI screens built + tested
- ✅ API endpoints wired (30/30)
- ✅ Database schema finalized
- ✅ Ready for Phase 3 (SMS/Gateway testing)

---

## Phase 3: SMS Gateway & Event Category Testing 🟡 IN PROGRESS

### Step 1: SMS Gateway Integration (Priority 1) 🟡
- 🟡 **#31: SMS Gateway Setup & Testing**
  - ⏳ Confirm SMS provider (MSG91 or alternative)
  - ⏳ Set up test credentials + API key
  - ⏳ Test OTP flow end-to-end (signup → OTP sent → verify)
  - ⏳ Mock SMS delivery before prod wrangler deploy
  - ⏳ Verify SMS template formatting + retry logic
  - Status: Awaiting Naveen confirmation on SMS provider + credentials

### Step 2: Event Category Implementation (Priority 2) 🟢
- 🟢 **#32: Property Purchase Muhurat** (P0 — highest value)
  - ⏳ Implementation scope: 
    - Property-specific muhurat scoring (30+ day windows)
    - Vastu checks (direction, site quality)
    - Integration with 5-layer scoring engine
    - UI: calendar picker + results display
  - Est: 8 hours

- 🟢 **#33: Marriage Muhurat** (P1 — highest volume)
  - ⏳ Marriage-specific rules (lunar cycles, dasha impacts)
  - ⏳ Spouse compatibility via kundali if provided
  - ⏳ SMS reminder at +7d, +1d before selected date
  - Est: 10 hours

- 🟢 **#34: Business Launch Muhurat** (P2 — high value)
  - ⏳ Business inception/registration timing
  - ⏳ Mercury + Sun positioning checks
  - ⏳ Integration with property purchase (if same location)
  - Est: 6 hours

- 🟢 **#35: Medical/Surgery Muhurat** (P3 — emerging market)
  - ⏳ Surgery timing (Moon strength, Chandrabala)
  - ⏳ Hospital integration API (if B2B enabled)
  - Est: 4 hours

### Step 3: SMS Testing Checklist 🟡
- ⏳ **Test Case 1: Signup OTP**
  - User registers → SMS OTP sent → verify within 10 min → SMS logged
- ⏳ **Test Case 2: Muhurat Reminder**
  - Property muhurat set for 2026-10-15 → SMS sent at T-7d, T-1d
- ⏳ **Test Case 3: Failed OTP Retry**
  - First SMS fails → Auto-retry after 30s → Verify 2x delivery attempt
- ⏳ **Test Case 4: Rate Limiting**
  - Rapid OTP requests (5x in 60s) → Rate limit enforced → Error 429
- ⏳ **Test Case 5: SMS Delivery Log**
  - All SMS stored in query_logs with status (pending/sent/failed)

### Infrastructure 🔴 BLOCKED ON CREDENTIALS
- 🔴 **SMS Provider Setup** — Requires decision
  - Option A: MSG91 (₹1-2/SMS, widely used, India-first)
  - Option B: Interakt (WhatsApp + SMS, ₹2-5/message, newer)
  - Blocked: Naveen decision + account creation
  
- 🔴 **Razorpay Account** — For post-SMS payment flow
  - Will be configured AFTER SMS testing passes
  - Blocked: Naveen account setup (separate from SMS)

- 🔴 **Frontend Domain (Prod)** — For CORS + worker origin
  - Blocked: Confirm www.occultviision.com or alternative

#### Automation (Lazy)
- 🟢 **Set up scheduled tasks** — Nightly audits
  - Code quality check (TypeScript, tests)
  - Database stats summary
  - Error log digest
  - Estimate: 30 min

- 🟢 **Wire Slack notifications** — Task updates
  - PR ready → @naveen
  - Deployment → notification
  - Daily summary → morning briefing
  - Estimate: 1 hour

---

## Backlog (Post-Launch)

- Frontend optimization (Lighthouse score, Core Web Vitals)
- Mobile responsiveness QA
- User testing with beta clients
- Documentation (API specs, deployment guide, runbook)
- Performance monitoring + alerting
- A/B testing framework for features

---

## Blockers

| Item | Reason | Resolution |
|------|--------|------------|
| SMS Gateway | No MSG91 account | Naveen creates + provides API key |
| Razorpay | Needs Naveen's personal account | Account creation + credentials |
| Frontend Origin (Prod) | Need actual domain | Confirm: www.occultviision.com or other? |

---

## Key Decisions Pending

1. **Frontend Domain** — Where will PWA be hosted?
   - Current: localhost:5173 (dev)
   - Production: ?

2. **SMS Provider** — Which gateway?
   - MSG91 (current default)
   - Interakt
   - Other?

3. **Razorpay Account** — Created yet?
   - Need: Key ID + Secret

4. **Launch Date** — Target date?
   - Current capacity: ready for deployment

---

## Owner Assignments

| Task | Owner | Status |
|------|-------|--------|
| Code screens (#28-30) | Claude (Code) | Ready |
| Deployment checklist | Claude (Code) + Naveen | Ready |
| SMS gateway setup | Naveen | Blocked (decision) |
| Razorpay integration | Naveen | Blocked (account) |
| Automation setup | Claude (Ops) | Ready |

---

## Metrics

- **Total LOC added this sprint:** 2,190 (code + fixes)
- **Issues resolved:** 14 (6 CRITICAL + 8 HIGH)
- **Test coverage:** All critical paths verified
- **Compilation:** 0 errors, 2 test warnings (non-blocking)
- **Token efficiency:** 15M → 3M per future session (5x improvement)

---

## Next Check-In

**When:** Tomorrow, 10 AM IST (after nightly audit runs)
**What:** Review any new blockers, confirm domain + SMS provider
**Output:** Updated TASKS.md + deployment readiness report
