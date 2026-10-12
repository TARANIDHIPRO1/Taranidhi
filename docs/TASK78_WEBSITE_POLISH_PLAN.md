# Task 78: Website UI Polish — Complete Build Plan  
**Status:** 📋 PLANNED  
**Date:** 2026-10-12  
**Priority:** 5  
**Effort:** 2-3 weeks  

---

## **SCOPE: 6 Public Website Pages**

| # | Page | File | Purpose | Status |
|---|------|------|---------|--------|
| 1 | Homepage | `public-home.ts` | Hero, value props, CTA | ⚠️ Needs Polish |
| 2 | Features | `public-features.ts` | Detailed capability breakdown | ⚠️ Needs Polish |
| 3 | Pricing | `public-pricing.ts` | Tier comparison, upgrade CTA | ⚠️ Needs Polish |
| 4 | Blog/Resources | `public-blog.ts` | Articles, guides, FAQ | ⚠️ Needs Polish |
| 5 | Contact/Support | `public-contact.ts` | Contact form, email, phone | ⚠️ Needs Polish |
| 6 | Layout | `public-layout.ts` | Header, nav, footer, shared | ⚠️ Needs Polish |

---

## **BUILD CHECKLIST: 6 Components**

### **1. HOMEPAGE (`public-home.ts`)**

**Hero Section:**
- [ ] Hero image/visual (branded, high-res)
- [ ] Headline: "OCCULTVIISION — Vedic Timing for Modern Life"
- [ ] Subheadline: 1-2 sentences on value prop
- [ ] Primary CTA button: "Get Started" (link to signup)
- [ ] Secondary CTA: "Learn More" (scroll to features)
- [ ] Hero layout responsive (image left/top on mobile)

**Value Propositions (3-4 cards):**
- [ ] Card 1: Muhurta (classical timing)
- [ ] Card 2: KP System (precise predictions)
- [ ] Card 3: Numerology (personal insights)
- [ ] Card 4: (Optional: Vastu or astro-coaching)
- [ ] Each card: Icon + headline + 1-2 sentences

**Social Proof:**
- [ ] 3-5 testimonials from clients (name, title, quote)
- [ ] Star rating display (if applicable)
- [ ] Number of satisfied users (if applicable)

**FAQ Section:**
- [ ] 5-7 FAQs (expandable/accordion)
- [ ] Topics: pricing, accuracy, privacy, onboarding

**Footer:**
- [ ] Logo + copyright
- [ ] Links: Privacy, Terms, Contact
- [ ] Social media links (if applicable)
- [ ] Email signup (optional newsletter)

---

### **2. FEATURES PAGE (`public-features.ts`)**

**Feature Grid (3+ features):**
- [ ] Muhurta Timing
  - Description: Classical timing for major life events
  - Image/icon
  - "Learn more" link
  
- [ ] KP Horary System
  - Description: Precise predictions via KP sub-lords
  - Image/icon
  - "Learn more" link
  
- [ ] Numerology Analysis
  - Description: Personal numerological insights
  - Image/icon
  - "Learn more" link
  
- [ ] (Additional features as needed)

**Detailed Breakdown (per feature):**
- [ ] Full explanation (2-3 paragraphs)
- [ ] Key benefits (bullet points)
- [ ] Use cases (real-world examples)
- [ ] CTA: "Explore [Feature]" button

**Comparison Matrix (optional):**
- [ ] Compare OCCULTVIISION vs other apps
- [ ] Columns: accuracy, speed, classical source, support, price
- [ ] Visual checkmarks/badges

---

### **3. PRICING PAGE (`public-pricing.ts`)**

**Pricing Tiers (3-4 tiers):**
- [ ] Basic Tier
  - Price: per-query pricing
  - Queries: limited daily
  - Features: Muhurta + Numerology
  - CTA: "Start Free" or "Upgrade"
  
- [ ] Premium Tier
  - Price: monthly/yearly
  - Queries: unlimited
  - Features: All + KP + admin
  - CTA: "Subscribe Now"
  
- [ ] Ultra Tier (optional)
  - Price: premium pricing
  - Features: All + priority support
  - CTA: "Upgrade to Ultra"

**Feature Comparison Table:**
- [ ] Rows: all features
- [ ] Columns: Basic, Premium, Ultra
- [ ] Checkmarks for included features
- [ ] Disabled for not-included

**Testimonials per tier:**
- [ ] Customer reviews for each tier
- [ ] Quote + name + title

**FAQ section:**
- [ ] Billing questions
- [ ] Upgrade/downgrade policy
- [ ] Refund policy

---

### **4. BLOG/RESOURCES PAGE (`public-blog.ts`)**

**Article Grid:**
- [ ] 6-12 article cards
- [ ] Each card:
  - Thumbnail image
  - Title
  - Excerpt (2-3 sentences)
  - Author + date
  - "Read more" link
  - Category badge (Muhurta, KP, Numerology, etc.)

**Article Categories:**
- [ ] Muhurta Guides (e.g., "Best Muhurtas for 2026")
- [ ] KP Tutorials (e.g., "KP Sub-Lord Meanings")
- [ ] Numerology Tips (e.g., "Life Path Number Explained")
- [ ] Case Studies (e.g., "Client Success Stories")
- [ ] General (e.g., "Vedic Astrology 101")

**Article Pages (detail view):**
- [ ] Article title + date + author
- [ ] Featured image
- [ ] Article body (Markdown or formatted HTML)
- [ ] Related articles (3-5 links)
- [ ] Author bio (if applicable)
- [ ] Email signup for follow-ups

**FAQ Guides:**
- [ ] "Common Questions About Muhurta"
- [ ] "KP System Explained"
- [ ] "Numerology Basics"
- [ ] Expand/collapse sections

---

### **5. CONTACT/SUPPORT PAGE (`public-contact.ts`)**

**Contact Form:**
- [ ] Name field (required)
- [ ] Email field (required)
- [ ] Subject dropdown (inquiry, support, business, other)
- [ ] Message textarea (min 50 chars)
- [ ] Submit button + loading state
- [ ] Success message: "Thanks for reaching out!"
- [ ] Error handling (validation + server errors)

**Contact Information:**
- [ ] Email: hello@occultviision.com (clickable mailto)
- [ ] Phone: Naveen's phone (with WhatsApp link if applicable)
- [ ] Office address: Bhopal, Madhya Pradesh, India
- [ ] Response time: "Typically within 24 hours"

**Support Channels:**
- [ ] Email support
- [ ] Phone support (hours TBD)
- [ ] WhatsApp business (if applicable)
- [ ] Social media links

**FAQ Section:**
- [ ] Support response times
- [ ] Billing inquiries
- [ ] Technical issues
- [ ] Privacy/data concerns

---

### **6. SHARED LAYOUT (`public-layout.ts`)**

**Header/Navigation:**
- [ ] Logo (links to home)
- [ ] Nav menu:
  - Home
  - Features
  - Pricing
  - Blog
  - Contact
- [ ] Auth buttons (if not logged in):
  - "Login" link
  - "Sign Up" button (primary CTA)
- [ ] Mobile hamburger menu (responsive)
- [ ] Dark mode toggle (if applicable)

**Footer:**
- [ ] Logo + tagline
- [ ] Company info (1-2 sentences)
- [ ] Quick links:
  - Privacy Policy
  - Terms of Service
  - Contact
  - Blog
- [ ] Social media icons:
  - LinkedIn (if applicable)
  - Twitter/X (if applicable)
  - Instagram (if applicable)
  - Email newsletter signup
- [ ] Copyright notice

**Global Styling:**
- [ ] Use TASK75_THEME_SPECIFICATION colors
- [ ] Typography: Poppins (display) + Inter (body)
- [ ] Spacing: 8px base grid
- [ ] Dark mode: Prefers-color-scheme + toggle
- [ ] Responsive: 360px → 1200px+

---

## **POLISH CHECKLIST: Design & UX**

### **Visual Design**
- [ ] Consistent color palette (from GLOBAL_DESIGN_SYSTEM.md)
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Adequate whitespace (padding/margins)
- [ ] Image optimization (WebP, compressed)
- [ ] Icon consistency (single icon set)
- [ ] Button styles consistent

### **User Experience**
- [ ] Clear call-to-action (primary button per page)
- [ ] Navigation is intuitive (breadcrumbs if needed)
- [ ] Form validation (clear error messages)
- [ ] Loading states (spinners, placeholders)
- [ ] Feedback messages (success, error, warning)
- [ ] Accessibility (WCAG 2.1 AA minimum)

### **Brand Identity**
- [ ] Logo usage consistent
- [ ] Color palette follows design system
- [ ] Typography: Poppins + Inter throughout
- [ ] Tone of voice: Professional, approachable, Indian astrology-aware
- [ ] Imagery: Vedic/spiritual but modern

---

## **IMPLEMENTATION SEQUENCE**

**Week 1: Homepage + Layout**
- [ ] Polish hero section (image, text, CTA)
- [ ] Build value prop cards
- [ ] Add testimonials + social proof
- [ ] Build/polish header + footer

**Week 2: Features + Pricing**
- [ ] Feature grid + detailed breakdowns
- [ ] Pricing table (3-4 tiers)
- [ ] Comparison matrix (optional)
- [ ] Feature-tier matching

**Week 3: Blog + Contact**
- [ ] Article grid (6-12 articles)
- [ ] Individual article pages
- [ ] Contact form (frontend + backend wiring)
- [ ] FAQ sections across pages
- [ ] Final polish + QA

---

## **TESTING CHECKLIST**

- [ ] All pages render @ 360px, 768px, 1024px
- [ ] All forms validate correctly
- [ ] Contact form submits successfully
- [ ] Email is received by admin
- [ ] Links (internal + external) work
- [ ] Images load correctly
- [ ] Dark mode toggle works (if applicable)
- [ ] Navigation responsive
- [ ] Touch targets ≥44×44px
- [ ] Performance: page load < 3s (3G)

---

## **COPYWRITING CHECKLIST**

- [ ] Headlines are clear and benefit-driven
- [ ] Descriptions explain value (not just features)
- [ ] CTAs are action-oriented ("Start Free", "Subscribe Now", etc.)
- [ ] Tone is professional yet approachable
- [ ] No jargon without explanation
- [ ] Testimonials are authentic + specific

---

## **SIGN-OFF CRITERIA**

✅ Task 78 is complete when:
1. All 6 pages built and styled
2. Responsive @ 360px, 768px, 1024px
3. All forms functional + backend wired
4. Contact form sends emails
5. Mobile-first design applied
6. WCAG 2.1 AA accessible
7. Performance < 3s @ 3G
8. QA passed on all devices
9. Copywriting proofread
10. Admin review + approval

---

## **REFERENCE**

- **Design System:** docs/GLOBAL_DESIGN_SYSTEM.md
- **Theme System:** docs/TASK75_THEME_SPECIFICATION.md
- **Colors:** Akash/Agni/Jal/Vayu/Prithvi tokens
- **Typography:** Poppins (display) + Inter (body)
- **Brand:** OCCULTVIISION — Vedic Astrology + Numerology for Modern Life

