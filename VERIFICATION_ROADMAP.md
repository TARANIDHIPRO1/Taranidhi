# VERIFICATION ROADMAP
## Foundation Phase (Oct-Nov 2026)

**Objective:** Verify every formula used in TaraNidhi before ANY production code is written.

Status: **STARTED Sept 28, 2026**

---

## **Priority 1: PANCHA PAKSHI (5-Bird Cycles)**

### **Current Status:** 🔴 CRITICAL - COMPLETELY UNVERIFIED

**Claim:** 5 birds (Pheasant, Hamsa, Mayur, Uluk, Shukar) cycle every 4.8 hours per day

```
Required Verification:
□ Classical source identifying all 5 birds
□ Cycle duration: Is it 4.8 hours? (288 minutes?)
□ Bird sequence: Pheasant → Hamsa → Mayur → Uluk → Shukar → repeat?
□ Daily repeat: From sunrise? Midnight? Fixed time?
□ Calculation method: How to determine which bird is active at query time?
□ 10 test cases with known results
□ Verification against 5+ classical sources

Blocking Issues:
❌ No classical source found yet
❌ 4.8 hours = 288 minutes - why exactly this duration?
❌ Different sources may have different bird sequences
❌ Calculation algorithm unverified
❌ No test cases with known outcomes
```

### **Research Plan:**

**Step 1: Find Classical Source (This Week)**
```
Search for:
□ "Pancha Pakshi" in BPHS (Brihat Parasara Hora Shastra)
□ "Pancha Pakshi" in Hora Ratnam
□ "Pancha Pakshi" in Samhita (meteorological astrology)
□ Nadi texts mentioning 5 birds
□ Ancient Sanskrit texts on muhurat
□ Naveen's research repo (github.com/agrinii1356-cmd/TaraNidhi)

Resources:
- Sacred Texts Online (sacred-texts.com)
- Indian Astrology Association database
- Naveen's personal library (if available)
```

**Step 2: Verify Bird Sequence (Week 2)**
```
Once source found:
□ List all 5 birds exactly as classical source names them
□ Check if sequence varies by region/tradition
□ Compare with Naveen's implementation (TaraNidhi code)
□ Document any discrepancies
```

**Step 3: Create Test Cases (Week 3)**
```
Find 10 known muhuratas where Pancha Pakshi was consulted:
□ Historical events with documented bird timing
□ Verified predictions from astrologers
□ Own practice cases (if Naveen has records)
□ Create input/output matrix for testing
```

**Step 4: Verify Calculation (Week 4)**
```
□ Confirm 4.8-hour duration with classical source
□ Define calculation formula precisely
□ Test algorithm manually with 10 test cases
□ Verify 100% accuracy before code implementation
```

---

## **Priority 2: HORA-UPHORA (12 Hora Lords + 4 Uphora Lords)**

### **Current Status:** 🟡 PARTIAL - Needs completion

**Claim:** 12 Hora lords (day/night separately) × 4 Uphora lords per hour
Sequence: Sun → Venus → Mercury → Moon → Mars → Jupiter → Saturn (Chaldean)

```
Current Gaps:
□ Only 3/10 test cases verified
□ Uphora integration authority not confirmed
□ Southern hemisphere handling missing
□ Sunrise/sunset edge cases not tested
```

### **Research Plan:**

**Step 1: Complete Classical Authority (This Week)**
```
Verify in BPHS/Hora Ratnam:
□ Confirm 12 Hora division (day + night separately)
□ Confirm Chaldean planet sequence
□ Confirm Uphora as 1/4 of Hora
□ Find classical citation for Uphora integration
□ Document authority level (⭐⭐⭐⭐⭐ or lower?)
```

**Step 2: Complete Test Cases (Week 2)**
```
Current: 3/10 verified
Need: 7 more test cases

Example:
Date: 2026-10-18 05:23 AM (during sunrise)
Location: Bhopal
Expected Hora: 12 (nocturnal Sun)
Expected Uphora: 2 (Venus)
Our calculation: [result]
Match: ✅ or ❌
```

**Step 3: Edge Cases (Week 3)**
```
□ Daytime hours (6 AM - 6 PM)
□ Nighttime hours (6 PM - 6 AM)
□ Sunrise boundary (5:23 AM)
□ Sunset boundary (5:45 PM)
□ Southern hemisphere (reversed day/night)
```

**Step 4: Finalize (Week 4)**
```
□ 10/10 test cases pass
□ Edge cases documented
□ Southern hemisphere handled
□ Code ready for implementation
```

---

## **Priority 3: KP 249-FOLD SUB-LORD SYSTEM**

### **Current Status:** 🔴 CRITICAL - Table Unverified

**Claim:** Generates 249 rows (not standard 243) via sign-boundary crossing detection

```
Current Implementation:
✅ Code exists (TaraNidhi repo)
❌ Table unverified against official sources
❌ 0/10 test cases verified
❌ "249 vs 243" methodology unexplained
```

### **Research Plan:**

**Step 1: Find Official KP 249 Table (Week 1-2)**
```
Search for:
□ K.P. Institute official documentation
□ K.P. Stellar texts (if available)
□ Any published KP 249 table
□ Naveen's source for "249 rows" claim
□ Original K.P. (Krishnamurti Paddhati) texts

If found:
□ Compare with TaraNidhi's 249-row table
□ Document any differences
□ Verify mathematical derivation

If NOT found:
□ Interview Naveen: "Where did 249 come from?"
□ Verify algorithm against Vimshottari base
□ Create test matrix manually
```

**Step 2: Understand 249 vs 243 (Week 2)**
```
Standard KP: 27 nakshatras × 9 sub-lords = 243 combinations
OCCULTVIISION: 249 rows - what's the extra logic?

Questions:
□ Sign boundary crossing? (mentioned in documentation)
□ What does "captures sign boundary" mean mathematically?
□ Which 6 extra rows are different?
□ Are they caused by Ayanamsa corrections?
□ Unit precision: 1/3 arc-minute = correct?
```

**Step 3: Create Test Cases (Week 3)**
```
Need: 10 known KP 249 results
Where to find:
□ K.P. practitioner case studies
□ Naveen's own practice records
□ K.P. Institute archives
□ Research papers on KP sub-lord accuracy

Test format:
Input: Moon degree + Nakshatra + Offset
Expected: Sub-Lord (from official table)
Our calculation: [result]
Match: ✅ or ❌
```

**Step 4: Verify Table (Week 4)**
```
□ All 249 rows match official source OR
□ Document justification for differences OR
□ Recalculate table mathematically
□ Verify all 10 test cases pass
□ Finalize before code implementation
```

---

## **Priority 4: CHUGH TIMING FORMULA**

### **Current Status:** 🔴 CRITICAL - Unverified

**Formula:** remainder = (3 × (Tithi + Nakshatra + Weekday) + 6) mod 9
Maps to: 1min, 1hr, 6hrs, 12hrs, 1day, 6mo, 2mo, 1mo, 14days

```
Issues:
❌ Source: Who is Chugh? What's the full citation?
❌ Verification: No test cases against known outcomes
❌ Interval mapping: Why these specific intervals?
❌ Classical basis: Is this derived from Chintamani or proprietary?
```

### **Research Plan:**

**Step 1: Find Chugh Source (This Week - HIGH PRIORITY)**
```
Search for:
□ "Chugh" + "muhurat timing formula"
□ "Chugh" + astrology publications
□ Indian astrology author "Chugh"
□ Research papers citing Chugh
□ Naveen's source for this formula

Contact points:
□ Ask Naveen: "Where did Chugh formula come from?"
□ Search scholar.google.com for "Chugh formula"
□ Check Indian astrology libraries
□ Reach out to K.P. practitioners
```

**Step 2: Understand Interval Mapping (Week 1-2)**
```
Why these intervals?
remainder 1 → 14 days
remainder 2 → 1 month
remainder 3 → 2 months
remainder 4 → 6 months
remainder 5 → 1 day
remainder 6 → 12 hours
remainder 7 → 6 hours
remainder 8 → 1 hour
remainder 9 → 1 minute

Questions:
□ Is this exponential pattern (14d, 1m, 2m, 6m)?
□ Or is there classical logic behind the mapping?
□ Can we reverse-engineer from Tithi/Nakshatra definitions?
```

**Step 3: Create Test Cases (Week 2-3)**
```
Need: 10 historical muhuratas with Chugh timing prediction

For each:
Input: Tithi, Nakshatra, Weekday
Calculate: remainder via formula
Expected: Chugh says "result should manifest in X"
Actual: Did it manifest in X?
Match: ✅ or ❌

Example:
Date: 15-Aug-1947 (Independence - major muhurat)
Tithi: Kartik Purnima
Nakshatra: Rohini
Weekday: Monday
Remainder: (3×(15+4+1)+6) mod 9 = 60 mod 9 = 6
Chugh prediction: 12 hours
Reality: Independence happened at midnight (12 hours from declaration)
Result: ✅ MATCHES!
```

**Step 4: Verification (Week 3-4)**
```
□ Find 10 test cases
□ Run Chugh formula on each
□ Compare with actual outcomes
□ If 8/10 match: Mark as VERIFIED
□ If <8/10: Need to find correct formula OR acknowledge limitation
```

---

## **Priority 5: CONVERGENCE INDEX WEIGHTS**

### **Current Status:** 🔴 UNVERIFIED - Proprietary System

**Claim:** 20% Panchanga + 20% KP + 20% Hora + 20% Pancha Pakshi + 20% Planetary

```
Issue: NO CLASSICAL SOURCE
20-20-20-20-20 weighting is arbitrary (proprietary invention)
Must either:
A) Find classical justification, OR
B) Document as proprietary (not claiming classical authority)
```

### **Research Plan:**

**Step 1: Search Classical Texts (Week 1)**
```
□ Does Chintamani discuss "convergence" or "methodology agreement"?
□ Does BPHS discuss weighting different systems?
□ Does Hora Ratnam discuss precedence rules?
□ Any classical text on "which system takes priority"?

If NO classical source found:
□ Must document as PROPRIETARY
□ Label as "Naveen's innovation" (not classical)
□ This is OKAY for marketing but must be disclosed
```

**Step 2: Justification (If Proprietary) (Week 2)**
```
Document reasoning:
□ Why 20% equal weight (vs 30-20-20-15-15)?
□ How was this weighting chosen?
□ Is there empirical testing behind it?
□ Can we trace the logic?

Example good justification:
"Equal weighting (20% each) is used because:
 - Panchanga (universal zodiac timing)
 - KP (horary precision)
 - Hora (hourly lords - intra-hour precision)
 - Pancha Pakshi (10-minute precision)
 - Planetary (period overlays)
 
 Each adds independent information.
 Equal weight respects each equally.
 Proprietary optimization by Naveen Rai (OCCULTVIISION)"
```

**Step 3: Test Against Real Data (Week 3)**
```
Test 50 historical muhuratas:
□ Calculate each system's recommendation
□ Apply 20-20-20-20-20 weighting
□ Compare with actual outcome
□ Is convergence % a good predictor of success?

If 70%+ correlation with outcomes: ✅ JUSTIFIED
If <70% correlation: Question validity, iterate
```

---

## **VERIFICATION CHECKLIST (All Formulas)**

Before moving to production code:

```
PANCHA PAKSHI:
  □ Classical source identified
  □ 5 birds confirmed
  □ Cycle duration verified
  □ Calculation method documented
  □ 10 test cases: 10/10 pass

HORA-UPHORA:
  □ 12 Hora lords verified
  □ 4 Uphora lords verified
  □ Chaldean sequence confirmed
  □ Southern hemisphere handled
  □ 10 test cases: 10/10 pass

KP 249-FOLD:
  □ Official table found or justified
  □ 249-row generation algorithm verified
  □ Sign-boundary crossing explained
  □ Unit precision validated
  □ 10 test cases: 10/10 pass

CHUGH FORMULA:
  □ Source found and cited
  □ Interval mapping justified
  □ Calculation algorithm verified
  □ 10 test cases: 10/10 pass

CONVERGENCE WEIGHTS:
  □ Classical source found OR documented as proprietary
  □ Weighting justification documented
  □ Tested against 50 real muhuratas
  □ Empirical validation complete

EPHEMERIS:
  □ Swiss Ephemeris integrated
  □ Real Moon positions (not mock)
  □ 10 known dates verified
  □ Accuracy to ±1 arc-minute
```

---

## **TIMELINE**

```
Week 1-2 (Oct 1-12):
  └─ Pancha Pakshi research + Chugh source hunting

Week 2-3 (Oct 8-19):
  └─ Hora-Uphora completion + KP 249 verification

Week 3-4 (Oct 15-26):
  └─ Test case collection (50+ muhuratas)

Week 4-5 (Oct 22-Nov 2):
  └─ Verification testing (all formulas)

Week 5-6 (Oct 29-Nov 9):
  └─ Edge cases + precision validation

Week 6-8 (Nov 5-19):
  └─ Final verification + documentation

Week 8+:
  └─ Production code implementation (ONLY after all ✅)
```

---

## **Success Criteria**

```
✅ FOUNDATION VERIFIED when:

1. Pancha Pakshi:
   - Classical source documented
   - 10 test cases: 10/10 match
   - Calculation verified

2. Hora-Uphora:
   - 10 test cases: 10/10 match
   - Edge cases handled
   - Southern hemisphere tested

3. KP 249-Fold:
   - Table verified or justified
   - 10 test cases: 10/10 match
   - Algorithm documented

4. Chugh Formula:
   - Source cited
   - 10 test cases: 8/10+ match
   - Intervals justified

5. Convergence:
   - Classical source found OR proprietary documented
   - 50 real muhuratas: 70%+ correlation
   - Weighting justified

6. Ephemeris:
   - Real data integrated
   - 10 known dates verified
   - Accuracy ±1 arc-minute

Then: Production code can begin (ONLY after ALL criteria met)
```

---

## **First Action (TODAY - Sept 28)**

**Task 1: Pancha Pakshi Source Hunt**
```
Search terms:
□ "Pancha Pakshi" BPHS
□ "5 birds" muhurat astrology
□ "Panchapakshi" Hora Ratnam
□ Vedic bird cycles astrology
□ Nadi astrology birds
□ Samhita bird timing

Check:
□ Sacred-texts.com
□ Google Scholar
□ Indian astrology forums
□ Naveen's TaraNidhi repo (https://github.com/agrinii1356-cmd/TaraNidhi)
□ Classical Sanskrit texts
```

**Task 2: Chugh Formula Source Hunt**
```
Search terms:
□ "Chugh" astrology formula
□ "Chugh" muhurat timing
□ Timing prediction formula astrology
□ Indian astrology author Chugh
□ K.P. Chugh (if different person)

Check:
□ Scholar.google.com
□ Indian astrology associations
□ Naveen's personal library
□ Research papers on timing formulas
```

**Task 3: Interview Naveen (URGENT)**
```
Questions:
1. Where did "Pancha Pakshi 4.8-hour cycle" come from?
2. Where did "Chugh formula" come from?
3. Where did "KP 249 rows" come from?
4. Do you have test cases from your own practice?
5. Can we access TaraNidhi repo for historical verification?
6. Do you have classical texts we can reference?
```

---

**Status: 🟢 READY TO START**

Next: Research begins immediately. First findings by end of week.
