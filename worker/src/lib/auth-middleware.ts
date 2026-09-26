// Shared helper for any route that requires a logged-in user.
// Expects `Authorization: Bearer <session_token>` on the request.

import { getUserIdFromSession, type Env as SessionEnv } from "./session";
import { errorJson } from "./response";

export interface Env extends SessionEnv {}

export interface AuthResult {
  userId: number;
}

/**
 * Returns the authenticated userId, or null if the request is not
 * authenticated. Callers decide what to do with null (usually: return
 * errorJson("Unauthorized", 401) immediately) -- kept as a plain function
 * rather than throwing, so route handlers stay easy to read top-to-bottom.
 */
export async function requireAuth(request: Request, env: Env): Promise<AuthResult | null> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;

  const token = match[1];
  const userId = await getUserIdFromSession(env, token);
  if (userId === null) return null;

  return { userId };
}

export function unauthorized(): Response {
  return errorJson("Unauthorized. Provide a valid session token as 'Authorization: Bearer <token>'.", 401, "UNAUTHORIZED");
}
