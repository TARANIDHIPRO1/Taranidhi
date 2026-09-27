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
| **OCCULTVIISION Kaalchakra Pro** | Single-file PWA for KP horoscope queries + numerology + licensing | Phase 2 (3 screens left, then deploy) |
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

1. ✅ **Chose Option B + A:** Fixed all 14 blocking issues in one session
2. ✅ **Architecture validated:** Lahiri ayanamsa default, KP module uses Krishnamurti - 0.0965°
3. ✅ **Database scaling:** 15 indexes added for 1M-user capacity
4. ⏳ **Pending:** Frontend domain (prod), SMS provider, Razorpay account

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

**Immediate (Next Session):**
1. Confirm frontend domain (prod)
2. Decide on SMS provider
3. Check if Razorpay account exists
4. Build 3 remaining UI screens
5. Deploy to Cloudflare

**Then:**
- SMS gateway integration
- Razorpay payment flow
- Automation/monitoring setup
- Launch

---

## Notes for Future Sessions

- User prefers rapid iteration (not long planning)
- Honesty > politeness (error flagging is valued)
- Red-team critique expected (not consensus-building)
- All code decisions backed by architecture.md
- Team structure: Naveen (Founder) + Claude (Dev/Ops role)
