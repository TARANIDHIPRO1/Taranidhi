// Auth routes: request-OTP and verify-OTP-and-signup/login.
//
// This is the FIRST endpoint in the build (per the Session 5 plan: every
// other table -- wallet, kundali, query_logs -- depends on a user_id, so
// nothing else can be meaningfully built or tested before this exists).
//
// Flow:
//   POST /auth/request-otp   { phone_number }
//     -> generates + "sends" (see lib/otp.ts stub) a 6-digit code
//   POST /auth/verify-otp    { phone_number, code, fingerprint_hash }
//     -> verifies the code
//     -> creates the user row if phone_number is new, else logs in the existing one
//     -> registers the device fingerprint against this user
//     -> grants the one-time free trial IF this exact phone+device
//        combination has never received one (ARCHITECTURE.md Section 8)
//     -> issues a session token
//
// `fingerprint_hash` is required on verify-otp, not optional -- see the note
// in lib/device.ts about where that value is expected to come from.

import { issueOtp, verifyOtp, type Env as OtpEnv } from "../lib/otp";
import { checkAndRegisterDevice, markTrialUsed, type Env as DeviceEnv } from "../lib/device";
import { grantFreeTrial, type Env as WalletEnv } from "../lib/wallet";
import { createSession, type Env as SessionEnv } from "../lib/session";
import { json, errorJson } from "../lib/response";

export interface Env extends OtpEnv, DeviceEnv, WalletEnv, SessionEnv {
  DB: D1Database;
  SESSIONS: KVNamespace;
}

function isValidIndianPhoneNumber(phone: string): boolean {
  // Accepts E.164 with +91, or a bare 10-digit number. Deliberately strict:
  // this app is India-first (see ARCHITECTURE.md's WhatsApp/Razorpay/OTP
  // provider choices, all India-focused) -- loosen this only alongside an
  // actual decision to support other countries.
  return /^(\+91)?[6-9]\d{9}$/.test(phone);
}

function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : `+${digits.replace(/^91/, "91")}`;
}

export async function handleRequestOtp(request: Request, env: Env): Promise<Response> {
  let body: { phone_number?: string };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }

  if (!body.phone_number || !isValidIndianPhoneNumber(body.phone_number)) {
    return errorJson("A valid Indian phone number is required.", 400, "INVALID_PHONE");
  }

  const phoneNumber = normalizePhoneNumber(body.phone_number);

  try {
    await issueOtp(env, phoneNumber);
  } catch (err) {
    // This will currently always throw -- see lib/otp.ts, the SMS gateway
    // integration is an intentional stub pending ARCHITECTURE.md open
    // decision #4 (provider choice). Surface that clearly rather than
    // pretending the OTP was sent.
    return errorJson(
      err instanceof Error ? err.message : "OTP could not be sent.",
      503,
      "OTP_GATEWAY_NOT_CONFIGURED"
    );
  }

  return json({ status: "otp_sent", phone_number: phoneNumber });
}

export async function handleVerifyOtp(request: Request, env: Env): Promise<Response> {
  let body: { phone_number?: string; code?: string; fingerprint_hash?: string };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }

  const { phone_number, code, fingerprint_hash } = body;

  if (!phone_number || !isValidIndianPhoneNumber(phone_number)) {
    return errorJson("A valid Indian phone number is required.", 400, "INVALID_PHONE");
  }
  if (!code || !/^\d{6}$/.test(code)) {
    return errorJson("A 6-digit OTP code is required.", 400, "INVALID_CODE");
  }
  if (!fingerprint_hash || fingerprint_hash.length < 8) {
    // Deliberately rejects a missing/trivial fingerprint rather than
    // silently treating the signup as trial-ineligible-by-default -- a
    // caller that skips this field is a bug in the frontend, not a normal
    // case to degrade gracefully through.
    return errorJson(
      "fingerprint_hash is required (client-computed device fingerprint).",
      400,
      "MISSING_FINGERPRINT"
    );
  }

  const phoneNumber = normalizePhoneNumber(phone_number);

  const codeOk = await verifyOtp(env, phoneNumber, code);
  if (!codeOk) {
    return errorJson("Incorrect or expired OTP.", 401, "OTP_INVALID");
  }

  // Find-or-create the user. D1 doesn't support a clean UPSERT-returning
  // pattern across engines uniformly, so this is select-then-insert -- fine
  // here because it's gated behind a verified OTP, not a hot/racy path like
  // wallet debits (which DO need a single atomic statement, per
  // ARCHITECTURE.md Section 8's double-spend row).
  let user = await env.DB.prepare(`SELECT id, tier FROM users WHERE phone_number = ?`)
    .bind(phoneNumber)
    .first<{ id: number; tier: string }>();

  let isNewUser = false;
  if (!user) {
    const created = await env.DB.prepare(
      `INSERT INTO users (phone_number, tier) VALUES (?, 'basic') RETURNING id, tier`
    )
      .bind(phoneNumber)
      .first<{ id: number; tier: string }>();
    user = created!;
    isNewUser = true;
  }

  const { deviceId, trialEligible } = await checkAndRegisterDevice(env, fingerprint_hash, user.id);

  let trialGranted = false;
  if (isNewUser && trialEligible) {
    await grantFreeTrial(env, user.id);
    await markTrialUsed(env, deviceId);
    trialGranted = true;
  }

  const sessionToken = await createSession(env, user.id);

  return json({
    status: "authenticated",
    session_token: sessionToken,
    user: { id: user.id, phone_number: phoneNumber, tier: user.tier },
    is_new_user: isNewUser,
    trial_granted: trialGranted,
  });
}
