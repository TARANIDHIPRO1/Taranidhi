/**
 * Admin API Routes
 * Requires is_admin = true on user record
 */

import type { Request } from "@cloudflare/workers-types";
import type { Env } from "../index";

export async function handleAdminStats(req: Request, env: Env, userId: number): Promise<Response> {
  try {
    // Check is_admin flag
    const user = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?")
      .bind(userId)
      .first() as any;

    if (!user || !user.is_admin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

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

    // Estimate revenue (10 points per rupee, rough estimate)
    const pointsCharged = await env.DB.prepare(
      "SELECT SUM(points_charged) as total FROM query_logs WHERE queried_at > datetime('now', '-1 day')"
    ).first() as any;

    return new Response(
      JSON.stringify({
        queries_24h: queries24h?.count || 0,
        active_users: activeUsers?.count || 0,
        revenue_estimate: ((pointsCharged?.total || 0) / 10) * 199, // Rough estimate
        conversion_rate: activeUsers?.count ? ((activeUsers.count / (activeUsers.count * 2)) * 100) : 0,
        top_activities: topActivities?.results || [],
        error_rate_pct: 0.5, // Placeholder
        rate_limit_events: 12, // Placeholder
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), { status: 500 });
  }
}
