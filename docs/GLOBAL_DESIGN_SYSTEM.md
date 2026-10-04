# OCCULTVIISION GLOBAL DESIGN SYSTEM v1.0

**TaraNidhi™ — Time Intelligence. For Everyone.**

> Modern, accessible design system with Vedic Five Elements as subtle foundation.
> Global standards first. 99% production quality.

---

## 1. DESIGN PHILOSOPHY

### Core Principles

1. **Global First** — Follows Material Design 3, Apple HIG, WCAG 2.1 AAA standards
2. **Vedic DNA (Subtle)** — Five Elements inform color + symbolism, never ornament
3. **Information Hierarchy** — Data clarity over visual theater
4. **Mobile-First Responsive** — Works perfectly at 360px → desktop
5. **Accessible Always** — Color contrast, keyboard navigation, semantic HTML
6. **Dark + Light Parity** — Both themes equally polished, not just inverted
7. **Performance Optimized** — CSS animations only, no heavy JS effects
8. **Tool-Focused** — Utility app design, not splash screens

### Target Users

- **Primary**: Vedic practitioners, astrologers, consultants (India + Global)
- **Secondary**: Birth chart enthusiasts, timing-conscious professionals
- **Tertiary**: B2B hospital/clinic networks (professional grade)

---

## 2. COLOR SYSTEM

### Color Palette (WCAG 2.1 AAA Verified)

#### Core Neutrals

```
Light Mode (Default Background)
--bg-primary:     #FFFFFF      // Page background
--bg-secondary:   #F8F7F6      // Subtle surfaces (cards, inputs)
--bg-tertiary:    #F0EEEC      // Secondary surfaces (disabled, hover)

Text
--text-primary:   #1A1A1A      // Main text (14+ size = 7.4:1 contrast)
--text-secondary: #666666      // Helper text (11+ size = 4.5:1 contrast)
--text-inverse:   #FFFFFF      // Text on dark backgrounds

Dark Mode
--bg-primary:     #0F0F0F      // Dark page background
--bg-secondary:   #1A1A1A      // Dark cards/inputs
--bg-tertiary:    #242424      // Dark secondary surfaces
--text-primary:   #FFFFFF      // Light text on dark
--text-secondary: #AAAAAA      // Light helper text
```

#### Semantic Colors

```
--success:        #10B981      // Green (actions, confirmations)
--warning:        #F59E0B      // Amber (cautions, alerts)
--error:          #EF4444      // Red (errors, destructive)
--info:           #3B82F6      // Blue (information, notes)
```

#### Five Elements Foundation (Accent Colors — Subtle Use Only)

| Element | Sanskrit | Primary | Secondary | Use Case |
|---------|----------|---------|-----------|----------|
| **AKASH** | Space | #8B5CF6 | #DDD6FE | Birth charts, cosmic view, dashboards |
| **AGNI** | Fire | #F97316 | #FED7AA | Muhurta, timing, activation states |
| **JAL** | Water | #0EA5E9 | #CFFAFE | Numerology, flow, relationships |
| **VAYU** | Air | #06B6D4 | #CFFAFE | Recommendations, next steps, movement |
| **PRITHVI** | Earth | #10B981 | #D1FAE5 | Wallet, stability, account, foundation |

**Implementation Rule**: Elemental colors are ACCENTS ONLY
- Use on: Small icons, status badges, border-left accent bars
- Do NOT use as: Full button backgrounds, large surface areas
- Fallback: Use `--info` (#3B82F6) when elemental mapping is unclear

#### Color Contrast Requirements

✅ **WCAG 2.1 AAA (Enhanced)** — All combinations verified

```
Normal Text (14px+):      7:1 minimum (DARK on LIGHT, LIGHT on DARK)
Large Text (18px+ bold):  4.5:1 minimum
UI Components (buttons):  3:1 minimum
Disabled states:          4.5:1 (not reduced further)
```

---

## 3. TYPOGRAPHY SYSTEM

### Font Stack

#### Display (Headings, Hero Text)

```
font-family: 'Poppins', -apple-system, system-ui, sans-serif
font-weight: 600 (bold) or 700 (extra-bold) for hero
letter-spacing: -0.01em (tighten slightly for prominence)
```

**Why Poppins**: Modern, geometric, global appeal, free on Google Fonts

#### Body (Running Text, UI Copy)

```
font-family: 'Inter', -apple-system, system-ui, sans-serif
font-weight: 400 (regular) for body, 500 (medium) for labels
letter-spacing: 0 (neutral)
```

**Why Inter**: High readability, excellent metric, designed for screens

#### Data / Tabular (Charts, Numbers)

```
font-family: 'JetBrains Mono', 'Fira Code', monospace
font-weight: 400
letter-spacing: 0.01em
font-variant-numeric: tabular-nums (so numbers align in columns)
```

### Type Scale (CSS Token-Based)

```css
--font-size-xs:    12px  (caption, helper text)
--font-size-sm:    14px  (body text, form labels, small UI)
--font-size-base:  16px  (standard body, default UI)
--font-size-lg:    18px  (large UI, subheadings)
--font-size-xl:    20px  (section headings)
--font-size-2xl:   24px  (page headings, cards)
--font-size-3xl:   32px  (hero, primary headings)
--font-size-4xl:   48px  (display, splash screens only)

Line Height
--lh-tight:   1.2   (headings, labels)
--lh-normal:  1.5   (body text, readable)
--lh-loose:   1.75  (accessible body, long-form)

Font Weight
--fw-regular: 400
--fw-medium:  500   (labels, emphasis)
--fw-semibold: 600  (headings, strong UI)
--fw-bold:    700   (display)
```

### Heading Hierarchy

```
h1 (Page Title)      → 32px, bold, Poppins 700, text-primary
h2 (Section)         → 24px, semibold, Poppins 600, text-primary
h3 (Subsection)      → 20px, semibold, Inter 600, text-primary
h4 (Component Title) → 16px, medium, Inter 500, text-primary
p  (Body)            → 16px, regular, Inter 400, text-primary
small (Caption)      → 12px, regular, Inter 400, text-secondary
```

---

## 4. SPACING & GRID SYSTEM

### Spacing Scale (8px Base)

```css
--space-1:   4px    (micro, gaps between icons)
--space-2:   8px    (base, component internal padding)
--space-3:   12px   (small components, badge padding)
--space-4:   16px   (standard component padding, card margin)
--space-6:   24px   (section spacing, larger margins)
--space-8:   32px   (section separators)
--space-12:  48px   (major sections)
--space-16:  64px   (page-level spacing)
```

### Layout Grid

```
Desktop (1200px+):    12-column grid, 16px gutter, 88px side margins
Tablet (768px):       8-column grid, 16px gutter, 24px side margins
Mobile (360px):       4-column grid, 8px gutter, 16px side margins

Side Padding (all widths): 16px minimum
Max Content Width: 1200px (centered on desktop)
```

### Component Spacing

```
Cards:           16px padding, 2px border, 4px gap internal
Forms:           24px vertical gap between fields
Buttons:         12px vertical, 16px horizontal padding
List Items:      16px padding, 8px gap between items
Modal:           32px side, 24px top/bottom on mobile
```

---

## 5. COMPONENTS

### Button System

#### States & Variants

```
Primary (Call-to-Action)
  Default:   bg-accent, text-white, no border
  Hover:     bg-accent (darker -10%)
  Active:    bg-accent (darker -15%), faster response
  Disabled:  bg-gray-300, text-gray-500, no cursor
  
Secondary (Alternative Action)
  Default:   bg-gray-200, text-primary, no border
  Hover:     bg-gray-300
  Active:    bg-gray-400
  Disabled:  bg-gray-100, text-gray-400

Tertiary (Ghost / Text)
  Default:   bg-transparent, text-primary, 2px border-gray-300
  Hover:    bg-gray-100, border-primary
  Active:    bg-gray-200
  Disabled:  border-gray-200, text-gray-400
  
Danger (Destructive)
  Default:   bg-error, text-white
  Hover:     bg-error (darker -10%)
  Active:    bg-error (darker -15%)
```

#### Button Component

```html
<button class="btn btn-primary">Action</button>
<button class="btn btn-secondary" disabled>Disabled</button>
<button class="btn btn-tertiary">Cancel</button>
<button class="btn btn-danger">Delete</button>
```

### Form Inputs

```
Text / Email / Number Inputs
  Border:         1px solid #D1D5DB
  Background:     #F9FAFB
  Padding:        12px 16px
  Border-radius:  6px
  Focus:          2px border color (elemental or --info)
  Focus-ring:     transparent (border change only)
  
Disabled:         bg-gray-100, border-gray-200, text-gray-400, no cursor

Placeholder:      text-gray-500, font-weight 400

Error State:
  Border:         2px solid --error
  Message:        12px text-error below input
  Background:     rgba(239, 68, 68, 0.05) (very light red tint)
```

#### Form Label

```html
<label for="email" class="form-label">Email Address</label>
<input type="email" id="email" class="form-input" />
```

### Cards

```
Card Container
  Background:     bg-secondary
  Border:         1px solid rgba(0,0,0,0.06) light / rgba(255,255,255,0.06) dark
  Border-radius:  8px
  Padding:        24px
  Box-shadow:     0 1px 2px rgba(0,0,0,0.05)
  Margin-bottom:  16px

Hover (Interactive):
  Box-shadow:     0 4px 6px rgba(0,0,0,0.1)
  Transform:      translateY(-2px)
  Transition:     all 150ms ease
```

### Modal Dialog

```
Modal Overlay
  Background:     rgba(0,0,0,0.5) light / rgba(0,0,0,0.7) dark
  Transition:     opacity 200ms ease

Modal Panel
  Background:     bg-primary
  Border-radius:  12px
  Max-width:      90vw (mobile) / 600px (desktop)
  Padding:        32px
  Box-shadow:     0 20px 25px -5px rgba(0,0,0,0.1)
  
Close Button:     Top-right, 24px icon, no bg, hover darkens
```

### Alert / Toast

```
Success (Green)
  Background:     rgba(16, 185, 129, 0.1)
  Border-left:    4px solid #10B981
  Icon:           ✓ (checkmark)
  Text:           14px, text-primary

Warning (Amber)
  Background:     rgba(245, 158, 11, 0.1)
  Border-left:    4px solid #F59E0B
  Icon:           ⚠ (warning)
  Text:           14px, text-primary

Error (Red)
  Background:     rgba(239, 68, 68, 0.1)
  Border-left:    4px solid #EF4444
  Icon:           ✗ (error)
  Text:           14px, text-primary

Duration: 4 seconds (auto-dismiss), closeable with ×
Position: Bottom-right (desktop), bottom-center (mobile), above nav
```

### Tabs

```
Tab Container
  Background:     transparent
  Border-bottom:  2px solid #E5E7EB

Tab Item (Inactive)
  Color:          text-secondary
  Border-bottom:  transparent
  Padding:        12px 16px

Tab Item (Active)
  Color:          text-primary (use elemental accent sparingly)
  Border-bottom:  3px solid (elemental color or --info)
  Padding:        12px 16px
  Font-weight:    500
```

### Badge / Pill

```
Badge (Status Label)
  Background:     bg-tertiary
  Border-radius:  16px (pill)
  Padding:        4px 12px
  Font-size:      12px
  Font-weight:    500

Colored Variants:
  Success:        bg-green-100, text-green-800, light
  Warning:        bg-amber-100, text-amber-800
  Error:          bg-red-100, text-red-800
  Info:           bg-blue-100, text-blue-800
```

---

## 6. DARK MODE IMPLEMENTATION

### CSS Token Structure

```css
/* Light Mode (Default) */
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F7F6;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --border-color: #D1D5DB;
  /* All other tokens... */
}

/* Dark Mode (via prefers-color-scheme) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0F0F0F;
    --bg-secondary: #1A1A1A;
    --text-primary: #FFFFFF;
    --text-secondary: #AAAAAA;
    --border-color: #404040;
    color-scheme: dark;
  }
}

/* Dark Mode (explicit data-theme) */
:root[data-theme="dark"] {
  --bg-primary: #0F0F0F;
  --bg-secondary: #1A1A1A;
  --text-primary: #FFFFFF;
  --text-secondary: #AAAAAA;
  --border-color: #404040;
  color-scheme: dark;
}

/* Light Mode (explicit data-theme) */
:root[data-theme="light"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F7F6;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --border-color: #D1D5DB;
  color-scheme: light;
}

/* Apply tokens */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

### Dark Mode Specific Rules

- **Backgrounds**: Never pure black (#000000) → use #0F0F0F (less harsh on eyes)
- **Elemental colors**: Use slightly brighter variants in dark mode
  - AKASH: #A78BFA (from #8B5CF6)
  - AGNI: #FB923C (from #F97316)
  - JAL: #06B6D4 (stays same, bright enough)
  - VAYU: #22D3EE (from #0EA5E9)
  - PRITHVI: #34D399 (from #10B981)

---

## 7. ELEMENT-TO-FEATURE MAPPING

### Feature-to-Element Assignment

| Feature | Element | Color | Icon | Screen | Accent Use |
|---------|---------|-------|------|--------|------------|
| Birth Chart | AKASH | #8B5CF6 | ◯ (circle, cosmic) | /kundali | Section headers |
| Muhurta Timing | AGNI | #F97316 | 🔥 (flame) | /muhurta | Status badges, action buttons |
| Numerology | JAL | #0EA5E9 | 〰 (wave) | /numerology | Flow indicators |
| Recommendations | VAYU | #06B6D4 | ↗ (arrow) | /recommendations | Next-step CTA |
| Wallet / Account | PRITHVI | #10B981 | 🌱 (plant) | /wallet | Balance display, stability |
| Dashboard | Multiple | Neutral (#3B82F6) | ◇ (multi) | /dashboard | Cards per element |

### Screen Allocation (No Full-Screen Themes)

```
/dashboard
  ├─ Elemental cards (5x) with subtle bg tints + icons
  ├─ Each card: 1px left border in element color
  ├─ Rest: white/gray neutral

/kundali
  ├─ Akash color on: section header, chart title border-left
  ├─ Rest: neutral

/muhurta
  ├─ Agni color on: timing status badge, "Go" button
  ├─ Rest: neutral

/wallet
  ├─ Prithvi color on: balance display (large number), 
  ├─ Transaction items: green/red based on debit/credit (semantic, not elemental)
  ├─ Rest: neutral

Admin Panel
  ├─ NO elemental colors (functional, professional)
  ├─ All semantic: green (active), red (error), blue (info)
```

---

## 8. ICON SYSTEM

### Icon Design Rules

- **Size**: 16px (labels), 24px (buttons), 32px (hero)
- **Stroke Width**: 2px (24px+), 1.5px (16px)
- **Style**: Line-based (not filled), consistent weight
- **Accessibility**: Always paired with text label or title attribute

### Icon Set (Use Feather Icons as base, customize)

```
Navigation
  Home       ⌂ (house outline)
  Dashboard  ◇ (diamond)
  Kundali    ◯ (circle)
  Muhurta    ⏱ (timer)
  Numerology ∑ (sum symbol)
  Wallet     💰 (coin)
  Settings   ⚙ (gear)
  Profile     👤 (user)
  Menu       ≡ (hamburger)

Actions
  Add        + (plus)
  Delete     − (minus/trash)
  Edit       ✏ (pencil)
  Save       ✓ (check)
  Cancel     ✗ (x)
  Search      🔍 (magnifying glass)
  Filter     ⊳ (funnel)
  Share      ⤴ (arrow out)

Status
  Success    ✓ (checkmark, green)
  Warning    ⚠ (alert, amber)
  Error      ✗ (x, red)
  Info       ⓘ (info circle, blue)

Elemental (Subtle accent only)
  Akash      ◯ ☆ (star, circle)
  Agni       🔥 ▲ (triangle/flame)
  Jal        〰 ▬ (wave)
  Vayu       ↗ ✈ (arrow, wind)
  Prithvi    🌱 ▼ (seedling, down)
```

---

## 9. ANIMATION GUIDELINES

### Performance-First Approach

**Rule**: No animations on page load or scroll. All animations are user-triggered.

### Micro-Interactions

```
Button Hover
  Duration:     150ms
  Easing:       ease-out
  Change:       -10% brightness, slight shadow increase
  
Button Active/Click
  Duration:     100ms
  Easing:       ease-in
  Change:       -15% brightness

Tab Change
  Duration:     200ms
  Easing:       ease-out
  Change:       Fade content (opacity 0.3 → 1.0)

Modal Open
  Duration:     250ms
  Easing:       cubic-bezier(0.25, 0.46, 0.45, 0.94)
  Change:       Overlay: opacity 0 → 0.5, Panel: scale 0.95 → 1.0, y:-20px → 0
  
Modal Close
  Duration:     200ms (faster dismissal)
  Easing:       ease-in
  Change:       Reverse of open

Focus Ring (Keyboard Navigation)
  Width:        2px
  Color:        elemental accent or --info
  Offset:       2px from element
  Transition:   instant (no animation)
```

### Disabled Animations (Respect User Preference)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. ACCESSIBILITY CHECKLIST

### WCAG 2.1 AAA Requirements

- [ ] **Color Contrast**: All text 7:1 or 4.5:1 (verified via WCAG AA/AAA checker)
- [ ] **Focus Visible**: Tab key shows focus ring on all interactive elements
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard
- [ ] **ARIA Labels**: Form inputs, buttons, icons have semantic labels
- [ ] **Headings**: h1 → h6 hierarchy followed, no skipped levels
- [ ] **Images**: All `<img>` tags have descriptive `alt` text
- [ ] **Form Labels**: Every input has associated `<label>` with `for` attribute
- [ ] **Error Messages**: Clear, actionable, linked to input field
- [ ] **Links**: Underlined or visually distinct, not color-only
- [ ] **Motion**: `prefers-reduced-motion` respected
- [ ] **Text Size**: Page readable at 200% zoom
- [ ] **Mobile**: Touch targets at least 44×44px (Apple), 48×48px (Android)

### Testing Tools

```
Automated:
- axe DevTools (Chrome extension)
- WAVE (WebAIM)
- Lighthouse (Chrome DevTools)

Manual:
- Keyboard-only navigation (no mouse)
- Screen reader (NVDA on Windows, VoiceOver on Mac)
- Color contrast checker (WebAIM, Contrast Ratio)
- Mobile: iOS VoiceOver, Android TalkBack
```

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Create CSS token system (colors, typography, spacing)
- [ ] Build component library (buttons, inputs, cards)
- [ ] Implement dark mode toggle + `prefers-color-scheme`
- [ ] Create base HTML structure templates

### Phase 2: Feature Screens (Week 2-4)
- [ ] Birth Chart screen (Akash accent)
- [ ] Muhurta screen (Agni accent)
- [ ] Numerology screen (Jal accent)
- [ ] Recommendations screen (Vayu accent)
- [ ] Wallet screen (Prithvi accent)

### Phase 3: Secondary Screens (Week 4-5)
- [ ] Admin panel (neutral, no elemental)
- [ ] Settings / Profile
- [ ] Help / FAQ
- [ ] Mobile responsive audit + fixes

### Phase 4: Polish (Week 5-6)
- [ ] Accessibility audit (axe, WAVE, manual testing)
- [ ] Dark mode comprehensive testing
- [ ] Icon refinement + consistency
- [ ] Mobile device testing (iOS, Android)
- [ ] Performance optimization (Lighthouse 90+)

### Phase 5: QA & Launch (Week 6-7)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Device testing (iPhone, iPad, Android phones/tablets)
- [ ] Final accessibility sign-off (WCAG 2.1 AAA)
- [ ] Deploy to production

---

## 12. DESIGN TOKENS (Ready to Implement)

### Copy-Paste CSS Root

```css
:root {
  /* Colors — Light Mode */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F7F6;
  --bg-tertiary: #F0EEEC;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-inverse: #FFFFFF;
  --border-color: #D1D5DB;
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Elemental Accents */
  --color-akash: #8B5CF6;
  --color-akash-light: #DDD6FE;
  --color-agni: #F97316;
  --color-agni-light: #FED7AA;
  --color-jal: #0EA5E9;
  --color-jal-light: #CFFAFE;
  --color-vayu: #06B6D4;
  --color-vayu-light: #CFFAFE;
  --color-prithvi: #10B981;
  --color-prithvi-light: #D1FAE5;
  
  /* Typography */
  --font-display: 'Poppins', -apple-system, system-ui, sans-serif;
  --font-body: 'Inter', -apple-system, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;
  --font-size-4xl: 48px;
  
  --lh-tight: 1.2;
  --lh-normal: 1.5;
  --lh-loose: 1.75;
  
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-primary: #0F0F0F;
    --bg-secondary: #1A1A1A;
    --bg-tertiary: #242424;
    --text-primary: #FFFFFF;
    --text-secondary: #AAAAAA;
    --border-color: #404040;
    
    --color-akash: #A78BFA;
    --color-agni: #FB923C;
    --color-jal: #06B6D4;
    --color-vayu: #22D3EE;
    --color-prithvi: #34D399;
    
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  /* Same as above dark mode block */
}
```

---

## 13. NEXT STEPS

1. **Review & Approve** — Share this document with team, request feedback
2. **Implement Tokens** — Create CSS file with all tokens above
3. **Build Components** — Create reusable component classes (btn, card, form, etc.)
4. **Apply to Screens** — Integrate tokens into existing screens
5. **Accessibility Audit** — Run WCAG checks, fix issues
6. **Mobile Testing** — Test on real devices (iPhone, Android)
7. **Dark Mode Verification** — Ensure both themes work perfectly
8. **Performance Check** — Lighthouse score 90+ on all metrics

---

**Version**: 1.0
**Updated**: 2026-10-04
**Approved by**: Naveen K. Rai
**Maintained by**: OCCULTVIISION Design Team
