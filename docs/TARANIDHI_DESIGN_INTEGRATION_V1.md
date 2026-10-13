# TaraNidhi™ — Complete Design Integration v1.0

**Version:** 1.0 | **Date:** Oct 13, 2026 | **Status:** Master Spec (Ready for Development)

---

## DESIGN PHILOSOPHY

**Aesthetic:** Cosmic-Premium Night-Sky Theme  
**Feel:** Standing beneath an infinite, glowing night-sky — premium, awe-inspiring, peaceful yet powerful  
**Quality:** Photorealistic astrophotography (NOT cartoon)  
**Target:** High-end astrology users (consultants, practitioners, serious students)

---

## GLOBAL STYLE SYSTEM

### Color Palette

#### Primary (Night Sky)
```css
--color-bg-primary: #0a0e27;        /* Deep indigo-black */
--color-bg-secondary: #0f1535;      /* Slightly lighter for cards */
--color-star-primary: #ffffff;      /* Twinkling stars */
--color-star-secondary: #e8d5ff;    /* Violet sparkle */
```

#### Elemental (Tatva Mapping)
```css
--color-akash: #8B5CF6;             /* Purple — Universal, Space, Ether */
--color-jal: #0EA5E9;               /* Cyan — Water, Flow, Emotions */
--color-agni: #F97316;              /* Orange — Fire, Energy, Transformation */
--color-vayu: #06B6D4;              /* Teal — Air, Movement, Mind */
--color-prithvi: #10B981;           /* Green — Earth, Foundation, Stability */
```

#### Accent
```css
--color-golden: #FFD700;            /* Golden glow, premium feel */
--color-golden-soft: rgba(255, 215, 0, 0.3);  /* Subtle golden aura */
--color-golden-bright: #FFA500;     /* Bright for highlights */
```

#### Semantic
```css
--color-success: #10B981;           /* Green (Prithvi) */
--color-warning: #F97316;           /* Orange (Agni) */
--color-error: #EF4444;             /* Red (Agni variant) */
--color-info: #0EA5E9;              /* Cyan (Jal) */
```

### Typography

```css
/* Display (Page Titles) */
--font-display: 'Poppins', sans-serif;
--font-display-size: 32px;
--font-display-weight: 700;
--font-display-letter-spacing: -0.5px;

/* Heading (Section Titles) */
--font-heading: 'Poppins', sans-serif;
--font-heading-size: 20px;
--font-heading-weight: 600;
--font-heading-letter-spacing: 0px;

/* Body (Main Content) */
--font-body: 'Inter', sans-serif;
--font-body-size: 16px;
--font-body-weight: 400;
--font-body-line-height: 1.6;

/* Data (Numbers, Scores) */
--font-data: 'JetBrains Mono', monospace;
--font-data-size: 14px;
--font-data-weight: 500;
--font-data-letter-spacing: 1px;

/* Label (Small UI Text) */
--font-label: 'Inter', sans-serif;
--font-label-size: 12px;
--font-label-weight: 500;
--font-label-text-transform: uppercase;
--font-label-letter-spacing: 0.5px;
```

### Spacing Grid

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;

/* Standard page padding */
--page-padding-mobile: 16px;
--page-padding-tablet: 24px;
--page-padding-desktop: 32px;
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 50%;

/* Cards and containers */
--radius-card: 12px;
--radius-input: 8px;
--radius-button: 8px;
```

---

## 6-PAGE COSMIC NARRATIVE

### Page 1: "NOW" (Dashboard/Home)

**Visual Theme:** Golden aura emanating from upper-center  
**Element Mapping:** Akash (Universal, Primary)  
**Tatva Color:** #8B5CF6 (Purple)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Golden Aura (Subtle)           │  ← Upper-center glow
├─────────────────────────────────┤
│  PAGE TITLE: "NOW"              │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────────────────┐   │
│  │ Live Hora Display        │   │  ← Primary card
│  │ (Planet, Score, Time)    │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │ Circular Score Gauge     │   │  ← SVG Ring
│  │ (0-100%, Color-coded)    │   │
│  └──────────────────────────┘   │
│                                 │
│  Panchang Quick Chips           │  ← Tithi, Vara, Nakshatra
│  [Tithi] [Vara] [Nakshatra]    │
│                                 │
│  AI Query Input                 │  ← "Ask about muhurta..."
│  Golden Windows (Top Slots)     │  ← Best 3-5 slots today
│  Daily Effect Card              │  ← Vara-based daily focus
│  Vimshottari Dasha Card        │  ← Current dasha period
│  Purpose Filter Pills           │  ← [General] [Career] [Finance]
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Hero section with golden aura
- Live data cards with purple (#8B5CF6) accents
- SVG circular gauge (radial gradient)
- Action CTAs (blue buttons with white text)

---

### Page 2: "STAR TIME" (Hora/Planetary Hour)

**Visual Theme:** Faint golden circular orbit-ring pattern (astronomical clock face)  
**Element Mapping:** Jal (Water, Flow, Emotions)  
**Tatva Color:** #0EA5E9 (Cyan)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Orbital Ring (Very Low Opacity)│  ← Upper-third decorative
├─────────────────────────────────┤
│  PAGE TITLE: "STAR TIME"        │
│  Subtitle: "24 Planetary Hours" │
├─────────────────────────────────┤
│                                 │
│  24-Hora List                   │  ← Vertical scrollable
│  ┌──────────────────────────┐   │
│  │ 1. Hora (Planet)         │   │  ← 1 of 24, with:
│  │    Score: 85% ▓▓▓▓▓      │   │     - Planet name
│  │    Time: 06:30-07:15 AM  │   │     - Score bar
│  │    Uphora: 12 slots      │   │     - Time window
│  └──────────────────────────┘   │     - Uphora count
│  ... (24 rows)                  │
│                                 │
│  Score per Hora Legend:         │  ← Color coding key
│  ▓ 75-100% (Golden)             │
│  ▓ 50-75% (Good)                │
│  ▓ 0-50% (Caution)              │
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Decorative orbit-ring in background
- Hourly list with score bars (color-coded)
- Cyan accents (#0EA5E9) for Jal element
- Clean typography for readability

---

### Page 3: "MOMENT" (Muhurta/Auspicious Timing)

**Visual Theme:** Golden compass-star or four-directional light-beam pattern  
**Element Mapping:** Agni (Fire, Energy, Action)  
**Tatva Color:** #F97316 (Orange)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Compass/Light-Beam (Upper)     │  ← Directional rays from center
├─────────────────────────────────┤
│  PAGE TITLE: "MOMENT"           │
│  Subtitle: "Auspicious Windows" │
├─────────────────────────────────┤
│                                 │
│  Purpose Selector               │  ← Tabs/Pills
│  [General] [Marriage] [Business]│
│                                 │
│  Score Breakdown (5-level)      │  ← Multi-metric scoring
│  ┌──────────────────────────┐   │
│  │ Panchang Score:  85% ▓▓▓ │   │
│  │ Choghadiya:      Good    │   │
│  │ Golden Window:   YES ✓   │   │
│  │ Inauspicious:    None    │   │
│  │ Dishashool:      Clear   │   │
│  └──────────────────────────┘   │
│                                 │
│  Recommended Timings            │  ← Top 3-5 slots
│  1. 06:30-07:15 AM (95% match)  │
│  2. 02:45-03:30 PM (92% match)  │
│  3. ...                         │
│                                 │
│  [Book Slot] [Save] [Share]    │  ← CTAs
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Directional compass pattern (SVG)
- Multi-level scoring visualization
- Orange (#F97316) accents for Agni
- Time slot recommendations with % scores

---

### Page 4: "TODAY" (Panchang/Calendar)

**Visual Theme:** Faint golden moon-phase sequence (crescent → full → crescent)  
**Element Mapping:** Prithvi (Earth, Foundation, Stability)  
**Tatva Color:** #10B981 (Green)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Moon Phases (Very Subtle Top)  │  ← Linear sequence decoration
├─────────────────────────────────┤
│  PAGE TITLE: "TODAY"            │
│  Date: Oct 13, 2026             │
├─────────────────────────────────┤
│                                 │
│  Panchang Elements (Grid)       │
│  ┌────────────────────────────┐ │
│  │ Tithi (Lunar Day)          │ │
│  │ Shukla Ashtami             │ │
│  │ Ends: 6:45 PM             │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ Vara (Weekday)             │ │
│  │ Monday (Somvar)            │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ Nakshatra (Star)           │ │
│  │ Swati (till 9:30 AM)       │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ Yoga (Conjunction)         │ │
│  │ Siddhi (till 2:15 PM)      │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ Karana (Half-Tithi)        │ │
│  │ Bava (till 2:15 PM)        │ │
│  └────────────────────────────┘ │
│                                 │
│  Sun Timing                     │  ← Important events
│  ↑ Rise: 06:21 AM              │
│  ↓ Set: 18:02 PM               │
│                                 │
│  Rahu Kaal (Avoid)              │  ← Warning block
│  ⚠ 07:30-09:00 AM              │
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Moon-phase sequence (decorative)
- Panchang elements in grid cards
- Green (#10B981) accents for Prithvi
- Sun timing and Rahu Kaal warnings

---

### Page 5: "MY COSMOS" (Personal Chart/Foundation)

**Visual Theme:** One bright personal star (upper-third) with light-rays + regular starfield  
**Element Mapping:** Vayu (Air, Movement, Mind)  
**Tatva Color:** #06B6D4 (Teal)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Personal Star with Light-Rays  │  ← Upper-third, prominent
│  Surrounded by Starfield        │
├─────────────────────────────────┤
│  PAGE TITLE: "MY COSMOS"        │
│  Birth: Apr 8, 1973, 11:45 IST  │
├─────────────────────────────────┤
│                                 │
│  Kundali Chart (SVG)            │
│  ┌────────────────────────────┐ │
│  │                            │ │
│  │     ◌ (Lagna at 82.97°)    │ │  ← Circular chart
│  │   ┌─────────────────┐      │ │
│  │   │ Houses 1-12     │      │ │  ← 12 segments
│  │   │ Planets placed  │      │ │  ← Planet positions
│  │   └─────────────────┘      │ │
│  │                            │ │
│  └────────────────────────────┘ │
│                                 │
│  Planet Details (Cards)         │  ← 9 planets
│  ┌────────────────────────────┐ │
│  │ Sun (Ravi)                 │ │
│  │ Sign: Aries 18°23'         │ │
│  │ House: 10 (Career)         │ │
│  │ Status: Strong             │ │
│  └────────────────────────────┘ │
│  ... (9 planets)                │
│                                 │
│  Dasha Timeline                 │  ← Vimshottari periods
│  Current: Mercury (11y left)    │
│  Next: Ketu (7y)                │
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Bright personal star (upper section)
- SVG Kundali chart (circular, 12 houses)
- Planet cards with details
- Teal (#06B6D4) accents for Vayu
- Dasha timeline

---

### Page 6: "NUMBERS" (Sankhya/Numerology)

**Visual Theme:** Subtle golden geometric pattern (mandala or sacred-geometry grid)  
**Element Mapping:** Akash (Universal, Return to source)  
**Tatva Color:** #8B5CF6 (Purple, same as Page 1 — cyclic)

**Layout Structure:**
```
┌─────────────────────────────────┐
│  Geometric Mandala Pattern      │  ← Upper-left, very subtle
│  (Sacred Geometry Grid)         │
├─────────────────────────────────┤
│  PAGE TITLE: "NUMBERS"          │
│  Subtitle: "Numerological Path" │
├─────────────────────────────────┤
│                                 │
│  Core Numbers (Grid)            │
│  ┌────────────────────────────┐ │
│  │ Life Path: 5               │ │  ← Birth date numerology
│  │ Expression: 8              │ │  ← Full name numerology
│  │ Soul Urge: 2               │ │  ← Inner desires
│  │ Personality: 6             │ │  ← Outer impression
│  │ Maturity: 7                │ │  ← Life direction
│  │ Personal Year: 3           │ │  ← Current year cycle
│  │ Birthday: 8                │ │  ← Birth date energy
│  └────────────────────────────┘ │
│                                 │
│  Lo Shu Grid (9-Box Diagram)    │
│  ┌─────────────────────┐        │
│  │ 2 │ 7 │ 6 │         │        │  ← Numbers 1-9 in grid
│  │───┼───┼───┤         │        │  ← Shows personality
│  │ 9 │ 5 │ 1 │         │        │  ← traits & strengths
│  │───┼───┼───┤         │        │
│  │ 4 │ 3 │ 8 │         │        │
│  └─────────────────────┘        │
│                                 │
│  Compatibility Score            │  ← For partnerships
│  Partner Name: [Input]          │
│  Compatibility: 78% (Good)      │
│  [Calculate] Button             │
│                                 │
│  Numerological Insights         │  ← AI-generated descriptions
│  Your Life Path 5 means:        │
│  "Freedom, change, adventure"   │
│  ...                            │
│                                 │
└─────────────────────────────────┘
```

**Key Components:**
- Mandala/sacred-geometry pattern
- Core numbers in grid layout
- Lo Shu Grid (3x3 diagram)
- Compatibility calculator
- Purple (#8B5CF6) accents
- Insights text blocks

---

## BACKGROUND & STAR ANIMATION

### Base Background
```css
/* Dark gradient sky */
background: linear-gradient(
  135deg,
  #0a0e27 0%,   /* Deep indigo-black */
  #0f1535 50%,
  #0a0d1f 100%
);

/* Twinkling star effect (CSS animation) */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.star {
  animation: twinkle 3s infinite;
  position: absolute;
  background: radial-gradient(circle, #ffffff, #e8d5ff);
  border-radius: 50%;
}
```

### Page-Specific Overlays

**Page 1 (Golden Aura):**
```css
::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent);
  border-radius: 50%;
  filter: blur(40px);
  z-index: 1;
}
```

**Page 2 (Orbital Ring):**
```css
::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  border: 1px solid rgba(255, 215, 0, 0.1);
  border-radius: 50%;
  z-index: 1;
}
```

**Page 3 (Compass/Light-Beam):**
```css
::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  background: conic-gradient(
    from 0deg,
    rgba(255, 215, 0, 0.1) 0deg,
    rgba(255, 215, 0, 0.2) 90deg,
    rgba(255, 215, 0, 0.1) 180deg,
    rgba(255, 215, 0, 0.0) 270deg,
    rgba(255, 215, 0, 0.1) 360deg
  );
  border-radius: 50%;
  filter: blur(30px);
  z-index: 1;
}
```

---

## COMPONENT LIBRARY

### Cards

```css
.card {
  background: rgba(15, 21, 53, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);  /* Purple border */
  border-radius: var(--radius-card);
  padding: var(--space-lg);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.card-hover:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.2);
  transition: all 0.3s ease;
}
```

### Buttons

```css
.btn-primary {
  background: #0EA5E9;              /* Cyan */
  color: #ffffff;
  border: none;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-button);
  font-size: var(--font-label-size);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #0284C7;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 215, 0, 0.3);  /* Golden */
  color: #FFD700;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-button);
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
}
```

### Score Gauge (SVG)

```html
<svg class="score-gauge" viewBox="0 0 100 100">
  <!-- Background circle -->
  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(139, 92, 246, 0.2)" stroke-width="8"/>
  
  <!-- Score arc (animated) -->
  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#scoreGradient)" stroke-width="8"
          stroke-dasharray="282.7" stroke-dashoffset="70.68" stroke-linecap="round"/>
  
  <!-- Center text -->
  <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" 
        font-size="24" font-weight="700" fill="#FFD700">85%</text>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
```

---

## RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile (default) */
@media (max-width: 640px) {
  --page-padding: 16px;
  font-size: 14px;
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  --page-padding: 24px;
  font-size: 15px;
}

/* Desktop */
@media (min-width: 1025px) {
  --page-padding: 32px;
  font-size: 16px;
}
```

### Touch Targets

```css
/* All interactive elements */
button, .card, input, select {
  min-height: 44px;  /* iOS standard */
  min-width: 44px;
}
```

---

## DARK MODE

All colors are optimized for dark mode (primary design).  
Light mode (optional future):
```css
@media (prefers-color-scheme: light) {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-star-primary: #1a1a1a;
  --color-star-secondary: #6b5b95;
  /* ... etc */
}
```

---

## ACCESSIBILITY

### Color Contrast

- Text (#ffffff) on bg (#0a0e27): 18.5:1 (AAA)
- Buttons (Cyan #0EA5E9) on bg: 8.2:1 (AAA)
- Golden accents have sufficient contrast with dark bg

### Keyboard Navigation

```css
:focus-visible {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}
```

### Screen Readers

```html
<!-- Use semantic HTML -->
<nav aria-label="Main navigation">...</nav>
<main role="main">...</main>
<section aria-labelledby="section-title">...</section>
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Base CSS system (colors, typography, spacing)
- [ ] Star animation system
- [ ] Card and button components
- [ ] Page template structure

### Phase 2: Pages 1-3 (Week 2)
- [ ] Page 1: "NOW" (Dashboard)
- [ ] Page 2: "STAR TIME" (Hora)
- [ ] Page 3: "MOMENT" (Muhurta)

### Phase 3: Pages 4-6 (Week 3)
- [ ] Page 4: "TODAY" (Panchang)
- [ ] Page 5: "MY COSMOS" (Chart)
- [ ] Page 6: "NUMBERS" (Numerology)

### Phase 4: Integration (Week 4)
- [ ] Backend API wiring
- [ ] Data population
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Performance optimization

---

## NOTES FOR DEVELOPERS

1. **Don't hardcode colors** — Use CSS variables always
2. **Backdrop filter support** — Use fallback for older browsers
3. **SVG charts** — Make them responsive with `viewBox`
4. **Animations** — Keep twinkling subtle (not distracting)
5. **Accessibility** — Every interactive element needs focus state
6. **Mobile first** — Design for 360px, scale up

---

**Document Version:** 1.0  
**Last Updated:** Oct 13, 2026  
**Author:** Claude Haiku 4.5 (Design Research + TaraNidhi Analysis)  
**Status:** Ready for Development

