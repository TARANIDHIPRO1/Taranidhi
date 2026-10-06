# TaraNidhi v5 — Dual Muhurta System Specification

**Status:** Phase 1 (Data Preparation) — Started 2026-10-07  
**Timeline:** 7 weeks total (Phase 1: 1 week | Phase 2: 3 weeks | Phase 3: 2 weeks | Phase 4: 1 week)  
**Scope:** Complete Traditional + Modern Muhurta system with all Yogas and classical sources

---

## PRODUCT ARCHITECTURE

Two completely separate pages:

### PAGE 1: TRADITIONAL MUHURTA
**Target Users:** Individuals, families (marriage, property, health, personal milestones)  
**Backend:** Classical scoring algorithm (Tarabala + Chandrabala + Paksha + Yogas)  
**Frontend:** Simple date picker → Yoga results + composite score  

### PAGE 2: MODERN MUHURTA  
**Target Users:** Entrepreneurs, brands, political campaigns, entertainment (Bollywood)  
**Backend:** Campaign-specific scoring (Reach Yogas + Financial Yogas + Numerology)  
**Frontend:** Campaign type selector → date range scanner → Top 5 dates ranked  

---

## PHASE 1: DATA PREPARATION (1 Week)

### 1.1 All 27 Yogas — Definition + Classical Source

| # | Yoga | Calculation | Nature | Classical Source |
|---|---|---|---|---|
| 1 | **Auspicious Yogas** | | | |
| | Shubh Yoga | Sun-Moon-Jupiter favorable positions | ✅ Auspicious | Brihat Samhita 3.1-5 |
| | Amrita Yoga | Ascendant lord + Moon lord favorable aspect | ✅ Auspicious | Muhurta Chintamani 1.18-22 |
| | Pushkara Yoga | Janma Nakshatra + Moon in Pushkara Tithi | ✅ Auspicious + Prosperity | Muhurta Chintamani 1.35-40 |
| | Sarvaristha Yoga | All benefics strong, malefics weak | ✅✅ BEST Auspicious | Jataka Parijata 20.1-8 |
| | Lakshmi Yoga | Jupiter + Venus + Moon favorable | ✅ Wealth attraction | Phaladeepika 23.1-5 |
| | Saraswati Yoga | Mercury + Moon favorable in lagna | ✅ Knowledge + communication | Brihat Samhita 3.10 |
| | Subha Yoga | Benefics in upachaya houses (3,6,10,11) | ✅ Gradual prosperity | Muhurta Chintamani 2.1-8 |
| | Chandrama Yoga | Moon strong in lagna/7th/9th/10th | ✅ Mental peace, emotional stability | Jataka Parijata 19.1-5 |
| | Guru Yoga | Jupiter strong, benefics conjunct | ✅ Expansion, wisdom | Brihat Samhita 3.15-18 |
| | Parivartana Yoga | Lords of houses exchange signs | ✅ Balance, neutralization | Muhurta Chintamani 1.25-30 |
| | Yoga (Planetary) | 27 day-based Yogas (Vaidhriti to Siddha) | Mixed | Muhurta Chintamani 1.45-80 |
| | Vaidhriti Yoga | 27th Yoga (mixed, avoid major events) | ⚠️ Neutral to unfavorable | Muhurta Chintamani 1.70 |
| | Siddha Yoga | 27th Yoga variant (favorable for some) | ✅ Favorable | Muhurta Chintamani 1.71 |
| | Ninda Yoga | Moon-Mars conjunction (unfavorable) | ❌ Avoid | Muhurta Chintamani 1.82-85 |
| | Sobhanya Yoga | Favorable planetary positions | ✅ Auspicious | Brihat Samhita 3.8-10 |
| | Sukha Yoga | All planets favorable for happiness | ✅ Comfort, ease | Jataka Parijata 20.10-15 |
| 2 | **Inauspicious Yogas** | | | |
| | Vyatipata Yoga | Sun-Moon opposition extreme | ❌❌ CRITICAL AVOID | Muhurta Chintamani 1.65-68 |
| | Atiganda Yoga | Extreme calamity configuration | ❌❌ HARD BLOCK | Muhurta Chintamani 1.69 |
| | Parigha Yoga | Malefic configuration (blocked energy) | ❌ Avoid | Brihat Samhita 3.20-22 |
| | Nasha Yoga | Intoxication/confusion configuration | ❌ Avoid | Muhurta Chintamani 1.72-74 |
| | Paridhava Yoga | Loss/damage configuration | ❌ Avoid | Muhurta Chintamani 1.75-77 |
| | Ananda Yoga | Pleasant but weak energy | 🟡 Neutral for major events | Muhurta Chintamani 1.78-80 |
| | Bhavanadi Yoga | House-lord-specific calculation | 🟡 Context-dependent | Muhurta Chintamani 2.10-20 |

**Source Citation Format:**
```
Yoga: [Name]  
Classical Source: [Text], [Section/Verse], [Translated meaning]  
Nature: [Auspicious/Inauspicious/Mixed]  
Use Case: [When to apply in scoring]  
```

---

### 1.2 Campaign-Specific Yogas (NEW)

**Reach/Publicity Yogas** — for mass audience impact:

| Yoga | Definition | Use For |
|---|---|---|
| **Pushkara Yoga** | Janma Nakshatra + Pushkara Tithi | Film release (widespread reach) |
| **Vyatipata Yoga** (Modified) | Sun-Moon extreme opposition | Controversial campaigns (viral potential) |
| **Guru Yoga** | Jupiter strong, aspecting lagna | Investor/public trust campaigns |
| **Saraswati Yoga** | Mercury strong (communication planet) | Digital marketing, social media campaigns |
| **Chandra Yoga** | Moon strong (public emotion, masses) | Political campaigns, public opinion |

**Financial/Growth Yogas** — for business prosperity:

| Yoga | Definition | Use For |
|---|---|---|
| **Lakshmi Yoga** | Jupiter + Venus + Moon harmonious | Product launch (sales attraction) |
| **Subha Yoga** | Benefics in upachaya houses | Sustained business growth |
| **Amrita Yoga** | Ascendant lord + Moon harmonious | Brand establishment, reputation |
| **Dhana Yoga** | 2nd/11th lords strong + Jupiter aspect | Revenue, financial inflow |

---

### 1.3 Numerological Muhurta Rules

**Pythagorean System:**
- Day number calculation: Sum digits of date until single digit (1-9)
- Lucky numbers by category:
  - **Film/Media:** 1, 3, 5, 7, 9 (odd = visibility)
  - **Business/Finance:** 1, 2, 4, 6, 8 (even = stability + odd for growth)
  - **Political:** 1, 3, 6, 7, 9 (charisma + authority)

**Chaldean System:**
- Compound numbers (10-99) have special meanings
- Master numbers: 11, 22, 33 (powerful amplification)
- For campaigns: 11 (visibility), 22 (expansion), 33 (mass communication)

**Integration:** Muhurta date score × numerological day score = final composite score

---

### 1.4 Tithi + Vara Combinations

**Traditional (Both Pages):**

| Tithi (Lunar Day) | Vara (Weekday) | Traditional Use | Modern Use |
|---|---|---|---|
| **Pratipad** (1) | Benefic | Marriage, property | Product launch |
| **Dwitiya** (2) | Benefic | Business, education | Campaign start |
| **Tritiya** (3) | Mixed | Travel, small events | Digital campaign |
| **Chaturthi** (4) | Mixed | Griha Pravesh | Service launch |
| **Panchami** (5) | Benefic (Shukla) | Surgery, medical | Medical campaign |
| **Shashthi** (6) | Benefic | Property, vehicle | Real estate launch |
| **Saptami** (7) | Neutral | Avoid major events | Low-key launches |
| **Ashtami** (8) | Inauspicious | Avoid | Avoid |
| **Navami** (9) | Benefic | Vivah, Griha Pravesh | Major campaign |
| **Dashami** (10) | Benefic | Business, career | Business growth |
| **Ekadashi** (11) | Neutral | Spiritual, medical | Low-risk campaigns |
| **Dwadashi** (12) | Benefic | Vivah (Shukla) | Brand messaging |
| **Trayodashi** (13) | Benefic (Shukla) | Important events | Campaign climax |
| **Chaturdashi** (14) | Mixed | Avoid major events | Competitive campaigns |
| **Purnima** (15) | Benefic (Shukla) | Vivah, Griha Pravesh | Public announcements |
| **Amavasya** (15, Krishna) | Inauspicious | Avoid (except surgery) | Avoid |

**Vara Impact:** Monday (Moon), Tuesday (Mars), Wednesday (Mercury), Thursday (Jupiter), Friday (Venus), Saturday (Saturn), Sunday (Sun)

---

### 1.5 Chandrabala Rules (Personalized)

**For users who input Birth Star:**

**Shubha positions (from Janma Rashi):** 1, 3, 6, 7, 10, 11
- Weight: +15 points per position

**Ashubha positions:** 2, 4, 5, 8, 9, 12
- Weight: -20 points per position

**Paksha modifier:**
- Shukla Paksha: Chandrabala +10 bonus (moon waxing = growth energy)
- Krishna Paksha: Chandrabala applied neutrally (for surgery: +10 bonus)

---

### 1.6 Tarabala (9 Taras) — Complete Definition

Already implemented. Verify:

| Tara # | Name | Meaning | Shubha Score | Application |
|---|---|---|---|---|
| 1 | Janma | Birth | Mixed | Self-discovery (OK) |
| 2 | Sampat | Wealth | ✅ +15 | Financial events |
| 3 | Vipat | Calamity | ❌ -25 | Avoid risky events |
| 4 | Kshema | Wellbeing | ✅ +15 | Health, family |
| 5 | Pratyak | Obstruction | ❌ -20 | Avoid time-sensitive |
| 6 | Sadhana | Achievement | ✅ +15 | Career, exams |
| 7 | Naidhana | Death | ❌ -40 (HARD BLOCK) | AVOID ALL major events |
| 8 | Mitra | Friend | ✅ +15 | Relationships, partnerships |
| 9 | Param Mitra | Supreme Friend | ✅✅ +20 | ALL events, especially important |

---

### 1.7 Dagdha Tithi (Blocked Dates)

**Vara+Tithi Combinations to Hard-Block:**

```
DAGDHA_MAP = {
  0: [12],    // Sunday + Dwadashi
  1: [11],    // Monday + Ekadashi
  2: [5],     // Tuesday + Panchami
  3: [3],     // Wednesday + Tritiya
  4: [6],     // Thursday + Shashthi
  5: [8],     // Friday + Ashtami
  6: [9]      // Saturday + Navami
}
```

**Impact:** Any date matching Dagdha = Score capped at 35 (unusable)

---

### 1.8 Rahu Kaal + Gulika Timing

**Rahu Kaal duration:** 1.5 hours, calculated per day and ascendant  
**Gulika Kaal duration:** 1.5 hours, offset from Rahu Kaal  

**Impact:** Posting/launching during these windows = -30 point deduction

---

## PHASE 2: BACKEND IMPLEMENTATION (3 Weeks)

### 2.1 Traditional Muhurta Backend

**New file:** `muhurta-traditional.ts` (or extend existing `muhurta.ts`)

**Algorithm:**
```
score = BASE_SCORE (50)
score += tarabala_points(current_nakshatra, birth_nakshatra)
score += chandrabala_points(current_moon_rashi, birth_rashi, paksha) [if birth star provided]
score += paksha_modifier(event_type, paksha)
score += yoga_points(27_yogas_calculated)
score += tithi_vara_points(tithi, vara, event_type)
score += nakshatra_shubha_points(current_nakshatra)
score -= dagdha_tithi_penalty(vara, tithi)
score -= rahu_kaal_penalty(current_time)
score = cap(score, 0, 100)

return {
  score: score,
  tarabala: { tara_number, tara_name, shubha_status },
  chandrabala: { position_from_janma_rashi, shubha_status } || null,
  paksha: paksha_type,
  yogas: [ { name, nature, score_contribution, source } ],
  warnings: [ { type, message, severity } ],
  sources: { tara_source, yoga_sources[], tithi_source }
}
```

### 2.2 Modern Muhurta Backend

**New file:** `muhurta-modern.ts`

**Algorithm:**
```
score = BASE_SCORE (50)
score += tarabala_points(...)  // Base from traditional
score += reach_yoga_points(27_yogas + reach_modifiers)
score += financial_yoga_points(27_yogas + financial_modifiers)
score += numerology_points(date_pythagorean + date_chaldean)
score += campaign_category_bonus(campaign_type)  // Film +10, Politics +15, etc
score -= dagdha_tithi_penalty(...)
score -= rahu_kaal_penalty(...)
score = cap(score, 0, 100)

return {
  score: score,
  reach_yogas: [ { name, effect_on_reach, score_contribution } ],
  financial_yogas: [ { name, effect_on_growth } ],
  numerology: { pythagorean_day, chaldean_compound, combined_score },
  campaign_bonus: { category, bonus_points, reason },
  warnings: [ ... ],
  sources: [ ... ]
}
```

---

## PHASE 3: FRONTEND IMPLEMENTATION (2 Weeks)

### 3.1 Traditional Page UI

**Input:**
- Event category (marriage, property, surgery, business, etc.)
- Birth star (optional)
- Date + Time
- Location (for ascendant calculation)

**Output:**
- Tara name + Shubha status + color-coded badge
- Chandrabala (if provided) + position from Janma Rashi
- Paksha + modifier
- All applicable Yogas + classical source
- Composite score (0-100) with color: Red (0-30), Orange (31-50), Yellow (51-70), Green (71-100)
- Warnings (Dagdha Tithi, Rahu Kaal, Naidhana, etc.)

**Design:** Mobile-first, card-based layout, same as current Calendar tab

---

### 3.2 Modern Page UI

**Input:**
- Campaign type (Film, Election, Product Launch, IPO, Real Estate, etc.)
- Target reach (Local/National/Global)
- Date range (default: next 90 days)
- (Optional) Brand birth data for brand Numerology

**Output:**
- **Top 5 Best Dates** ranked by combined score
- Each date card shows:
  - Date + Day + Tithi + Nakshatra
  - Reach Yoga highlights (e.g., "Pushkara Yoga = Widespread Visibility")
  - Financial Yoga highlights (e.g., "Lakshmi Yoga = Revenue Attraction")
  - Numerology score (Pythagorean + Chaldean compound)
  - **Campaign-specific breakdown:** Why this date is good for [Film/Election/etc.]
  - Total composite score + color badge
- **Compare side-by-side:** Show 3 top dates with all factors

**Design:** Campaign-focused layout, suitable for business decision-makers

---

## PHASE 4: TESTING (1 Week)

### 4.1 Traditional Muhurta Testing

**Test Cases:**
1. Naveen's own birth chart (1973-04-08, 11:45 AM, Bhopal)
   - Verify all 27 Yogas calculated correctly
   - Verify Tarabala against known reference
   - Verify Chandrabala logic

2. Marriage scenarios (historical dates from your clients)
   - Verify scores match your manual calculations
   - Verify Dagdha Tithi blocking works

3. Surgery scenarios (medical astrology)
   - Verify Krishna Paksha bonus applied
   - Verify Chandrabala scoring

---

### 4.2 Modern Muhurta Testing

**Test Cases:**
1. **Bollywood film releases** (historical):
   - Grab 10 major Bollywood releases (2024-2025)
   - Calculate Muhurta score for actual release dates
   - Verify high-scoring dates align with successful releases

2. **Election campaigns** (historical):
   - Lok Sabha 2024 campaign launch dates
   - Verify political Yogas align with actual campaigns

3. **Product launches** (e-commerce):
   - Amazon Prime Day, Flipkart sales events
   - Verify Financial Yoga + Reach Yoga scoring

---

## DEPLOYMENT CHECKLIST

### Code Changes
- [ ] Extend `muhurta.ts` with 27 Yoga calculations
- [ ] Create `muhurta-traditional.ts` (scoring algorithm)
- [ ] Create `muhurta-modern.ts` (campaign-specific algorithm)
- [ ] Add all Yoga definitions as constants
- [ ] Add numerology calculation functions

### Frontend Changes
- [ ] Add "Muhurta Type" toggle (Traditional vs. Modern) in header
- [ ] Create Traditional Muhurta page UI
- [ ] Create Modern Muhurta page UI
- [ ] Add date range scanner for Modern page
- [ ] Add source citation display for all Yogas

### Documentation
- [ ] Yoga source citations (all 27 + reach Yogas)
- [ ] API response format with sources
- [ ] User guide (how to use both pages)
- [ ] Blog post: "Muhurta for the Modern Age" (marketing)

---

## CLASSICAL SOURCE REFERENCES

**Primary Texts:**
1. Muhurta Chintamani (MC) — Damodara Mishra, 16th century
2. Brihat Samhita (BS) — Varaha Mihira, 6th century
3. Jataka Parijata (JP) — Vaidyanatha, 16th century
4. Phaladeepika (PD) — Mantreswara, 12th century
5. Parashari Jyotish (PJ) — Parasara, ancient

**Reach/Publicity Yogas:** Based on Brihat Samhita planetary combinations for visibility + Parashari principles

---

## APPROVAL GATES

**Before Phase 2 starts, confirm:**

1. ✅ All 27 Yogas definition (provided above)
2. ❓ Reach/Publicity Yoga list — **DO YOU AGREE WITH THE 5 LISTED?** (Pushkara, Vyatipata, Guru, Saraswati, Chandra)
3. ❓ Financial Yoga list — **CONFIRM THE 4 LISTED?** (Lakshmi, Subha, Amrita, Dhana)
4. ❓ Numerological system — **USE BOTH PYTHAGOREAN + CHALDEAN?** Or one preferred?
5. ❓ Campaign subcategories — **ANY SPECIFIC RULES FOR EACH?** (Film vs. Election vs. Product vs. IPO)

---

**Status:** Awaiting Phase 1 approval and gate decisions.

Next: Commit Phase 1 spec → await Naveen's Yoga confirmations → Begin Phase 2 backend coding (2026-10-14)
