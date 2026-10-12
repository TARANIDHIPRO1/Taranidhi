// Public (unauthenticated) website endpoints -- Task 78.
//
//   GET  /public/config        -> contact numbers from app_settings
//   POST /public/contact       -> save a contact-form enquiry
//   POST /public/testimonials  -> submit feedback (stored as 'pending')
//   GET  /public/testimonials  -> approved feedback only, no phone numbers
//
// These routes are open to anyone, so every input is validated in
// lib/publicSubmissions.ts and submissions are rate limited per IP on top
// of the global limiter in index.ts.

import { json, errorJson } from "../lib/response";
import { checkRateLimit, getClientIp, type Env as RateLimitEnv } from "../lib/rateLimit";
import {
  LIMITS,
  isHoneypotTripped,
  publicDisplayName,
  validateContact,
  validateTestimonial,
} from "../lib/publicSubmissions";

export interface Env extends RateLimitEnv {
  DB: D1Database;
}

// Defaults used only if app_settings has no row (e.g. fresh database).
export const SETTING_DEFAULTS: Record<string, string> = {
  whatsapp_number: "919669756111",
  contact_phone: "919669756111",
  contact_email: "info@occultviision.com",
};

export async function readSettings(env: Env): Promise<Record<string, string>> {
  const out: Record<string, string> = { ...SETTING_DEFAULTS };
  try {
    const rows = await env.DB.prepare("SELECT key, value FROM app_settings").all<{ key: string; value: string }>();
    for (const r of rows.results ?? []) out[r.key] = r.value;
  } catch (err) {
    console.error("[readSettings] falling back to defaults:", (err as Error)?.message ?? err);
  }
  return out;
}

async function readJsonBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; res: Response }> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > LIMITS.bodyBytesMax) {
    return { ok: false, res: errorJson("Request too large.", 413, "PAYLOAD_TOO_LARGE") };
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > LIMITS.bodyBytesMax) {
    return { ok: false, res: errorJson("Request too large.", 413, "PAYLOAD_TOO_LARGE") };
  }
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, res: errorJson("Invalid JSON body.", 400, "BAD_JSON") };
  }
}

async function submissionAllowed(request: Request, env: Env): Promise<boolean> {
  const decision = await checkRateLimit(
    env,
    { bucket: "public-submit", windowSeconds: 3600, maxRequests: 5 },
    getClientIp(request),
    null
  );
  return decision.allowed;
}

export async function handlePublicConfig(_request: Request, env: Env): Promise<Response> {
  const s = await readSettings(env);
  return json({
    whatsapp_number: s.whatsapp_number,
    contact_phone: s.contact_phone,
    contact_email: s.contact_email,
  });
}

export async function handleSubmitContact(request: Request, env: Env): Promise<Response> {
  try {
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.res;

    // Bots that fill the hidden field get a normal-looking success and
    // nothing is stored, so they learn nothing from the response.
    if (isHoneypotTripped(parsed.body)) return json({ ok: true });

    if (!(await submissionAllowed(request, env))) {
      return errorJson("Too many submissions. Please try again in an hour or message us on WhatsApp.", 429, "RATE_LIMITED");
    }

    const v = validateContact(parsed.body);
    if (!v.ok) return json({ error: v.error, field: v.field, code: "VALIDATION" }, 400);

    const res = await env.DB.prepare(
      "INSERT INTO contact_messages (name, phone, topic, message) VALUES (?, ?, ?, ?)"
    )
      .bind(v.value.name, v.value.phone, v.value.topic, v.value.message)
      .run();

    const settings = await readSettings(env);
    return json({ ok: true, id: res.meta.last_row_id, whatsapp_number: settings.whatsapp_number }, 201);
  } catch (err) {
    console.error("[handleSubmitContact]", (err as Error)?.message ?? err);
    return errorJson("Could not save your message. Please use WhatsApp instead.", 500, "INTERNAL_ERROR");
  }
}

export async function handleSubmitTestimonial(request: Request, env: Env): Promise<Response> {
  try {
    const parsed = await readJsonBody(request);
    if (!parsed.ok) return parsed.res;

    if (isHoneypotTripped(parsed.body)) return json({ ok: true, status: "pending" });

    if (!(await submissionAllowed(request, env))) {
      return errorJson("Too many submissions. Please try again in an hour.", 429, "RATE_LIMITED");
    }

    const v = validateTestimonial(parsed.body);
    if (!v.ok) return json({ error: v.error, field: v.field, code: "VALIDATION" }, 400);

    const t = v.value;
    const res = await env.DB.prepare(
      `INSERT INTO testimonials (name, city, service, rating, quote, phone, consent_publish)
       VALUES (?, ?, ?, ?, ?, ?, 1)`
    )
      .bind(t.name, t.city, t.service, t.rating, t.quote, t.phone)
      .run();

    return json({ ok: true, id: res.meta.last_row_id, status: "pending" }, 201);
  } catch (err) {
    console.error("[handleSubmitTestimonial]", (err as Error)?.message ?? err);
    return errorJson("Could not save your feedback. Please try again later.", 500, "INTERNAL_ERROR");
  }
}

export async function handleListTestimonials(_request: Request, env: Env): Promise<Response> {
  try {
    const rows = await env.DB.prepare(
      `SELECT id, name, city, service, rating, quote, reviewed_at
         FROM testimonials
        WHERE status = 'approved' AND consent_publish = 1
        ORDER BY reviewed_at DESC, id DESC
        LIMIT 24`
    ).all<{ id: number; name: string; city: string; service: string; rating: number | null; quote: string; reviewed_at: string }>();

    // Phone numbers are never selected; names are shortened to "First L.".
    const testimonials = (rows.results ?? []).map((r) => ({
      id: r.id,
      name: publicDisplayName(r.name),
      city: r.city,
      service: r.service,
      rating: r.rating,
      quote: r.quote,
    }));
    return json({ testimonials });
  } catch (err) {
    console.error("[handleListTestimonials]", (err as Error)?.message ?? err);
    return json({ testimonials: [] });
  }
}
