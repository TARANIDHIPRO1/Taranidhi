# TaraNidhi — Muhurat Technique Specification (draft v0.1)

**Status:** Draft for Naveen's review. Nothing in this document is a verified rule unless its row says so.
**Date:** 19 Oct 2026 (IST). **Scope:** the technique for every muhurat category, built from the engine plus rules that have a source.

---

## 1. Three layers, kept separate

| Layer | What it is | Who verifies it |
|---|---|---|
| **A. Computed signals** | Tithi, nakshatra, yoga, karana, weekday, Sun/Moon sidereal, sunrise/sunset, Rahu Kaal, Yamaganda, Gulika, Abhijit, Choghadiya, Hora. Calculated from astronomy-engine, Lahiri ayanamsha. | Checked against known panchang values (done for several items; see §5). |
| **B. Classical rules** | "Tithi X is good for Y", "Pushya is good for gold". Each rule needs a source and an authority rating (FACT_CHECK_ENGINE scale). | Naveen, plus the classical text. |
| **C. Personal layer** | Client's chart: house lords, dasha, tara bala, chandra bala, navamsha. Needs DOB, time, place. | Checked against the kundali engine and a test chart. |

A result shown to a client must say which layers it used. A rule from layer B with no source must not appear as a fact.

---

## 2. Inputs for each request

- Category (see §3), date range, location (lat/long, timezone Asia/Kolkata by default).
- Client DOB, time, place (only for layer C).
- For vehicle, company, or property: purpose and whether the buyer is an individual or a company.
- Optional: preferred weekday or time window.

---

## 3. Category technique

Status key: **S** = source present in repo (see §4), **P** = pending source, **X** = not supported, needs a decision first.

| # | Category | Layer A filters | Layer B rules (source status) | Layer C | Status |
|---|---|---|---|---|---|
| 1 | **Gold / jewellery** | Avoid Rahu Kaal, Yamaganda, Gulika. Prefer daytime. | Guru Pushya (Thu + Pushya) "+35" bonus (P). Panchami / Jupiter hora "+20" (P). | 2nd and 11th house lords (P). | P |
| 2 | **Property / land / plot / flat** | Avoid Rahu Kaal, Yamaganda, Gulika, Amavasya. | Venus hora, Jupiter expansion (P). Thresholds in old chat (e.g. "Property 80+") are placeholders, not rules. | 4th lord, dasha (P). | P |
| 3 | **Griha pravesh (first entry to a new home)** | Avoid Rahu Kaal, Yamaganda, Gulika, Amavasya, Ashtami/Navami where classical texts say so. | Pending text. | 4th house, Moon strength (P). | P |
| 4 | **New griha pravesh / rental move-in** | Same as 3, plus shifting timings. | Pending text. Rental: no classical rule found yet. | Same as 3 | P |
| 5 | **New car (individual)** | Mercury hora or weekday per source (P). Avoid Rahu Kaal. | Mercury hora "+20" (P). | 10th lord, Mercury gochar (P). | P |
| 6 | **Second-hand car** | Same filters as 5. Number does not change on transfer. | Same as 5 (P). | 10th lord (P). | P |
| 7 | **Vehicle in company name** | Same as 5. | Same as 5 (P). | Company founder / director chart (X until company data is defined). | X |
| 8 | **Business / shop opening** | Wed, Thu, Fri (P). | Mercury hora "+20" (P). | 10th lord, career dasha (P). | P |
| 9 | **Family events (marriage, engagement)** | Shukla 2, 5, 7, 11 (P). | Venus hora "+20" (P). | 7th lord, navamsha (P). | P |
| 10 | **Legal / court / agreements** | Two rule sets: agreements vs court. Saptami rules differ (P). | Mercury hora "+20" (P). | 1st and 8th lords (P). | P |
| 11 | **Health / surgery** | Amrit Kaal window; Gulika must be avoided (P). | Moon hora "+20"; cap 60% outside Amrit Kaal (P). | 6th and 12th house (P). | P |
| 12 | **Education** | Mercury hora (P). | Mercury hora "+20" (P). | 5th and 10th lords (P). | P |

**Notes on the rows:**
- Every "+N" bonus is a points value from `deepavaliMuhurta.ts`. Those numbers are not from a classical text in the repo.
- "Amrit Kaal (pre-dawn 96–48 min)" is written as a window in the code. Classical texts usually define Amrit Kaal by nakshatra and weekday, so this definition needs checking before use.
- Number, colour, mobile, and "lucky" car number analysis (§6) are not in this table because no source is defined for them.

---

## 4. What the repo actually contains

| File (remote main history) | What it is | Use it for |
|---|---|---|
| `FACT_CHECK_ENGINE.md` | Verification protocol with authority scale ⭐1–5, known test cases, conflicting-rule handling. | Gate every rule in §3 before it goes live. |
| `worker/src/lib/deepavaliMuhurta.ts` | Festival scoring layer for 8 categories. | Reference only. Its "verified" claim cites `DEEPAVALI_MAHURAT_VERIFICATION_AUDIT.md`, which is not in the tree. |
| `worker/src/lib/commercialMuhurta.ts`, `CORRECTED_COMMERCIAL_MUHURTA_2026-10-12.js` | Commercial activities. Commit `c8a336d` records 3 tithi errors found against Muhurta Chintamani. | Source of truth for commercial tithis after correction. |
| `MUHURAT_COMPLETE_FORMULAS_AND_CALCULATIONS.md`, `CLASSICAL_RULES_EXTRACTED_2026-10-12.md` | Formulas and extracted rules (in history; removed from root in commit `1957ab6`). | Restore and cite per rule. |
| `TARANIDHI_V5_DUAL_MUHURTA_SPEC.md` | Earlier dual-layer spec. | Check against this document. |

---

## 5. Verification protocol (before any rule is live)

1. Give each rule a source and authority rating. No source = not shown to clients.
2. Run at least 3 known historical dates for each category, with expected results from the source.
3. Record conflicts between sources. Do not average them.
4. Only then change the status in §3 from P to S.

**Known gap:** the engine's panchang output has been checked against sample values. The muhurat rules have not been checked against test cases. Any client-facing muhurat result before §5 is complete should say "rules under verification".

---

## 6. Out of scope until a source is defined

- Car number and colour analysis (new or old)
- Name and date-of-birth number analysis for vehicles or companies
- Mobile number analysis (no code or data for it was found in the repo)
- Payment mode suggestion from chart (financial decision; needs a disclaimer and a source)
- Company and director analysis

---

## 7. Output format for a client result

- Ranked windows (date, time, the Layer A signals that pass).
- For each window: the rules used (with source ID) and the personal factors (Layer C), if any.
- A disclaimer: "This is an astrological consultation. Final decisions are yours."
- Windows with a failed Layer A filter are not shown.

---

## 8. Decisions needed from Naveen

1. Which classical texts are the authority for each category (Muhurta Chintamani edition and verse numbers, etc.)?
2. Is `DEEPAVALI_MAHURAT_VERIFICATION_AUDIT.md` available? If not, should the "+35 / +20" values be removed or re-sourced?
3. Should Amrit Kaal be defined by nakshatra and weekday, or kept as a pre-dawn window?
4. Is the "lucky number" and mobile analysis part of the product? If yes, provide the method and source.
5. Attach `Taranidhi-main3.zip` if it has rules not present in the repo.
