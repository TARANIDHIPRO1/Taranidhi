# Task 74: Screen-Specific Translation Templates
## Complete Translation Structure for All 7 Remaining Screens

**Status:** Ready for dev team to complete  
**Complete Example:** en-kundali.json + hi-kundali.json (use as reference)  
**Template Below:** Copy structure for other 7 screens

---

## Template Structure (For Each Screen)

```json
{
  // PAGE METADATA
  "page.title": "Screen Title",
  "page.description": "Brief description of the screen",

  // SECTION HEADINGS
  "section.main": "Main Section",
  "section.details": "Details Section",
  "section.results": "Results Section",

  // LABELS & FIELDS
  "label.fieldName": "Field Display Name",
  "label.anotherField": "Another Field Name",

  // BUTTONS & ACTIONS
  "button.action": "Action Label",
  "button.next": "Next Button Text",

  // MESSAGES & FEEDBACK
  "message.success": "Success message text",
  "message.error": "Error message text",
  "message.loading": "Loading state text",

  // TOOLTIPS & HELP
  "tooltip.fieldName": "Help text explaining the field",

  // SPECIFIC CONTENT
  "term.concept": "Vedic or technical term",
  "info.stat": "Status or information text"
}
```

---

## 7 Remaining Screens

### 1. Muhurta (/muhurta)
**~100-150 strings**

```json
{
  "page.title": "Muhurta Timing (Auspicious Moments)",
  "section.eventType": "Select Event Type",
  "section.eventDate": "Event Date & Time",
  "section.results": "Muhurta Results",
  
  "eventType.marriage": "Marriage",
  "eventType.property": "Property/Housewarming",
  "eventType.business": "Business Launch",
  "eventType.medical": "Medical Procedure",
  "eventType.travel": "Travel",
  "eventType.ceremony": "Religious Ceremony",
  
  "label.eventName": "Event Name",
  "label.proposedDate": "Proposed Date",
  "label.proposedTime": "Proposed Time",
  
  "button.calculate": "Calculate Muhurta",
  "button.showAlternatives": "Show Alternative Times",
  
  "result.auspicious": "Highly Auspicious",
  "result.neutral": "Neutral",
  "result.inauspicious": "Not Recommended",
  
  "message.calculatingMuhurta": "Analyzing auspicious moments...",
  "message.noMuhurtaFound": "No auspicious muhurta in selected period",
  
  "tooltip.muhurta": "Auspicious timing for important life events"
}
```

### 2. Numerology (/numerology)
**~80-120 strings**

```json
{
  "page.title": "Numerology Analysis",
  "section.inputData": "Enter Your Details",
  "section.results": "Your Numbers",
  "section.analysis": "Numerology Insights",
  
  "numberType.lifePathNumber": "Life Path Number",
  "numberType.destinyNumber": "Destiny Number",
  "numberType.expressionNumber": "Expression Number",
  "numberType.soulUrgeNumber": "Soul Urge Number",
  "numberType.personalYearNumber": "Personal Year Number",
  
  "label.fullName": "Full Name",
  "label.dateOfBirth": "Date of Birth",
  
  "button.calculate": "Calculate Numbers",
  "button.viewDetails": "View Full Details",
  
  "meaning.number1": "Leadership, Independence, Innovation",
  "meaning.number2": "Partnerships, Sensitivity, Diplomacy",
  "meaning.number3": "Creativity, Communication, Expression",
  // ... continues for numbers 1-9, 11, 22, 33
  
  "message.enterValidData": "Please enter valid name and date"
}
```

### 3. Recommendations (/recommendations)
**~90-130 strings**

```json
{
  "page.title": "Personalized Recommendations",
  "section.overview": "Your Recommendation Overview",
  "section.lifestyle": "Lifestyle Recommendations",
  "section.careerBusiness": "Career & Business Guidance",
  "section.relationships": "Relationship Insights",
  "section.timingDates": "Key Dates & Timing",
  
  "category.lucky": "Lucky Factors",
  "category.caution": "Caution Areas",
  "category.remedies": "Suggested Remedies",
  
  "label.luckyDays": "Lucky Days",
  "label.luckyNumbers": "Lucky Numbers",
  "label.luckyColor": "Lucky Color",
  "label.luckyDirection": "Lucky Direction",
  
  "button.scheduleConsultation": "Schedule Consultation",
  "button.viewFullRecommendations": "View Full Recommendations",
  
  "message.basedOnChart": "Based on your birth chart analysis",
  "message.personalizedAdvice": "Personalized advice for your situation"
}
```

### 4. Wallet (/wallet)
**~80-120 strings**

```json
{
  "page.title": "Wallet & Credits",
  "section.balance": "Your Balance",
  "section.topUp": "Add Credits",
  "section.history": "Transaction History",
  "section.tier": "Subscription Tier",
  
  "label.currentBalance": "Current Balance",
  "label.availableCredits": "Available Credits",
  "label.totalSpent": "Total Spent",
  "label.currentTier": "Current Tier",
  
  "button.addCredits": "Add Credits",
  "button.upgradeTier": "Upgrade Tier",
  "button.viewHistory": "View History",
  
  "tier.basic": "Basic Tier",
  "tier.premium": "Premium Tier",
  "tier.ultra": "Ultra Tier",
  
  "transaction.query": "Kundali Query",
  "transaction.report": "Full Report",
  "transaction.subscription": "Subscription",
  
  "message.lowBalance": "Your balance is low. Add credits to continue.",
  "message.paymentSuccess": "Payment successful. Credits added.",
  "message.paymentFailed": "Payment failed. Please try again."
}
```

### 5. Dashboard (/dashboard)
**~100-140 strings**

```json
{
  "page.title": "Dashboard",
  "section.overview": "Overview",
  "section.recentQueries": "Recent Queries",
  "section.usageStats": "Usage Statistics",
  "section.upcomingDates": "Upcoming Important Dates",
  
  "stat.queriesThisMonth": "Queries This Month",
  "stat.creditBalance": "Credit Balance",
  "stat.tierStatus": "Tier Status",
  "stat.nextResetDate": "Next Reset Date",
  
  "button.viewAllQueries": "View All Queries",
  "button.viewAllStats": "View All Statistics",
  "button.addCredits": "Add Credits",
  
  "message.welcome": "Welcome back, {{name}}!",
  "message.statsLoading": "Loading statistics...",
  
  "chart.monthlyUsage": "Monthly Usage Chart",
  "chart.queryBreakdown": "Query Type Breakdown"
}
```

### 6. Admin (/admin)
**~140-180 strings**

```json
{
  "page.title": "Admin Panel",
  "section.userManagement": "User Management",
  "section.queryLogs": "Query Logs",
  "section.statistics": "Statistics",
  "section.systemSettings": "System Settings",
  "section.auditTrail": "Audit Trail",
  
  "userAction.deactivate": "Deactivate User",
  "userAction.upgradeTier": "Upgrade Tier",
  "userAction.resetPassword": "Reset Password",
  "userAction.addCredits": "Add Credits",
  
  "setting.smsGateway": "SMS Gateway Configuration",
  "setting.razorpay": "Razorpay Keys",
  "setting.domain": "Frontend Domain",
  "setting.emailServer": "Email Server",
  
  "button.saveSettings": "Save Settings",
  "button.testConnection": "Test Connection",
  "button.exportData": "Export Data",
  
  "message.settingsSaved": "Settings saved successfully",
  "message.connectionFailed": "Connection test failed",
  
  "table.userId": "User ID",
  "table.userName": "User Name",
  "table.email": "Email",
  "table.tier": "Tier",
  "table.status": "Status",
  "table.joinDate": "Join Date",
  "table.lastActive": "Last Active"
}
```

### 7. Errors (/errors)
**~60-80 strings** - Shared across all screens

```json
{
  "error.404": "Page not found",
  "error.500": "Server error",
  "error.503": "Service unavailable",
  "error.unauthorized": "Unauthorized access",
  "error.forbidden": "Access forbidden",
  
  "validation.emailRequired": "Email is required",
  "validation.emailInvalid": "Invalid email format",
  "validation.passwordRequired": "Password is required",
  "validation.passwordTooShort": "Password too short (minimum 8 characters)",
  "validation.passwordsDoNotMatch": "Passwords do not match",
  
  "validation.dateRequired": "Date is required",
  "validation.dateInvalid": "Invalid date format",
  "validation.dateInFuture": "Date cannot be in the future",
  "validation.dateInPast": "Date cannot be in the past",
  
  "validation.timeRequired": "Time is required",
  "validation.timeInvalid": "Invalid time format",
  
  "validation.locationRequired": "Location is required",
  "validation.locationInvalid": "Invalid location",
  
  "error.network": "Network error. Please check your internet connection.",
  "error.timeout": "Request timeout. Please try again.",
  "error.dataLoadFailed": "Failed to load data. Please refresh.",
  
  "retry.button": "Try Again",
  "retry.message": "Something went wrong. {{action}}"
}
```

---

## File Naming Convention

**English Files:**
- `en-common.json` ✅ (Already done)
- `en-kundali.json` ✅ (Complete example)
- `en-muhurta.json` (Create using template above)
- `en-numerology.json` (Create using template above)
- `en-recommendations.json` (Create using template above)
- `en-wallet.json` (Create using template above)
- `en-dashboard.json` (Create using template above)
- `en-admin.json` (Create using template above)
- `en-errors.json` (Create using template above)

**Hindi Files:**
- `hi-common.json` ✅ (Already done)
- `hi-kundali.json` ✅ (Complete example)
- `hi-muhurta.json` (Create using template above, translate to Hindi)
- `hi-numerology.json` (Create using template above, translate to Hindi)
- `hi-recommendations.json` (Create using template above, translate to Hindi)
- `hi-wallet.json` (Create using template above, translate to Hindi)
- `hi-dashboard.json` (Create using template above, translate to Hindi)
- `hi-admin.json` (Create using template above, translate to Hindi)
- `hi-errors.json` (Create using template above, translate to Hindi)

---

## Implementation Steps for Dev Team

1. **Copy structure** from relevant section above
2. **Fill in translations** using en-kundali.json + hi-kundali.json as reference
3. **Keep terminology consistent** (use words from common.json where possible)
4. **Test on live screens** using TASK74_TESTING_CHECKLIST.md

---

## Key Principles for All Translations

✅ **Action-oriented buttons:** "Calculate", "Submit", "Generate", not "Click"  
✅ **Clear labels:** "Date of Birth", not "DoB" or "Birth Date"  
✅ **Helpful tooltips:** Explain what the field does, not just the name  
✅ **Vedic terms:** Transliterate in Hindi (Kundali, Muhurta, Nakshatra) - don't translate  
✅ **UI terms:** In Hindi (buttons, labels, messages)  
✅ **Error messages:** Clear + actionable ("Email is required" not "Error")  
✅ **Consistency:** Use same word for same concept throughout  

---

## Validation Checklist

Before committing each translation file:

- [ ] All keys from template present
- [ ] No hardcoded numbers or dates
- [ ] No English mixed with Hindi (except for Vedic terms)
- [ ] Proper Hindi grammar
- [ ] Terminology consistent with CLAUDE.md glossary
- [ ] All buttons are action-oriented
- [ ] All error messages are helpful
- [ ] File is valid JSON (no syntax errors)

---

**Total Strings Remaining:**
- Muhurta: ~120 strings
- Numerology: ~100 strings
- Recommendations: ~110 strings
- Wallet: ~100 strings
- Dashboard: ~120 strings
- Admin: ~160 strings
- Errors: ~70 strings
- **Total new: ~780 strings × 2 languages = 1,560 strings**

**Grand Total (with common + kundali):**
- English: 270 + 150 + 780 = 1,200 strings
- Hindi: 270 + 150 + 780 = 1,200 strings
- **Overall: 2,400 strings (complete i18n system)**

---

**Status:** ✅ Templates ready, dev team can now complete all 7 screens
