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

11. ✅ **GLOBAL DESIGN SYSTEM v1.0 (Oct 4, 2026 — COMPREHENSIVE):**
    - **Approach:** Material Design 3 + Apple HIG standards + WCAG 2.1 AAA accessibility
    - **Vedic Foundation:** Five Elements (Akash/Agni/Jal/Vayu/Prithvi) as SUBTLE accents ONLY (not ornate)
    - **Color Palette:** Light + Dark modes, WCAG AAA verified, elemental colors for feature mapping
    - **Typography:** Poppins (display) + Inter (body) + JetBrains Mono (data), type scale 12px-48px
    - **Components:** Complete specs (buttons, forms, cards, modals, alerts, badges, tabs)
    - **Spacing:** 8px base grid, responsive (360px→1200px+), 16px side padding
    - **Dark Mode:** prefers-color-scheme + explicit toggle, equal polish both themes
    - **Accessibility:** Checklist + testing plan (keyboard nav, ARIA labels, focus rings, color contrast)
    - **Element-to-Feature Mapping:**
      - Akash (Purple #8B5CF6) → Birth Charts (/kundali)
      - Agni (Orange #F97316) → Muhurta Timing (/muhurta)
      - Jal (Cyan #0EA5E9) → Numerology (/numerology)
      - Vayu (Teal #06B6D4) → Recommendations (/recommendations)
      - Prithvi (Green #10B981) → Wallet/Account (/wallet)
    - **File:** `docs/GLOBAL_DESIGN_SYSTEM.md` + interactive artifact
    - **Implementation Roadmap:** 7-week build plan (Foundation → Features → QA → Launch)
    - **Commit:** 84da760 (770 insertions)

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

## Next Steps - PRIORITY REORDERING (Oct 4 - Oct 31)

**USER PRIORITY (Naveen's reorder, Oct 4 2026):** 2→3→4→5→6→1 (UI/UX FIRST, then backend activation)

### TASK 74: Hindi/English i18n Framework (PRIORITY 1 — NEXT SESSION START)
- [ ] i18n architecture (i18next or similar, no build requirement)
- [ ] Language toggle (header button, persists to localStorage)
- [ ] Hindi translations (all screens: labels, buttons, messages)
- [ ] English fallback (already done, complete proofreading)
- [ ] RTL support (future: if Arabic expansion planned)
- [ ] Testing (multiple languages + toggle)

### TASK 75: Five Elements Theme System (PRIORITY 2 — PENDING DESIGN SPECS)
- [ ] Build CSS token system (colors, typography, spacing from GLOBAL_DESIGN_SYSTEM.md)
- [ ] Component library (buttons, forms, cards, modals using elemental accents)
- [ ] Dark mode toggle + prefers-color-scheme
- [ ] Apply to all screens with elemental color mapping
- [ ] Mobile responsive audit
- [ ] Accessibility verification (WCAG AAA)

### TASK 76: Admin Panel Completion (PRIORITY 3 — 99%)
- [ ] User management (list, view detail, deactivate, tier upgrade)
- [ ] Query logs viewer (filter, search, export)
- [ ] Statistics dashboard (charts, metrics, trends)
- [ ] System settings (SMS gateway config, Razorpay keys, domain)
- [ ] Audit trail (all admin actions logged)
- [ ] Mobile responsive (tablets + landscape)

### TASK 77: Mobile Responsive Audit (PRIORITY 4 — 99%)
- [ ] Test all screens (360px, 768px, 1024px breakpoints)
- [ ] Touch targets (44×44px minimum)
- [ ] Orientation changes (portrait↔landscape)
- [ ] Device testing (iOS Safari, Chrome, Android)
- [ ] Keyboard navigation (full accessibility)
- [ ] Performance on slow networks (throttled 3G)

### TASK 78: Website UI Polish (PRIORITY 5 — 99%)
- [ ] Homepage (hero, value props, CTA, testimonials)
- [ ] Pricing page (tiers with features comparison)
- [ ] Features page (detailed capability breakdown)
- [ ] Blog/resources (articles, guides, FAQ)
- [ ] Contact/support (form, email, phone)
- [ ] Footer (links, legal, social)

### TASK 73: Payment → Auto-Activation (PRIORITY 6 — BACKEND LOGIC)
- [ ] Wire payment.captured webhook → user.tier upgrade
- [ ] Tier logic (basic→premium→ultra based on order purpose)
- [ ] Activation notification (email + in-app toast)
- [ ] Edge cases (failed payment, refund, tier downgrade)
- [ ] Testing (full payment flow → tier change)

**REFERENCE:** Design System (`docs/GLOBAL_DESIGN_SYSTEM.md`) covers all color, typography, spacing, component, and accessibility specs for above tasks.

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
