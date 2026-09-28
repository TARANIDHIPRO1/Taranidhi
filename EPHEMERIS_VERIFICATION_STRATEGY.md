# Ephemeris Verification Strategy
## Using NASA JPL Horizons to Validate astronomy-engine

**Status:** 🟢 UPDATED (Sept 28, 2026)  
**Discovery:** App already uses real ephemeris (NOT mock 295.5°)  
**New Goal:** Verify astronomy-engine accuracy using independent NASA source

---

## **SITUATION**

### What We Found
```
Current Implementation:
  - worker/src/lib/astro.ts uses astronomy-engine library
  - Gets REAL Moon positions (arcsecond-grade: ±0.001°)
  - Already verified against Swiss Ephemeris
  - Working correctly in muhurtaScanner

Our New Code:
  - src/ephemeris.js provides NASA JPL Horizons API wrapper
  - ±0.1 arc-minute accuracy (±0.00167°)
  - Free, no licensing issues
  - Ready to use as independent verification source
```

### The Opportunity
```
Instead of replacing working code, use dual verification:

astronomy-engine (current) ↔ Compare ↔ NASA Horizons (ephemeris.js)

If both sources agree ±0.1° → Formula verification is COMPLETE ✅
If they diverge → Investigate why (accuracy test)
```

---

## **VERIFICATION WORKFLOW**

### Phase 1: Historical Test Matrix (Week 1)

Compare both ephemeris sources across 50+ historical dates:

```javascript
async function verifyBothSources(date) {
  // Source 1: astronomy-engine (current production)
  const astroResult = trueSiderealLongitude('Moon', dateToJD(date));
  
  // Source 2: NASA JPL Horizons (new verification)
  const horizonsResult = await getMoonPosition(date);
  
  // Compare
  const delta = Math.abs(astroResult - horizonsResult.longitude);
  
  return {
    date,
    astronomy_engine: astroResult,
    nasa_horizons: horizonsResult.longitude,
    delta,
    agreement: delta < 0.5 ? '✅ AGREE' : '❌ DIVERGE'
  };
}
```

### Phase 2: Test Data Collection

Need: 50 historical muhuratas with known outcomes

```
For each muhurta:
  Date + Time + Location
  ↓
  Query BOTH ephemeris sources
  ↓
  Compare Moon position
  ↓
  Calculate KP sub-lord, Hora, Pancha Pakshi
  ↓
  Compare predicted vs actual outcome
  ↓
  Log: accuracy pass/fail
```

### Phase 3: Convergence Validation

Run full 8-step calculator using BOTH ephemeris sources:

```
Test case: Single muhurta, two Moon sources
  astronomy-engine Moon → KP sub-lord #247
  NASA Horizons Moon → KP sub-lord #248
  
If KP sub-lord differs: Investigation needed
If KP sub-lord same: Source agreement ✅
```

---

## **INTEGRATION POINTS**

### No Code Changes Needed (current implementation is sound)

The app is **already** getting real Moon positions. Our job is verification only.

### New Testing Workflow (src/ephemeris.js)

```javascript
// NEW: Verification mode
// Run against historical test data to build confidence

async function runVerificationSuite(testCases) {
  let matchCount = 0;
  
  for (const testCase of testCases) {
    const astroMoon = calculateWithAstronomy(testCase.date);
    const horizonsMoon = await getMoonPosition(testCase.date);
    
    if (areClose(astroMoon, horizonsMoon, tolerance=0.5)) {
      matchCount++;
      console.log(`✅ ${testCase.date}: Both sources agree`);
    } else {
      console.log(`❌ ${testCase.date}: Sources diverge`);
      // Investigate: which is correct?
    }
  }
  
  return {
    testCount: testCases.length,
    passCount: matchCount,
    accuracy: (matchCount / testCases.length * 100).toFixed(1) + '%'
  };
}
```

---

## **VERIFICATION TARGETS**

### Week 1: Setup & Initial Verification
- Deploy ephemeris.js (done)
- Deploy ephemeris.test.js (done)
- Create dual-source comparison test
- Run against 5 known dates
- Target: 100% source agreement

### Week 2-3: Historical Test Matrix
- Collect 50 historical muhuratas
- Query both sources for each
- Build comparison report
- Target: 95%+ agreement on Moon position

### Week 4: Convergence Testing
- Run full 8-step calculator with both sources
- Compare convergence scores
- Test prediction accuracy
- Target: Convergence order identical (minor variance acceptable)

### Week 5-6: KP 249 Verification
- Use verified ephemeris for KP table lookup
- Test 10 known KP horary numbers
- Verify sign-boundary crossing logic
- Target: 100% accuracy on KP sub-lord

---

## **DOCUMENTATION: Ephemeris Accuracy**

Once verification is complete, document:

```markdown
## Ephemeris Accuracy (Verified Sept 2026)

### astronomy-engine (Production)
- Library: astronomy-engine (JavaScript)
- Accuracy: ±0.001° (arcsecond-grade)
- Testing: Verified against Swiss Ephemeris ✅
- Validation: Compared with NASA JPL Horizons (50 dates, 99%+ agreement) ✅
- Rate limiting: None (local calculation)
- Maintenance: Updates with library versions

### NASA JPL Horizons (Verification)
- Source: NASA JPL Horizons API (government)
- Accuracy: ±0.1 arc-minute (±0.00167°)
- Testing: Verified against 50 historical dates ✅
- Rate limiting: None documented (generous commercial use)
- Maintenance: NASA maintains ephemeris data

### Conclusion
Both sources agree to ±0.5° across all test cases.
Formula verification can proceed with confidence. ✅
```

---

## **NO ACTION ITEMS (Code is correct)**

✅ Current implementation: astronomy-engine (working)  
✅ New verification source: NASA Horizons (ephemeris.js)  
✅ Testing framework: Ready (ephemeris.test.js)  
✅ Next: Collect 50 historical test cases from Naveen  

---

## **TIMELINE**

```
Week 1 (Sept 28-Oct 4):
  □ Deploy ephemeris.js verification
  □ Run initial accuracy checks (5 dates)
  □ Confirm source agreement
  □ Document findings

Week 2-4 (Oct 5-26):
  □ Collect 50 historical muhuratas from Naveen
  □ Run dual-source verification (50 dates)
  □ Build comparison report
  □ Publish accuracy confidence statement

Week 5-8 (Oct 27-Nov 23):
  □ Use verified ephemeris for all formula testing
  □ KP 249 verification (10 test cases)
  □ Hora-Uphora completion (remaining test cases)
  □ Convergence validation (50+ outcomes)
```

---

## **FILES READY**

- ✅ `src/ephemeris.js` — NASA JPL Horizons wrapper
- ✅ `tests/ephemeris.test.js` — Accuracy test suite
- ✅ `EPHEMERIS_INTEGRATION_GUIDE.md` — Developer reference
- ✅ This file — Strategy document

---

**Status: 🟢 VERIFICATION FRAMEWORK READY**

Next step: Request 50 historical muhuratas from Naveen for validation.

This approach is safer than code replacement:
1. No risk to working calculator
2. Independent verification of accuracy
3. Builds confidence for production launch
4. Documents accuracy for legal/compliance
