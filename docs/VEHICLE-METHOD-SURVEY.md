# Vehicle Number & Colour — method survey (web and popular sources)

**Date:** 19 Oct 2026 (IST). **Status:** Survey of popular methods. **None of these methods cites a classical text, verse, or named authority.** Treat every rule below as unverified popular opinion.

---

## 1. Methods found

### 1a. Vehicle number vs DOB (numerology)

**Source:** [Astromedha, "My vehicle number and my chart"](https://astromedha.in/insights/vedic/my-vehicle-number-and-my-chart)

| Step | What the page does | Issue |
|---|---|---|
| Mulank | Birth day reduced to one digit | Standard numerology, not a classical Jyotish method. |
| Bhagyank | Full date reduced, year digits summed | Same. |
| Registration digits | Only the 4-digit series is used. State, district and letter codes are excluded. | Choice is arbitrary. The page admits Chaldean letter values give a different result. |
| Compatibility score | Digit in both sets = 90, one set = 65, neither = 40 | **No source for these numbers.** They are the page's own scale. |
| Ruling planet check | Natural friendship table as a "second opinion" | No source given. |
| Timing layer | Nakshatra, tithi, weekday, yoga, Vishti karana for vehicle day scoring | Similar in spirit to our engine. Our Tarabala and Chandrabala rules are verified (repo commit `7f2e654`). |
| Personal filters | Tara Bala and Chandra Bala from birth star and natal Moon | **This part matches our verified rules.** |

**Other number calculators** (not read in full): [Astromitra](https://www.astromitra.com/numerology/lucky-vehicle-number-calculator.php), [AstroSight](https://astrosight.ai/numerology/numerology-for-car-number-plate), [KundliGPT](https://kundligpt.com/numerology/vehicle-number-numerology/), [TotalCalcHub](https://totalcalchub.com/in/utilities/vehicle-lucky-number-calculator). These are tools. None shows a source.

### 1b. Colour by sign

**Source:** [Astrotalk, "Lucky colour for vehicle as per your zodiac sign"](https://astrotalk.com/astrology-blog/your-lucky-colour-for-vehicle-as-per-your-zodiac-sign/)

- The page says the colour depends on the **Moon sign and ruling planet**, and that the 4th house, Venus and Mars, nakshatra and muhurta may matter.
- But the 2026 list is given by **sun-sign** style (Aries, Taurus, etc.), and the page does not show how each sign's colours were derived from a planet.
- **Inconsistency:** the text says Moon sign, the table is by sign without a derivation.
- The table: Aries (Red, Maroon, Orange; unlucky Black), Taurus (White, Pink, Cream; unlucky Dark Red), and so on for all 12 signs.
- No classical text or author is cited (only the blog author's name).

---

## 2. What is usable and what is not

| Item | Usable? | Why |
|---|---|---|
| Tara Bala and Chandra Bala for a purchase day | **Yes** | Our rules are verified against Muhurta Chintamani (repo commit `7f2e654`). |
| Vehicle day timing (weekday, tithi, nakshatra) | **Partly** | Depends on which rules are sourced. Needs source per rule. |
| Number compatibility score (90/65/40) | **No** | Arbitrary scale, no source. |
| Mulank/bhagyank vs registration digits | **No** | Popular numerology, no classical source. |
| Colour by sign | **No** | No source, and the text is internally inconsistent. |

---

## 3. What this means for the request

- A verdict like "this number is not good for DOB X" is **not supported** by any source found. Our output must not state it as fact.
- If Naveen chooses to present numerology as the consultant's opinion, the method must be labelled "traditional/popular opinion, not verified", and the client must see that label.
- The timing layer (Tara Bala, Chandra Bala, day rules) can be used with verified rules. This covers the purchase-day part of the request, but not the number or colour part.

---

## 4. Next steps

1. Naveen decides: present numerology/colour as labelled opinion, or drop it.
2. If yes, pick one method and document its source and status.
3. For the timing layer, build the purchase-day check with Tara Bala and Chandra Bala (verified) and clearly sourced day rules.
