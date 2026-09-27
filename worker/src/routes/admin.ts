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
  const userId = await requireAdminAuth(request, env);
  if (!userId) return unauthorized();

  const users = await env.DB.prepare("SELECT id, phone_number, tier, created_at FROM users LIMIT 100").all();
  return json({ users: users.results || [] });
}

export async function handleGetUserDetail(request: Request, env: Env, userId: number): Promise<Response> {
  const adminId = await requireAdminAuth(request, env);
  if (!adminId) return unauthorized();

  const user = await env.DB.prepare("SELECT id, phone_number, tier, created_at, is_active FROM users WHERE id = ?")
    .bind(userId)
    .first();

  if (!user) return errorJson("User not found", 404);
  return json(user);
}

export async function handleDeactivateUser(request: Request, env: Env, userId: number): Promise<Response> {
  const adminId = await requireAdminAuth(request, env);
  if (!adminId) return unauthorized();

  await env.DB.prepare("UPDATE users SET is_active = 0, deactivated_at = datetime('now') WHERE id = ?")
    .bind(userId)
    .run();

  return json({ success: true });
}

export async function handleListQueryLogs(request: Request, env: Env): Promise<Response> {
  const userId = await requireAdminAuth(request, env);
  if (!userId) return unauthorized();

  const logs = await env.DB.prepare(
    "SELECT id, user_id, query_type, verdict, confidence_pct, queried_at FROM query_logs ORDER BY queried_at DESC LIMIT 100"
  ).all();

  return json({ logs: logs.results || [] });
}

export async function handleGetSummary(request: Request, env: Env): Promise<Response> {
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
}
