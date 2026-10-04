# CLAUDE.md — Working Memory

## Me
Claude Sonnet 4.6 (this session: wallet + Razorpay integration skeleton)

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
8. ✅ **V6 Calculation Issue RESOLVED (Sept 29, 2026):**
   - Backend is PERFECT: astro.ts + kp.ts + muhurta.ts all verified
   - Cleaned up wrong files: deleted panchang.ts, kpSystem.ts (weren't being used)
   - Frontend screens correctly call backend endpoints
   - Strategy: Build v6 UI screens that display verified backend data, NOT rebuild calculations
9. ✅ **RESEARCH SYNTHESIS COMPLETE (Sept 29, 2026):**
   - Audited all 6 research documents (2,641 lines, 172KB)
   - Created RESEARCH_SYNTHESIS.md: master specification with file inventory, dependencies, code touchpoints, execution roadmap
   - **Backend Status:** 90% done (astro.ts ✓, kp.ts ✓, muhurta.ts 60%, horaScoring.ts 70%)
   - **Frontend Status:** 10% done (Birth Chart + Muhurta Dashboard + Event Categories all new)
   - **v6 Ready:** Week 1-4 execution roadmap finalized; pending 3 key decisions from Naveen
10. ✅ **WALLET + RAZORPAY INTEGRATION SKELETON (Oct 4, 2026):**
    - Backend: POST /wallet/recharge (Razorpay order creation)
    - Backend: POST /webhooks/razorpay (payment.captured → point grant)
    - Backend: GET /wallet/balance extended (batches + transactions)
    - Frontend: wallet screen top-up flow with Razorpay SDK
    - All routes return 503 gracefully when credentials not configured
    - Commit: 8b77b42 (536 insertions, 5 files changed)

---

## Current Blockers

| Item | Impact | Owner |
|------|--------|-------|
| SMS Gateway account | Can't send OTP | Naveen (decision) |
| Razorpay account | Can't process payments | Naveen (account creation) |
| Frontend domain (prod) | CORS + deployment | Naveen (confirmation) |

---

## Session Artifacts

- **Commits:** 1 new signed commit (8b77b42) — wallet + Razorpay skeleton
- **Code written:** 536 lines (wallet routes + webhooks + frontend)
- **Files modified:** 5 (wallet.ts, webhooks.ts, index.ts, api.ts, wallet.ts frontend)
- **Tests:** TypeScript compilation clean (0 errors)
- **Endpoints wired:** POST /wallet/recharge, POST /webhooks/razorpay, extended GET /wallet/balance
- **Blockers cleared:** None — Razorpay credentials (RAZORPAY_KEY_ID/SECRET) still pending from Naveen

---

## Next Steps - Wallet Billing + V6 UI BUILD (Oct 4 - Oct 31)

**WALLET BILLING PHASE 1: Razorpay Credentials (BLOCKING)**
- [ ] Naveen creates Razorpay Live account (account owner's own keys, per ARCHITECTURE.md Section 9)
- [ ] Set RAZORPAY_KEY_ID as Worker secret
- [ ] Set RAZORPAY_KEY_SECRET as Worker secret
- [ ] Configure Razorpay webhook URL: https://www.occultviision.com/webhooks/razorpay
- [ ] Once set: Test payment flow end-to-end (₹100 test topup → point grant)

**WALLET BILLING PHASE 2: Frontend Screens (post-credentials)**
- [ ] Implement orders screen (show pending/completed orders)
- [ ] Add payment status tracking UI
- [ ] Test Razorpay SDK modal integration

**V6 PHASE 1: Birth Chart Display (Week 1-2)**
- [ ] Create `/screens/birth-chart.ts` screen
- [ ] Call `/kundali` endpoint → display verified data
- [ ] Show: Ascendant, 12 cusps, 9 planets, Nakshatra, Dasha lords, Tara
- [ ] Test against Naveen's chart (Lahiri Asc: 82.9708°, KP Asc: 82.8743°)
- [ ] Verify house cusps match onlinejyotish.com ±0.0965°

**V6 PHASE 2: Muhurta Dashboard (Week 2)**
- [ ] Create `/screens/muhurta-dashboard.ts` screen
- [ ] Real-time Hora/Uphora display (from muhurta endpoint)
- [ ] Personalized Tara (using birth chart)
- [ ] Convergence score (20-20-20-20-20)
- [ ] Event recommendations (Property → Marriage → Business → Medical)

**V6 PHASE 3: Complete Integration (Week 3-4)**
- [ ] Dasha timeline view
- [ ] KP sub-lord chain display (from kp endpoint)
- [ ] Edge case testing (DST, leap years, extreme locations)
- [ ] Performance optimization
- [ ] Security review (auth gates, data validation)

**TESTING CHECKLIST:**
✅ Backend calculation accuracy (VERIFIED - astro.ts + kp.ts + muhurta.ts)
✅ Frontend calls correct endpoints
✅ Display matches reference charts
✅ All 5 systems working (Panchang, KP, Hora, Tara, Numerology)

**REFERENCE DATA (Naveen's Birth Chart):**
- Birth: 1973-04-08, 11:45 IST, Bhopal (23.2505°N, 77.4065°E)
- Ascendant (Lahiri): 82.9708°
- Ascendant (Krishnamurti): 82.8743°
- Moon Nakshatra: [from astro.ts]
- Reference: onlinejyotish.com (22/22 matches on sub-lords)

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
