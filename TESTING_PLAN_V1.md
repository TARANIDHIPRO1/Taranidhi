# TESTING PLAN — TaraNidhi Muhurta Engine v1.0
**Date:** 2026-10-11 | **Time:** After 9:50 PM IST | **Test Case:** Naveen's Birth Chart

---

## IMPLEMENTATION SUMMARY

✅ **Framework Complete — 5 Activity Types Implemented**
- Vivah (Marriage) — P0 priority, Shukla-only hard block
- Griha Pravesh (Housewarming)
- Chikitsa (Medical/Surgery)
- Yatra (Travel)
- Vidya (Education)

✅ **Classical 221-Point Scoring Active**
- Chandrabala: 100 pts (primary in Shukla)
- Tarabala: 60 pts (primary in Krishna)
- Yoga: 32 pts
- Karana: 16 pts
- Vara: 8 pts
- Nakshatra: 4 pts
- Tithi: 1 pt
- **Total: 221 pts → normalized to 0-100 scale**

✅ **Birth Chart Matching**
- Chandra-Tara indicators displayed with birth chart (Kundali tab)
- Paksha-aware weight swap implemented
- Venus/Jupiter combust check for Vivah

✅ **Hard Blocks Implemented**
- Rahu Kaal (Gulika, Yamagandam)
- Vishti/Bhadra Karana
- Vyatipata/Vaidhriti Yoga
- Amavasya (Tithi 30)
- Krishna Paksha (Vivah only)

---

## TESTING CHECKLIST

### 1. LOAD BIRTH CHART (Kundali Tab)
```
Input: Naveen K. Rai
Date: 08/04/1973 (April 8, 1973)
Time: 11:45 AM IST
Place: Bhopal, MP (23.2599°N, 77.4126°E)
```

**Expected Output:**
- Lagna matches onlinejyotish.com (reference: 82.97° Lahiri)
- Moon Nakshatra identified (should match reference)
- Moon Rashi identified
- All 9 planets computed
- Ayanamsha: Lahiri (Chitrapaksha)

**Verification:**
- [ ] Lagna reads as "Gemini" or "Mithuna" (82.97° Lahiri)
- [ ] Moon position matches reference chart
- [ ] No NaN or calculation errors in console

---

### 2. VIVAH (MARRIAGE) MUHURTA SCAN
```
Activity: Vivah · Marriage (विवाह)
Scan: Next 30 days from today
Location: Bhopal (auto-filled from Kundali)
```

**Expected Behavior:**
- [ ] Only Shukla Paksha dates appear (Krishna Paksha filtered out with ⚠ block)
- [ ] Top 7 results scored 0-100
- [ ] Each result shows:
  - Date, Day, Vara
  - Tithi (e.g., "Tithi 3 Shukla")
  - Nakshatra (e.g., "Rohini")
  - Yoga
  - **Chandra-Tara indicators with ★ marks:**
    - 🌙 XX% ★ (Chandra primary in Shukla)
    - ⭐ YY% (Tara secondary)
  - ⏰ Best hora (preferred lord + time window)
  - 📍 Best choghadiya (good/best marked ✨)
  - ✓ Flags (green tags for auspicious)
  - ⚠ Warnings (yellow tags for cautions)

**Quality Checks:**
- [ ] Score≥80 = high-quality window
- [ ] Score 60-79 = acceptable
- [ ] Score<60 = avoid
- [ ] Choghadiya window shown (e.g., "Amrit" or "Labh")
- [ ] No Krishna Paksha dates in top 7

---

### 3. CHANDRABALA + TARABALA VERIFICATION
```
Birth Chart Loaded: YES ✓
Moon Rashi (Birth): [from Kundali]
Moon Nakshatra (Birth): [from Kundali]
```

**For each top result, verify:**

**Chandrabala (Weight 100, primary in Shukla):**
- Position calculated: Moon rashi (transit) from birth rashi
- Positions 1,3,6,7,10,11: Always good → 100% score
- Positions 2,5,9 in Shukla: Good → 100% (NOT in Krishna)
- Positions 4,8,12: Always bad → 0%
- Others: Neutral → 50%

**Tarabala (Weight 60, primary in Krishna):**
- Count: (Transit Nak - Birth Nak + 27) % 27 + 1
- Tara calculated: (Count - 1) % 9 + 1
- Good taras (2,4,6,8,9): ⭐ 100% + "✓"
- Bad taras (3,5,7): ⭐ 0% + "— adverse"
- Janma (1): ⭐ 50% + "(neutral)"

**Example Test Case:**
```
If Naveen's Moon: Mrigashira (Nak 4), Taurus (Rashi 2)

For a date with Moon in Cancer (Rashi 4), Pushya (Nak 7):
- Chandrabala: Position = (4-2+12)%12+1 = 3 → GOOD → 100%
- Tarabala: Count = (7-4+27)%27+1 = 4, Tara = (4-1)%9+1 = 4 → Kshema (GOOD) → 100%

Expected: 🌙 100% ⭐ 100% ✓ ✓ (both strong, score likely 90+)
```

---

### 4. VIVAH PAKSHA HARD BLOCK TEST
```
Activity: Vivah · Marriage
Manually select Krishna Paksha date (e.g., Tithi 20 Krishna)
```

**Expected:**
- [ ] Date completely filtered OUT of results (not in top 7)
- [ ] If found by extending scan: 🚫 Krishna Paksha warning displayed
- [ ] Score for that date: BLOCKED (blocked=true, score unavailable)

---

### 5. VENUS COMBUST CHECK (Vivah only)
```
Check if any result shows:
"🔥 Venus combust (X.X° from Sun) — Vivah blocked"
```

**Expected:**
- [ ] If Venus <7° from Sun: warning appears, date blocked
- [ ] If Venus safe: no warning, date included normally

**Verification:**
- [ ] At least 1 top result shows ZERO combust warnings
- [ ] Birth chart Moon position + Venus position visible in Kundali tab

---

### 6. OTHER ACTIVITY TYPES (Quick Scan)
```
Test each activity for correct scoring:
```

**Property (Property Registration/Purchase):**
- [ ] Auspicious days found
- [ ] No Vivah-specific blocks (Paksha NOT restricted)
- [ ] Can include Krishna Paksha

**Medical (Chikitsa):**
- [ ] Score reflects medical-favorable nakshatras (Ashwini, Pushya, Hasta)
- [ ] Results in top 7 for next 30 days

**Travel (Yatra):**
- [ ] Score reflects travel-favorable nakshatras (Punarvasu, Swati, Shravana, Dhanishta)
- [ ] Movable nakshatras preferred

**Education (Vidya):**
- [ ] Score reflects education-favorable nakshatras (Ashwini, Hasta, Pushya, Mrigashira)
- [ ] 5th house lord consideration (via Vara+Tithi+Nak)

---

### 7. REFERENCE VALIDATION
```
Cross-check against: onlinejyotish.com/panchang
Select same date from TaraNidhi results
Verify:
```

- [ ] Tithi matches (e.g., "Tithi 5 Shukla")
- [ ] Nakshatra matches
- [ ] Vara matches
- [ ] Yoga matches
- [ ] Moon Rashi matches

**Example:**
```
TaraNidhi Result: Oct 15, 2026
- Tithi: 7 Shukla
- Nakshatra: Rohini (Nak 3)
- Vara: Tuesday (1)
- Yoga: Auspicious
- Moon: Taurus (Rashi 2)

OnlineJyotish Oct 15, 2026:
- Should show IDENTICAL values above
```

---

### 8. UI/UX CHECKS

**Pro Muhurta Panel Description:**
- [ ] Shows: "Chandrabala (100) + Tarabala (60) + Yoga (32) + Karana (16) + Vara (8) + Nakshatra (4) + Tithi (1)"
- [ ] Mentions: "Paksha-aware weight swap"
- [ ] Cites: "Phalita Navaratna Samgraha, Muhurta Chintamani"
- [ ] OLD text removed: NO "Vara (25) + Tithi (25)" language

**Results Display:**
- [ ] Medal system: 🥇 🥈 🥉 for top 3, then #4, #5, etc.
- [ ] Color coding: Green (80+), Orange (60-79), Red (<60)
- [ ] Choghadiya window always shown: "📍 Best choghadiya: ..."
- [ ] Hora window always shown: "⏰ Best hora: ..."
- [ ] Birth-chart note: "✓ Birth chart loaded" (green) when Kundali loaded

---

### 9. EDGE CASES

**No Auspicious Dates:**
- [ ] Extend scan to 45 days
- [ ] If still no results: message "No auspicious dates found in 45 days"
- [ ] Suggestion: "Try a different activity"

**Ganda Moola Warning:**
- [ ] If a date has Ganda Moola nakshatra (0,8,9,17,18,26):
- [ ] ⚠ tag appears: "Nakshatra — Ganda Moola (verify before proceeding)"

**Amavasya Block:**
- [ ] Amavasya (Tithi 30) never appears in results
- [ ] If searched: ⚠ "Amāvasyā — absolute block for most Muhurta"

---

### 10. CONSOLE ERRORS
```
Open browser console (F12 → Console tab)
```

- [ ] NO JavaScript errors
- [ ] NO NaN in calculations
- [ ] NO "undefined" in data output
- [ ] Warnings acceptable: "astronomy-engine" load status

---

## SIGN-OFF MATRIX

| Component | Status | Verified | Notes |
|-----------|--------|----------|-------|
| Vivah Paksha Block | ✅ Code | [ ] Test | Krishna=filtered |
| Venus Combust Check | ✅ Code | [ ] Test | <7° = block |
| Chandrabala Calc | ✅ Code | [ ] Test | Matches ref chart |
| Tarabala Calc | ✅ Code | [ ] Test | Matches ref chart |
| Choghadiya Display | ✅ Code | [ ] Test | Shows best window |
| UI Description | ✅ Code | [ ] Test | 221-point updated |
| Activity Types (5) | ✅ Code | [ ] Test | All 5 in dropdown |
| Hard Blocks (5) | ✅ Code | [ ] Test | All filtering correctly |

---

## NEXT STEPS (After Testing)

1. **If all tests pass:** Mark v1.0 PRODUCTION READY
2. **If edge cases fail:** Debug + retest same cases
3. **If reference mismatch:** Compare formula vs classical text
4. **Phase 2 (Oct 12+):** Additional activities (Vivah only → add others)

---

## QUICK REFERENCE

**Commit:** 9edbce2
**File:** TaraNidhi_Panchang_Kundli.html
**Lines Modified:** +71 insertions, -3 deletions
**Test Harness:** Naveen's birth (1973-04-08, 11:45 IST, Bhopal)
**Reference:** onlinejyotish.com/panchang

---

**Testing starts:** Tonight after 9:50 PM IST
**Expected duration:** 30-45 minutes
**Ready:** YES ✅
