// Small helpers so every route returns JSON in the same shape.
// Keeping this trivial on purpose -- do not add a framework here.

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorJson(message: string, status = 400, code?: string): Response {
  return json({ error: message, code: code ?? null }, status);
}
