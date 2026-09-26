// Small helpers so every route returns JSON in the same shape.
// Keeping this trivial on purpose -- do not add a framework here.
//
// CORS note: Access-Control-Allow-Origin: * below is intentionally
// permissive so a browser-based test harness (opened from any local origin,
// any LAN IP, or a file:// page) can call this API during development/demo.
// This is NOT a production-appropriate CORS policy -- before launch this
// needs to be scoped to the actual frontend's origin(s). Tracked here rather
// than silently left permissive: search for CORS_TODO before a real deploy.

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*", // CORS_TODO: scope to real frontend origin(s) before launch
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export function errorJson(message: string, status = 400, code?: string): Response {
  return json({ error: message, code: code ?? null }, status);
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
