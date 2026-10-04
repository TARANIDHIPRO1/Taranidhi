# TaraNidhi / Kaalchakra Pro: System Review (verified)
**Date:** 5 Oct 2026
**Method:** Every statement below was checked against the repo on this date (line counts, grep, tsc). Items I could not verify are marked UNVERIFIED. Nothing is marked "complete" unless tested.
**Supersedes:** an earlier draft of this file that contained unverified numbers and statuses.

---

## 1. Verified facts

| Check | Result |
|---|---|
| Worker (`worker/src/lib` + `routes`) size | 11,704 lines across 44 files |
| `tsc --noEmit` worker | 0 errors |
| `tsc --noEmit` frontend | 0 errors |
| Test files | 2 (`verification.test.ts`, 101 test cases; `panchaPakshi.test.ts`, 6) |
| `npm test` (vitest) | **Does not start**: `Cannot find package 'vite'`. Existing tests are unrun this session. |
| Frontend screens | 15 files in `frontend/src/screens/` |

"0 errors" means the code compiles. It says nothing about astrological correctness.

---

## 2. Framework layers vs. what exists in code

| Layer (TARANIDHI_COMPLETE_FRAMEWORK.md) | In code? | Evidence | Gap |
|---|---|---|---|
| Panchang: Tithi, Vaar, Karana, Nakshatra, Yoga | Yes (in `muhurta.ts`, 1,573 lines) | Not re-read in detail | Correctness UNVERIFIED |
| Nakshatra (27) attributes | Partial | Used throughout `astro.ts` / `kp.ts` | Full attribute set per framework UNVERIFIED |
| Chandra Bal (Moon strength) | Yes | `horaScoring.ts`, `muhurta*.ts` routes, referenced in tests | Formula vs classical source UNVERIFIED |
| Sun position / month quality | UNVERIFIED | No dedicated function found | Likely missing |
| Hora (hourly lord) | Yes | `horaScoring.ts` (285 lines) | Accuracy UNVERIFIED |
| **Upa-hora (5-7 min)** | **No** | Zero grep hits | Not started |
| Navtara / Tara | Partial | `computeTara()` used in `kpVerdict.ts` for sub-lord check | No standalone Navatara Chakra module, no classification table or remedies found |
| KP sub-lord chain | Yes | `kp.ts`, `kpVerdict.ts` | Prior note: 22/22 sub-lord match vs onlinejyotish (from CLAUDE.md, not re-run) |
| Dasha + Antardasha (Vimshottari) | Yes | `astro.ts: getCurrentDasha`, `DASHA_SEQ` | Only Maha + Antar |
| **Pratyantar Dasha** | **No** | No function found | Not started |
| **Shooksma Dasha** | **No** | Zero grep hits | Not started. Framework calls it "the event decider". |
| Gochar (transits) | Partial | `astro.ts:272` current planet positions; `professionalMuhurta.ts:887` applies flat +20 / -25 adjustments; `kpVerdict.ts:13` says "(Future) Gochar" | No real transit analysis; the adjustment is a crude placeholder and defaults to 0 |
| Confidence engine (layer stacking to %) | Partial | `convergenceIndex.ts` (318 lines), `professionalMuhurta.ts` 3-layer scoring | Weights are not derived from the 8-layer framework. Not yet aligned. |

---

## 3. Other backend modules

| Module | Finding |
|---|---|
| `ashtakwarga.ts` | **68 lines; only `computeChandrashtakavarga`.** There is no full Ashtakavarga (BAV/SAV). Earlier docs implied more. |
| `parashari.ts` | 838 lines, dignity/yogas/aspects. Citations to BPHS are in code comments; not re-checked. |
| `panchaPakshi.ts` | 322 lines, has 6 tests. |
| `numerology.ts` | 359 lines. Correctness UNVERIFIED. |
| `background-jobs.ts` | 59 lines. Scope of reminders UNVERIFIED. |
| `rate-limit.ts` and `rateLimit.ts` | Two near-duplicate files (91 and 101 lines). Needs cleanup. |
| Admin / Auth / Wallet / Webhooks / Orders routes | Exist. Function not tested end-to-end. Razorpay and SMS blocked on credentials. |

## 4. Frontend

15 screen files exist: admin-panel, birth-chart, dasha-timeline, dashboard, event-muhurta, kp-query, kp-sublords, kundali-form, kundali-list, login, muhurta-dashboard, muhurta, referral, scanner, wallet.
- No dedicated Numerology screen file and no knowledge-search screen file, though the backend routes exist.
- Whether each screen is functionally complete, themed (Task 75) or i18n-wired (Task 74) is UNVERIFIED. Per CLAUDE.md the theme and i18n work are specs and assets that the dev team still has to apply.
- TASKS.md: birth-chart not yet checked against Naveen's chart / onlinejyotish.com (pending live deployment).

---

## 5. INCOMPLETE LIST (priority order)

**A. Not built (new code required)**
1. Shooksma Dasha (and Pratyantar Dasha above it)
2. Upa-hora
3. Real Gochar / transit analysis (replace flat +20/-25)
4. Sun position / month quality
5. Standalone Navatara Chakra module (classification, remedies) if the framework requires more than the current Tara check
6. Full Ashtakavarga (BAV/SAV), if it is to stay in scope
7. Confidence engine re-weighted to the 8-layer framework

**B. Built but unproven (cannot be called done)**
8. Panchang, Nakshatra, Chandra Bal, Hora, Muhurta, KP, Parashari, Numerology: formulas not checked against classical sources per FACT_CHECK_ENGINE.md
9. Test runner broken (`vite` missing). Fix first, then run the 107 existing cases.
10. Muhurta Scanner, Professional Muhurta, Referral, Background jobs: untested

**C. Cleanup**
11. Merge `rate-limit.ts` / `rateLimit.ts`
12. Frontend: confirm each screen's state, apply theme + i18n

**D. Blocked on Naveen**
13. SMS provider + credentials
14. Razorpay account keys
15. Production domain

**E. Gate before launch**
16. 225+ test cases (the figure comes from the earlier audit; it is a target, not a measured gap)
17. Netlify deployment, then trial with ~100 users

---

## 6. Recommended next step
1. Fix vitest (install missing deps) and run the existing 107 tests; record real pass/fail.
2. Verify Phase 1 formulas (Panchang, Nakshatra, Chandra Bal) against classical sources with Naveen's chart as one benchmark.
3. Then build the missing pieces in A, in order.

Repo: https://github.com/occultviision-code/occultviision
