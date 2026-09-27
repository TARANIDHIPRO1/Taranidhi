# WhatsApp OTP Integration Plan

**Number:** 9669756111  
**Status:** Ready to implement  
**Timeline:** 1 hour (once confirmed)

---

## Flow

```
User enters phone → /auth/request-otp
  ↓
Claude generates 6-digit OTP
  ↓
Send via WhatsApp to 9669756111
  ↓
User enters OTP → /auth/verify-otp
  ↓
Session created, login successful
```

---

## Implementation Steps

### Step 1: Get WhatsApp API (Options)

**Option A: WhatsApp Business API** (Official)
- Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/
- Requires: Business Account + Phone Number Verification
- Cost: Pay-per-message (or free tier for testing)

**Option B: Twilio WhatsApp** (Easier for testing)
- Setup: Create Twilio account, enable WhatsApp integration
- Your number gets: Twilio's WhatsApp sandbox (+1234567890)
- Test messages: Free
- Production: Requires WhatsApp Business approval

**Recommendation:** Use **Twilio WhatsApp** for MVP (faster setup)

---

### Step 2: Code Changes

**File:** `worker/src/routes/auth.ts`

Current code sends SMS via MSG91. We'll add WhatsApp fallback:

```typescript
// Inside handleRequestOtp()

// Generate OTP
const otp = generateOtp();

// Try WhatsApp first
const whatsappResult = await sendWhatsAppOtp(phoneNumber, otp);

if (whatsappResult.success) {
  // Store OTP for verification
  await storeOtp(phoneNumber, otp);
  return json({ ok: true, method: "whatsapp" });
} else if (msg91Available) {
  // Fallback to SMS
  const smsResult = await sendSmsOtp(phoneNumber, otp);
  if (smsResult.success) {
    await storeOtp(phoneNumber, otp);
    return json({ ok: true, method: "sms" });
  }
}

// If both fail
return errorJson("OTP delivery failed", 500);
```

**New Function:** `worker/src/lib/whatsapp.ts`

```typescript
import fetch from 'node-fetch';

export async function sendWhatsAppOtp(phone: string, otp: string): Promise<{success: boolean}> {
  const twilioAccountSid = env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = env.TWILIO_WHATSAPP_NUMBER;

  const message = `Your OccultViision verification code is: ${otp}. Valid for 10 minutes.`;

  try {
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': `whatsapp:${twilioPhoneNumber}`,
        'To': `whatsapp:+91${phone}`,
        'Body': message,
      }).toString(),
    });

    const data = await response.json();
    return { success: response.ok && data.sid };
  } catch (error) {
    console.error('WhatsApp send failed:', error);
    return { success: false };
  }
}
```

---

### Step 3: Environment Variables

Add to `worker/wrangler.toml`:

```toml
[env.production]
vars = { FRONTEND_ORIGIN = "https://www.occultviision.com" }
secrets = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_WHATSAPP_NUMBER",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_SECRET",
  "MSG91_API_KEY",    # Fallback
  "MSG91_SENDER_ID",  # Fallback
]
```

---

### Step 4: Testing

1. **Twilio Setup** (5 min)
   - Create account at twilio.com
   - Enable WhatsApp sandbox
   - Get Account SID, Auth Token, WhatsApp number

2. **Test Send OTP** (5 min)
   - Call POST `/auth/request-otp` with `{ phone: "9669756111" }`
   - Check WhatsApp for OTP message
   - Verify OTP can be entered and verified

3. **Fallback Test** (5 min)
   - Disable WhatsApp credentials
   - Verify SMS fallback works (once MSG91 ready)

---

### Step 5: Handoff to Naveen

Once WhatsApp is live:
- Users can sign up with OTP via WhatsApp
- Fallback to SMS if WhatsApp unavailable
- SMS takes over once MSG91 approval complete

---

## Timeline

| Task | Who | Time | Blocker |
|------|-----|------|---------|
| Confirm number 9669756111 | Naveen | 1 min | None |
| Setup Twilio account | Claude | 10 min | None |
| Code integration | Claude | 30 min | None |
| Deploy + test | Claude | 20 min | WhatsApp account ready |
| **Total** | | **1 hour** | Confirmation |

---

## Next Steps

1. Naveen confirms: "9669756111 is correct"
2. Claude sets up Twilio WhatsApp
3. Claude deploys to Cloudflare
4. Naveen tests login with OTP via WhatsApp
5. Done! ✅

**Ready to go?**
