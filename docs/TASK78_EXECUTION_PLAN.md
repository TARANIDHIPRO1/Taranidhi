# Task 78: Website UI Polish — Detailed Execution Plan

**Status:** STARTING (Oct 12, 2026)  
**Duration:** 2-3 weeks  
**Approach:** Design system application + content polish + responsive optimization  

---

## SCOPE: 6 Pages to Polish

All pages exist but need styling, copy refinement, and responsive verification.

| Page | File | Current State | Polish Goal | Effort |
|------|------|---------------|-------------|--------|
| Homepage | `public-home.ts` | Structure exists | Add hero image, testimonials, smooth animations | 3-4 days |
| Features | `public-features.ts` | Basic grid | Add detailed descriptions, icons, use cases | 3-4 days |
| Pricing | `public-pricing.ts` | Tier cards exist | Add comparison table, visual hierarchy, CTAs | 2-3 days |
| Blog/Resources | `public-blog.ts` | Article grid placeholder | Build article cards, categories, excerpt flow | 4-5 days |
| Contact/Support | `public-contact.ts` | Form skeleton | Wire form validation, success state, contact info | 2-3 days |
| Layout (Header/Footer) | `public-layout.ts` | Nav structure exists | Polish header, footer, dark mode toggle | 2-3 days |

**Total Estimate:** 16-22 days of work (within 2-3 week target)

---

## DESIGN SYSTEM BASELINE

All pages must follow:
- **Colors:** Token system from `docs/GLOBAL_DESIGN_SYSTEM.md` + `docs/TASK75_THEME_SPECIFICATION.md`
- **Typography:** Poppins (display) + Inter (body) + JetBrains Mono (code)
- **Spacing:** 8px base grid (16px, 24px, 32px, 48px gaps)
- **Dark Mode:** Full support via `prefers-color-scheme` + explicit toggle
- **Responsive:** 360px (mobile), 768px (tablet), 1024px+ (desktop)
- **Touch Targets:** 44×44px minimum for all interactive elements
- **Accessibility:** WCAG 2.1 AA minimum (AAA where practical)

---

## WEEK 1: Foundation + Homepage

### Day 1: Design System Review
- [ ] Read GLOBAL_DESIGN_SYSTEM.md (color tokens, typography)
- [ ] Read TASK75_THEME_SPECIFICATION.md (CSS implementation)
- [ ] Test color palette in both light & dark modes
- [ ] Verify all element styling is imported

**Deliverable:** Design system baseline locked, ready for page application

### Days 2-3: Homepage Polish

**Currently:**
- Hero section with title + copy
- Value prop cards with icons
- Chart visualization (circles + labels)
- Hero actions (CTAs)

**Missing:**
- Hero background image or gradient
- Testimonial section (3-5 client quotes)
- "How it works" flow (4-5 steps)
- Trust badges (verified records, users, etc.)
- Newsletter signup

**Checklist:**
- [ ] Hero section: Add high-res image or gradient
- [ ] Hero copy: Refine headline for clarity
- [ ] Hero CTAs: Style primary button, secondary ghost button
- [ ] Value prop cards: Add 5-element theming (Akash/Agni/Jal/Vayu/Prithvi colors)
- [ ] Add 3-5 testimonial cards (client name, title, quote, avatar)
- [ ] Add "How it Works" section (4-5 numbered steps)
- [ ] Add trust signals (22/22 verified, users, years, etc.)
- [ ] Mobile responsive: Test @ 360px, 768px, 1024px
- [ ] Dark mode: Full coverage with toggle
- [ ] Accessibility: Heading hierarchy, alt text, ARIA labels

**Quality Checklist:**
- [ ] No horizontal scroll @ 360px
- [ ] Touch targets ≥44×44px
- [ ] Font sizes readable (16px+ body)
- [ ] Line height comfortable (1.5-1.8)
- [ ] All images optimized (WebP, compressed)
- [ ] Performance < 3s @ 3G throttle

**Day 4: Homepage Sign-Off**
- [ ] Full QA pass (all devices/breakpoints)
- [ ] Copy proofread by Naveen
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance test (Lighthouse score ≥85)

---

## WEEK 2: Features, Pricing, Contact

### Days 5-6: Features Page Polish

**Currently:**
- Feature grid (3-4 features with icons/descriptions)
- Comparison matrix (optional)

**Missing:**
- Detailed feature breakdowns (2-3 paragraphs per feature)
- Use-case examples (real client scenarios)
- Interactive feature explorer
- "Try it free" CTA

**Checklist:**
- [ ] Create feature cards with icon + title + 1-2 sentence description
- [ ] Add detailed feature pages (click → expanded view)
  - KP Sub-Lords: 243-fold subdivision, accuracy verification
  - Muhurta Timing: 8-layer confidence index breakdown
  - Numerology: Pythagorean + Chaldean + Kabalah
  - Tarabala & Hora: Star compatibility + business timing
- [ ] Add 2-3 use cases per feature (real scenarios)
- [ ] Add "Learn More" button per feature → feature detail page
- [ ] Optional: Comparison matrix (OCCULTVIISION vs competitors)
- [ ] Mobile responsive: 360px, 768px, 1024px
- [ ] Dark mode: Full coverage

**Day 7: Pricing Page Polish**

**Currently:**
- 3 tier cards (Basic, Premium, Ultra)
- Pricing toggle (monthly/yearly)

**Missing:**
- Feature comparison table
- Testimonials per tier
- FAQ about billing
- Upgrade path visualization

**Checklist:**
- [ ] Tier cards: Clear pricing, features, CTA per tier
- [ ] Comparison table: Features vs Basic/Premium/Ultra (rows: muhurta, kp, numerology, numerology, admin, priority support)
- [ ] Add testimonial card per tier (customer success story)
- [ ] Add FAQ section: Billing questions, upgrade/downgrade policy, refund policy
- [ ] Pricing toggle: Monthly ↔ Yearly with savings calculation
- [ ] Mobile responsive: Stack cards vertically @ 360px
- [ ] Dark mode: Full coverage

### Day 8: Contact/Support Page Polish

**Currently:**
- Contact form (name, email, subject, message)
- Contact information

**Missing:**
- Form validation (client-side + server-side)
- Success/error states
- Support channels (email, phone, WhatsApp)
- FAQ section

**Checklist:**
- [ ] Form fields: Name, Email, Subject dropdown, Message textarea
- [ ] Form validation: Required fields, email format, min message length
- [ ] Submit button: Loading state, success message ("Thanks for reaching out!")
- [ ] Error handling: Clear error messages per field
- [ ] Contact info: Email (clickable mailto), Phone (clickable tel), Address, Response time SLA
- [ ] Support channels: Email support, Phone support (hours), WhatsApp business link
- [ ] FAQ section: Support response times, billing questions, technical issues
- [ ] Mobile responsive: Form stack vertically @ 360px
- [ ] Dark mode: Full coverage
- [ ] Accessibility: Proper label/input associations, form error ARIA

---

## WEEK 3: Blog, Layout Refinement, QA

### Days 9-10: Blog/Resources Page Polish

**Currently:**
- Article grid placeholder

**Missing:**
- Article cards (thumbnail, title, excerpt, author, date, category)
- Article detail pages (full content + related articles)
- Categories (Muhurta, KP, Numerology, Case Studies, General)
- Article search/filtering

**Checklist:**
- [ ] Create 6-12 article stubs with metadata
- [ ] Article cards: Image, title, excerpt (2-3 sentences), author, date, category badge
- [ ] Category filtering: Tabs or dropdown to filter by category
- [ ] "Read More" links → article detail page
- [ ] Article detail page: Full content, author bio, related articles (3-5 links)
- [ ] FAQ guides: Collapsible sections (Muhurta Guide, KP Explained, Numerology Basics)
- [ ] Mobile responsive: Grid stacks to 1 column @ 360px
- [ ] Dark mode: Full coverage

### Days 11-12: Layout (Header/Footer) Refinement

**Currently:**
- Basic header with logo + nav menu
- Footer with links

**Missing:**
- Sticky header (stays at top on scroll)
- Mobile hamburger menu
- Dark mode toggle in header
- Rich footer (social links, email signup, legal links)

**Checklist:**
- [ ] Header: Logo, nav menu (Home, Features, Pricing, Blog, Contact)
- [ ] Header responsive: Hamburger menu @ 360px, full nav @ 768px+
- [ ] Header sticky: Stays at top on scroll, shadow on scroll
- [ ] Dark mode toggle: Visible in header, persists in localStorage
- [ ] Footer: Logo, tagline, company info, quick links, social icons, email signup, legal
- [ ] Footer responsive: Stack sections vertically @ 360px
- [ ] Footer links: Privacy Policy, Terms of Service, Contact, Blog, LinkedIn, Twitter, Email
- [ ] Footer email signup: Input + button, success message, error handling
- [ ] Accessibility: Proper heading hierarchy, skip link, ARIA labels

### Days 13-14: Full QA + Polish

**Final Verification:**
- [ ] All 6 pages tested @ 360px, 768px, 1024px
- [ ] All touch targets ≥44×44px
- [ ] All interactive elements keyboard-accessible
- [ ] Dark mode toggle works on all pages
- [ ] No horizontal scroll @ 360px
- [ ] Performance: All pages < 3s @ 3G throttle
- [ ] Lighthouse scores ≥85 (Performance, Accessibility, Best Practices)
- [ ] Copy proofread by Naveen
- [ ] All links work (internal + external)
- [ ] Form validation tested (success + error states)
- [ ] Mobile orientation changes (portrait ↔ landscape)
- [ ] iOS Safari + Android Chrome tested
- [ ] Print styles verified (if applicable)

**Sign-Off:**
- [ ] Admin sign-off (Naveen)
- [ ] QA pass on all platforms
- [ ] Performance verified
- [ ] Accessibility verified
- [ ] Copy verified

---

## DESIGN TOKENS & STYLE GUIDE

### Colors (from TASK75_THEME_SPECIFICATION.md)
- **Light Mode:** Primary (brand), secondary, accent, success, warning, error, info, neutral
- **Dark Mode:** Same tokens, darker values
- **Elemental Mapping:**
  - Akash (Purple #8B5CF6) → Birth Charts
  - Agni (Orange #F97316) → Muhurta Timing
  - Jal (Cyan #0EA5E9) → Numerology
  - Vayu (Teal #06B6D4) → Recommendations
  - Prithvi (Green #10B981) → Wallet/Account

### Typography
- **Display:** Poppins (600-700 weight, 32px-48px)
- **Body:** Inter (400-500 weight, 14px-16px)
- **Mono:** JetBrains Mono (code, 12px-14px)
- **Line height:** 1.5 (body), 1.2 (headings)
- **Letter spacing:** 0.5px (labels)

### Spacing (8px Grid)
- Gutters: 16px (mobile), 24px (tablet), 32px (desktop)
- Card padding: 16px, 24px, 32px
- Section gaps: 48px, 64px, 80px

### Components (Pre-styled)
- Buttons (primary, secondary, ghost, disabled states)
- Cards (elevated, flat, with/without hover)
- Forms (text inputs, select, textarea, checkboxes, radio)
- Modals (centered, fullscreen on mobile)
- Alerts (info, success, warning, error)
- Badges (colored by category)

---

## DELIVERABLES

### End of Week 1
- [ ] Homepage fully polished and signed off
- [ ] Design system applied to all pages
- [ ] Dark mode toggle functional

### End of Week 2
- [ ] Features page polished
- [ ] Pricing page polished
- [ ] Contact form wired
- [ ] Mobile responsive verified

### End of Week 3
- [ ] Blog page polished
- [ ] Header/Footer refined
- [ ] Full QA pass complete
- [ ] All 6 pages signed off

---

## SUCCESS CRITERIA

✅ **Task 78 Complete When:**
1. All 6 pages responsive @ 360px, 768px, 1024px
2. All touch targets ≥44×44px
3. Dark mode works on all pages
4. All forms functional (validation + submit)
5. Performance ≥85 (Lighthouse)
6. Accessibility ≥85 (WCAG 2.1 AA)
7. Copy proofread and approved
8. iOS Safari + Android Chrome tested
9. No horizontal scroll @ 360px
10. Admin sign-off by Naveen

---

## REFERENCES

- Design System: `docs/GLOBAL_DESIGN_SYSTEM.md`
- Theme System: `docs/TASK75_THEME_SPECIFICATION.md`
- Original Plan: `docs/TASK78_WEBSITE_POLISH_PLAN.md`
- i18n: `TASK74_INTEGRATION_GUIDE.md` (test EN + HI on pages)

