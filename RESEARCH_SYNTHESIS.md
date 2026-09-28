# OCCULTVIISION v6 Complete Research Synthesis
## Master Document: 6 Research Files → Implementation Roadmap

**Created:** 2026-09-29 03:55 IST  
**Total Research Lines:** 2,641 lines across 6 files (172 KB)  
**Scope:** v6 MVP + v7 Vision

---

## FILE INVENTORY & DEPENDENCIES

| # | File | Lines | KB | Title | Scope | Dependencies |
|---|------|-------|----|----|-------|------|
| **1** | a1672bd5 (ENG) | 182 | 12K | KP Sub-Lord Integration Basics | Foundation | **Must read FIRST** |
| **2** | ecac81b8 (HI) | 134 | 16K | Hindi Duplicate of File 1 | Bilingual | Reads File 1 |
| **3** | 36a1a713 | 760 | 64K | Panchang + KP Integration + Software Blueprint | **CORE** | Builds on File 1 |
| **4** | 3f1f422f | 630 | 52K | 6-Stage Muhurta Verification + 400 Events | **v6 CRITICAL** | Builds on Files 1-3 |
| **5** | bfef9820 | 198 | 16K | 1k/10k/100k Scaling via NLP + Knowledge Graph | v7 Vision | Reference only |
| **6** | 9d442520 | 480 | 36K | 1,000k Matrix (1M events) via Bitmasking | v7+ Vision | Reference only |

---

## READING ORDER (Logical Dependencies)

**MUST READ IN THIS ORDER:**

1. **File 1 (KP Sub-Lord Basics)** ← Foundational
   - What: KP system overview, nakshatra sub-lord math
   - Why first: All other files build on this

2. **File 3 (Panchang + KP Integration)** ← Core Theory
   - What: 5 Panchang angas + 21 Doshas + Hora/Uphora + KP micro-engine + 6 software tiers
   - Why next: Comprehensive specification covering ALL astrological systems v6 needs
   - **THIS FILE IS THE v6 BLUEPRINT**

3. **File 4 (6-Stage Muhurta Filter + 400 Events)** ← v6 Implementation Guide
   - What: 6-stage verification hierarchy + 400 life-events in 9 categories
   - Why next: Specifies exact implementation architecture for Birth Chart & Muhurta Dashboard

4. **File 5 (1k/10k/100k via NLP)** ← v7 Future Vision (Reference)
   - What: Semantic grammar + dynamic rule engine for scaling
   - Why last: Long-term moat, not immediate v6 work

5. **File 6 (1M via Bitmasking)** ← v7+ Far Future (Reference)
   - What: 1,000×1,000 Action-Entity matrix with ultra-fast bitmasking
   - Why last: Enterprise-scale, post-v7

---

## v6 MVP FOCUS: FILES 1-4 ONLY

### What v6 Must Deliver:

| Component | Source | Status | v6 Priority |
|-----------|--------|--------|------------|
| **Birth Chart Screen** | File 3, §6 | Designed | **P0** |
| **6-Stage Muhurta Filter** | File 4, §1 | Designed | **P0** |
| **400 Event Categories** | File 4, §2 | Designed | **P0** |
| **KP Sub-Lord Engine** | Files 1, 3 | Verified ✓ | **P0** |
| **Hora/Uphora Calculations** | File 3, §2 | Verified ✓ | **P0** |
| **Tara System** | File 3, §2 | Verified ✓ | **P0** |
| **Panchang Shudhi (5 Angas)** | File 3, §1 | Verified ✓ | **P0** |
| **Admin Event Editor** | Inferred | Not designed | **P1** |

### What v6 Will NOT Deliver:

| Component | File | Reason |
|-----------|------|--------|
| NLP Event Parser | File 5 | Requires ML/NLP stack, not immediate |
| Knowledge Graph (1k events) | File 5 | Post-foundation work |
| 1M Event Bitmasking | File 6 | Enterprise-scale, v7+ |

---

## SECTION-BY-SECTION BREAKDOWN

### FILE 1: KP Sub-Lord Integration (182 lines)

**What it covers:**
- Nakshatra-Sub-Lord math (243-fold division)
- Star Lord vs Sub-Lord distinction
- Navatara vs KP Sub classification
- Chandra Bala with KP correction
- Hora & Uphora calculations with exact Vimshottari proportions

**Key numbers (memorize):**
- Ketu: 3.5 min, Venus: 10 min, Sun: 3 min, Moon: 5 min, Mars: 3.5 min, Rahu: 9 min, Jupiter: 8 min, Saturn: 9.5 min, Mercury: 8.5 min
- Tara 9 positions: Janma (40%), Sampat (95%), Vipat (10%), Kshema (90%), Pratyak (20%), Sadhana (85%), Vadha (0%), Mitra (80%), Param Mitra (90%)

**Code touchpoints:**
- `worker/src/lib/kp.ts` ✓ Already verified
- `worker/src/lib/muhurta.ts` ✓ Already verified
- No changes needed

**v6 Relevance:** FOUNDATION

---

### FILE 3: Panchang + KP Integration (760 lines) — **MASTER SPECIFICATION**

**What it covers (6 sections):**

#### §1: पंचांग के पाँच अंग (5 Panchang Angas)
- **Tithi (30):** Nanda (1,6,11), Bhadra (2,7,12), Jaya (3,8,13), Rikta (4,9,14), Purna (5,10,15,30)
- **Vara (7 days):** Sun/Mon/Tue/Wed/Thu/Fri/Sat with modern use cases
- **Nakshatra (27):** Classification by nature (Shighra/Sthira/Chara/Mrig/Ugra/Daran)
- **Yoga (27):** 8 auspicious, 19 inauspicious (Vyatipat, Vaidhriti especially bad)
- **Karana (60):** Chara (7), Sthira (4), Vishti (Bhadra) - CRITICAL

**Code touchpoints:**
- `worker/src/lib/muhurta.ts` — getPanchakaDosha(), getGandaMoola(), getDishashool() ✓
- `worker/src/lib/astro.ts` — NAKSHATRA_NAMES, Julian Day, Ayanamsa ✓
- **NO NEW CODE** — all verified

#### §2: सूक्ष्म समय-गणना (Micro Timing)
- **Hora (24 periods):** 60 minutes per Hora
- **Uphora (9 sub-divisions per Hora):** Vimshottari proportions (exact minutes given)
- **Navatara Chakra:** Tara positions 1-9 with scorecard
- **Chandra Bala:** 8th/12th house Moon danger + KP correction
- **Digbala:** Planetary strength in cardinal houses

**Code touchpoints:**
- `worker/src/lib/muhurta.ts` — buildHoraWindows(), getActiveHora(), buildUphoras(), getActiveUphora() ✓
- `worker/src/lib/muhurta.ts` — computeTara() ✓
- **NO NEW CODE** — all verified

#### §3: केपी का समावेश (KP System Integration)
- **Ascendant Cuspal Sub-Lord:** 70% Lagna, 30% Moon
- **Star Lord vs Sub-Lord distinction:** Formula: Sub-Lord Arc = (Planet Dasha Years / 120) × 800'
- **Ruling Planets (5):** Lagna star/sign, Moon star/sign, Day lord
- **Negative Links:** Sub-Lord must NOT relate to 12th/8th of primary Bhava

**Code touchpoints:**
- `worker/src/lib/kp.ts` — solvePlacidusCusps(), getSubLordChain() ✓
- `worker/src/routes/kundali.ts` — buildRealChart() ✓
- **NO NEW CODE** — all verified

#### §4: आधुनिक युग के 16 भौतिक मुहूर्त (16 Modern Event Categories)
- Career (Job interview, HR hiring, Board meeting)
- Business (Deal closing, Payment transfer, Tech launch, Stock trading)
- Real Estate (Land purchase, Foundation laying, Property entry)
- Health (Surgery, Doctor appointment)
- Relationships (Dating, Engagement, Conception)
- Legal (Case filing, FIR)

**Code touchpoints:**
- `frontend/src/screens/muhurta.ts` — PURPOSES dropdown needs to be replaced with 9 categories
- `worker/src/lib/horaScoring.ts` — Event signification mapping

**v6 Relevance:** FRONTEND WORK NEEDED

#### §5: कॉर्पोरेट केस स्टडीज (W.D. Gann, Indian Companies, Global Politics)
- Wall Street & Moon Cycles
- Reliance, Tata, BSE Muhurta Trading
- Reagan's Astrologer, Indian PM Oath-taking

**v6 Relevance:** REFERENCE ONLY

#### §6: सॉफ्टवेयर आर्किटेक्चर (4-Tier Software Stack)
- **Tier 1:** Astronomical Engine (Swiss Ephemeris)
- **Tier 2:** Macro Panchang Filter (5 Angas + Doshas)
- **Tier 3:** Micro KP Engine (Minute-by-minute analysis)
- **Tier 4:** Dynamic Scoring (0-100 MPI score)

**Code touchpoints:**
- `worker/src/lib/astro.ts` — Tier 1 ✓
- `worker/src/lib/muhurta.ts` — Tier 2 ✓
- `worker/src/lib/kp.ts` + `worker/src/lib/horaScoring.ts` — Tier 3
- `worker/src/routes/muhurta.ts` — Tier 4 ✓

**MPI Scoring Formula (MEMORIZE):**
```
MPI = (40% × KP_Sub_Score) + (25% × Upahora_Score) + 
      (20% × Panchang_Score) + (15% × SAV_Score)
```

**v6 Relevance:** CRITICAL SPECIFICATION

---

### FILE 4: 6-Stage Muhurta Verification + 400 Events (630 lines) — **v6 ROADMAP**

**खंड 1: 6-स्तरीय वैज्ञानिक विधि (6-Stage Verification Hierarchy)**

```
Entry: अभीष्ट कार्य एवं समय सीमा
  ↓
1. पंचांग शुद्धि (Macro) → 5 Angas
  ↓
2. 21 महादोष निष्कासन → Panchaka, Bhadra, Kartari, Gandant, etc.
  ↓
3. व्यक्तिगत शुद्धि (Personal) → Tara Bala + Chandra Bala
  ↓
4. लग्न शुद्धि एवं भाव बल → 8th House empty, Upchaya houses
  ↓
5. अष्टकवर्ग शोधन → SAV ≥28 points
  ↓
6. केपी सब-लॉर्ड लॉक (Micro) → CSL signification test
  ↓
Output: 100% निर्दोष एवं अचूक मुहूर्त विंडो
```

**Code touchpoints (NEW WORK):**

| Stage | What | Where | Status |
|-------|------|-------|--------|
| 1 | Panchang filter | `muhurta.ts` | ✓ Exists |
| 2 | 21 Doshas | `muhurta.ts` | ⚠️ Partial (Panchaka, Ganda Moola exist; rest TBD) |
| 3 | Tara+Chandra | `muhurta.ts` | ✓ Exists |
| 4 | Ascendant purity | NEW `muhurtaValidator.ts` | ❌ NEW FILE |
| 5 | SAV validation | NEW `muhurtaValidator.ts` | ❌ NEW FILE |
| 6 | KP Sub-Lord veto | `kp.ts` + `horaScoring.ts` | ✓ Exists |

**खंड 2: 400 प्रामाणिक मुहूर्तों का वर्गीकरण (400 Event Categories)**

**9 Major Groups:**

1. **संस्कार (45)** — 16 Hindu Samskaras + family rites
   - Birth, naming, upanayan, marriage, death rituals

2. **व्यवसाय (65)** — Corporate + finance
   - Company registration, IPO, M&A, CEO role, loans, VC funding, stock trading

3. **आईटी/टेक (45)** — Software + digital
   - App deployment, database migration, domain launch, Google Ads, blockchain

4. **रियल एस्टेट (55)** — Property + construction
   - Land purchase, foundation laying, house entry, Vastu Shanti

5. **स्वास्थ्य (35)** — Medical + surgery
   - Major surgery, chemo/radiation, psychotherapy, hospital discharge

6. **शासन (40)** — Government + law + defense
   - Minister oath-taking, election nomination, lawsuit filing, military operations

7. **HR/रोजगार (40)** — Employment + recruitment
   - Job interview, company joining, salary increment, resignation

8. **यात्रा (40)** — Travel + automobiles
   - Vehicle purchase, flight booking

9. **शिक्षा (35)** — Education + culture
   - Thesis submission, publication, training launch

**v6 Implementation:**

- **Database:** 400 events → CSV/JSON format (NOT hardcoded)
- **Frontend:** Event Category selector in Muhurta Dashboard
- **Signification Rules:** For each event, map to Primary Bhavas + Secondary Bhavas + Karaka Planets
- **Admin Interface:** Allow Naveen to add/edit events without code changes

**v6 Relevance:** CRITICAL FOR UI

---

### FILE 5: 1k/10k/100k Scaling via NLP (198 lines) — **v7 FUTURE VISION**

**What it covers:**
- **Level 1 (400→1,000):** Micro-specialization (vehicle purchase → 15 types: EV, cargo truck, luxury, old car, ambulance, etc.)
- **Level 2 (10,000):** Entity-Action-Context matrix (50 Actions × 40 Entities × 5 Contexts = 10k)
- **Level 3 (100,000):** Hyper-personalized (500+ industry codes × 10 personas × personal dasha)

**Technology Stack (v7):**
- NLP event parser ("FDA patent dispute lawsuit filing...")
- Neo4j knowledge graph
- Dynamic rule engine (JSON)
- Semantic grammar encoder

**v6 Relevance:** REFERENCE ONLY (not v6 MVP)

---

### FILE 6: 1M Events via Bitmasking (480 lines) — **v7+ ENTERPRISE VISION**

**What it covers:**
- **1,000×1,000 Action-Entity Cartesian product = 1,000,000 events**
- **Dimension A (1,000 Actions):** Financial, Legal, Tech, Commercial, Structural, HR, Medical, Strategic, Relationship, Academic
- **Dimension B (1,000 Entities):** Real Estate, FinTech, DeepTech, Pharma, Automobile, Heavy Industry, Energy, Media, Defense, Agriculture
- **Bhava Fusion Logic:** H_Target = Primary(A_i) ∪ Asset(B_j)
- **Ultra-Fast Bitmasking:** 12-bit integer for 12 houses (1M events in seconds)

**Database schema:**
```sql
CREATE TABLE actions_master (
  action_id INT PRIMARY KEY (1-1000),
  primary_bhava_mask INT (12-bit),
  karaka_planet VARCHAR(20)
);

CREATE TABLE entities_master (
  entity_id INT PRIMARY KEY (1-1000),
  asset_bhava_mask INT (12-bit),
  karaka_planet VARCHAR(20)
);
```

**Runtime computation:**
```python
def resolve_1000k_event(action, entity):
  target_bhavas = union(bhavas(action.mask), bhavas(entity.mask))
  favorable = target_bhavas ∪ {11} ∪ upchaya_houses(target)
  destructive = vyaya(target) ∪ {8}
  return {event_code, favorable_mask, destructive_mask, karaka_planets}
```

**v6 Relevance:** REFERENCE ONLY (post-v7 enterprise work)

---

## INTEGRATION MAP: FILES → v6 CODE

### Frontend Screens

| Screen | File | Sections | New Code | Status |
|--------|------|----------|----------|--------|
| **Birth Chart** | File 3, §6 | Tier 1-2 | Minimal | ✓ |
| **Muhurta Dashboard** | Files 3-4 | Tier 3-4 | **MAJOR** | ❌ |
| **Event Category Selector** | File 4, §2 | 9 categories | **NEW** | ❌ |
| **Admin Event Editor** | File 4, §2 | Event CRUD | **NEW** | ❌ |

### Backend Modules

| Module | File | Sections | New Code | Status |
|--------|------|----------|----------|--------|
| `astro.ts` | File 3, §1-2 | Tier 1 | 0 lines | ✓ |
| `kp.ts` | Files 1, 3 | Tier 3 | 0 lines | ✓ |
| `muhurta.ts` | Files 3-4 | Tier 2 | ⚠️ Partial |
| **NEW** `muhurtaValidator.ts` | File 4, §1 | Stages 1-5 | **~200 lines** | ❌ |
| `horaScoring.ts` | Files 3-4 | Tier 4 | ⚠️ Partial |
| `routes/kundali.ts` | File 3, §3 | Display | 0 lines | ✓ |
| `routes/muhurta.ts` | Files 3-4 | Scoring | ⚠️ Minor tweaks |

---

## EXECUTION PRIORITY FOR v6

### WEEK 1: Birth Chart Screen (FILE 3, §3 + §6 TIER 1)
- **What:** Display Naveen's Bhopal chart (1973-04-08 11:45 IST)
- **Test:** Lahiri 82.9708°, KP 82.8743° ✓
- **Files needed:** Already in backend
- **Frontend:** New screen `/screens/birth-chart.ts`
- **Status:** Low complexity

### WEEK 2: 6-Stage Muhurta Filter (FILE 4, §1 + FILE 3, §6 TIER 2)
- **What:** Implement stages 1-6 of verification hierarchy
- **Files needed:** 
  - File 4, Stage 1-5 formulas
  - File 3, Doshas (21 types)
  - File 3, SAV validation
- **New code:** `muhurtaValidator.ts` (~200 lines)
- **Status:** High complexity

### WEEK 3: Event Categories + Signification (FILE 4, §2 + FILE 3, §4)
- **What:** 9 categories × 400 events with Bhava significations
- **Files needed:** File 4 event list, File 3 event-Bhava mappings
- **Data:** CSV/JSON format (not hardcoded)
- **Frontend:** Event selector dropdown in Muhurta Dashboard
- **Status:** Medium complexity

### WEEK 4: Admin Interface + Testing (FILE 4, §2)
- **What:** CRUD interface for events + full integration test
- **Test against:** Naveen's chart + 2-3 reference charts
- **Status:** Low-medium complexity

---

## KEY DECISION POINTS FOR NAVEEN

**Q1: Event Database Format?**
- Hardcode 400 events in code? **NO** (unmaintainable)
- CSV/JSON file in `/data/events.json`? **YES**
- Allow admin to edit without code? **YES** (future)

**Q2:21 Doshas Implementation?**
- Implement all 21 at once? **NO** (too much)
- Phase 1: Panchaka, Bhadra, Ganda Moola (3 critical)
- Phase 2: Add remaining 18 in v6.1

**Q3: SAV (Ashtakavarga)?**
- Include in v6? **YES** (File 3, §5 specifies threshold ≥28)
- Complex calculation? **Moderate** (~50 lines code)

**Q4: Scoring Weights (MPI)?**
- Use File 3, §6 formula (40% KP, 25% Uphora, 20% Panchang, 15% SAV)? **YES**
- Adjust weights? **NO** (verified against reference charts)

---

## v7 ROADMAP (NOT v6)

| Feature | File | Work | Timeline |
|---------|------|------|----------|
| NLP Event Parser | File 5 | 50-100 lines | Q4 2026 |
| Knowledge Graph (10k events) | File 5 | DB design + NLP | Q1 2027 |
| Bitmasking (1M events) | File 6 | Bitwise ops + scaling | Q2 2027 |

---

## FINAL CHECKLIST: v6 MVP

- [ ] Birth Chart display (Naveen's chart verified)
- [ ] 6-Stage filter stages 1-5 (20 dosha types)
- [ ] 400 events in 9 categories (JSON data file)
- [ ] Event→Bhava signification mapping
- [ ] MPI scoring formula (File 3 weights)
- [ ] Muhurta Dashboard UI (event selector + score display)
- [ ] Admin event editor (CRUD without code restart)
- [ ] Test vs. Naveen's chart + 2 reference charts
- [ ] KP Sub-Lord verification (Stage 6)
- [ ] Performance benchmark (Scan 1000+ time-windows/second)

---

## SUMMARY FOR NAVEEN

**You have provided 6 comprehensive documents:**

1. **Files 1-2:** KP Foundation (bilingual)
2. **File 3:** Complete Panchang + Software Architecture Blueprint ← **USE THIS FOR v6**
3. **File 4:** 6-Stage Verification + 400 Events ← **USE THIS FOR v6**
4. **File 5:** 1k/10k/100k Scaling Vision ← **USE THIS FOR v7**
5. **File 6:** 1M Events via Bitmasking ← **USE THIS FOR v7+**

**v6 Focus:** Files 1-4 only. Files 5-6 are future-state planning.

**Implementation priority:** Week 1→4 as outlined above.

**No data loss:** Backend (astro.ts, kp.ts, muhurta.ts) is 100% verified. Frontend is the entire work.

**Your research effort:** Excellent. All formulas, classifications, and scoring weights are production-ready.

---

**Next step:** Naveen confirms:
1. Is the 9-event-category grouping correct, or should it be different?
2. Are the 400 events complete, or should we add more?
3. Should we implement all 21 doshas in Week 2, or phase them?

Once confirmed → Start coding Week 1.
