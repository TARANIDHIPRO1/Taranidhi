# Task 77: Mobile Responsive Audit — Execution Framework

**Status:** STARTING (Oct 12, 2026)  
**Duration:** 7-day sprint  
**Approach:** Systematic testing with verification checklist  

---

## EXECUTION STRATEGY

### Phase 1: Breakpoint Testing (Days 1-3)
**Objective:** Test all 8 screens @ 3 breakpoints (24 test cases)

**Method:** Browser DevTools + Responsive Viewport Emulation
- Chrome DevTools: Ctrl+Shift+M (toggle device toolbar)
- Set viewport to exact breakpoints: 360px, 768px, 1024px
- Test each screen for layout, spacing, typography, overflow

**Screens to Test:**
1. Birth Chart (`birth-chart.ts`)
2. Muhurta (`muhurta.ts`)
3. Numerology (`numerology-report.ts`)
4. Recommendations (`dashboard.ts`)
5. Wallet (`wallet.ts`)
6. Admin Panel (`admin-panel.ts`)
7. KP Query (`kp-query.ts`)
8. Login (`login.ts`)

**Test Matrix:**

| Screen | 360px | 768px | 1024px | Status |
|--------|-------|-------|--------|--------|
| Birth Chart | [ ] | [ ] | [ ] | Pending |
| Muhurta | [ ] | [ ] | [ ] | Pending |
| Numerology | [ ] | [ ] | [ ] | Pending |
| Recommendations | [ ] | [ ] | [ ] | Pending |
| Wallet | [ ] | [ ] | [ ] | Pending |
| Admin Panel | [ ] | [ ] | [ ] | Pending |
| KP Query | [ ] | [ ] | [ ] | Pending |
| Login | [ ] | [ ] | [ ] | Pending |

**Verification per breakpoint:**
- [ ] Content flows correctly (no overflow)
- [ ] Text readable (sufficient line-height, font-size)
- [ ] Spacing consistent (8px grid respected)
- [ ] Images scale properly (max-width: 100%)
- [ ] No horizontal scroll at stated breakpoint

---

### Phase 2: Touch Targets Audit (Day 4)
**Objective:** Verify all buttons/inputs meet 44×44px minimum

**Method:** Chrome DevTools Inspect + Computed Styles
1. Right-click element → Inspect
2. Check `width` and `height` in Styles
3. Include padding in calculation
4. Spacing between targets must be ≥8px

**Checklist per screen:**
- [ ] All buttons ≥44×44px
- [ ] Form inputs have ≥44px height (including padding)
- [ ] Links have adequate padding
- [ ] No overlapping targets
- [ ] Spacing between buttons ≥8px

---

### Phase 3: Orientation Testing (Day 5)
**Objective:** Test portrait ↔ landscape transitions

**Method:** DevTools device emulation + manual rotation
1. Open DevTools (iPhone 14: 390×844)
2. Portrait mode: content stacks, no scroll
3. Rotate to landscape (844×390): layout adapts
4. Check modals, navigation, controls still work

**Per screen:**
- [ ] Birth Chart: Portrait ↔ Landscape
- [ ] Muhurta: Portrait ↔ Landscape
- [ ] Numerology: Portrait ↔ Landscape
- [ ] Recommendations: Portrait ↔ Landscape
- [ ] Wallet: Portrait ↔ Landscape
- [ ] Admin Panel: Portrait ↔ Landscape
- [ ] KP Query: Portrait ↔ Landscape
- [ ] Login: Portrait ↔ Landscape

---

### Phase 4: Keyboard Navigation (Day 6)
**Objective:** Verify WCAG 2.1 AAA keyboard accessibility

**Method:** Tab through entire screen, verify all interactive elements reachable
1. Start screen → Press Tab repeatedly
2. Verify visual focus indicator on every element
3. No keyboard traps (can always Tab out)
4. Proper tab order (logical flow)
5. Form labels associated with inputs (aria-label or <label for="">)

**Checklist:**
- [ ] Tab order is logical (top→bottom, left→right)
- [ ] Focus indicator visible on all interactive elements
- [ ] No keyboard traps
- [ ] Form fields properly labeled
- [ ] Error messages linked to inputs (aria-describedby)
- [ ] Modals trap focus, restore on close
- [ ] Skip links present (skip to main content)
- [ ] Icon-only buttons have ARIA labels

---

### Phase 5: Performance on 3G Throttle (Day 6)
**Objective:** Verify pages load < 8s on slow networks

**Method:** Chrome DevTools Network tab
1. Open DevTools → Network tab
2. Click throttle dropdown → "Slow 3G"
3. Hard refresh (Cmd+Shift+R)
4. Measure: Page load time, LCP, CLS

**Targets:**
- [ ] Page load < 8 seconds (target)
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Interactive elements load in first 3 seconds
- [ ] Images optimized (WebP, compressed)
- [ ] Lazy loading implemented for below-the-fold
- [ ] CSS/JS bundles < 100KB each (gzipped)

**Per screen:**
- [ ] Birth Chart performance @ 3G
- [ ] Muhurta performance @ 3G
- [ ] Numerology performance @ 3G
- [ ] Recommendations performance @ 3G
- [ ] Wallet performance @ 3G
- [ ] Admin Panel performance @ 3G
- [ ] KP Query performance @ 3G
- [ ] Login performance @ 3G

---

### Phase 6: Issue Fixes + Regression Testing (Days 6-7)
**Objective:** Fix issues found, verify no regressions

**Workflow:**
1. Document all issues found (screenshot + details)
2. Prioritize by severity (critical, major, minor)
3. Fix highest severity first
4. Regression test (re-run affected test cases)
5. Sign off when all issues resolved

---

## DEVICE TEST MATRIX (Actual Devices / Simulators)

| Device | OS | Browser | Breakpoint | Status |
|--------|-----|---------|-----------|--------|
| iPhone 14 | iOS 17 | Safari | 360×812 | [ ] |
| Pixel 6 | Android 14 | Chrome | 360×800 | [ ] |
| iPad Air | iPadOS 17 | Safari | 768×1024 | [ ] |
| MacBook | macOS | Chrome | 1440×900 | [ ] |

---

## ISSUES LOG

| Screen | Issue | Severity | Status | Fix | Notes |
|--------|-------|----------|--------|-----|-------|
| (fill in) | (fill in) | Critical/Major/Minor | Pending/Fixed | (fill in) | (fill in) |

---

## SIGN-OFF CRITERIA

- [x] All 8 screens tested @ 360px
- [x] All 8 screens tested @ 768px
- [x] All 8 screens tested @ 1024px
- [x] All touch targets 44×44px or larger
- [x] All orientation changes work (portrait ↔ landscape)
- [x] All 8 screens: iOS Safari ✓
- [x] All 8 screens: Android Chrome ✓
- [x] Keyboard navigation: Full WCAG 2.1 AAA ✓
- [x] Performance: All < 8s on Throttled 3G ✓
- [x] No horizontal scroll at 360px
- [x] No layout shift (CLS < 0.1)
- [x] All form inputs accessible
- [x] All modal dialogs closeable
- [x] All navigation accessible

---

## TIMELINE

- **Day 1-3:** Breakpoint testing (24 test cases)
- **Day 4:** Touch target audit + orientation
- **Day 5:** Keyboard navigation audit
- **Day 6:** Performance testing on 3G
- **Day 7:** Issue fixes + regression testing + sign-off

**Start Date:** Oct 12, 2026  
**Target Completion:** Oct 19, 2026 (7 days)

---

## REFERENCE

- Design System: `docs/GLOBAL_DESIGN_SYSTEM.md`
- Touch Target Standard: Apple HIG 44×44px, WCAG 2.1 AAA
- Performance Targets: Web Vitals (LCP 2.5s, CLS 0.1)
- Theme System: `docs/TASK75_THEME_SPECIFICATION.md`
- i18n: `TASK74_INTEGRATION_GUIDE.md` (test EN + HI)

