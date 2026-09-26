// Admin API -- read-mostly support/ops endpoints, per ARCHITECTURE.md
// Section 9's least-privilege principle and Section 8's query_logs table
// being "the substrate for future admin-panel analytics." No PWA/admin-UI
// consumes these yet (Task #8) -- this is the API surface a future admin
// screen (or a manual curl/Postman check by Naveen) can call.
//
// Deliberately narrow for v1: list + inspect, not edit. The one exception
// (deactivating a user) is a real support need (Section 8's "deactivate-
// and-rejoin" abuse row assumes an admin CAN deactivate someone) and is
// intentionally soft (is_active flag), never a hard delete -- financial/
// audit rows (orders, wallet_ledger, wallet_transactions) must never be
// deleted regardless of who asks.

import { requireAdmin, forbidden, unauthorized, type Env as AdminEnv } from "../lib/admin-middleware";
import { json, errorJson } from "../lib/response";

export interface Env extends AdminEnv {
  DB: D1Database;
}

function clampLimit(param: string | null, fallback: number, max: number): number {
  const n = param !== null ? Number(param) : fallback;
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

async function guard(request: Request, env: Env): Promise<Response | null> {
  const result = await requireAdmin(request, env);
  if (result === "unauthenticated") return unauthorized();
  if (result === "forbidden") return forbidden();
  return null;
}

export async function handleListUsers(request: Request, env: Env): Promise<Response> {
  const denied = await guard(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"), 50, 200);
  const offset = clampLimit(url.searchParams.get("offset"), 0, 1_000_000) || 0;

  const { results } = await env.DB.prepare(
    `SELECT id, phone_number, email, tier, is_active, created_at
     FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(limit, offset)
    .all();

  return json({ users: results, limit, offset });
}

/**
 * One user's full picture: profile, wallet batches, orders, referral state,
 * recent query activity. Deliberately one endpoint rather than four -- a
 * support agent looking at a support ticket needs the whole picture at
 * once, not four separate round-trips.
 */
export async function handleGetUserDetail(request: Request, env: Env, userId: number): Promise<Response> {
  const denied = await guard(request, env);
  if (denied) return denied;

  const user = await env.DB.prepare(
    `SELECT id, phone_number, email, tier, is_active, created_at, deactivated_at FROM users WHERE id = ?`
  )
    .bind(userId)
    .first();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");

  const [walletBatches, orders, referralAsReferrer, referralAsReferred, recentQueries] = await Promise.all([
    env.DB.prepare(
      `SELECT id, source, amount_granted, amount_remaining, granted_at, expires_at, status, holding_until
       FROM wallet_ledger WHERE user_id = ? ORDER BY granted_at DESC LIMIT 50`
    )
      .bind(userId)
      .all(),
    env.DB.prepare(
      `SELECT id, purpose, amount_due, status, created_at, paid_at FROM orders
       WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`
    )
      .bind(userId)
      .all(),
    env.DB.prepare(
      `SELECT id, referred_user_id, referred_signup_at, first_paid_order_id, commission_amount, commission_status
       FROM referrals WHERE referrer_user_id = ? ORDER BY referred_signup_at DESC LIMIT 50`
    )
      .bind(userId)
      .all(),
    env.DB.prepare(
      `SELECT id, referrer_user_id, referred_signup_at, commission_status FROM referrals WHERE referred_user_id = ?`
    )
      .bind(userId)
      .first(),
    env.DB.prepare(
      `SELECT id, kundali_id, query_type, verdict, confidence_pct, muhurta_pct, queried_at, points_charged
       FROM query_logs WHERE user_id = ? ORDER BY queried_at DESC LIMIT 50`
    )
      .bind(userId)
      .all(),
  ]);

  return json({
    user,
    wallet_batches: walletBatches.results,
    orders: orders.results,
    referrals_made: referralAsReferrer.results,
    referred_by: referralAsReferred,
    recent_queries: recentQueries.results,
  });
}

export async function handleDeactivateUser(request: Request, env: Env, userId: number): Promise<Response> {
  const denied = await guard(request, env);
  if (denied) return denied;

  const user = await env.DB.prepare(`SELECT id, is_active FROM users WHERE id = ?`)
    .bind(userId)
    .first<{ id: number; is_active: number }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");
  if (user.is_active === 0) {
    return errorJson("User is already deactivated.", 409, "ALREADY_DEACTIVATED");
  }

  // Soft delete only -- see file header. Device-fingerprint/phone-number
  // blacklisting for trial-eligibility (ARCHITECTURE.md Section 8's
  // "deactivate-and-rejoin" row) is NOT done here: that's a property of
  // device_fingerprints/user_devices, not of the users row, and doing it
  // automatically on every deactivation would also block a legitimate
  // "user asked to delete their account, unrelated to abuse" case. Flagging
  // this as a real gap -- if deactivation is ever used specifically to
  // respond to abuse, the admin also needs a separate explicit action to
  // blacklist the associated fingerprint(s), which does not exist yet.
  await env.DB.prepare(`UPDATE users SET is_active = 0, deactivated_at = datetime('now') WHERE id = ?`)
    .bind(userId)
    .run();

  return json({ status: "deactivated", user_id: userId });
}

export async function handleListQueryLogs(request: Request, env: Env): Promise<Response> {
  const denied = await guard(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const limit = clampLimit(url.searchParams.get("limit"), 50, 200);
  const offset = clampLimit(url.searchParams.get("offset"), 0, 1_000_000) || 0;

  const { results } = await env.DB.prepare(
    `SELECT id, user_id, kundali_id, query_type, verdict, confidence_pct, muhurta_pct, queried_at, points_charged
     FROM query_logs ORDER BY queried_at DESC LIMIT ? OFFSET ?`
  )
    .bind(limit, offset)
    .all();

  return json({ query_logs: results, limit, offset });
}

/**
 * Coarse revenue/usage snapshot -- deliberately simple aggregate queries,
 * not a real analytics pipeline. ARCHITECTURE.md doesn't specify what an
 * admin dashboard should show, so this is a reasonable, clearly-labeled
 * starting set (paid-order revenue, active-user count, query volume) rather
 * than a guess at a full metrics suite.
 */
export async function handleGetSummary(request: Request, env: Env): Promise<Response> {
  const denied = await guard(request, env);
  if (denied) return denied;

  const [userCounts, orderRevenue, queryVolume] = await Promise.all([
    env.DB.prepare(
      `SELECT tier, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY tier`
    ).all<{ tier: string; count: number }>(),
    env.DB.prepare(
      `SELECT COUNT(*) as paid_orders, COALESCE(SUM(amount_due), 0) as total_paise
       FROM orders WHERE status = 'paid'`
    ).first<{ paid_orders: number; total_paise: number }>(),
    env.DB.prepare(
      `SELECT query_type, COUNT(*) as count FROM query_logs GROUP BY query_type`
    ).all<{ query_type: string; count: number }>(),
  ]);

  return json({
    active_users_by_tier: userCounts.results,
    paid_orders: orderRevenue?.paid_orders ?? 0,
    total_revenue_paise: orderRevenue?.total_paise ?? 0,
    query_volume_by_type: queryVolume.results,
  });
}
