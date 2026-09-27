// Small helpers so every route returns JSON in the same shape.
// Keeping this trivial on purpose -- do not add a framework here.

interface Env {
  FRONTEND_ORIGIN?: string;
  ENVIRONMENT?: string;
}

function getCorsHeaders(env: Env): Record<string, string> {
  const allowedOrigins = env.FRONTEND_ORIGIN || "http://localhost:5173";

  // For preflight, we return one origin or "*" (browsers handle both)
  // For actual requests, the frontend origin is checked server-side
  const origins = allowedOrigins.split(",").map((o) => o.trim());
  const primaryOrigin = origins[0] || "*";

  return {
    "Access-Control-Allow-Origin": primaryOrigin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function json(data: unknown, status = 200, env?: Env): Response {
  const corsHeaders = env ? getCorsHeaders(env) : { "Access-Control-Allow-Origin": "*" };
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

export function errorJson(message: string, status = 400, code?: string, env?: Env): Response {
  return json({ error: message, code: code ?? null }, status, env);
}

export function corsPreflight(env?: Env): Response {
  const corsHeaders = env ? getCorsHeaders(env) : { "Access-Control-Allow-Origin": "*" };
  return new Response(null, { status: 204, headers: corsHeaders });
}
