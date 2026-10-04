# OCCULTVIISION Vedic Five Elements Theme
## Custom Theme Specification for Task 75

---

## Theme Identity

**Name:** Vedic Five Elements (WAFES)  
**Purpose:** Design system for OCCULTVIISION Kaalchakra Pro  
**Audience:** Global, professional, accessible  
**Philosophy:** Material Design 3 + Vedic foundation (subtle, not ornate)

---

## Color Palette

### Primary Elements (Accent Colors)

```
AKASH (Space/Consciousness)
  Primary:    #8B5CF6 (Purple — cosmic, spiritual)
  Light:      #DDD6FE (Very light purple — subtle accent)
  Dark:       #A78BFA (Brighter purple for dark mode)
  Usage:      Birth charts, cosmic view, dashboards
  
AGNI (Fire/Energy)
  Primary:    #F97316 (Orange — transformation, action)
  Light:      #FED7AA (Light orange — soft accent)
  Dark:       #FB923C (Brighter orange for dark mode)
  Usage:      Muhurta, timing, activation states
  
JAL (Water/Flow)
  Primary:    #0EA5E9 (Cyan — flow, emotion, balance)
  Light:      #CFFAFE (Light cyan — subtle)
  Dark:       #06B6D4 (Teal for dark mode)
  Usage:      Numerology, flow, relationships
  
VAYU (Air/Movement)
  Primary:    #06B6D4 (Teal — movement, freedom)
  Light:      #CFFAFE (Light teal — subtle)
  Dark:       #22D3EE (Brighter cyan for dark mode)
  Usage:      Recommendations, next steps, movement
  
PRITHVI (Earth/Stability)
  Primary:    #10B981 (Green — stability, nourishment)
  Light:      #D1FAE5 (Light green — subtle)
  Dark:       #34D399 (Brighter green for dark mode)
  Usage:      Wallet, stability, account, foundation
```

### Neutral Colors (Light Mode)

```
Backgrounds:
  --bg-primary:      #FFFFFF    (Page background)
  --bg-secondary:    #F8F7F6    (Card, surface backgrounds)
  --bg-tertiary:     #F0EEEC    (Disabled, secondary surfaces)

Text:
  --text-primary:    #1A1A1A    (Main text, 14px+ = 7.4:1 contrast)
  --text-secondary:  #666666    (Helper text, 11px+ = 4.5:1 contrast)
  --text-inverse:    #FFFFFF    (Text on dark backgrounds)

Borders & Dividers:
  --border-color:    #D1D5DB    (Subtle dividers, borders)
```

### Neutral Colors (Dark Mode)

```
Backgrounds:
  --bg-primary:      #0F0F0F    (Dark page background, not pure black)
  --bg-secondary:    #1A1A1A    (Dark card, surface backgrounds)
  --bg-tertiary:     #242424    (Dark disabled, secondary surfaces)

Text:
  --text-primary:    #FFFFFF    (Light text on dark)
  --text-secondary:  #AAAAAA    (Light helper text)

Borders & Dividers:
  --border-color:    #404040    (Subtle dividers on dark)
```

### Semantic Colors (Both Themes)

```
--success:         #10B981    (Green — actions, confirmations)
--warning:         #F59E0B    (Amber — cautions, alerts)
--error:           #EF4444    (Red — errors, destructive)
--info:            #3B82F6    (Blue — information, notes)
```

---

## Typography

### Font Families

```
Display (Headings, Hero):
  Font-family:     'Poppins', -apple-system, system-ui, sans-serif
  Source:          Google Fonts (free, global-friendly)
  Usage:           h1, h2, h3, hero text
  Weights:         600 (semibold), 700 (bold)
  Letter-spacing:  -0.01em (tighten for prominence)

Body (Running Text, UI):
  Font-family:     'Inter', -apple-system, system-ui, sans-serif
  Source:          Google Fonts (free, screen-optimized)
  Usage:           p, span, labels, input text
  Weights:         400 (regular), 500 (medium)
  Letter-spacing:  0 (neutral)

Data / Tabular (Charts, Numbers):
  Font-family:     'JetBrains Mono', 'Fira Code', monospace
  Source:          Google Fonts (free)
  Usage:           code, numbers in tables, data
  Weights:         400 (regular)
  Letter-spacing:  0.01em (align columns)
```

### Type Scale

```
12px  — Caption, helper text (small)
14px  — Body text, form labels, UI
16px  — Standard body, default UI
18px  — Large UI, subheadings
20px  — Section headings
24px  — Page headings
32px  — Hero, primary headings
48px  — Display (splash screens only)
```

### Line Heights

```
--lh-tight:   1.2   (Headings, labels)
--lh-normal:  1.5   (Body text, readable)
--lh-loose:   1.75  (Accessible body, long-form)
```

---

## Component Styling

### Buttons

```
Primary (Action)
  Background:   Elemental accent (or --info #3B82F6 default)
  Text:         White (#FFFFFF)
  Padding:      12px vertical, 16px horizontal
  Border-radius: 6px
  Hover:        -10% brightness
  Active:       -15% brightness

Secondary (Alternative)
  Background:   --bg-tertiary (#F0EEEC light / #242424 dark)
  Text:         --text-primary
  Border:       1px solid --border-color
  Padding:      12px vertical, 16px horizontal
  Hover:        -5% brightness

Tertiary (Ghost)
  Background:   transparent
  Text:         --text-primary
  Border:       2px solid --border-color
  Padding:      12px vertical, 16px horizontal
  Hover:        +5% brightness (slight bg tint)

Danger (Destructive)
  Background:   --error (#EF4444)
  Text:         White (#FFFFFF)
  Padding:      12px vertical, 16px horizontal
  Hover:        -10% brightness
```

### Forms & Inputs

```
Text / Email / Number Inputs
  Border:         1px solid --border-color
  Background:     --bg-tertiary
  Padding:        12px 16px
  Border-radius:  6px
  Font:           Body (Inter 400)
  Focus:          2px border (elemental color or --info)
  Focus-ring:     transparent (border change only)
  
Disabled State:
  Background:     --bg-secondary (lighter)
  Border:         1px solid #D1D5DB (lighter border)
  Text:           --text-secondary
  Cursor:         not-allowed

Error State:
  Border:         2px solid --error
  Background:     rgba(239, 68, 68, 0.05) (light red tint)
  Message:        12px text-error below input
```

### Cards

```
Card Container
  Background:     --bg-secondary
  Border:         1px solid rgba(0,0,0,0.06) light / rgba(255,255,255,0.06) dark
  Border-radius:  8px
  Padding:        24px
  Box-shadow:     0 1px 2px rgba(0,0,0,0.05)
  Margin-bottom:  16px

Card Hover (Interactive):
  Box-shadow:     0 4px 6px rgba(0,0,0,0.1)
  Transform:      translateY(-2px)
  Transition:     all 150ms ease
```

### Alerts / Toasts

```
Success (Green)
  Background:     rgba(16, 185, 129, 0.1)
  Border-left:    4px solid #10B981
  Text:           14px, --text-primary
  Icon:           ✓ (checkmark)

Warning (Amber)
  Background:     rgba(245, 158, 11, 0.1)
  Border-left:    4px solid #F59E0B
  Text:           14px, --text-primary
  Icon:           ⚠ (warning)

Error (Red)
  Background:     rgba(239, 68, 68, 0.1)
  Border-left:    4px solid #EF4444
  Text:           14px, --text-primary
  Icon:           ✗ (error)
```

---

## Spacing & Layout

### Spacing Scale (8px Base)

```
--space-1:   4px    (Micro gaps)
--space-2:   8px    (Base)
--space-3:   12px   (Small components)
--space-4:   16px   (Standard)
--space-6:   24px   (Section spacing)
--space-8:   32px   (Section separators)
--space-12:  48px   (Major sections)
--space-16:  64px   (Page-level spacing)
```

### Grid

```
Desktop (1200px+):   12-column grid, 16px gutter, 88px side margins
Tablet (768px):      8-column grid, 16px gutter, 24px side margins
Mobile (360px):      4-column grid, 8px gutter, 16px side margins
Side padding:        16px minimum (all widths)
```

### Border Radius

```
--radius-sm:   4px      (Subtle)
--radius-md:   6px      (Default)
--radius-lg:   8px      (Cards, modals)
--radius-xl:   12px     (Large modals)
--radius-full: 9999px   (Pills, badges)
```

---

## Dark Mode Implementation

### CSS Token Structure

```css
/* Light Mode (Default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F7F6;
  --text-primary: #1A1A1A;
  /* All light tokens... */
}

/* Dark Mode (via prefers-color-scheme) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0F0F0F;
    --bg-secondary: #1A1A1A;
    --text-primary: #FFFFFF;
    /* All dark tokens... */
    color-scheme: dark;
  }
}

/* Dark Mode (explicit data-theme) */
:root[data-theme="dark"] {
  --bg-primary: #0F0F0F;
  --bg-secondary: #1A1A1A;
  --text-primary: #FFFFFF;
  /* All dark tokens... */
  color-scheme: dark;
}
```

---

## Accessibility (WCAG 2.1 AAA)

### Color Contrast

```
Normal Text (14px+):      7:1 minimum
Large Text (18px+ bold):  4.5:1 minimum
UI Components (buttons):  3:1 minimum
Disabled states:          4.5:1 (not reduced further)
```

### Requirements

- [ ] Color contrast verified for all text + backgrounds
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation full access
- [ ] ARIA labels on form inputs, buttons, icons
- [ ] Heading hierarchy (h1 → h6, no skips)
- [ ] Image alt text (all images)
- [ ] Form labels with <label> and for attribute
- [ ] Error messages clear + linked to field
- [ ] prefers-reduced-motion respected
- [ ] Touch targets 44×44px minimum (mobile)

---

## Element-to-Feature Mapping

```
Screen              Element     Color           Accent Use
─────────────────────────────────────────────────────────────
/kundali            Akash       #8B5CF6         Section headers, chart title border
/muhurta            Agni        #F97316         Timing badges, "Go" CTA buttons
/numerology         Jal         #0EA5E9         Flow indicators, number displays
/recommendations    Vayu        #06B6D4         Next-step CTA, movement arrows
/wallet             Prithvi     #10B981         Balance display, transaction labels
/dashboard          Multiple    #3B82F6 (info)  Neutral, each card shows element
/admin              None        Semantic only   No elemental colors (functional)
```

---

## Theme Review Checklist

✅ **Colors:**
- [ ] All hex codes verified
- [ ] Light + Dark mode defined
- [ ] WCAG AAA contrast verified
- [ ] Elemental colors mapped to features
- [ ] Semantic colors (success, warning, error, info)

✅ **Typography:**
- [ ] Font families (Poppins, Inter, JetBrains Mono)
- [ ] Type scale complete (12px-48px)
- [ ] Line heights defined
- [ ] Font weights specified

✅ **Components:**
- [ ] Buttons (primary, secondary, tertiary, danger)
- [ ] Forms (inputs, labels, error states)
- [ ] Cards (surface styling, hover)
- [ ] Alerts (success, warning, error)
- [ ] Spacing consistent

✅ **Accessibility:**
- [ ] Color contrast 7:1+ (AAA)
- [ ] Focus rings visible
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Touch targets 44×44px+

✅ **Dark Mode:**
- [ ] All tokens redefined
- [ ] Equal polish as light mode
- [ ] prefers-color-scheme respected
- [ ] Explicit toggle support

---

**Status:** ✅ READY FOR IMPLEMENTATION

This theme is production-ready for building the complete design system in Task 75.
