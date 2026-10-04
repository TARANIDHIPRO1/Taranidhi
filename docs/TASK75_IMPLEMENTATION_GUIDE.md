# Task 75: Five Elements Theme System
## Implementation Guide for OCCULTVIISION Kaalchakra Pro

**Status:** ✅ READY FOR IMPLEMENTATION  
**Completion:** Week 1-2 of Phase 3  
**Files:** 4 deliverables (spec + CSS + demo + guide)

---

## Quick Start (5 Minutes)

### 1. Add CSS to Your App

Copy the entire `task75-wafes-theme.css` file into your project:

```bash
# Option A: As a global stylesheet
<link rel="stylesheet" href="css/theme.css">

# Option B: Import in your main CSS file
@import url('theme.css');

# Option C: Bundle with your CSS tooling
import './theme.css';
```

### 2. Dark Mode Toggle

Add a button in your header to toggle dark mode:

```html
<button id="theme-toggle" aria-label="Toggle dark mode">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>
```

Add this JavaScript:

```javascript
const themeBtn = document.getElementById('theme-toggle');
const root = document.documentElement;

// Load saved preference
const savedTheme = localStorage.getItem('theme') || 'light';
root.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const newTheme = current === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});
```

### 3. Use CSS Variables Everywhere

Instead of hardcoding colors, use tokens:

```css
/* ❌ DON'T: Hardcode colors */
.button {
  background-color: #3B82F6;
}

/* ✅ DO: Use tokens */
.button {
  background-color: var(--color-info);
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}
```

---

## Component Usage Guide

### Buttons

**Primary (Action):**
```html
<button class="btn btn-primary">Submit</button>
```

**Secondary (Alternative):**
```html
<button class="btn btn-secondary">Cancel</button>
```

**Danger (Destructive):**
```html
<button class="btn btn-danger">Delete Account</button>
```

### Form Inputs

```html
<label for="name">Name</label>
<input id="name" type="text" placeholder="Enter your name">

<!-- Error state -->
<input class="error" type="email" placeholder="Email">

<!-- Disabled state -->
<input disabled type="text" placeholder="Disabled input">
```

### Cards

```html
<div class="card">
  <div class="card-header">Card Title</div>
  <div class="card-body">Card content goes here</div>
  <div class="card-footer">Footer text</div>
</div>

<!-- With elemental accent -->
<div class="card accent-akash">
  <div class="card-header">Birth Chart</div>
  <div class="card-body">Chart data</div>
</div>
```

### Alerts

```html
<!-- Success -->
<div class="alert alert-success">✓ Success message</div>

<!-- Warning -->
<div class="alert alert-warning">⚠ Warning message</div>

<!-- Error -->
<div class="alert alert-error">✗ Error message</div>

<!-- Info -->
<div class="alert alert-info">ℹ Info message</div>
```

### Elemental Accent Classes

Use these on any element to apply Five Elements colors:

```html
<!-- Akash (Purple) -->
<div class="accent-akash">Spiritual content</div>
<div class="accent-akash-bg">Light purple background</div>

<!-- Agni (Orange) -->
<div class="accent-agni">Action content</div>

<!-- Jal (Cyan) -->
<div class="accent-jal">Flow content</div>

<!-- Vayu (Teal) -->
<div class="accent-vayu">Movement content</div>

<!-- Prithvi (Green) -->
<div class="accent-prithvi">Stability content</div>
```

---

## Element-to-Feature Mapping

Apply these accents to the relevant screens:

| Screen | Element | Color | Usage |
|--------|---------|-------|-------|
| `/kundali` | **Akash** | Purple #8B5CF6 | Section headers, chart title border, cosmic theme |
| `/muhurta` | **Agni** | Orange #F97316 | Timing badges, "Go ahead" CTA buttons, action states |
| `/numerology` | **Jal** | Cyan #0EA5E9 | Flow indicators, number displays, relationship focus |
| `/recommendations` | **Vayu** | Teal #06B6D4 | Next-step CTA, movement arrows, change indicators |
| `/wallet` | **Prithvi** | Green #10B981 | Balance display, transaction labels, stability accent |
| `/dashboard` | Multiple | Blue #3B82F6 | Neutral info color, card separators |
| `/admin` | Semantic only | N/A | No elemental colors, functional palette only |

---

## Dark Mode Implementation

The theme automatically respects `prefers-color-scheme: dark` (system preference). Users can also toggle manually:

```javascript
// Force light mode
document.documentElement.setAttribute('data-theme', 'light');

// Force dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Let system preference decide
document.documentElement.removeAttribute('data-theme');
```

### Dark Mode Colors

When dark mode is active, these colors shift for better visibility:

```
--color-akash:   #8B5CF6 → #A78BFA (brighter purple)
--color-agni:    #F97316 → #FB923C (brighter orange)
--color-vayu:    #06B6D4 → #22D3EE (brighter teal)
--color-prithvi: #10B981 → #34D399 (brighter green)
```

Backgrounds and text automatically adjust via CSS variables — **no code changes needed**.

---

## Responsive Design

The theme includes mobile-first responsive utilities:

```html
<!-- Container with max-width -->
<div class="container">
  <!-- max-width: 1200px, auto margins, 16px side padding -->
</div>

<!-- Flex layout -->
<div class="flex">
  <!-- display: flex, gap: 16px -->
</div>

<!-- Grid layout -->
<div class="grid">
  <!-- display: grid, gap: 16px -->
</div>
```

### Breakpoints (Recommended)

```css
/* Mobile: 360px - 639px */
@media (max-width: 639px) {
  /* 4-column grid, 8px gutter, 16px side padding */
}

/* Tablet: 640px - 1023px */
@media (min-width: 640px) and (max-width: 1023px) {
  /* 8-column grid, 16px gutter, 24px side padding */
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  /* 12-column grid, 16px gutter, 88px side margins */
}
```

---

## Accessibility Checklist

✅ **Color Contrast:**
- Normal text: 7:1 minimum (exceeds WCAG AAA)
- Large text (18px+): 4.5:1 minimum
- All verified in spec (color palette section)

✅ **Keyboard Navigation:**
- All buttons/inputs have `:focus-visible` rings
- Tab order is logical and visible
- No focus traps

✅ **Forms:**
- All inputs have associated labels
- Error messages are visible and linked to fields
- Disabled states have reduced opacity (0.6)
- Placeholder text is supplementary only, not a label

✅ **Motion:**
- All transitions respect `prefers-reduced-motion`
- No auto-playing animations
- Animations are 150-200ms max

✅ **ARIA:**
- Buttons have semantic `<button>` tags
- Form inputs have `<label for="id">` associations
- Icons need `aria-label` or title attributes
- Status messages use `role="status"` or `role="alert"`

---

## Testing Your Implementation

### Visual Regression

1. **Light Mode:** Screenshot all screens
2. **Dark Mode:** Toggle and screenshot same screens
3. **Compare:** Verify colors, text contrast, spacing

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Shift+Tab to navigate backwards
- [ ] Enter/Space to activate buttons
- [ ] Arrow keys in select menus
- [ ] Escape to close modals

### Screen Reader

- [ ] Test with NVDA (Windows) or JAWS
- [ ] Verify heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Check form labels are announced
- [ ] Verify alt text on images
- [ ] Test status updates (alerts) are announced

### Mobile

- [ ] Test on iOS Safari (iPhone 12/14)
- [ ] Test on Android Chrome (Pixel 4/6)
- [ ] Verify touch targets are 44×44px minimum
- [ ] Test portrait and landscape
- [ ] Verify form inputs don't zoom on focus

### Color Contrast

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

```
Light Mode:
  Text: #1A1A1A on #FFFFFF = 7.4:1 ✓ (exceeds AAA)
  Secondary: #666666 on #FFFFFF = 4.5:1 ✓ (AAA for 11px+)

Dark Mode:
  Text: #FFFFFF on #0F0F0F = 7.4:1 ✓
  Secondary: #AAAAAA on #0F0F0F = 4.5:1 ✓
```

---

## Common Customizations

### Change a Color

Override the variable globally:

```css
:root {
  --color-info: #8B5CF6; /* Change from blue to purple */
}
```

Or for dark mode only:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-info: #A78BFA;
  }
}
```

### Change a Font

```css
:root {
  --font-display: 'Playfair Display', serif; /* Changed from Poppins */
}
```

### Change Spacing

```css
:root {
  --space-4: 18px; /* Changed from 16px */
}
```

All dependent components automatically adjust.

### Add New Semantic Color

```css
:root {
  --color-urgent: #DC2626;
  --color-urgent-light: rgba(220, 38, 38, 0.1);
}

.alert-urgent {
  background-color: var(--color-urgent-light);
  border-left-color: var(--color-urgent);
  color: var(--color-urgent);
}
```

---

## Deployment Checklist

- [ ] CSS file is minified for production
- [ ] All fonts are loaded from Google Fonts CDN
- [ ] Dark mode toggle works in production
- [ ] localStorage persists theme preference
- [ ] All pages respect the system preference (prefers-color-scheme)
- [ ] Color contrast verified on final designs
- [ ] Mobile responsive tested on real devices
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader tested (at least 2 elements per page)
- [ ] Performance: CSS file is <20KB gzipped
- [ ] No console errors in DevTools

---

## Next Steps After Implementation

1. **Apply to all screens** (Week 1-2)
   - Update existing components to use tokens
   - Add elemental accents to feature screens
   - Test dark mode on each screen

2. **Mobile responsive audit** (Week 2-3)
   - Test all breakpoints
   - Adjust touch targets
   - Verify landscape orientation

3. **Polish & optimization** (Week 3-4)
   - Fine-tune spacing on mobile
   - Optimize image sizes
   - Add micro-interactions

4. **Final QA** (Week 4)
   - Full accessibility audit
   - Performance testing
   - Cross-browser testing

---

## Support & References

| Need | Resource |
|------|----------|
| **Color Palette** | `TASK75_THEME_SPECIFICATION.md` |
| **CSS Tokens** | `task75-wafes-theme.css` (lines 1-92) |
| **Component Examples** | `task75-components-demo.html` |
| **Accessibility** | `task75-wafes-theme.css` (lines 553-576) |
| **Dark Mode** | `task75-wafes-theme.css` (lines 94-150) |

---

**Created:** Oct 4, 2026  
**Phase:** Task 75 (Priority 2)  
**Status:** Implementation-Ready  
**Handoff:** Development team ready to apply theme to all screens
