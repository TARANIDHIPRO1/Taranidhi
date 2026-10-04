# Task 74: Complete i18n Implementation & Testing Checklist
## All 3 Phases - End-to-End Verification

**Phase:** 1 (COMPLETE) + 2 (TEMPLATE READY) + 3 (TESTING)  
**Status:** Ready for dev team to complete Phases 2 & 3  
**Strings:** 2,400 total (1,200 English + 1,200 Hindi)

---

## PHASE 1: FOUNDATION ✅ COMPLETE

- [x] i18n Strategy (TASK74_I18N_STRATEGY.md)
- [x] Integration Guide (TASK74_INTEGRATION_GUIDE.md)
- [x] Common strings EN (en-common.json, 270 strings)
- [x] Common strings HI (hi-common.json, 270 strings)
- [x] Kundali example EN (en-kundali.json, 150 strings)
- [x] Kundali example HI (hi-kundali.json, 150 strings)
- [x] Screen templates (TASK74_SCREEN_TEMPLATES.md)

**Deliverable:** Complete reference example + templates for 7 remaining screens

---

## PHASE 2: INTEGRATION (Dev Team)

### 2.1 Create Remaining Translation Files

For each of 7 screens (Muhurta, Numerology, Recommendations, Wallet, Dashboard, Admin, Errors):

- [ ] Create en-{screen}.json using template from TASK74_SCREEN_TEMPLATES.md
- [ ] Create hi-{screen}.json by translating en-{screen}.json to Hindi
- [ ] Validate JSON syntax (no errors)
- [ ] Verify all keys from template are present
- [ ] Check consistency with en-common.json terminology

**Dev Steps:**
1. Copy template from TASK74_SCREEN_TEMPLATES.md → en-{screen}.json
2. Fill in English translations for your screen
3. Translate to Hindi → hi-{screen}.json (reference en-kundali.json + hi-kundali.json)
4. Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('en-screen.json'))"`
5. Commit both files

### 2.2 Update i18n Configuration

Update i18n initialization to include all 9 namespaces:

```javascript
i18next.init({
  ns: ['common', 'kundali', 'muhurta', 'numerology', 'recommendations', 'wallet', 'dashboard', 'admin', 'errors'],
  defaultNS: 'common',
  // ... rest of config
});
```

### 2.3 Wire Translations to HTML

For each screen, replace hardcoded strings:

**Before:**
```html
<h1>Birth Chart</h1>
<button>Generate Chart</button>
<label>Ascendant:</label>
```

**After:**
```html
<h1 data-i18n="kundali.page.title"></h1>
<button data-i18n="kundali.button.generate"></button>
<label data-i18n="kundali.label.ascendant"></label>

<script>
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
</script>
```

### 2.4 Test Language Toggle

- [ ] Language toggle button works (EN → HI → EN)
- [ ] localStorage saves language preference
- [ ] All screen text updates on toggle
- [ ] Page reloads with saved language
- [ ] No console errors

---

## PHASE 3: TESTING & VERIFICATION (QA)

### 3.1 Language Functionality Testing

- [ ] **English display:** All text appears in English on all 7 screens
- [ ] **Hindi display:** All text appears in Hindi on all 7 screens
- [ ] **Toggle works:** Button toggles between languages
- [ ] **Persistence:** Language preference survives page reload
- [ ] **System detection:** App respects browser language preference on first visit
- [ ] **Fallback works:** Missing translations show English fallback

### 3.2 String Coverage Testing

For each screen, verify:

- [ ] No hardcoded English text visible
- [ ] No `undefined` or `[object Object]` appearing
- [ ] All buttons have translations
- [ ] All labels have translations
- [ ] All error messages have translations
- [ ] All page titles have translations
- [ ] Tooltips appear in correct language

### 3.3 Dark Mode + Language Testing

- [ ] Dark mode works with English
- [ ] Dark mode works with Hindi
- [ ] Language toggle works in dark mode
- [ ] Text is readable in both modes + both languages

### 3.4 Mobile Testing

- [ ] Language toggle is visible on mobile (360px width)
- [ ] Text doesn't overflow in Hindi (longer words)
- [ ] All buttons are accessible (44×44px minimum)
- [ ] Landscape orientation works
- [ ] Language preference persists on mobile

### 3.5 Localization Testing

- [ ] Numbers display correctly (e.g., dates)
- [ ] Decimals use correct separator (if applicable)
- [ ] Currency displays correctly (₹ vs $)
- [ ] No character rendering issues in Hindi
- [ ] Proper spacing between Hindi words

### 3.6 Browser Compatibility

- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Mobile Safari (iOS)
- [ ] Works in Chrome Mobile (Android)

### 3.7 Performance Testing

- [ ] Translation files load quickly (< 100ms)
- [ ] Language toggle is instant (< 50ms)
- [ ] No memory leaks (test with DevTools)
- [ ] No console errors or warnings

### 3.8 Accessibility Testing

- [ ] Screen readers work with both languages
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Color contrast maintained in both languages
- [ ] ARIA labels correct

### 3.9 Content Quality Testing

- [ ] English grammar is correct
- [ ] Hindi grammar is correct
- [ ] Terminology is consistent (use glossary)
- [ ] Vedic terms are transliterated (not translated)
- [ ] No mixed English-Hindi in single string
- [ ] Tone is consistent across all strings

### 3.10 Edge Cases

- [ ] Very long strings don't break layout
- [ ] Strings with special characters work (quotes, apostrophes)
- [ ] Empty strings handled gracefully
- [ ] RTL text direction ready (future: Arabic support)
- [ ] Multiple instances of same key work correctly

---

## Sign-Off Matrix

| Phase | Component | Owner | Status | Date |
|-------|-----------|-------|--------|------|
| 1 | Foundation & Common Strings | Claude | ✅ | Oct 4 |
| 1 | Kundali Example | Claude | ✅ | Oct 4 |
| 1 | Screen Templates | Claude | ✅ | Oct 4 |
| 2 | Translation Files (7 screens) | Dev Team | ⏳ | - |
| 2 | i18n Configuration Update | Dev Team | ⏳ | - |
| 2 | HTML Integration | Dev Team | ⏳ | - |
| 3 | Language Testing | QA | ⏳ | - |
| 3 | Mobile Testing | QA | ⏳ | - |
| 3 | Accessibility Testing | QA | ⏳ | - |

---

## File Inventory

### Complete ✅

- [x] TASK74_I18N_STRATEGY.md (12KB)
- [x] TASK74_INTEGRATION_GUIDE.md (12KB)
- [x] en-common.json (7.2KB, 270 strings)
- [x] hi-common.json (11KB, 270 strings)
- [x] en-kundali.json (6KB, 150 strings) ← Complete Reference Example
- [x] hi-kundali.json (9KB, 150 strings) ← Complete Reference Example
- [x] TASK74_SCREEN_TEMPLATES.md (15KB, structure + examples for 7 screens)
- [x] TASK74_COMPLETE_CHECKLIST.md (this file)

### Pending (Dev Team) 📋

- [ ] en-muhurta.json (120 strings)
- [ ] hi-muhurta.json (120 strings)
- [ ] en-numerology.json (100 strings)
- [ ] hi-numerology.json (100 strings)
- [ ] en-recommendations.json (110 strings)
- [ ] hi-recommendations.json (110 strings)
- [ ] en-wallet.json (100 strings)
- [ ] hi-wallet.json (100 strings)
- [ ] en-dashboard.json (120 strings)
- [ ] hi-dashboard.json (120 strings)
- [ ] en-admin.json (160 strings)
- [ ] hi-admin.json (160 strings)
- [ ] en-errors.json (70 strings)
- [ ] hi-errors.json (70 strings)

---

## Success Criteria

✅ **Phase 1:** All foundation + example + templates delivered  
✅ **Phase 2:** All 14 translation files created + HTML integrated  
✅ **Phase 3:** All testing passed + no console errors  

**Final Status:** Bilingual app (English + Hindi) ready for production

---

**Created:** Oct 4, 2026  
**Status:** Ready for dev team handoff
