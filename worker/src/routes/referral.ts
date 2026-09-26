import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import {
  getOrCreateReferralCode,
  attributeReferral,
  SelfReferralError,
  AlreadyReferredError,
  InvalidReferralCodeError,
  type Env as ReferralEnv,
} from "../lib/referral";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, ReferralEnv {
  DB: D1Database;
}

export async function handleGetReferralCode(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const code = await getOrCreateReferralCode(env, auth.userId);
  return json({ code });
}

/**
 * Attribute the caller to a referrer, by code. Meant to be called once,
 * right after signup -- ARCHITECTURE.md Section 7: "attribution locked on
 * first touch, not last click." A second call for an already-attributed
 * user is rejected, not silently overwritten.
 */
export async function handleAttributeReferral(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }
  if (!body.code || typeof body.code !== "string") {
    return errorJson("code is required.", 400, "MISSING_CODE");
  }

  try {
    await attributeReferral(env, auth.userId, body.code);
  } catch (err) {
    if (err instanceof InvalidReferralCodeError) return errorJson(err.message, 404, "INVALID_CODE");
    if (err instanceof SelfReferralError) return errorJson(err.message, 400, "SELF_REFERRAL");
    if (err instanceof AlreadyReferredError) return errorJson(err.message, 409, "ALREADY_REFERRED");
    throw err;
  }

  return json({ status: "attributed" });
}
