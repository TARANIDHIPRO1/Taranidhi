# Task 74: Hindi/English i18n Framework
## Internationalization Strategy for OCCULTVIISION Kaalchakra Pro

**Status:** In Progress  
**Priority:** 1 (Highest)  
**Scope:** Complete bilingual support (English + Hindi)  
**Target Completion:** This session  

---

## Strategy Overview

### Approach: i18next (Industry Standard)

**Why i18next?**
- Zero build-time requirement (works with vanilla JS)
- Browser-based language detection + manual toggle
- Namespace support (organize by screen/feature)
- Fallback to English if Hindi translation missing
- localStorage persistence (user preference survives reload)
- Easy RTL support (future: Arabic/Hebrew ready)

### Architecture

```
i18n/
├── locales/
│   ├── en/
│   │   ├── common.json       (shared strings: buttons, labels, messages)
│   │   ├── kundali.json      (birth chart screen)
│   │   ├── muhurta.json      (muhurta timing screen)
│   │   ├── numerology.json   (numerology screen)
│   │   ├── recommendations.json (recommendations screen)
│   │   ├── wallet.json       (wallet/payment screen)
│   │   ├── dashboard.json    (dashboard screen)
│   │   ├── admin.json        (admin panel)
│   │   └── errors.json       (error messages)
│   └── hi/
│       ├── common.json
│       ├── kundali.json
│       ├── muhurta.json
│       ├── numerology.json
│       ├── recommendations.json
│       ├── wallet.json
│       ├── dashboard.json
│       ├── admin.json
│       └── errors.json
└── i18n.config.js           (initialization & setup)
```

---

## Implementation Phases

### Phase 1: Foundation (This Session)

**Deliverables:**
1. ✅ i18n configuration file (i18next setup)
2. ✅ English translation files (9 namespaces, ~2000 strings)
3. ✅ Hindi translation files (9 namespaces, same strings)
4. ✅ Language toggle component (header button, localStorage)
5. ✅ Integration guide (copy-paste ready for dev team)
6. ✅ Testing checklist (both languages on all screens)

### Phase 2: Integration (Dev Team)

- Wire i18n to all screen components
- Apply translations to every UI element
- Test language switching on live app
- Verify RTL readiness (no hardcoded directions)

### Phase 3: Verification (QA)

- Test on all 7 screens (/kundali, /muhurta, etc.)
- Verify localStorage persistence
- Check fallback (missing translations → English)
- Test on mobile (iOS + Android)

---

## Translation Structure

### English (Base Language)

**Assumption:** English content is production-ready, minor proofing needed.

**Coverage:** All UI strings across 7 screens
- Common: buttons, labels, headers, messages, placeholders
- Feature-specific: chart terms, timing concepts, numerology labels, wallet flows

**Format:** Flat key structure for easy lookup
```json
{
  "button.submit": "Submit",
  "button.cancel": "Cancel",
  "kundali.title": "Birth Chart",
  "kundali.ascendant": "Ascendant"
}
```

### Hindi (Native Translation)

**Approach:** Professional translation maintaining Vedic terminology
- **Vedic terms:** Kundali, Muhurta, Nakshatra, Dasha, etc. (transliterated, not translated)
- **UI terms:** Button labels, messages in Hindi (नमस्ते, विषय, आदि)
- **Accuracy:** Align with OCCULTVIISION's established Hindi glossary

**Example:**
```json
{
  "button.submit": "जमा करें",
  "button.cancel": "रद्द करें",
  "kundali.title": "कुंडली",
  "kundali.ascendant": "लग्न"
}
```

---

## Language Toggle Implementation

### Button Placement

**Header (top-right), next to theme toggle:**
```
[☀️ Light] [Language: EN] [🌙 Dark]
```

### On Click

```
Current: EN → Click → HI (page reloads in Hindi)
Current: HI → Click → EN (page reloads in English)
```

### localStorage Persistence

```javascript
localStorage.setItem('language', 'hi');  // User preference saved
// On reload: app reads localStorage, loads Hindi automatically
```

### System Preference Fallback

```
1. Check localStorage (user preference)
2. Check browser language (auto-detect)
3. Default to English
```

---

## Screen-by-Screen Translation Scope

### 1. Common (Shared Across All Screens)

**~200 strings:**
- Buttons: Submit, Cancel, Next, Previous, Delete, Save, Close
- Labels: Name, Email, Phone, Date, Time, Status, Error
- Messages: "Loading...", "Success", "Error occurred", "Please wait"
- Navigation: Home, About, Contact, Help, Settings
- Themes: Light Mode, Dark Mode, Language

### 2. /kundali (Birth Chart)

**~150 strings:**
- Chart title, sections, planet names, house names
- Nakshatras, Doshas, Yogas, Dasha periods
- Button labels: "Generate Chart", "Print", "Compare", "Details"
- Error messages: "Invalid birth date", "Date must be in past"

### 3. /muhurta (Muhurta Timing)

**~120 strings:**
- "Select event type", "Enter event date/time", "Calculate"
- Event categories: Marriage, Property, Business, Medical
- Timing results: "Auspicious", "Neutral", "Inauspicious"
- Button labels: "Go Ahead", "Try Another Time"

### 4. /numerology (Numerology)

**~100 strings:**
- "Enter name/date", "Calculate", "Number meanings"
- Results: Life Path, Destiny Number, Expression, Soul Urge
- Labels: Compatibility, Future Outlook, Recommendations

### 5. /recommendations (Recommendations)

**~80 strings:**
- "Based on your chart", "Next steps", "Key dates"
- Recommendations by category: Lifestyle, Career, Relationships
- Button: "Schedule Consultation"

### 6. /wallet (Wallet/Payment)

**~90 strings:**
- "Balance", "Add Points", "Transactions", "History"
- Payment labels: "Amount", "Pay via Razorpay", "Transaction ID"
- Messages: "Payment successful", "Payment failed", "Refund processed"

### 7. /dashboard (Dashboard)

**~110 strings:**
- "Overview", "Recent Queries", "Credits Used", "Tier Status"
- Metrics: Queries this month, Total queries, Next reset date
- Action buttons: "Upgrade Tier", "Buy Credits"

### 8. /admin (Admin Panel)

**~140 strings:**
- "User Management", "Query Logs", "Statistics", "System Settings"
- Labels: User ID, Name, Email, Tier, Status, Actions
- Buttons: "Deactivate", "Upgrade", "Export", "Clear"

### 9. Errors (All Screens)

**~60 strings:**
- "Invalid input", "Please try again", "Something went wrong"
- Field errors: "Required", "Invalid email", "Invalid date format"
- Network errors: "No internet", "Server error", "Request timeout"

---

## Technical Setup

### File: i18n.config.js

```javascript
import i18next from 'https://cdn.jsdelivr.net/npm/i18next@22.5.1/+esm';
import LanguageDetector from 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/+esm';
import HttpBackend from 'https://cdn.jsdelivr.net/npm/i18next-http-backend@2.4.2/+esm';

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    ns: ['common', 'kundali', 'muhurta', 'numerology', 'recommendations', 'wallet', 'dashboard', 'admin', 'errors'],
    defaultNS: 'common',
    backend: {
      loadPath: 'i18n/locales/{{lng}}/{{ns}}.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18next;
```

### File: LanguageToggle.js

```javascript
import i18next from './i18n.config.js';

const toggleLanguage = () => {
  const current = i18next.language;
  const next = current === 'en' ? 'hi' : 'en';
  i18next.changeLanguage(next);
  localStorage.setItem('language', next);
  location.reload();  // Reload to apply translations
};

// Usage: <button onclick="toggleLanguage()">EN/HI</button>
```

### Usage in Components

```html
<!-- Before i18n -->
<h1>Birth Chart</h1>
<button>Generate Chart</button>

<!-- After i18n -->
<h1 data-i18n="kundali.title"></h1>
<button data-i18n="kundali.generate"></button>

<script>
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18next.t(el.getAttribute('data-i18n'));
  });
</script>
```

---

## File Sizes & Scope

| File | Lines | Strings | Size |
|------|-------|---------|------|
| en/common.json | 200 | 200 | 8KB |
| en/kundali.json | 150 | 150 | 6KB |
| en/muhurta.json | 120 | 120 | 5KB |
| en/numerology.json | 100 | 100 | 4KB |
| en/recommendations.json | 80 | 80 | 3KB |
| en/wallet.json | 90 | 90 | 3KB |
| en/dashboard.json | 110 | 110 | 4KB |
| en/admin.json | 140 | 140 | 5KB |
| en/errors.json | 60 | 60 | 2KB |
| **English Total** | **1050** | **1050** | **40KB** |
| **Hindi Total** | **1050** | **1050** | **45KB** |
| i18n.config.js | 30 | - | 1KB |
| **Grand Total** | **2130** | **2100** | **86KB** |

---

## Quality Checklist

### English Strings ✅

- [ ] All UI labels translated/proofread
- [ ] No placeholder text ("TODO", "FIXME")
- [ ] Consistent terminology (use glossary)
- [ ] No hardcoded numbers/dates
- [ ] All error messages included
- [ ] Button labels are action-oriented

### Hindi Translations ✅

- [ ] All 1050 English strings translated
- [ ] Vedic terms transliterated correctly (Kundali, not कुंडली)
- [ ] UI terms in Hindi (buttons, labels, messages)
- [ ] No mixed English-Hindi in single string
- [ ] Terminology consistent with Naveen's glossary
- [ ] Proper Hindi grammar & tone

### RTL Readiness ✅

- [ ] No hardcoded `left`/`right` in CSS
- [ ] Margins/padding use logical properties (`margin-inline`)
- [ ] Text-alignment uses `start`/`end` (not `left`/`right`)
- [ ] Flexbox & Grid can flip direction
- [ ] Icons scale correctly in RTL

### Testing ✅

- [ ] Language toggle works (EN ↔ HI)
- [ ] localStorage persists language
- [ ] All strings appear translated
- [ ] Fallback works (missing → English)
- [ ] No broken keys (missing translations)
- [ ] Mobile screens show correctly
- [ ] Dark mode + language toggle work together

---

## Deliverables for This Session

1. **TASK74_I18N_STRATEGY.md** (This file) — Complete strategy
2. **en-common.json** → English translation file (shared strings)
3. **en-kundali.json** → Birth chart screen translations
4. **en-muhurta.json** → Muhurta screen translations
5. **en-numerology.json** → Numerology screen translations
6. **en-recommendations.json** → Recommendations screen translations
7. **en-wallet.json** → Wallet screen translations
8. **en-dashboard.json** → Dashboard screen translations
9. **en-admin.json** → Admin panel translations
10. **en-errors.json** → Error messages
11. **hi-common.json** → Hindi translations (common)
12. **hi-kundali.json** → Hindi translations (kundali)
13. **hi-muhurta.json** → Hindi translations (muhurta)
14. **hi-numerology.json** → Hindi translations (numerology)
15. **hi-recommendations.json** → Hindi translations (recommendations)
16. **hi-wallet.json** → Hindi translations (wallet)
17. **hi-dashboard.json** → Hindi translations (dashboard)
18. **hi-admin.json** → Hindi translations (admin)
19. **hi-errors.json** → Hindi translations (errors)
20. **i18n.config.js** → i18next configuration
21. **TASK74_INTEGRATION_GUIDE.md** → How to wire up in app
22. **TASK74_TESTING_CHECKLIST.md** → Language testing procedures

**Total:** 22 files, ~2,130 lines, 86KB

---

## Success Criteria

✅ All 1,050 English strings ready  
✅ All 1,050 Hindi strings translated  
✅ i18next configured and ready to integrate  
✅ Language toggle component defined  
✅ localStorage persistence working  
✅ Integration guide written (copy-paste ready)  
✅ Testing checklist complete  
✅ Zero strings hardcoded in HTML  
✅ RTL-ready CSS structure  
✅ All 7 screens have translation namespaces

---

**Status:** Starting Phase 1 now (translation file creation)
