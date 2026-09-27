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

---

## Active Systems

### Task Tracking
- **File:** `TASKS.md` (this directory)
- **Status:** Fresh setup (Sept 27, 2026)
- **Current focus:** Phase 2 — 3 UI screens + deployment

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

## Next Steps

**Phase 3 (SMS Gateway Testing) — Immediate:**
1. ⏳ Naveen confirms SMS provider (MSG91 or Interakt)
2. ⏳ Set up SMS test credentials + mock delivery
3. ⏳ Test OTP flow (signup → OTP → verify)
4. ⏳ Verify SMS retry logic + rate limiting
5. ⏳ Run 5-point SMS test checklist (signup, reminder, retry, rate-limit, logging)

**Phase 3 (Event Categories) — Parallel:**
1. 🟢 Build Property Purchase muhurat (P0, 8h)
2. 🟢 Build Marriage muhurat (P1, 10h)
3. 🟢 Build Business Launch muhurat (P2, 6h)
4. 🟢 Build Medical/Surgery muhurat (P3, 4h)

**Phase 4 (Post-SMS):**
- Razorpay payment integration
- Frontend domain configuration
- Full Cloudflare worker deployment
- Automation/monitoring setup
- Public launch

---

## Notes for Future Sessions

- User prefers rapid iteration (not long planning)
- Honesty > politeness (error flagging is valued)
- Red-team critique expected (not consensus-building)
- All code decisions backed by architecture.md
- Team structure: Naveen (Founder) + Claude (Dev/Ops role)
