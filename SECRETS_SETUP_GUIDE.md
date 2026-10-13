# 🔐 TaraNidhi Production Secrets Setup Guide

**Last Updated:** Oct 14, 2026  
**Status:** For Production Launch (Oct 20, 2026)  
**Owner:** DevOps / Naveen

---

## Overview

This guide walks through setting up all required secrets in **Cloudflare Workers Secrets Manager** for the TaraNidhi production deployment.

**CRITICAL:** All secrets must be stored in Cloudflare's encrypted vault, NOT in `.env` files or version control.

---

## Phase 1: Generate New Secrets

### 1.1 JWT Secret (Authentication)

**Purpose:** Signing JWT tokens for user authentication  
**Strength:** Must be cryptographically secure, minimum 32 characters

```bash
# Generate on macOS/Linux
openssl rand -hex 32

# Example output (DO NOT USE THIS):
# a7f8b3d2c4e9f1a6b8d5e2c7f9a3b8c1

# Save the output securely
```

**Steps:**
1. Generate with: `openssl rand -hex 32`
2. Copy the output
3. Run: `wrangler secret put JWT_SECRET --env production`
4. Paste the value when prompted
5. Verify: ✅ (no output = success)

---

## Phase 2: Third-Party Service Secrets

### 2.1 Twilio SMS Gateway

**Status:** 🟡 Requires Naveen's account creation  
**Link:** https://www.twilio.com/console

**What to retrieve:**
1. Go to Twilio Console → Account
2. Copy: **Account SID**
3. Copy: **Auth Token** (click "View")
4. Go to Phone Numbers → Active Numbers
5. Copy the phone number assigned for SMS (or create one)

**Commands:**
```bash
wrangler secret put TWILIO_ACCOUNT_SID --env production
# Paste: <Twilio Account SID>

wrangler secret put TWILIO_AUTH_TOKEN --env production
# Paste: <Twilio Auth Token>

wrangler secret put TWILIO_PHONE_NUMBER --env production
# Paste: +1xxxxxxxxxx (or your assigned number)
```

---

### 2.2 Razorpay Payment Gateway

**Status:** 🟡 Requires Naveen's account creation  
**Link:** https://dashboard.razorpay.com/

**What to retrieve:**
1. Go to Dashboard → Settings → API Keys
2. Copy: **Key ID**
3. Copy: **Key Secret**
4. Go to Webhooks → Create Webhook
5. Endpoint: `https://api.taranidhi.com/webhooks/razorpay`
6. Events: `payment.authorized`, `payment.failed`, `subscription.created`
7. Copy: **Webhook Secret**

**Commands:**
```bash
wrangler secret put RAZORPAY_KEY_ID --env production
# Paste: <Razorpay Key ID>

wrangler secret put RAZORPAY_SECRET_KEY --env production
# Paste: <Razorpay Secret Key>

wrangler secret put RAZORPAY_WEBHOOK_SECRET --env production
# Paste: <Webhook Secret from Razorpay>
```

---

### 2.3 Sentry Error Monitoring

**Status:** 🟢 Can be created anytime  
**Link:** https://sentry.io/

**What to retrieve:**
1. Create account if needed (free tier available)
2. Create project: "TaraNidhi"
3. Platform: Node.js
4. Copy the **DSN** (looks like: `https://key@sentry.io/project-id`)

**Commands:**
```bash
wrangler secret put SENTRY_DSN --env production
# Paste: <Sentry DSN>
```

---

### 2.4 Slack Webhook (Alert Notifications)

**Status:** 🟢 Can be created anytime  
**Link:** https://api.slack.com/messaging/webhooks

**What to retrieve:**
1. Create a Slack workspace (or use existing)
2. Create incoming webhook: https://api.slack.com/apps
3. Create New App → From scratch → "TaraNidhi Alerts"
4. Incoming Webhooks → On
5. Add New Webhook → Select channel `#alerts`
6. Copy the **Webhook URL**

**Commands:**
```bash
wrangler secret put SLACK_WEBHOOK_URL --env production
# Paste: <Slack Webhook URL>
```

---

## Phase 3: Database Secrets

### 3.1 NEON PostgreSQL Connection String

**Status:** 🟡 Requires Naveen's account creation  
**Link:** https://console.neon.tech/

**What to retrieve:**
1. Create account (free tier available)
2. Create project: "taranidhi"
3. Create database: "taranidhi_prod"
4. Create role: "neon_prod_user"
5. Copy connection string: `postgresql://user:password@host/database`

**Commands:**
```bash
wrangler secret put DATABASE_URL --env production
# Paste: postgresql://neon_prod_user:PASSWORD@HOST.neon.tech/taranidhi_prod
```

---

## Phase 4: Backup & Storage

### 4.1 AWS S3 (For Daily Backups)

**Status:** 🟡 Requires AWS account  
**Link:** https://aws.amazon.com/s3/

**What to retrieve:**
1. Create S3 bucket: `taranidhi-backups-prod`
2. Create IAM user: `taranidhi-backup-service`
3. Attach policy: `AmazonS3FullAccess` (or custom policy for least privilege)
4. Generate access keys
5. Copy: **Access Key ID** + **Secret Access Key**

**Commands:**
```bash
wrangler secret put AWS_S3_ACCESS_KEY --env production
# Paste: <AWS Access Key ID>

wrangler secret put AWS_S3_SECRET_KEY --env production
# Paste: <AWS Secret Access Key>

wrangler secret put AWS_S3_BUCKET --env production
# Paste: taranidhi-backups-prod
```

---

## Phase 5: Verification Checklist

### Before Deployment

Run this script to verify all secrets are set:

```bash
#!/bin/bash
echo "Verifying Production Secrets..."

REQUIRED_SECRETS=(
    "JWT_SECRET"
    "TWILIO_ACCOUNT_SID"
    "TWILIO_AUTH_TOKEN"
    "TWILIO_PHONE_NUMBER"
    "RAZORPAY_KEY_ID"
    "RAZORPAY_SECRET_KEY"
    "RAZORPAY_WEBHOOK_SECRET"
    "SENTRY_DSN"
    "DATABASE_URL"
    "SLACK_WEBHOOK_URL"
)

MISSING=0
for secret in "${REQUIRED_SECRETS[@]}"; do
    wrangler secret list --env production | grep -q "$secret"
    if [ $? -eq 0 ]; then
        echo "✅ $secret"
    else
        echo "❌ $secret (MISSING)"
        ((MISSING++))
    fi
done

if [ $MISSING -eq 0 ]; then
    echo ""
    echo "✅ All secrets configured!"
else
    echo ""
    echo "❌ $MISSING secrets are missing. See above."
    exit 1
fi
```

**Run:**
```bash
bash scripts/verify-secrets.sh
```

---

## Phase 6: Secret Rotation (Ongoing)

### Every 90 Days

1. **Generate new JWT secret**
   ```bash
   openssl rand -hex 32
   wrangler secret put JWT_SECRET --env production
   ```

2. **Rotate Twilio token**
   - Go to Twilio Console → Account → Auth Token → Regenerate
   - Update: `TWILIO_AUTH_TOKEN`

3. **Rotate Razorpay keys** (monthly)
   - Go to Razorpay Dashboard → Settings → API Keys
   - Regenerate keys
   - Update: `RAZORPAY_KEY_ID`, `RAZORPAY_SECRET_KEY`

4. **Rotate database password** (quarterly)
   - Use NEON console to change role password
   - Update: `DATABASE_URL`

---

## Phase 7: Incident Response (If Compromised)

### If a secret is leaked:

1. **Immediately regenerate** in the service
2. **Update Cloudflare secret**: `wrangler secret put VAR_NAME --env production`
3. **Monitor for abuse** (check logs, Sentry, billing)
4. **Document in incident log**
5. **Notify team** via Slack

---

## Commands Reference

### List all secrets (without values)
```bash
wrangler secret list --env production
```

### Update a secret
```bash
wrangler secret put SECRET_NAME --env production
```

### Delete a secret
```bash
wrangler secret delete SECRET_NAME --env production
```

### Test deployment with secrets
```bash
wrangler deploy --env production
```

---

## Troubleshooting

### Secret not being read
1. Ensure correct environment: `--env production`
2. Check secret name spelling (case-sensitive)
3. Redeploy after creating/updating: `wrangler deploy --env production`

### "Secret not found" errors
1. Verify secret was created: `wrangler secret list --env production`
2. Check code is reading correct variable name
3. Restart worker after secret update

### API calls failing with auth errors
1. Verify credentials are correct (re-check service console)
2. Ensure tokens/keys haven't expired
3. Check rate limits in service dashboard

---

## Security Best Practices

✅ **DO:**
- Store ALL secrets in Cloudflare vault
- Rotate secrets every 90 days
- Use strong, random values (minimum 32 chars)
- Document rotation schedule
- Monitor for unauthorized access

❌ **DON'T:**
- Commit secrets to Git
- Share secrets via email/chat
- Use same secret across environments
- Hardcode secrets in code
- Log secrets in debug output

---

## Timeline for Naveen

**By Oct 15:** Create accounts + retrieve credentials
- ☐ Twilio account + keys
- ☐ Razorpay account + keys  
- ☐ NEON PostgreSQL + connection string
- ☐ AWS S3 + IAM credentials
- ☐ Slack webhook

**By Oct 18:** Configure all secrets
- ☐ Run `wrangler secret put` for each

**By Oct 19:** Verify & test
- ☐ Run verification script
- ☐ Test production deployment

**Oct 20:** Deploy
- ☐ `wrangler deploy --env production`

---

**Status:** Ready to execute  
**Next Step:** Send this guide to Naveen for account creation
