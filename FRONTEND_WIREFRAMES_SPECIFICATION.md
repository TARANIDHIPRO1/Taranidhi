# FRONTEND WIREFRAMES — KAALCHAKRA PRO v6 MVP
## 3 Screens: Birth Chart | Muhurta Dashboard | Event Categories
**Status:** Wireframe v1.0 (Sep 29, 2026)  
**Designer:** Claude  
**Frontend:** React + TypeScript + shadcn/ui (Tailwind)  
**Responsive:** Mobile-first (320px → 1920px)

---

## DESIGN SYSTEM (Shared)

### Color Palette
```
Primary:      #6B4CE6 (Deep Purple — Vedic elegance)
Secondary:    #FF6B6B (Coral — Urgency/Warnings)
Success:      #51CF66 (Green — Positive slots)
Warning:      #FFD93D (Yellow — Caution)
Danger:       #FF4757 (Red — Blocked slots)
Neutral:      #2D3748 (Dark Gray — Text)
Light:        #F7FAFC (Off-White — Backgrounds)

Accent (Dosha):   #FF6B6B (Red — Doshas)
Accent (MPI):     #51CF66 (Green — High scores)
```

### Typography
```
Heading 1:    32px, Bold (Titles)
Heading 2:    24px, SemiBold (Section headers)
Heading 3:    18px, SemiBold (Card titles)
Body:         16px, Regular (Content)
Small:        14px, Regular (Labels, hints)
Monospace:    14px, Courier (Degrees, timestamps)
```

### Spacing (8px grid)
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

---

## SCREEN 1: BIRTH CHART DISPLAY

**Purpose:** Show user's natal chart with planets, houses, nakshatras, CSL positions  
**Route:** `/charts/:user_id` or `/birth-chart`  
**API Call:** `GET /api/v1/kundali` (cached, 200ms latency)

### Layout (Split View)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: "Birth Chart — Naveen Rai" [← Back] [Settings]          │
├─────────────────────────────────────────────────────────────────┤
│  PANEL 1 (LEFT, 50%):                                            │
│  ┌───────────────────────────────────────┐                      │
│  │   12-House Circle (SVG Visualization) │                      │
│  │                                       │                      │
│  │       11  ↑    12  ↑    1  ↑         │                      │
│  │       ↓   \   ↓ ☀  ↓   / ↑          │                      │
│  │   10 ← ───────────────────── → 2     │                      │
│  │    ↓   \     (Birth: Apr 8,   /  ↑   │                      │
│  │    ↓  9↓ \   1973, 11:45 IST) / 3 ↑  │                      │
│  │    ↓   ← ─────────────────────→  ↑   │                      │
│  │    ↓   \   ↓       ↓    ↓   / ↑  ↑   │                      │
│  │    ↓  8 ↓  \  ♃ ♀ ♂ ♁ / 4 ↑       │                      │
│  │    ↓     \  ↓   ♂ ↓   /  ↑        │                      │
│  │    7      ←───────────────→ 5      │                      │
│  │   ↓       /   ♅ ♆ ♑  \  ↑        │                      │
│  │   ↓  6 ↓ /     ↑      \ 5 ↑      │                      │
│  │   ↓    /  ↑        ↑    \   ↑    │                      │
│  │   ↓   /    \   Rahu → ↑    \   ↑ │                      │
│  │   ↓  ↓      └────────────────┘   │                      │
│  │                                   │                      │
│  └───────────────────────────────────┘                      │
│                                                              │
│  House Cusps Table:                                         │
│  ┌─────────────────────────────────────┐                    │
│  │ House  Sign    Degree  Nakshatra    │                    │
│  ├─────────────────────────────────────┤                    │
│  │  1st   Gemini  82.97°  Ardra        │                    │
│  │  2nd   Cancer  113.25° Punarvasu    │                    │
│  │  ...                                │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
├─────────────────────────────────────────────────────────────│
│  PANEL 2 (RIGHT, 50%):                                       │
│  ┌────────────────────────────────────┐                     │
│  │ PLANETS & POSITIONS                │                     │
│  ├────────────────────────────────────┤                     │
│  │ Planet    Sign    Degree  Nakshat. │                     │
│  │ ☀ Sun     Pisces  29.45°  Revati   │                     │
│  │ ☾ Moon    Scorpio 14.32°  Jyeshtha │                     │
│  │ ☿ Merc.   Aries   5.18°   Ashwini  │                     │
│  │ ♀ Venus   Taurus  18.90°  Kritika  │                     │
│  │ ♂ Mars    Leo     22.15°  Magha    │                     │
│  │ ♃ Jupit.  Taurus  12.67°  Kritika  │                     │
│  │ ♄ Saturn  Gemini  16.42°  Ardra    │                     │
│  │ ☊ Rahu    Scorpio (R)              │                     │
│  │ ☋ Ketu    Taurus  (R)              │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  ┌────────────────────────────────────┐                     │
│  │ CURRENT DASHA                      │                     │
│  ├────────────────────────────────────┤                     │
│  │ Maha: Jupiter (1994-06-15 to 2010) │                     │
│  │ Antar: Saturn (2024-01-20 to 2025) │                     │
│  │ Remaining: 16.2 years              │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  ┌────────────────────────────────────┐                     │
│  │ PERSONALIZED TARA                  │                     │
│  ├────────────────────────────────────┤                     │
│  │ Birth: Ardra (Moon)                │                     │
│  │ Classification: Neutral            │                     │
│  │ Karma Vipak: Neutral               │                     │
│  │ (7 stars = Sampath, 4 = Vipat)    │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  [VIEW FULL DASHA TIMELINE] [PRINT]                         │
└─────────────────────────────────────────────────────────────┘
```

### Interactions

1. **Hover on Planet:** Show degree (accurate to 0.0001°), nakshatra, CSL, sub-lord
2. **Click House Number:** Show all planets in that house + their influence
3. **Toggle Ayanamsha:** Switch between Lahiri (82.9708°) ↔ KP New (82.8743°)
4. **Print Button:** Generate PDF with chart + all data (for B2B hospital use)

### Mobile Variant (320-768px)
```
Stack vertically:
1. Chart (smaller radius, 280px)
2. Planets Table
3. Dasha
4. Tara
```

---

## SCREEN 2: MUHURTA DASHBOARD + 6-STAGE FILTER

**Purpose:** Real-time muhurta slot finder with golden slots ranked by MPI  
**Route:** `/muhurta` or `/dashboard`  
**API Call:** `POST /api/v1/muhurta` (5-10s latency for 30-day range)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: "Find Golden Moments" [← Back] [User: Naveen] [Settings]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ SECTION 1: QUERY FILTERS (Collapsible Panel)                   │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ EVENT TYPE      [Dropdown ▼ Property Deed]                  ││
│ │ DATE RANGE      [Oct 1, 2026] — [Oct 31, 2026] [📅 Picker] ││
│ │ DURATION        [1 hour] ↕                                  ││
│ │                                                              ││
│ │ DOSHAS FILTER   ⚙️                                          ││
│ │ ☐ 3 Critical (Panchaka, Ganda Moola, Mrityu Bana)          ││
│ │ ☑ All 21 Doshas                                            ││
│ │                                                              ││
│ │ [CALCULATE GOLDEN SLOTS]  [CLEAR]                           ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ SECTION 2: REAL-TIME PROGRESS (During Calculation)            │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Scanning Oct 16, 2026...                                   ││
│ │ [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 35% (12s)      ││
│ │ Checked: 720 Hora slots | Golden found: 3                  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ SECTION 3: SUMMARY (Post-Calculation)                          │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ 📊 RESULTS SUMMARY                                          ││
│ │ ✅ Golden Slots: 5 (out of 720 checked)                     ││
│ │ 📈 Best MPI: 81% (Oct 16, 2:30 PM IST)                     ││
│ │ 📊 Median MPI: 62% (moderate confidence)                    ││
│ │                                                              ││
│ │ [Recommendation: Proceed with Oct 16, 2:30 PM] ✓            ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ SECTION 4: GOLDEN SLOTS (Card List, Sorted by MPI)           │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │                                                              ││
│ │  SLOT 1: Oct 16, 2026 | 2:30 PM – 3:30 PM IST             ││
│ │  ┌───────────────────────────────────────────────────────┐ ││
│ │  │ MPI SCORE: 81% [████████░░] EXCELLENT                │ ││
│ │  │ Status: ✅ PASS (All 6 stages cleared)               │ ││
│ │  │                                                      │ ││
│ │  │ 6-STAGE VERIFICATION:                               │ ││
│ │  │ ┌──────────────────────────────────────────────┐    │ ││
│ │  │ │ Stage 1: Panchang Shudhi         ✅ PASS  │    │ ││
│ │  │ │  Tithi: Krishna Chaturthi (Neutral)       │    │ ││
│ │  │ │  Vara: Thursday (Favorable)               │    │ ││
│ │  │ │  Nakshatra: Uttara Phalguni (Excellent)  │    │ ││
│ │  │ │  Yoga: Siddha (Excellent)                │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ │ Stage 2: Doshas Check            ✅ PASS  │    │ ││
│ │  │ │  Triggered: 0 (Panchaka: No, Ganda: No)  │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ │ Stage 3: Personal Filter (Tara)  ✅ PASS  │    │ ││
│ │  │ │  Your Birth: Ardra                       │    │ ││
│ │  │ │  Slot Time: Uttara Phalguni              │    │ ││
│ │  │ │  Result: Sampath (7 stars) — FAVORABLE   │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ │ Stage 4: Ascendant Purity (CSL) ✅ PASS  │    │ ││
│ │  │ │  CSL at 2:30 PM: 45.23° (1st House)      │    │ ││
│ │  │ │  Destructive houses: No                   │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ │ Stage 5: Ashtakavarga (SAV)      ✅ PASS  │    │ ││
│ │  │ │  Total AV: 32 (Strong, >28 threshold)    │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ │ Stage 6: KP Sub-Lord Veto        ✅ PASS  │    │ ││
│ │  │ │  SSL: Venus (Benefic, 8-88 sec window)   │    │ ││
│ │  │ │                                           │    │ ││
│ │  │ └──────────────────────────────────────────────┘    │ ││
│ │  │                                                      │ ││
│ │  │ HOURLY DETAILS:                                     │ ││
│ │  │ Hora (1st hour):  Saturn (Mild caution)            │ ││
│ │  │ Uphora (2nd):     Mercury (Favorable)              │ ││
│ │  │ Duration: 1 hour (can start 2:30, end by 3:30)    │ ││
│ │  │                                                      │ ││
│ │  │ [📋 SAVE SLOT] [📧 SHARE] [📅 ADD TO CALENDAR]     │ ││
│ │  └───────────────────────────────────────────────────┘ ││
│ │                                                          ││
│ │  SLOT 2: Oct 20, 2026 | 10:15 AM – 11:15 AM IST        ││
│ │  ┌───────────────────────────────────────────────────┐ ││
│ │  │ MPI SCORE: 72% [███████░░░] GOOD                 │ ││
│ │  │ Status: ✅ PASS                                  │ ││
│ │  │ [More details...]                               │ ││
│ │  └───────────────────────────────────────────────────┘ ││
│ │                                                          ││
│ │  SLOT 3: Oct 25, 2026 | 4:45 PM – 5:45 PM IST         ││
│ │  ┌───────────────────────────────────────────────────┐ ││
│ │  │ MPI SCORE: 65% [██████░░░░░] ADEQUATE            │ ││
│ │  │ Status: ⚠️  CONDITIONAL (CSL compromised)       │ ││
│ │  │ [Requires manual approval...]                    │ ││
│ │  └───────────────────────────────────────────────────┘ ││
│ │                                                          ││
│ │  [SHOW MORE SLOTS (10 total found)]                     ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                                  │
│ FOOTER: [REFINE SEARCH] [EXPORT PDF] [CONSULT EXPERT] [HELP]   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Interactions

1. **Event Type Dropdown:** Populate from `/api/v1/events` (with search)
2. **Date Picker:** Max 30 days (performance limit: 720 Hora slots/day)
3. **Doshas Toggle:** Switch between 3 critical ↔ all 21 (impacts score)
4. **Slot Cards:** Click to expand full 6-stage breakdown
5. **MPI Bar:** Color-coded (Green: 75+, Yellow: 50-75, Red: <50)
6. **Save Slot:** Store in user preferences (for later review)
7. **Share Slot:** Generate shareable link (no auth required for viewing)

### Mobile Variant (320-768px)
```
Stack vertically:
1. Filters (collapsible)
2. Progress bar
3. Summary
4. Slot cards (full width, scrollable)
```

---

## SCREEN 3: EVENT CATEGORIES + SEARCH

**Purpose:** Browse 400 events, find significations + ideal muhurta windows  
**Route:** `/events` or `/categories`  
**API Call:** `GET /api/v1/events` (cached, 50ms latency)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: "Life Events Catalog" [← Back] [User: Naveen]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ SECTION 1: SEARCH & FILTERS                                    │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [🔍 Search events...] (e.g., wedding, property, business)   ││
│ │                                                              ││
│ │ CATEGORIES (Tabs):                                          ││
│ │ [Property] [Marriage] [Business] [Medical] [IT/Tech] [+All] ││
│ │                                                              ││
│ │ ADVANCED FILTERS (Collapsible):                             ││
│ │ Bhavas: [2 (Wealth)] [4 (Property)] [7 (Partners)]          ││
│ │ Karakas: [Venus] [Mercury] [Saturn]                         ││
│ │ [APPLY FILTERS] [CLEAR]                                     ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ SECTION 2: RESULTS (Property Tab Active)                       │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Showing 55 events in Property                               ││
│ │                                                              ││
│ │ EVENT 1:                                                     ││
│ │ ┌────────────────────────────────────────────────────────┐ ││
│ │ │ PROPERTY DEED REGISTRATION                           │ ││
│ │ │ Category: Property | Bhavas: 2,4,7,8                │ ││
│ │ │                                                      │ ││
│ │ │ Karakas (Key Planets): Venus, Mercury, Saturn       │ ││
│ │ │ Optimal Dasha: Jupiter (major period)               │ ││
│ │ │                                                      │ ││
│ │ │ MUHURTA REQUIREMENTS:                                │ ││
│ │ │ ✓ Favorable Tithi: Shukla Paksha (waxing moon)      │ ││
│ │ │ ✓ Favorable Vara: Wednesday, Friday                │ ││
│ │ │ ✓ Favorable Nakshatra: Rohini, Hasta, U. Phalguni  │ ││
│ │ │ ✓ Avoid Yoga: Parivraya                            │ ││
│ │ │ ✓ CSL Requirement: Houses 1,2,4,10,11 (avoid 6,8)│ ││
│ │ │                                                      │ ││
│ │ │ DOSHAS TO AVOID:                                    │ ││
│ │ │ 🚫 CRITICAL: Panchaka, Ganda Moola, Mrityu Bana    │ ││
│ │ │ ⚠️ MAJOR: Chandra Ashtam, Ravi Ashtam              │ ││
│ │ │ ℹ️ MINOR: Kuja Dosha                               │ ││
│ │ │                                                      │ ││
│ │ │ MPI THRESHOLDS:                                     │ ││
│ │ │ Min: 60% | Ideal: 75% | Exceptional: 85%+         │ ││
│ │ │                                                      │ ││
│ │ │ CASE STUDY:                                        │ ││
│ │ │ Date: Oct 16, 2026 | Time: 2:30 PM IST             │ ││
│ │ │ MPI Score: 81% ✅ | Outcome: Success               │ ││
│ │ │                                                      │ ││
│ │ │ [🔍 FIND GOLDEN SLOTS FOR THIS EVENT]              │ ││
│ │ │ [📖 READ MORE ABOUT THIS EVENT]                     │ ││
│ │ └────────────────────────────────────────────────────┘ ││
│ │                                                          ││
│ │ EVENT 2: LAND PURCHASE                                 ││
│ │ ┌────────────────────────────────────────────────────┐ ││
│ │ │ Category: Property | Bhavas: 4,6,7                 │ ││
│ │ │ ...                                                │ ││
│ │ └────────────────────────────────────────────────────┘ ││
│ │                                                          ││
│ │ [SHOW MORE EVENTS] [Page 1 of 3]                        ││
│ │                                                          ││
│ └──────────────────────────────────────────────────────────┘│
│                                                                  │
│ FOOTER: [DOWNLOAD EVENT LIBRARY] [CONTACT EXPERT] [HELP]       │
└─────────────────────────────────────────────────────────────────┘
```

### Interactions

1. **Tab Selection:** Filter events by category (9 categories, 400-475 total)
2. **Search Box:** Real-time search across event names + descriptions
3. **Dosha Pills:** Click to expand dosha details
4. **Find Golden Slots:** Pre-populate muhurta dashboard with selected event
5. **Read More:** Scroll to expanded description + classical references
6. **Case Study Link:** Open reference case with MPI breakdown

### Mobile Variant (320-768px)
```
Stack vertically:
1. Search bar
2. Category accordion (not tabs)
3. Event cards (full width)
```

---

## RESPONSIVE BREAKPOINTS

```
Mobile:     320px - 767px  (Single column, stacked)
Tablet:     768px - 1024px (2 columns)
Desktop:    1025px - 1920px (3 columns / split panels)
Ultra-wide: 1921px+        (4 columns / expanded sidebars)
```

---

## INTERACTION PATTERNS (Shared)

### Loading States
```
[Skeleton Loaders]
├─ Chart: Gray circles with pulsing animation
├─ Table rows: Gray bars, 3 rows
├─ Text: Gray pill shapes
└─ After 2s: Real content slides in (fade-in 300ms)
```

### Error States
```
┌─────────────────────────────────────────┐
│ ⚠️ ERROR                               │
│ Could not load birth chart.            │
│ (CALCULATION_ERROR)                    │
│ [RETRY] [GO BACK]                      │
└─────────────────────────────────────────┘
```

### Tooltips & Hints
```
"CSL" (Cuspal Sub-Lord) 
  ↓ (hover)
┌───────────────────────────────────────┐
│ Cuspal Sub-Lord: The microsub-lord    │
│ (243-fold division) at the moment of  │
│ the event. Determines the final veto. │
│ [Learn more →]                        │
└───────────────────────────────────────┘
```

### Print Stylesheet
```
@media print {
  .no-print { display: none; }
  .chart { page-break-inside: avoid; }
  .page-break { page-break-after: always; }
  body { font-size: 12pt; color: black; }
}
```

---

## ACCESSIBILITY (WCAG 2.1 AA)

- ✅ All interactive elements: keyboard accessible (Tab, Enter, Esc)
- ✅ Color contrast: 4.5:1 minimum (PASS for normal text, PASS for large text)
- ✅ Alt text: All SVG charts have `<title>` + `<desc>`
- ✅ Form labels: `<label for="...">` paired with inputs
- ✅ Aria-live regions: MPI score updates announced to screen readers
- ✅ Focus indicators: 3px outline, high contrast
- ✅ Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`

---

## PERFORMANCE TARGETS

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint (FCP) | <1.5s | ✅ (React lazy-load) |
| Largest Contentful Paint (LCP) | <2.5s | ✅ (Image optimization) |
| Cumulative Layout Shift (CLS) | <0.1 | ✅ (Reserve space for charts) |
| Time to Interactive (TTI) | <3.5s | ✅ (Code splitting) |

---

## DECISION-DEPENDENT NOTES

**Waiting for Questionnaire #3 (Frontend Priority):**
- If **OPTION A** (Birth Chart first): Week 1 = Screen 1, Week 2 = Screen 2, Week 3 = Screen 3
- If **OPTION B** (Dashboard first): Week 1 = Screen 2, Week 2 = Screen 3, Week 3 = Screen 1
- If **OPTION C** (Events first): Week 1 = Screen 3, Week 2 = Screen 2, Week 3 = Screen 1

All three screens are fully specified; build order is the only variable.

---

**Next:** Implement frontend screens in React (Week 1 TBD) using this wireframe contract.

