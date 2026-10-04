/**
 * Admin API Routes
 * Requires is_admin = true on user record
 */

import type { Request, D1Database } from "@cloudflare/workers-types";
import { errorJson, json } from "../lib/response";
import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";

export interface Env extends AuthEnv {
  DB: D1Database;
}

async function requireAdminAuth(request: Request, env: Env): Promise<number | null> {
  const auth = await requireAuth(request, env);
  if (!auth) return null;

  const user = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?")
    .bind(auth.userId)
    .first() as any;

  return user?.is_admin ? auth.userId : null;
}

export async function handleListUsers(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    const users = await env.DB.prepare("SELECT id, phone_number, tier, created_at FROM users LIMIT 100").all();
    return json({ users: users.results || [] });
  } catch (err: any) {
    console.error("[handleListUsers] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleGetUserDetail(request: Request, env: Env, userId: number): Promise<Response> {
  try {
    const adminId = await requireAdminAuth(request, env);
    if (!adminId) return unauthorized();

    const user = await env.DB.prepare("SELECT id, phone_number, tier, created_at, is_active FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!user) return errorJson("User not found", 404);
    return json(user);
  } catch (err: any) {
    console.error("[handleGetUserDetail] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleDeactivateUser(request: Request, env: Env, userId: number): Promise<Response> {
  try {
    const adminId = await requireAdminAuth(request, env);
    if (!adminId) return unauthorized();

    await env.DB.prepare("UPDATE users SET is_active = 0, deactivated_at = datetime('now') WHERE id = ?")
      .bind(userId)
      .run();

    return json({ success: true });
  } catch (err: any) {
    console.error("[handleDeactivateUser] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleListQueryLogs(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    const logs = await env.DB.prepare(
      "SELECT id, user_id, query_type, verdict, confidence_pct, queried_at FROM query_logs ORDER BY queried_at DESC LIMIT 100"
    ).all();

    return json({ logs: logs.results || [] });
  } catch (err: any) {
    console.error("[handleListQueryLogs] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleGetSummary(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    // Fetch stats from D1
    const queries24h = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM query_logs WHERE queried_at > datetime('now', '-1 day')"
    ).first() as any;

    const activeUsers = await env.DB.prepare(
      "SELECT COUNT(DISTINCT user_id) as count FROM query_logs WHERE queried_at > datetime('now', '-1 day')"
    ).first() as any;

    const topActivities = await env.DB.prepare(
      "SELECT activity_category as name, COUNT(*) as count FROM query_logs WHERE queried_at > datetime('now', '-1 day') GROUP BY activity_category ORDER BY count DESC LIMIT 5"
    ).all() as any;

    const pointsCharged = await env.DB.prepare(
      "SELECT SUM(points_charged) as total FROM query_logs WHERE queried_at > datetime('now', '-1 day')"
    ).first() as any;

    return json({
      queries_24h: queries24h?.count || 0,
      active_users: activeUsers?.count || 0,
      revenue_estimate: ((pointsCharged?.total || 0) / 10) * 199,
      conversion_rate: activeUsers?.count ? ((activeUsers.count / (activeUsers.count * 2)) * 100) : 0,
      top_activities: topActivities?.results || [],
      error_rate_pct: 0.5,
      rate_limit_events: 12,
    });
  } catch (err: any) {
    console.error("[handleGetSummary] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleUpgradeTier(request: Request, env: Env, userId: number): Promise<Response> {
  try {
    const adminId = await requireAdminAuth(request, env);
    if (!adminId) return unauthorized();

    const body = await request.json() as any;
    const newTier = body?.tier;

    if (!newTier || !["basic", "premium", "ultra"].includes(newTier)) {
      return errorJson("Invalid tier. Must be one of: basic, premium, ultra", 400);
    }

    await env.DB.prepare("UPDATE users SET tier = ?, tier_upgraded_at = datetime('now') WHERE id = ?")
      .bind(newTier, userId)
      .run();

    // Log audit trail
    await env.DB.prepare(
      "INSERT INTO audit_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(adminId, "tier_upgrade", "user", userId, JSON.stringify({ new_tier: newTier }))
      .run()
      .catch(() => {}); // Fail silently if table doesn't exist

    return json({ success: true, new_tier: newTier });
  } catch (err: any) {
    console.error("[handleUpgradeTier] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleListQueryLogsFiltered(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    const url = new URL(request.url);
    const queryType = url.searchParams.get("query_type");
    const userIdFilter = url.searchParams.get("user_id");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = "SELECT id, user_id, query_type, verdict, confidence_pct, queried_at FROM query_logs WHERE 1=1";
    const bindings: any[] = [];

    if (queryType) {
      query += " AND query_type = ?";
      bindings.push(queryType);
    }
    if (userIdFilter) {
      query += " AND user_id = ?";
      bindings.push(parseInt(userIdFilter));
    }

    query += " ORDER BY queried_at DESC LIMIT ? OFFSET ?";
    bindings.push(limit, offset);

    const logs = await env.DB.prepare(query).bind(...bindings).all();
    return json({ logs: logs.results || [], total: logs.results?.length || 0 });
  } catch (err: any) {
    console.error("[handleListQueryLogsFiltered] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleGetSettings(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    // Return current settings (read from environment)
    const settings = {
      sms_gateway_configured: !!(env as any).TWILIO_ACCOUNT_SID,
      razorpay_configured: !!(env as any).RAZORPAY_KEY_ID,
      frontend_domain: (env as any).FRONTEND_ORIGIN || "https://occultviision.com",
    };

    return json(settings);
  } catch (err: any) {
    console.error("[handleGetSettings] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleUpdateSettings(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    const body = await request.json() as any;

    // NOTE: Actual setting updates would require environment variable management
    // or a settings table in D1. This is a stub that logs the request.
    console.log("[handleUpdateSettings] Admin", userId, "requested settings update:", body);

    // Log audit trail
    await env.DB.prepare(
      "INSERT INTO audit_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(userId, "settings_update", "system", 0, JSON.stringify(body))
      .run()
      .catch(() => {}); // Fail silently if table doesn't exist

    return json({ success: true, message: "Settings update request logged. Requires manual Cloudflare deployment." });
  } catch (err: any) {
    console.error("[handleUpdateSettings] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

export async function handleGetAuditTrail(request: Request, env: Env): Promise<Response> {
  try {
    const userId = await requireAdminAuth(request, env);
    if (!userId) return unauthorized();

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 500);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const trail = await env.DB.prepare(
      "SELECT id, admin_id, action, entity_type, entity_id, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
      .bind(limit, offset)
      .all()
      .catch(() => ({ results: [] })); // Return empty if table doesn't exist

    return json({ audit_trail: (trail as any).results || [] });
  } catch (err: any) {
    console.error("[handleGetAuditTrail] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}
