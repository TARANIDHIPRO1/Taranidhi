// Per-account and per-IP rate limiting -- ARCHITECTURE.md Section 8's
// "API scraping to reverse-engineer the proprietary scoring formula" row:
// "Per-account and per-IP rate limiting; CAPTCHA triggered past a velocity
// threshold. The scoring logic itself should never be exposed to the
// client -- all scoring happens server-side in Workers."
//
// Implementation: fixed-window counters in KV (the same SESSIONS namespace
// already used for OTP/session state -- ARCHITECTURE.md doesn't call for a
// separate namespace, and one more KV namespace is one more thing to
// provision/misconfigure for no real benefit at this scale).
//
// This is a FIXED window, not a sliding one -- simpler, and KV's
// expirationTtl already does the cleanup for free. The tradeoff (a client
// can burst up to ~2x the limit right at a window boundary) is an accepted
// looseness for a first version; tighten to a sliding-window or token-bucket
// algorithm later if abuse data shows this boundary effect is actually being
// exploited. Documenting the tradeoff rather than presenting this as a
// precise rate limiter.
//
// NOT included here: CAPTCHA verification itself. Which CAPTCHA provider
// (Cloudflare Turnstile is the natural fit given the app is already on
// Workers, but that's a choice, not a foregone conclusion) and its site/
// secret keys are an account-setup decision nobody has made yet -- same
// pattern as OTP_PROVIDER_API_KEY / RAZORPAY_KEY_ID. getRateLimitDecision()
// below reports "should this request be CAPTCHA-challenged" as a boolean the
// caller can act on (e.g. return a 429 telling the client to solve a
// CAPTCHA), but does not itself issue or verify a CAPTCHA challenge.

export interface Env {
  SESSIONS: KVNamespace;
}

export interface RateLimitConfig {
  /** Logical bucket name, e.g. "general" or "muhurta". Keeps different
   *  endpoint classes from sharing one counter. */
  bucket: string;
  windowSeconds: number;
  maxRequests: number;
  /** Once the count exceeds this (still under maxRequests), flag the
   *  request as CAPTCHA-worthy rather than outright blocking it yet. Must be
   *  <= maxRequests. Optional -- omit to never flag before the hard block. */
  captchaThreshold?: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  shouldCaptcha: boolean;
  count: number;
  limit: number;
}

async function incrementCounter(env: Env, key: string, windowSeconds: number): Promise<number> {
  // KV has no atomic increment -- this is a read-then-write, so under true
  // concurrent bursts from the same key within the same millisecond a few
  // requests could be undercounted. Acceptable for an abuse-deterrence
  // counter (unlike wallet debits, which use D1's batch() for real
  // atomicity) -- being off by a handful of requests doesn't create a
  // financial-correctness bug, just a slightly looser rate limit.
  const existing = await env.SESSIONS.get(key);
  const count = existing ? Number(existing) + 1 : 1;
  await env.SESSIONS.put(key, String(count), { expirationTtl: windowSeconds });
  return count;
}

/**
 * Checks (and increments) both a per-account and a per-IP counter for the
 * given bucket, returning the stricter of the two decisions. Call this once
 * per request, after requireAuth() if the route needs it (so `userId` is
 * available) -- for unauthenticated routes (e.g. /auth/request-otp), pass
 * userId: null and only the IP counter is checked.
 */
export async function checkRateLimit(
  env: Env,
  config: RateLimitConfig,
  ip: string,
  userId: number | null
): Promise<RateLimitDecision> {
  const ipKey = `ratelimit:${config.bucket}:ip:${ip}`;
  const ipCount = await incrementCounter(env, ipKey, config.windowSeconds);

  let accountCount = 0;
  if (userId !== null) {
    const accountKey = `ratelimit:${config.bucket}:acct:${userId}`;
    accountCount = await incrementCounter(env, accountKey, config.windowSeconds);
  }

  const count = Math.max(ipCount, accountCount);
  const allowed = count <= config.maxRequests;
  const shouldCaptcha = config.captchaThreshold !== undefined && count > config.captchaThreshold;

  return { allowed, shouldCaptcha, count, limit: config.maxRequests };
}

/** Best-effort client IP extraction. Cloudflare sets CF-Connecting-IP on
 *  every request that reaches a Worker through its network; this is trusted
 *  (unlike X-Forwarded-For, which a client could spoof if it reached the
 *  Worker some other way). Falls back to a constant so a missing header
 *  degrades to "everyone shares one IP bucket" rather than throwing. */
export function getClientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "unknown";
}
