// Admin endpoints for the website and manual account activation -- Task 78.
// All require users.is_admin = 1 (lib/admin-middleware.ts) and every write
// is recorded in audit_log.
//
//   GET  /admin/contact-messages?status=new|contacted|closed|spam|all
//   POST /admin/contact-messages/:id/status      { status }
//   GET  /admin/testimonials?status=pending|approved|rejected|all
//   POST /admin/testimonials/:id/review          { status: approved|rejected }
//   GET  /admin/app-settings
//   POST /admin/app-settings                     { whatsapp_number?, contact_phone?, contact_email? }
//   GET  /admin/users/lookup?phone=9876543210    -> user + wallet balance + batches
//   POST /admin/users/activate                   { phone, tier?, points?, validity_days?, source?, note? }
//
// /admin/users/activate is the activation tool: it creates the account if
// the phone has never logged in (the person later logs in with OTP on the
// same number and lands on this account), optionally sets the plan tier,
// and optionally credits wallet points with an expiry -- all in one D1
// batch so a partial activation cannot happen.

import { json, errorJson } from "../lib/response";
import { requireAdmin, forbidden, unauthorized, type Env as AdminEnv } from "../lib/admin-middleware";
import { getAvailablePoints } from "../lib/wallet";
import { normalizeIndianMobile, cleanText } from "../lib/publicSubmissions";
import { readSettings, type Env as PublicEnv } from "./publicSite";

export interface Env extends AdminEnv, PublicEnv {
  DB: D1Database;
}

const CONTACT_STATUSES = ["new", "contacted", "closed", "spam"] as const;
const TESTIMONIAL_STATUSES = ["pending", "approved", "rejected"] as const;
const TIERS = ["basic", "premium", "ultra"] as const;
const CREDIT_SOURCES = ["subscription_package", "purchased_topup", "free_trial"] as const;

export const ACTIVATION_LIMITS = {
  pointsMax: 100000,
  validityDaysMin: 1,
  validityDaysMax: 730,
  validityDaysDefault: 365,
  noteMax: 200,
} as const;

async function adminOr401(request: Request, env: Env): Promise<number | Response> {
  const r = await requireAdmin(request, env);
  if (r === "unauthenticated") return unauthorized();
  if (r === "forbidden") return forbidden();
  return r.userId;
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await request.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function audit(env: Env, adminId: number, action: string, entityType: string, entityId: number, details: unknown) {
  return env.DB.prepare(
    "INSERT INTO audit_log (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)"
  ).bind(adminId, action, entityType, entityId, JSON.stringify(details));
}

function pageParams(url: URL): { limit: number; offset: number } {
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0", 10) || 0, 0);
  return { limit, offset };
}

// ── Contact messages ────────────────────────────────────────────────────────

export async function handleAdminListContacts(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "new";
  const { limit, offset } = pageParams(url);

  const all = status === "all";
  if (!all && !(CONTACT_STATUSES as readonly string[]).includes(status)) return errorJson("Unknown status.", 400);

  const rows = await env.DB.prepare(
    `SELECT id, name, phone, topic, message, status, created_at, updated_at
       FROM contact_messages ${all ? "" : "WHERE status = ?"}
      ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`
  )
    .bind(...(all ? [limit, offset] : [status, limit, offset]))
    .all();
  return json({ messages: rows.results ?? [] });
}

export async function handleAdminSetContactStatus(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const body = await readBody(request);
  const status = typeof body?.status === "string" ? body.status : "";
  if (!(CONTACT_STATUSES as readonly string[]).includes(status)) return errorJson("Unknown status.", 400);

  // Existence check first, so a 404 never leaves an audit row behind.
  const exists = await env.DB.prepare("SELECT id FROM contact_messages WHERE id = ?").bind(id).first();
  if (!exists) return errorJson("Message not found.", 404, "NOT_FOUND");

  await env.DB.batch([
    env.DB.prepare("UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(status, id),
    audit(env, admin, "contact_status", "contact_message", id, { status }),
  ]);
  return json({ ok: true, id, status });
}

// ── Testimonials ───────────────────────────────────────────────────────────

export async function handleAdminListTestimonials(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "pending";
  const { limit, offset } = pageParams(url);

  const all = status === "all";
  if (!all && !(TESTIMONIAL_STATUSES as readonly string[]).includes(status)) return errorJson("Unknown status.", 400);

  const rows = await env.DB.prepare(
    `SELECT id, name, city, service, rating, quote, phone, status, reviewed_at, created_at
       FROM testimonials ${all ? "" : "WHERE status = ?"}
      ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`
  )
    .bind(...(all ? [limit, offset] : [status, limit, offset]))
    .all();
  return json({ testimonials: rows.results ?? [] });
}

export async function handleAdminReviewTestimonial(request: Request, env: Env, id: number): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const body = await readBody(request);
  const status = typeof body?.status === "string" ? body.status : "";
  if (status !== "approved" && status !== "rejected") {
    return errorJson("Status must be 'approved' or 'rejected'.", 400);
  }

  const exists = await env.DB.prepare("SELECT id FROM testimonials WHERE id = ?").bind(id).first();
  if (!exists) return errorJson("Testimonial not found.", 404, "NOT_FOUND");

  await env.DB.batch([
    env.DB.prepare(
      "UPDATE testimonials SET status = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?"
    ).bind(status, admin, id),
    audit(env, admin, `testimonial_${status}`, "testimonial", id, { status }),
  ]);
  return json({ ok: true, id, status });
}

// ── App settings (WhatsApp number etc.) ────────────────────────────────────

export function validateSettingsPatch(body: Record<string, unknown> | null):
  { ok: true; patch: Record<string, string> } | { ok: false; error: string } {
  if (!body) return { ok: false, error: "Invalid JSON body." };
  const patch: Record<string, string> = {};
  for (const key of ["whatsapp_number", "contact_phone"] as const) {
    if (body[key] === undefined) continue;
    const ten = normalizeIndianMobile(body[key]);
    if (!ten) return { ok: false, error: `${key}: enter a valid 10-digit Indian mobile number.` };
    patch[key] = `91${ten}`;
  }
  if (body.contact_email !== undefined) {
    const email = cleanText(body.contact_email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email) || email.length > 120) {
      return { ok: false, error: "contact_email: enter a valid email address." };
    }
    patch.contact_email = email;
  }
  if (Object.keys(patch).length === 0) return { ok: false, error: "Nothing to update." };
  return { ok: true, patch };
}

export async function handleAdminGetAppSettings(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  return json({ settings: await readSettings(env) });
}

export async function handleAdminUpdateAppSettings(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const v = validateSettingsPatch(await readBody(request));
  if (!v.ok) return errorJson(v.error, 400, "VALIDATION");

  const before = await readSettings(env);
  const stmts = Object.entries(v.patch).map(([k, val]) =>
    env.DB.prepare(
      `INSERT INTO app_settings (key, value, updated_by, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at`
    ).bind(k, val, admin)
  );
  const changes: Record<string, { from: string | undefined; to: string }> = {};
  for (const [k, val] of Object.entries(v.patch)) changes[k] = { from: before[k], to: val };
  stmts.push(audit(env, admin, "app_settings_update", "app_settings", 0, changes));
  await env.DB.batch(stmts);
  return json({ ok: true, settings: await readSettings(env) });
}

// ── Activation tool ────────────────────────────────────────────────────────

export interface ActivationInput {
  phoneE164: string;
  tier: (typeof TIERS)[number] | null;
  points: number;
  validityDays: number;
  source: (typeof CREDIT_SOURCES)[number];
  note: string;
}

export function validateActivation(body: Record<string, unknown> | null):
  { ok: true; value: ActivationInput } | { ok: false; error: string } {
  if (!body) return { ok: false, error: "Invalid JSON body." };
  const ten = normalizeIndianMobile(body.phone);
  if (!ten) return { ok: false, error: "Enter a valid 10-digit Indian mobile number." };

  let tier: ActivationInput["tier"] = null;
  if (body.tier !== undefined && body.tier !== null && body.tier !== "") {
    if (!(TIERS as readonly string[]).includes(String(body.tier))) return { ok: false, error: "Tier must be basic, premium or ultra." };
    tier = body.tier as ActivationInput["tier"];
  }

  let points = 0;
  if (body.points !== undefined && body.points !== null && body.points !== "") {
    const p = Number(body.points);
    if (!Number.isInteger(p) || p < 1 || p > ACTIVATION_LIMITS.pointsMax) {
      return { ok: false, error: `Points must be a whole number from 1 to ${ACTIVATION_LIMITS.pointsMax}.` };
    }
    points = p;
  }

  let validityDays: number = ACTIVATION_LIMITS.validityDaysDefault;
  if (body.validity_days !== undefined && body.validity_days !== null && body.validity_days !== "") {
    const d = Number(body.validity_days);
    if (!Number.isInteger(d) || d < ACTIVATION_LIMITS.validityDaysMin || d > ACTIVATION_LIMITS.validityDaysMax) {
      return { ok: false, error: `Validity must be ${ACTIVATION_LIMITS.validityDaysMin}-${ACTIVATION_LIMITS.validityDaysMax} days.` };
    }
    validityDays = d;
  }

  const source = (body.source ?? "subscription_package") as ActivationInput["source"];
  if (!(CREDIT_SOURCES as readonly string[]).includes(source)) return { ok: false, error: "Unknown credit source." };

  const note = cleanText(body.note).slice(0, ACTIVATION_LIMITS.noteMax);

  if (!tier && points === 0) return { ok: false, error: "Choose a plan, points, or both." };
  return { ok: true, value: { phoneE164: `+91${ten}`, tier, points, validityDays, source, note } };
}

async function userSnapshot(env: Env, userId: number) {
  const user = await env.DB.prepare(
    "SELECT id, phone_number, tier, is_active, is_admin, created_at, tier_upgraded_at FROM users WHERE id = ?"
  ).bind(userId).first();
  const balance = await getAvailablePoints(userId, env.DB);
  const batches = await env.DB.prepare(
    `SELECT id, source, amount_granted, amount_remaining, granted_at, expires_at, status
       FROM wallet_ledger WHERE user_id = ? ORDER BY granted_at DESC LIMIT 20`
  ).bind(userId).all();
  return { user, balance, batches: batches.results ?? [] };
}

export async function handleAdminLookupUser(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const ten = normalizeIndianMobile(new URL(request.url).searchParams.get("phone") ?? "");
  if (!ten) return errorJson("Enter a valid 10-digit Indian mobile number.", 400, "VALIDATION");

  const row = await env.DB.prepare("SELECT id FROM users WHERE phone_number = ?").bind(`+91${ten}`).first<{ id: number }>();
  if (!row) return json({ found: false, phone: `+91${ten}` });
  return json({ found: true, ...(await userSnapshot(env, row.id)) });
}

export async function handleAdminActivate(request: Request, env: Env): Promise<Response> {
  const admin = await adminOr401(request, env);
  if (admin instanceof Response) return admin;
  const v = validateActivation(await readBody(request));
  if (!v.ok) return errorJson(v.error, 400, "VALIDATION");
  const a = v.value;

  try {
    // Create the account if this number has never logged in.
    await env.DB.prepare("INSERT OR IGNORE INTO users (phone_number, tier) VALUES (?, 'basic')").bind(a.phoneE164).run();
    const user = await env.DB.prepare("SELECT id, tier, is_active FROM users WHERE phone_number = ?")
      .bind(a.phoneE164).first<{ id: number; tier: string; is_active: number }>();
    if (!user) return errorJson("Could not create or find the account.", 500, "INTERNAL_ERROR");
    if (user.is_active !== 1) return errorJson("This account is deactivated. Reactivate it first.", 409, "DEACTIVATED");

    const stmts: D1PreparedStatement[] = [];
    if (a.tier) {
      stmts.push(env.DB.prepare("UPDATE users SET tier = ?, tier_upgraded_at = datetime('now') WHERE id = ?").bind(a.tier, user.id));
    }
    if (a.points > 0) {
      // expires_at uses SQLite's own datetime format so it compares exactly
      // against datetime('now') in the wallet queries.
      stmts.push(
        env.DB.prepare(
          `INSERT INTO wallet_ledger (user_id, source, amount_granted, amount_remaining, granted_at, expires_at, status)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now', ?), 'active')`
        ).bind(user.id, a.source, a.points, a.points, `+${a.validityDays} days`)
      );
    }
    stmts.push(
      audit(env, admin, "user_activate", "user", user.id, {
        phone: a.phoneE164,
        tier_from: user.tier,
        tier_to: a.tier ?? user.tier,
        points: a.points,
        validity_days: a.points > 0 ? a.validityDays : null,
        source: a.points > 0 ? a.source : null,
        note: a.note || null,
      })
    );
    await env.DB.batch(stmts);

    return json({ ok: true, ...(await userSnapshot(env, user.id)) });
  } catch (err) {
    console.error("[handleAdminActivate]", (err as Error)?.message ?? err);
    // The plan/points/audit batch is atomic; only the empty account row
    // (INSERT OR IGNORE above) may already exist if the batch failed.
    return errorJson("Activation failed. Plan and points were not changed.", 500, "INTERNAL_ERROR");
  }
}
