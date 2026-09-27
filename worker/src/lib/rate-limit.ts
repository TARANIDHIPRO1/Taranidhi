/**
 * Rate Limiting Module
 * Token-bucket based rate limiting using Cloudflare KV
 * For 1M users/year: distributed rate limiting with fallback
 */

export interface RateLimitConfig {
  limit: number;      // max requests
  windowSec: number;  // time window in seconds
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth endpoints: prevent OTP brute-force
  "auth:otp": { limit: 5, windowSec: 60 },
  "auth:verify": { limit: 10, windowSec: 60 },

  // KP Query: prevent scraping the scoring logic
  "kp:query": { limit: 10, windowSec: 60 },

  // Kundali: prevent spam creation
  "kundali:create": { limit: 3, windowSec: 86400 }, // per day

  // General API: default rate limit
  "api:default": { limit: 100, windowSec: 60 },
};

interface RateLimitState {
  count: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  category: string,
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const config = RATE_LIMIT_CONFIGS[category] ?? RATE_LIMIT_CONFIGS["api:default"];
  if (!config) throw new Error("No default rate limit config");
  const now = Date.now();

  try {
    // Try to get current state from KV
    const stored = await kv.get<RateLimitState>(key, "json");
    let state = stored || { count: 0, resetAt: now + config.windowSec * 1000 };

    // Check if window has expired
    if (now >= state.resetAt) {
      // Reset
      state = { count: 1, resetAt: now + config.windowSec * 1000 };
    } else {
      // Increment
      state.count += 1;
    }

    // Store back (TTL = window + buffer)
    const ttlSec = Math.ceil((state.resetAt - now) / 1000) + 10;
    await kv.put(key, JSON.stringify(state), { expirationTtl: ttlSec });

    const allowed = state.count <= config.limit;
    const remaining = Math.max(0, config.limit - state.count);

    return {
      allowed,
      remaining,
      resetAt: state.resetAt,
    };
  } catch (error) {
    // KV unavailable: fail-open with warning (graceful degradation)
    console.warn(`KV unavailable for rate limit key: ${key}`, error);
    return { allowed: true, remaining: config.limit, resetAt: Date.now() + config.windowSec * 1000 };
  }
}

export function getKeyForRequest(req: Request, userId?: number): string {
  if (userId) {
    // Per-user limit
    return `ratelimit:user:${userId}`;
  }
  // Per-IP limit
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  return `ratelimit:ip:${ip}`;
}

export function getRateLimitCategory(path: string): string {
  // Extract category from path
  if (path.includes("/auth/request-otp")) return "auth:otp";
  if (path.includes("/auth/verify-otp")) return "auth:verify";
  if (path.includes("/kp/query")) return "kp:query";
  if (path.includes("/kundali") && path.endsWith("/kundali")) return "kundali:create";
  return "api:default";
}
