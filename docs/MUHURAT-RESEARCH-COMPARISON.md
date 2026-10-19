# Muhurat Research Comparison — repo rules vs modern panchang sites vs classical sources

**Date:** 19 Oct 2026 (IST). **Status:** Research notes. Not verified rules. Companion to `docs/MUHURAT-TECHNIQUE-SPEC.md`.

---

## 1. What was checked

| Source | Type | Citation to classical text? |
|---|---|---|
| `worker/src/lib/deepavaliMuhurta.ts` (remote main history) | Our code | Names `DEEPAVALI_MAHURAT_VERIFICATION_AUDIT.md`, which is not in the tree. |
| dekhopanchang.com, vehicle purchase page | Modern panchang site | **None.** Says "Vedic texts and Jyotish Shastras" with no title, chapter or verse. |
| drikpanchang.com, Diwali gold timings (2024 page) | Modern panchang site | **None.** Says "Vedic astrology" in general. |
| Web search: Muhurta Chintamani, Amrit Kaal, Guru Pushya | Secondary sites, blogs | No primary text quoted. |
| "Book smin" (named in your request) | — | **Not identified.** I could not match this name to any text. Please give the full title or attach the file. |

**Main finding:** none of the sources I could read cites a classical verse for the rules. A rule without a verse is only a tradition or a website's claim, not a classical source.

---

## 2. Vehicle purchase: our rules vs modern rules

| Rule | Our code (`deepavaliMuhurta.ts`) | dekhopanchang.com | Match? |
|---|---|---|---|
| Weekday | Wed, Thu, Fri (business only) | Wed and Fri best; avoid Sat and Tue | **No.** Our code has no vehicle weekday rule. |
| Tithi | "No Saptami" | Shukla paksha preferred; Dwitiya, Tritiya, Panchami, Saptami, Dashami, Trayodashi favourable | **Conflict.** Our code excludes Saptami. Dekho includes it. |
| Nakshatra | 10th lord strength only | Ashwini, Mrigashira, Pushya, Hasta, Anuradha, Revati best | **No.** Not in our code. |
| Avoid Rahu Kaal, Yamaganda, Gulika | Not listed for vehicles | Yes | **Missing in our code.** |
| Mercury hora | +20 points | No hora rule | **Not supported by the modern source.** Source needed. |
| 10th house / 10th lord | Yes | No | Chart factor; needs classical source. |

**Action:** the vehicle rule set in the spec needs its own sourced list. The current Mercury-hora bonus is not supported by any source I found.

---

## 3. Gold purchase: our rules vs modern rules

| Rule | Our code | Modern (drikpanchang) | Match? |
|---|---|---|---|
| Guru Pushya (Thu + Pushya) | +35 "paramount" | Yes, called "utmost importance" | Partly. The point value is ours, not theirs. |
| Ravi Pushya (Sun + Pushya) | Not in code | Yes | **Missing in our code.** |
| Pushya nakshatra alone | Not stated | Preferred | **Missing in our code.** |
| Dhanteras | Not in gold rules | Second key day, "as auspicious as Akshaya Tritiya" | **Missing in our code.** |
| Jupiter hora +20 | Yes | Not mentioned | Source needed. |

**Note on the drikpanchang page:** its timings are labelled "local time of Toga Village, Tuvalu". That is a wrong location. For our engine the location must be Bhopal (23.25 N, 77.40 E, Asia/Kolkata). Any time we show must be checked against that.

---

## 4. Amrit Kaal

- Our code defines Amrit Kaal as a pre-dawn window (96 to 48 minutes before sunrise) and caps the health score at 60% outside it.
- The search results describe "Amrit Kalam" as a daily panchang period. Those pages do not cite a classical source for the health rule.
- **Conclusion:** the health rule has no verified source. Its window definition is also unclear.

---

## 5. Classical texts: what is still needed

To move any rule from "pending" to "sourced", we need the primary text, not a website. Needed:

1. **Muhurta Chintamani** (Ram Daivagya), with chapter and verse for: vehicle, gold, property, griha pravesh, marriage, business.
2. **Muhurta Martanda** or **Dharmasindhu** if they cover the same categories.
3. The **"book smin"** you mentioned. I cannot identify it. Please give the full title and language, or attach the file.
4. For Guru Pushya and Ravi Pushya: the classical verse, if one exists, or a clear statement that it is a later tradition.

Without these, the rule table stays as "pending", and no client-facing output should say a rule is classical.

---

## 6. Next steps

1. Give the "book smin" title or file.
2. Attach the Muhurta Chintamani text (or the relevant chapters).
3. Decide: which rules we show as traditional belief and which as classical fact.
4. Then build the rule table from §2 and §3, with one source per row.
