# TaraNidhi Mahurat System — Architecture (Festival Purchase Muhurat)

**Date:** 19 Oct 2026 (IST). **Status:** Draft v0.2 for Naveen's review. Builds on `MUHURAT-TECHNIQUE-SPEC.md`, `MUHURAT-RESEARCH-COMPARISON.md`, `CAR-PURCHASE-RESEARCH.md`, and `VEHICLE-METHOD-SURVEY.md`.

**Golden rule:** every suggestion carries a status tag. No rule is shown as "classical" unless it has a verse citation. No verdict about a name, DOB, number or colour is shown as fact.

---

## 1. Status tags (used everywhere)

| Tag | Meaning | Can it reach a client? |
|---|---|---|
| **V — Verified** | Computed by engine, or a rule checked against a named classical text (e.g. Tara Bala, Chandra Bala vs Muhurta Chintamani, commit `7f2e654`) | Yes, with source |
| **F — Factual** | Arithmetic or public fact (loan EMI, fee, registration process), with source and date | Yes, with source and date |
| **T — Traditional** | Popular or web-sourced rule with no verse (e.g. Guru Pushya, Wed/Fri for vehicles) | Only labelled "traditional, not classical" |
| **P — Pending** | No source yet | No. Internal only |
| **O — Opinion** | Consultant's method (numerology, colour by sign). Needs Naveen's approval | Only labelled "consultant's opinion, not verified" |

---

## 2. System components

```
Client form (web)  ──►  /muhurta/* API (Worker)  ──►  Engine (Layer A: computed)
                              │                       Rule store (Layer B: tagged)
                              │                       Personal (Layer C: chart)
                              ▼                       Finance calc (F: arithmetic)
                       Output composer  ──►  Result card (ranked windows + tags + disclaimer)
```

| Component | Current state | Needed |
|---|---|---|
| Engine (tithi, nakshatra, yoga, karana, sunrise, Rahu Kaal, Hora) | Built in frontend `tn-panchang-engine.js` and worker | Confirm Bhopal coordinates and Asia/Kolkata everywhere. Do not trust third-party timings (drikpanchang shows Tuvalu). |
| Tara Bala, Chandra Bala | Verified (repo `7f2e654`) | Expose as a function for any date |
| Rule store | Does not exist as a data file | Build `rules/*.json`: id, category, condition, status, source, date verified |
| Personal layer | Kundali engine exists | Use only for verified factors |
| Finance calculator | Not built | Loan EMI, total interest, down payment (arithmetic only) |
| Output composer | Not built | Renders windows, tags, sources, disclaimer |
| Vehicle/number/colour module | `vehicle.html` enquiry page built (no analysis) | Stays as enquiry until Naveen decides §6 |

---

## 3. Category catalogue

Each category lists: when (engine filter), how (steps), status of each rule, and what the client sees.

### 3.1 Vehicle — used car (second-hand)

- **When:** delivery or transfer day, after Tara Bala and Chandra Bala pass (V). Weekday, tithi and nakshatra rules are T (web sources only).
- **How:**
  1. Check RC transfer status with the seller. Confirm the transfer route.
  2. Register or transfer at the RTO on the chosen day (number rule: see §6, status P).
  3. Take delivery in a daytime window that passes Rahu Kaal, Yamaganda and Gulika (T).
- **Client sees:** ranked days with V and T tags. Number and colour not included unless Naveen decides.

### 3.2 Vehicle — new car

- **When:** same filters as 3.1. Add: the dealer's delivery slot.
- **How:**
  1. Book choice number (if wanted) through e-auction (F, MP source: ACKO page, date check needed).
  2. Pick delivery day from the ranked windows.
  3. Insurance and registration in the same week.
- **Client sees:** windows with V/T tags. Number suggestion only as F (process and fee), not as a verdict.

### 3.3 Property — new (flat, plot, builder)

- **When:** booking or registration day. Engine filters: avoid Amavasya, Rahu Kaal, Yamaganda, Gulika (T).
- **How:** Book the agreement on the chosen day. Registration date is set by the sub-registrar, so only a window can be suggested, not a fixed day.
- **Status:** Rules T. Property thresholds in old chat ("Property 80+") are placeholders (P), not shown.

### 3.4 Property — used (resale)

- **When:** registration day. Same engine filters as 3.3.
- **How:** Verify title and encumbrance first (legal, not astrological). Then register on the chosen window if the sub-registrar allows.
- **Status:** Rules T. Title check is a legal step, outside astrology.

### 3.5 Gold / jewellery

- **When:** Dhanteras and Diwali period, plus Guru Pushya or Ravi Pushya (T). Avoid Rahu Kaal, Yamaganda, Gulika.
- **How:** Buy in daytime window. Keep GST invoice and purchase record.
- **Status:** Guru Pushya +35 bonus in code is P (no audit file). Drikpanchang page is T.

### 3.6 Other goods (business start, electronics, household)

- **When:** Business: Wed, Thu, Fri (T). Household and electronics: no sourced rule. Use only the engine's Rahu Kaal filter (V).
- **Status:** P for everything except engine filters.

---

## 4. Payment: loan or upfront

- Factual only (F). The client supplies price, down payment, interest rate and tenure. The system computes monthly EMI, total interest and total outgo for both options.
- No chart-based recommendation. Chart-based financial advice is not supported (P).
- Show the comparison table. Naveen or the client decides.

---

## 5. Output format (client result)

For each category:
1. Ranked windows (date, time, which V/T filters pass).
2. Tag and source for each rule shown.
3. Factual section (loan vs upfront numbers, if asked).
4. Disclaimer: "This is an astrological consultation. The final decision is yours. Legal and financial steps follow official rules."

Rules tagged P are not shown.

---

## 6. Decisions needed from Naveen

1. **Number analysis (vehicle):** keep as enquiry only, or show labelled consultant's opinion (O)?
2. **Colour analysis:** same question.
3. **Traditional rules (T):** show them labelled "traditional, not classical", or hide until verified?
4. **Diwali 2026 dates:** engine computes these. Confirm the festival list (Dhanteras, Diwali, Govardhan, Bhai Dooj, etc.) and whether to include Akshaya Tritiya.
5. **Gold bonus values (+35, +20) in code:** remove, or re-source?
6. **Privacy:** the enquiry form collects DOB, mobile, company and director details. Add a consent line and retention policy before launch.

---

## 7. Build plan (after decisions)

1. Rule store: `rules/*.json` with tags and sources. (Blocked on §6.3)
2. Output composer and result card UI.
3. Finance calculator (arithmetic only).
4. Engine-based windows per category, using verified Tara/Chandra Bala.
5. Verification run: 3 known historical dates per category (per FACT_CHECK_ENGINE).
6. Launch with only V and F rules visible. T rules added after labelling is approved.

---

## 8. Known gaps (be upfront)

- No verse-level citations exist yet for vehicle, property, or gold rules.
- `deepavaliMuhurta.ts` cites an audit file that is not in the repo.
- Drikpanchang timings use the wrong location (Tuvalu).
- Number and colour methods found online have no classical source (see `VEHICLE-METHOD-SURVEY.md`).
