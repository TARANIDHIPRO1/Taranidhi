# TARANIDHI v4 — Complete System Architecture
**Date:** October 6, 2026  
**Author:** System Analysis Session  
**Status:** APPROVED BASELINE — build from this, not from v3

---

## 1. THE CORE SIDDHANT (Embedded in Every Feature)

Every result in TaraNidhi must answer the **6W Framework** derived from classical Jyotish:

| W | Sanskrit | Question | Implementation |
|---|----------|----------|----------------|
| **Kya** | Kim | What event? | Event category + subcategory |
| **Kab** | Kada | When exactly? | Best window (HH:MM – HH:MM), not just "today" |
| **Kaise** | Katham | How to do it? | Direction, method, approach |
| **Kyoun** | Kasmat | Why this time? | Classical siddhant reason (Muhurta Chintamani source) |
| **Kaha** | Kutra | Where? | GPS location → affects Suryodaya, Rahu Kaal, Hora |
| **Kitna** | Kiyat | How intense? | Prabhaav meter 1–10 |
| **Kaun** | Kah | Who rules? | Hora lord, Nakshatra lord, Dasha lord |

**Rule:** No result screen exists without all 7 answers visible. This is non-negotiable.

---

## 2. MISSING FEATURES — COMPLETE INVENTORY

### 2A. Header (Missing on all pages)
- [ ] TaraNidhi logo (top-left, every screen)
- [ ] Live clock (HH:MM:SS, every screen)
- [ ] GPS location display (City, State — every screen)
- [ ] Language toggle EN / हि (every screen)
- [ ] Theme toggle ☀️ / 🌙 (every screen)
- [ ] License badge: DEMO / PRO / ULTRA (every screen)

### 2B. Missing Screens
- [ ] **Support Tab** — WhatsApp number (9669756111), Instagram, email, social links
- [ ] **Astrologer Promotion Page** — Naveen K. Rai profile, services, booking link
- [ ] **About / Settings** — Ayanamsa selector, Sidereal/Tropical toggle, language, theme

### 2C. Missing from Panchang
- [ ] GPS-based Suryodaya / Suryast (currently hardcoded or missing)
- [ ] Chandrodaya / Chandrast
- [ ] Rahu Kaal (location-based)
- [ ] Gulika Kaal (location-based)  
- [ ] Yamaganda Kaal
- [ ] Abhijit Muhurta window
- [ ] Dur Muhurta
- [ ] **Dagdha Tithi warning** (see Section 6)
- [ ] Panchak warning
- [ ] Ganda Moola warning
- [ ] Tithi end time
- [ ] Nakshatra end time
- [ ] Yoga end time
- [ ] Karana (current + next)
- [ ] Masa (lunar month name)
- [ ] Paksha (Shukla/Krishna)
- [ ] Samvat (Vikram + Shaka)

### 2D. Missing from Hora/Uphora
- [ ] Full 24-hour Hora table (all 7 lords, all 24 slots)
- [ ] 5-minute Uphora subdivision per Hora (12 slots per Hora)
- [ ] Golden Time Window: best 5-min slot for selected event
- [ ] WHY explanation for each slot (classical reason)
- [ ] Next auspicious Hora countdown timer

### 2E. Missing from Verdict/Result
- [ ] Event timing window (kab se kab tak — not just score)
- [ ] Prabhaav meter (visual gauge 1–10)
- [ ] Siddhant explanation (why classical texts say this)
- [ ] Good / Madhyam / Average / Bad label (not just score number)
- [ ] Direction recommendation (Kaha — which direction to face/travel)
- [ ] Method recommendation (Kaise — what to do first)

### 2F. Missing Calendar Features
- [ ] Past dates (no limit — any historical date)
- [ ] Future: 1 year standard, 5 years advanced/pro
- [ ] Color-coded month grid 🟢🟡🔴
- [ ] Event category filter
- [ ] "Best days this month for [event]" summary
- [ ] Tap any day → full day result

### 2G. Missing Event Categories (currently only 8)
**Need minimum 25:**
- Vehicle purchase, Job interview, Loan application
- New venture launch, Surgery (elective), House construction
- Farming/sowing, Investment (equity/gold), Education admission  
- Court filing, Contract signing, Name ceremony (Naamkaran)
- Thread ceremony (Upanayana), Engagement, House warming (Griha Pravesh)
- Foreign travel, Job joining, Partnership deed, Will signing
- Import/Export shipment, Interview, Exam, Medical consultation

### 2H. Missing UI Elements
- [ ] Nakshatra symbol (glyph) next to name everywhere
- [ ] Info ℹ️ tooltip on every technical term (tap → explanation)
- [ ] Query history (last 20 queries, local storage)
- [ ] Ayanamsa display (which system active — Lahiri/KP/Raman)
- [ ] Sidereal / Tropical toggle (with warning: KP requires Sidereal)

---

## 3. SCREEN ARCHITECTURE — v4

### Bottom Navigation (5 tabs)

```
[ 🔮 Muhurta ] [ 📅 Panchang ] [ 🕐 Hora ] [ 📆 Calendar ] [ 👤 More ]
```

---

### TAB 1: MUHURTA (Query + Instant Result)

**Flow:** Input → Calculate → Result (NO intermediate screens)

**Input section (top half):**
```
Name: [___________]
Janma Nakshatra: [dropdown — 27 options with symbols]
Event Category: [dropdown — 25 categories]
Date: [date picker — past or future]
Time: [time picker — for specific query]
[📍 Use GPS Location] or [Enter City: ___]
[🔮 GET MUHURTA]
```

**Result section (scrollable, same screen):**
```
┌──────────────────────────────────────┐
│  ✅ SHUBHA — TRAVEL                  │
│  Prabhaav: ████████░░ 8/10           │
│  Score: 84/100                        │
├──────────────────────────────────────┤
│  ⏰ BEST WINDOW TODAY                 │
│  14:35 – 15:10 (Guru Hora)           │
│  Next: 16:00 – 16:22 (Shukra Hora)  │
├──────────────────────────────────────┤
│  📋 6W ANALYSIS                       │
│  KYA:   International Travel          │
│  KAB:   14:35–15:10 IST today         │
│  KAISE: Start facing East, avoid West │
│  KYOUN: Sampat Tara + Guru Hora —     │
│         Muhurta Chintamani 3.14       │
│  KAHA:  Bhopal (23.25°N, 77.41°E)    │
│  KITNA: Prabhaav 8/10 (Ati Shubha)   │
│  KAUN:  Nakshatra lord: Mangal       │
│         Hora lord: Guru              │
├──────────────────────────────────────┤
│  ⚠️ WARNINGS                          │
│  Rahu Kaal: 10:30–12:00 (avoid)      │
│  No Dagdha Tithi today               │
├──────────────────────────────────────┤
│  📊 SCORE BREAKDOWN (8 layers)        │
│  [expandable accordion]               │
├──────────────────────────────────────┤
│  🌟 NAKSHATRA NATURE                  │
│  [Nakshatra card with upay]           │
├──────────────────────────────────────┤
│  [📤 WhatsApp Share]                  │
│  [📖 Save to History]                 │
└──────────────────────────────────────┘
```

---

### TAB 2: PANCHANG (Complete — Drik Standard)

**Header:** Live date, GPS location, Samvat

**Section A — Pancha Anga (5 limbs):**
```
तिथि    : सप्तमी (Shukla) — ends 16:42
वार     : मंगलवार (Tuesday)
नक्षत्र  : ♂ मृगशिरा — ends 19:15
योग     : सिद्धि — ends 23:30
करण     : बव
```

**Section B — Surya/Chandra:**
```
सूर्योदय  : 06:12  |  सूर्यास्त  : 17:58
चन्द्रोदय : 12:35  |  चन्द्रास्त : 23:44
```

**Section C — Inauspicious Periods:**
```
राहु काल  : 15:00 – 16:30  ⚠️
गुलिक काल : 07:30 – 09:00  ⚠️
यम गण्ड   : 10:30 – 12:00  ⚠️
```

**Section D — Auspicious Windows:**
```
अभिजित् मुहूर्त : 11:52 – 12:40  ✅
```

**Section E — Tara/Chandra Bala:**
```
तारा बल    : सम्पत् (2) ✅ शुभ
चन्द्र बल  : ✅ उपचय भाव (7)
```

**Section F — Warnings:**
```
दग्ध तिथि  : नहीं ✅
पंचक       : नहीं ✅
गण्ड मूल   : नहीं ✅
```

**Section G — Astronomical:**
```
सूर्य राशि  : कन्या (Virgo)
चन्द्र राशि : मिथुन (Gemini)
शक सम्वत   : 1948 | विक्रम सम्वत : 2083
माह        : आश्विन | पक्ष : शुक्ल
```

---

### TAB 3: HORA / UPHORA TABLE

**Sub-tabs:** [24-Hour View] [Golden Window] [5-Min Detail]

**24-Hour Hora Table:**
```
Time        Hora Lord   Medical  Travel  Business  Property
06:12–07:12  Mangal      ⚠️       ✅      ❌        ⚠️
07:12–08:12  Ravi        ✅       ⚠️      ✅        ✅
...
```

**Golden Window (for selected event):**
```
Best 5-minute slots for TRAVEL today:
1. 09:47–09:52  Guru Uphora in Shukra Hora  ⭐⭐⭐⭐⭐
   WHY: Guru rules wisdom/expansion + Shukra rules comfort
   Source: Muhurta Chintamani Ch.4 — Guru in Shukra Hora = sarvashubha

2. 14:35–14:40  Shukra Uphora in Guru Hora  ⭐⭐⭐⭐⭐
   WHY: Shukra rules vehicles and journeys
```

---

### TAB 4: CALENDAR

**Header:** [Event category dropdown] [← Month →]

**Month Grid:**
```
  Oct 2026
Mo Tu We Th Fr Sa Su
          1  2  3  4
 5  6  7  8  9 10 11
🟢 🔴 🟡 🟢 🟡 🟢 🔴
...
```

**Footer:** "Best days for TRAVEL this month: 5, 8, 12, 19, 23, 28"

**Tap any date:** Opens full day result (same as Muhurta tab result)

**Navigation:**
- Standard: ±12 months
- Advanced/Pro: ±5 years (past and future)

---

### TAB 5: MORE

**Sections:**

**Astrologer Profile (Naveen K. Rai):**
```
[Photo]  Navveen Chandraa Raii
         OCCULTVIISION™
         Bhopal, Madhya Pradesh
         [📞 9669756111] [📸 Instagram] [🌐 Website]
         [📅 Book Consultation]
         "Expert in KP, Parashari, Jaimini, Vastu, Numerology"
```

**Support:**
```
📱 WhatsApp: 9669756111
📸 Instagram: @occultviision
🌐 www.occultviision.com
📧 info@occultviision.com
[Send us a message]
```

**Settings:**
```
🌍 Language:    [English] [हिन्दी]
🎨 Theme:       [Dark ●] [Light ○]
📍 Location:    [GPS Auto] [Manual Entry]
🪐 Ayanamsa:    [Lahiri (Chitrapaksha) ●] [KP] [Raman]
🌐 Zodiac:      [Sidereal ●] [Tropical]
📱 License:     DEMO (7 days remaining)
                [Upgrade to PRO]
```

**License Tiers:**
```
DEMO   : Muhurta tab only, today's date only, watermarked
BASIC  : Muhurta + Panchang, ±30 days
PRO    : All tabs, ±1 year calendar
ULTRA  : All tabs, ±5 year calendar, astrologer branding
```

---

## 4. DAGDHA TITHI — Classical Logic (Must Implement)

**Definition:** "Dagdha" = burnt. A combination of Tithi + Vara that destroys the auspiciousness of any work begun in it.

**When it forms (Muhurta Chintamani, Adhyaya 1):**

| Vara (Day) | Dagdha Tithi |
|------------|--------------|
| Sunday (Ravi) | Dvadashi (12th) |
| Monday (Soma) | Ekadashi (11th) |
| Tuesday (Mangala) | Panchami (5th) |
| Wednesday (Budha) | Tritiya (3rd) |
| Thursday (Guru) | Shashthi (6th) |
| Friday (Shukra) | Ashtami (8th) |
| Saturday (Shani) | Navami (9th) |

**Why it forms:** Each planet rules a day. The Tithi ruled by its enemy planet on that day creates a "combustion" — the day's energy is burnt. Source: Muhurta Chintamani, Shloka 1.45-47.

**Effect:** All new work is forbidden. No muhurta can override Dagdha Tithi. Score cap: maximum 35/100 when Dagdha Tithi is active.

**Implementation in code:**
```javascript
function isDagdhaTithi(vara, tithi) {
  // vara: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // tithi: 1-30
  const DAGDHA = {0:12, 1:11, 2:5, 3:3, 4:6, 5:8, 6:9};
  return DAGDHA[vara] === tithi;
}
// If true: cap composite score at 35, show RED warning, block GO verdict
```

**Additional Dagdha Tithis (Brihat Samhita):**
- Chaturdashi (14th) in all months — Shiva-related caution
- Amavasya (30th/New Moon) — ancestor spirits active, avoid new work
- Purnima (15th/Full Moon) — sacred, but some work types restricted

---

## 5. PANCHANG IMPORTANCE — The Astronomy-Astrology Bridge

**Core principle:** Panchang is not opinion. It is astronomy.

The 5 elements (Pancha Anga) are astronomical observations:
1. **Tithi** = Moon's angular distance from Sun (12° = 1 Tithi) — pure astronomy
2. **Vara** = Earth's rotation = day of week — pure astronomy  
3. **Nakshatra** = Moon's sidereal position (13°20' each) — pure astronomy
4. **Yoga** = Sum of Sun + Moon longitudes / 13°20' — pure astronomy
5. **Karana** = Half-Tithi — pure astronomy

**Universal effect:** Because Panchang is based on actual planetary positions, its effects are universal — not just for believers. Location changes the exact timing (Suryodaya) but not the Tithi/Nakshatra.

**This must be explained in the UI** via an info panel: "Why trust Panchang? Because it is astronomy, not belief."

---

## 6. AYANAMSA & ZODIAC SYSTEM

**Default:** Lahiri (Chitrapaksha) Ayanamsa — official Indian government standard

**Ayanamsa Formula (already in codebase — verify):**
```
Ayanamsa = (85885.53192 + 5028.796195×T + 1.1054348×T² + 0.00007964×T³) / 3600
```
where T = Julian centuries from J2000.0

**Options to expose in Settings:**
- Lahiri (default, most common in India)
- KP (Krishnamurti Paddhati — 0°0'0" different formula)
- Raman
- Fagan-Bradley (Tropical/Western)

**Warning to show if user selects Tropical:** "Tropical zodiac does not support Nakshatra-based calculations. KP and Tarabala will be disabled."

---

## 7. GPS & LOCATION SYSTEM

**Why GPS is mandatory:**
- Suryodaya (sunrise) varies by up to 2 hours across India
- Rahu Kaal, Gulika, Yamaganda are fractions of day length → need exact sunrise
- Abhijit Muhurta = midpoint of day → needs exact sunrise + sunset
- Hora starts at sunrise → needs GPS

**Implementation:**
```javascript
// On app load: request GPS
navigator.geolocation.getCurrentPosition(pos => {
  STATE.lat = pos.coords.latitude;
  STATE.lon = pos.coords.longitude;
  STATE.tz = 5.5; // IST always for Indian users
  reverseGeocode(lat, lon); // Get city name
  recalcSunrise(); // Recalculate all time-based elements
});
// Fallback: Bhopal (23.2505°N, 77.4065°E) with user notification
```

**Sunrise calculation (Meeus algorithm — already in astro.ts):**
Must be called BEFORE any time-based Panchang display.

---

## 8. NAKSHATRA SYMBOLS

All 27 nakshatras with Unicode/emoji symbols:

| # | Nakshatra | Symbol |
|---|-----------|--------|
| 1 | Ashwini | ♈⚡ |
| 2 | Bharani | ♈⚖️ |
| 3 | Krittika | ♈🔥 |
| 4 | Rohini | ♉🌹 |
| 5 | Mrigashira | ♉🦌 |
| 6 | Ardra | ♊💎 |
| 7 | Punarvasu | ♊🏹 |
| 8 | Pushya | ♋🌸 |
| 9 | Ashlesha | ♋🐍 |
| 10 | Magha | ♌👑 |
| 11 | Purva Phalguni | ♌🛏️ |
| 12 | Uttara Phalguni | ♌/♍🤝 |
| 13 | Hasta | ♍✋ |
| 14 | Chitra | ♍🎨 |
| 15 | Swati | ♎🌿 |
| 16 | Vishakha | ♎🌿 |
| 17 | Anuradha | ♏🪷 |
| 18 | Jyeshtha | ♏⚡ |
| 19 | Moola | ♐🌱 |
| 20 | Purvashadha | ♐🐘 |
| 21 | Uttarashadha | ♑🐘 |
| 22 | Shravana | ♑👂 |
| 23 | Dhanishtha | ♒🥁 |
| 24 | Shatabhisha | ♒⭕ |
| 25 | Purva Bhadrapada | ♓⚔️ |
| 26 | Uttara Bhadrapada | ♓🐍 |
| 27 | Revati | ♓🐟 |

---

## 9. LICENSE / VALIDITY SYSTEM

**Demo mode restrictions (enforced client-side, verified server-side):**
```
DEMO (7 days):
  ✅ Muhurta tab
  ✅ Today's date only
  ✅ 5 queries per day
  ❌ Panchang tab
  ❌ Hora/Uphora table
  ❌ Calendar
  ❌ WhatsApp share
  ✅ Watermark: "Powered by OCCULTVIISION — DEMO"

BASIC (₹499/mo):
  ✅ All above +
  ✅ Panchang tab (complete)
  ✅ ±30 day calendar
  ✅ WhatsApp share
  ✅ 50 queries/day

PRO (₹999/mo):
  ✅ All above +
  ✅ Hora/Uphora table
  ✅ ±1 year calendar
  ✅ Query history (20)
  ✅ Unlimited queries

ULTRA (₹2999/mo):
  ✅ All above +
  ✅ ±5 year calendar
  ✅ Astrologer branding (Naveen's name/photo)
  ✅ Client report generation
  ✅ White-label option
```

**Visual indicator (header badge):**
- DEMO: Orange pill "DEMO"
- BASIC: Blue pill "BASIC"
- PRO: Purple pill "PRO"
- ULTRA: Gold pill "ULTRA ⭐"

---

## 10. BUILD SEQUENCE (v4 from scratch)

### Phase 1 — Foundation (Week 1)
1. Single HTML file structure with correct 5-tab architecture
2. Header with logo, clock, GPS indicator, language toggle, theme toggle, license badge
3. GPS + location system (sunrise recalculation)
4. Ayanamsa selector wired to all calculations

### Phase 2 — Panchang (Week 1-2)
5. Complete Panchang tab (all 20 elements)
6. Dagdha Tithi detection + warning
7. Rahu/Gulika/Yamaganda (GPS-based)
8. Abhijit Muhurta window

### Phase 3 — Muhurta + Result (Week 2)
9. Query input with 25 categories
10. Single-page result with 6W framework
11. Timing window (kab se kab tak)
12. Prabhaav meter
13. Siddhant explanation per result

### Phase 4 — Hora/Uphora (Week 3)
14. 24-hour Hora table
15. 5-minute Uphora breakdown
16. Golden Window calculation
17. WHY explanation per slot

### Phase 5 — Calendar (Week 3)
18. Month grid view
19. Color-coded days
20. Past + future navigation (±1 year standard)
21. Event category filter

### Phase 6 — More Tab (Week 4)
22. Astrologer profile (Naveen)
23. Social/support links
24. Query history
25. Settings (ayanamsa, theme, language, license)

### Phase 7 — QA (Week 4)
26. GPS fallback testing
27. Dagdha Tithi verification (classical source check)
28. All 25 categories tested
29. Mobile responsive (360px min)
30. License tier enforcement

---

## 11. WHAT KAALCHAKRA v1 DID RIGHT (Restore These)

From your feedback, the old Kaalchakra version had better presentation. Based on that:
- Single result page (no tab-switching for verdicts) ← restore
- Clear GO/NO-GO display ← restore and enhance
- Less clutter in navigation ← restore (fewer tabs, more content per tab)
- Immediate answer on load ← restore

---

## 12. WHAT v3 MUST NEVER DO AGAIN

- ❌ Require 5 tab-switches to see a verdict
- ❌ Show "#5" nakshatra index in header (show symbol + name)  
- ❌ Incomplete panchang scattered across tabs
- ❌ No explanation for any score or term
- ❌ No GPS (hardcoded Bhopal coordinates without disclosure)
- ❌ No timing window (only score, no "kab se kab tak")
- ❌ Building features piecemeal without this architecture doc

---

*This document is the single source of truth for v4 development. Any feature not in this doc requires Naveen's explicit approval before building.*
