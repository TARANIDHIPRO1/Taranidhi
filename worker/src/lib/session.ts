// Session tokens. Deliberately simple for v1: an opaque random token stored
// in KV mapping token -> userId, not a JWT. A JWT would let the Worker
// validate sessions without a KV read, but it also can't be revoked before
// it expires -- and "revoke a session on logout / suspicious activity" is a
// real requirement here (this app moves money via the wallet). KV lookup
// costs one read per authenticated request, which is a fine trade for that.
// Revisit only if request volume makes that read a measured bottleneck.

export interface Env {
  SESSIONS: KVNamespace;
}

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const SESSION_KEY_PREFIX = "session:";

export async function createSession(env: Env, userId: number): Promise<string> {
  const token = crypto.randomUUID();
  await env.SESSIONS.put(SESSION_KEY_PREFIX + token, String(userId), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
  return token;
}

export async function getUserIdFromSession(env: Env, token: string): Promise<number | null> {
  const raw = await env.SESSIONS.get(SESSION_KEY_PREFIX + token);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export async function destroySession(env: Env, token: string): Promise<void> {
  await env.SESSIONS.delete(SESSION_KEY_PREFIX + token);
}
