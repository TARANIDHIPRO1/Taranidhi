# Task 77: Mobile Responsive Audit — Complete Test Plan
**Status:** 🔄 IN PROGRESS  
**Date Started:** 2026-10-12  
**Priority:** 4  
**Effort:** 1-2 weeks  

---

## **SCOPE: 8 Priority Screens**

| # | Screen | File | Purpose | Breakpoints |
|---|--------|------|---------|------------|
| 1 | Birth Chart | `birth-chart.ts` | Display kundali/natal chart | 360px, 768px, 1024px |
| 2 | Muhurta | `muhurta.ts` | Muhurta dashboard & scanner | 360px, 768px, 1024px |
| 3 | Numerology | `numerology-report.ts` | Numerology readings | 360px, 768px, 1024px |
| 4 | Recommendations | `dashboard.ts` | Dashboard + recommendations | 360px, 768px, 1024px |
| 5 | Wallet | `wallet.ts` | Payment, balance, top-up | 360px, 768px, 1024px |
| 6 | Admin Panel | `admin-panel.ts` | User mgmt, settings, logs | 360px, 768px, 1024px |
| 7 | KP Query | `kp-query.ts` | KP horary questions | 360px, 768px, 1024px |
| 8 | Login | `login.ts` | OTP entry screen | 360px, 768px, 1024px |

---

## **AUDIT CHECKLIST: 5 Categories**

### **Category 1: BREAKPOINT TESTING (3 widths)**

| Breakpoint | Device | Width | Expected Layout |
|-----------|--------|-------|-----------------|
| **Mobile** | iPhone 14, Pixel 6 | 360px | Single column, stacked |
| **Tablet** | iPad Air | 768px | 2-column when needed |
| **Desktop** | MacBook, Win | 1024px+ | Multi-column, full layout |

**Test each screen at all 3 breakpoints:**
- [ ] 1. Birth Chart @ 360px
- [ ] 2. Birth Chart @ 768px
- [ ] 3. Birth Chart @ 1024px
- [ ] 4. Muhurta @ 360px
- [ ] 5. Muhurta @ 768px
- [ ] 6. Muhurta @ 1024px
- [ ] 7. Numerology @ 360px
- [ ] 8. Numerology @ 768px
- [ ] 9. Numerology @ 1024px
- [ ] 10. Recommendations @ 360px
- [ ] 11. Recommendations @ 768px
- [ ] 12. Recommendations @ 1024px
- [ ] 13. Wallet @ 360px
- [ ] 14. Wallet @ 768px
- [ ] 15. Wallet @ 1024px
- [ ] 16. Admin Panel @ 360px
- [ ] 17. Admin Panel @ 768px
- [ ] 18. Admin Panel @ 1024px
- [ ] 19. KP Query @ 360px
- [ ] 20. KP Query @ 768px
- [ ] 21. KP Query @ 1024px
- [ ] 22. Login @ 360px
- [ ] 23. Login @ 768px
- [ ] 24. Login @ 1024px

---

### **Category 2: TOUCH TARGETS (44×44px minimum)**

**Apple Human Interface Guidelines + WCAG 2.1 AAA:**
- All buttons, links, form inputs: **44×44px minimum** (44 × 44px = 176px²)
- Touch target spacing: **8px minimum** between adjacent targets
- No hover-only elements on touch devices

**Checklist per screen:**
- [ ] All buttons are 44×44px or larger
- [ ] All form inputs have 44px tall target area (including padding)
- [ ] Links have adequate padding/spacing
- [ ] No overlapping touch targets
- [ ] Spacing between buttons ≥8px
- [ ] Primary actions are largest/most prominent

---

### **Category 3: ORIENTATION CHANGES**

Test on mobile devices at 360px width:

**Portrait mode (360px × 640px+):**
- [ ] Content flows top-to-bottom
- [ ] Modals/dialogs visible in viewport
- [ ] No horizontal scroll
- [ ] Charts/tables responsive or scrollable

**Landscape mode (640px × 360px+):**
- [ ] Layout adapts to wider format
- [ ] No content hidden or truncated
- [ ] Navigation still accessible
- [ ] Modals still closeable

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

### **Category 4: KEYBOARD NAVIGATION (Accessibility)**

Test on desktop (WCAG 2.1 AAA):
- [ ] Tab order is logical (top→bottom, left→right)
- [ ] Focus indicator visible on all interactive elements
- [ ] No keyboard traps (can Tab out of any element)
- [ ] Form fields properly labeled (with <label for="">)
- [ ] Error messages associated with inputs (aria-describedby)
- [ ] Modals: focus trapped inside, restore on close
- [ ] Skip links present (skip to main content)
- [ ] ARIA labels for icon-only buttons

**Per screen:**
- [ ] Birth Chart keyboard nav
- [ ] Muhurta keyboard nav
- [ ] Numerology keyboard nav
- [ ] Recommendations keyboard nav
- [ ] Wallet keyboard nav
- [ ] Admin Panel keyboard nav
- [ ] KP Query keyboard nav
- [ ] Login keyboard nav (critical)

---

### **Category 5: PERFORMANCE ON SLOW NETWORKS**

Test on **Throttled 3G** (Chrome DevTools):
- Download: 400 kbps
- Upload: 400 kbps  
- Latency: 400ms

**Checklist:**
- [ ] Page loads within 8 seconds (target)
- [ ] Content Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Interactive elements load in first 3 seconds
- [ ] Images are optimized (WebP, compressed)
- [ ] Lazy loading implemented for below-the-fold
- [ ] CSS/JS bundles < 100KB each (gzipped)
- [ ] No render-blocking resources

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

## **DEVICE TEST MATRIX**

| Device | OS | Browser | Screen | Portrait | Landscape |
|--------|-----|---------|--------|----------|-----------|
| iPhone 14 | iOS 17 | Safari | 360×812 | ✓ | ✓ |
| Pixel 6 | Android 14 | Chrome | 360×800 | ✓ | ✓ |
| iPad Air | iPadOS 17 | Safari | 768×1024 | ✓ | ✓ |
| MacBook | macOS | Chrome | 1440×900 | ✓ | - |

---

## **ISSUES LOG & FIXES**

| Screen | Issue | Severity | Status | Fix |
|--------|-------|----------|--------|-----|
| (fill in as testing) | | | | |

---

## **SIGN-OFF CHECKLIST**

- [ ] All 8 screens tested @ 360px
- [ ] All 8 screens tested @ 768px
- [ ] All 8 screens tested @ 1024px
- [ ] All touch targets 44×44px or larger
- [ ] All orientation changes work (portrait ↔ landscape)
- [ ] All 8 screens: iOS Safari ✓
- [ ] All 8 screens: Android Chrome ✓
- [ ] Keyboard navigation: Full WCAG 2.1 AAA ✓
- [ ] Performance: All < 8s on Throttled 3G ✓
- [ ] No horizontal scroll at 360px
- [ ] No layout shift (CLS < 0.1)
- [ ] All form inputs accessible
- [ ] All modal dialogs closeable
- [ ] All navigation accessible

---

## **DEFINITION OF DONE**

✅ Task 77 is complete when:
1. All 8 screens responsive at 360px, 768px, 1024px
2. All touch targets ≥44×44px
3. Orientation changes work (portrait↔landscape)
4. iOS Safari + Android Chrome both pass
5. Keyboard navigation WCAG 2.1 AAA
6. Performance < 8s on 3G throttle
7. All issues documented + fixed
8. QA sign-off on all devices

---

## **TIMELINE**

- **Day 1-2:** Breakpoint testing (24 test cases)
- **Day 3:** Touch target audit + orientation
- **Day 4:** Keyboard navigation audit
- **Day 5:** Performance testing on 3G
- **Day 6:** Issue fixes + regression testing
- **Day 7:** Final QA + sign-off

---

## **REFERENCE**

- **Design System:** docs/GLOBAL_DESIGN_SYSTEM.md
- **Touch Target Standard:** Apple HIG 44×44px, WCAG 2.1 AAA
- **Performance Targets:** Web Vitals (LCP 2.5s, CLS 0.1)
- **Theme System:** docs/TASK75_THEME_SPECIFICATION.md
- **i18n:** TASK74_INTEGRATION_GUIDE.md (test EN + HI)

