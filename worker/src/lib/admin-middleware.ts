// Admin-only route guard. ARCHITECTURE.md Section 9's "least privilege"
// principle governs the Cloudflare/GitHub/Razorpay account level; this is
// the analogous in-app control for the Admin API itself -- a logged-in user
// still needs users.is_admin = 1 to call any /admin/* route.

import { requireAuth, unauthorized, type Env as AuthEnv } from "./auth-middleware";
import { errorJson } from "./response";

export interface Env extends AuthEnv {
  DB: D1Database;
}

export interface AdminAuthResult {
  userId: number;
}

/**
 * Returns the authenticated admin's userId, or null if the request is
 * either not authenticated at all, or authenticated as a non-admin user.
 * Callers should return forbidden() for the latter case specifically (via
 * the sibling check below) rather than conflating "not logged in" with
 * "logged in but not an admin" -- the two deserve different status codes.
 */
export async function requireAdmin(request: Request, env: Env): Promise<AdminAuthResult | "unauthenticated" | "forbidden"> {
  const auth = await requireAuth(request, env);
  if (!auth) return "unauthenticated";

  const row = await env.DB.prepare(`SELECT is_admin FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ is_admin: number }>();
  if (!row || row.is_admin !== 1) return "forbidden";

  return { userId: auth.userId };
}

export function forbidden(): Response {
  return errorJson("This account does not have admin access.", 403, "FORBIDDEN");
}

export { unauthorized };
