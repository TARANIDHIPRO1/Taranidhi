// GET /muhurta/upaya?birth_nakshatra=0..26&query_nakshatra=0..26
// Premium/ultra only. Remedies come ONLY from lib/upaya.ts (book-cited).
import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { getUpayaForTara, PARIHARA_AFTER_MIDDAY, MULA_SHANTI } from "../lib/upaya";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv { DB: D1Database }
const PREMIUM_TIERS = new Set(["premium", "ultra"]);

function parseNak(v: string | null): number | null {
  if (v === null || !/^\d{1,2}$/.test(v)) return null;
  const n = Number(v);
  return n >= 0 && n <= 26 ? n : null;
}

export async function handleMuhurtaUpaya(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const birth = parseNak(url.searchParams.get("birth_nakshatra"));
  const query = parseNak(url.searchParams.get("query_nakshatra"));
  if (birth === null || query === null) {
    return errorJson("birth_nakshatra and query_nakshatra must be integers 0-26 (0 = Ashwini).", 400, "INVALID_INPUT");
  }

  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`).bind(auth.userId).first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");
  if (!PREMIUM_TIERS.has(user.tier)) {
    return errorJson("Upaya (remedies) are part of the Premium package. Upgrade to view.", 403, "PREMIUM_REQUIRED");
  }

  return json({
    ...getUpayaForTara(birth, query),
    parihara: PARIHARA_AFTER_MIDDAY,
    mulaShanti: MULA_SHANTI,
    disclaimer: "Traditional practices cited from Muhurta Chintamani; not guaranteed outcomes.",
  });
}
