// OTP generation + verification against KV.
//
// Design note: OTP codes live in KV (short-lived, auto-expiring), never in D1.
// D1 is the durable store; KV is the right tool for "expires in 5 minutes"
// data -- using D1 for this would mean a manual cleanup job for no benefit.
//
// This file does NOT send the SMS itself -- that's a real external API call
// (MSG91 / Twilio / whichever gateway gets picked, per ARCHITECTURE.md
// Section 1, "External" row) and needs a real account + secret before it can
// be wired up. `sendOtpViaSmsGateway` below is a deliberate stub: it throws
// with a clear message so this is never silently "fake-succeeding" in a way
// that could ship unnoticed.
//
// DEV_OTP_BYPASS -- added so the rest of the app (kundali, wallet, everything
// downstream of auth) can be exercised end-to-end before a real SMS provider
// is chosen. Deliberately double-gated (see isDevOtpBypassActive) so it can
// sit "wired but off" in wrangler.toml and be flipped on for a test session
// without a code change or redeploy of this file. Both gates must be true:
//   - ENVIRONMENT must NOT be "production"
//   - DEV_OTP_BYPASS must be the literal string "true"
// If either is missing/false, behavior is identical to before this was added
// -- issueOtp still calls the real (stubbed) gateway and still throws.

export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  OTP_PROVIDER_API_KEY?: string;
  ENVIRONMENT?: string;
  DEV_OTP_BYPASS?: string;
}

const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
const OTP_KEY_PREFIX = "otp:";
export const DEV_BYPASS_OTP_CODE = "000000";

function isDevOtpBypassActive(env: Env): boolean {
  return env.ENVIRONMENT !== "production" && env.DEV_OTP_BYPASS === "true";
}

function generateOtpCode(): string {
  // 6-digit numeric OTP. crypto.getRandomValues is available in Workers.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const n = (buf[0] as number) % 1_000_000;
  return n.toString().padStart(6, "0");
}

export async function issueOtp(env: Env, phoneNumber: string): Promise<void> {
  if (isDevOtpBypassActive(env)) {
    // Still goes through KV with the real TTL, so verify-otp exercises the
    // exact same lookup/expiry/one-time-use path it would in production --
    // only the "send a real SMS" step is skipped. Logged loudly on purpose:
    // this must never be mistaken for a normal successful send in the logs.
    console.warn(
      `[DEV_OTP_BYPASS active] Skipping real SMS send for ${phoneNumber}. ` +
        `Fixed test code ${DEV_BYPASS_OTP_CODE} accepted. ` +
        `This must be off (DEV_OTP_BYPASS unset or ENVIRONMENT=production) before launch.`
    );
    await env.SESSIONS.put(OTP_KEY_PREFIX + phoneNumber, DEV_BYPASS_OTP_CODE, {
      expirationTtl: OTP_TTL_SECONDS,
    });
    return;
  }

  const code = generateOtpCode();
  await env.SESSIONS.put(OTP_KEY_PREFIX + phoneNumber, code, {
    expirationTtl: OTP_TTL_SECONDS,
  });
  await sendOtpViaSmsGateway(env, phoneNumber, code);
}

export async function verifyOtp(env: Env, phoneNumber: string, submittedCode: string): Promise<boolean> {
  const key = OTP_KEY_PREFIX + phoneNumber;
  const stored = await env.SESSIONS.get(key);
  if (!stored) return false;
  const ok = stored === submittedCode;
  if (ok) {
    // one-time use -- delete on success so the same code can't be replayed
    await env.SESSIONS.delete(key);
  }
  return ok;
}

async function sendOtpViaSmsGateway(env: Env, phoneNumber: string, code: string): Promise<void> {
  if (!env.OTP_PROVIDER_API_KEY) {
    // Deliberately loud. Do not swallow this -- a silent no-op here means
    // users "successfully" request an OTP that never arrives.
    throw new Error(
      "OTP_PROVIDER_API_KEY is not configured. No SMS gateway is wired up yet " +
        "(ARCHITECTURE.md open decision #4). Set the secret with " +
        "`wrangler secret put OTP_PROVIDER_API_KEY` and implement the actual " +
        "gateway call here once a provider is chosen."
    );
  }
  // TODO: real gateway call goes here once a provider (MSG91 etc.) is chosen.
  throw new Error("sendOtpViaSmsGateway: provider integration not yet implemented.");
}
