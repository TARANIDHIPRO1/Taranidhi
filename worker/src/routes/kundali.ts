// Kundali (birth chart) CRUD. Second endpoint in the build, per the plan in
// worker/README.md: everything downstream (wallet spend tied to a chart,
// query_logs, the future Universal KP Engine) needs a kundali_id to attach
// to, so this has to exist before any of that.
//
// Enforces the multi-kundali tier limit from ARCHITECTURE.md Section 5:
// Basic = 1, Premium = 3, Ultra = unlimited. Enforced here at the
// application layer (SQLite CHECK constraints can't count sibling rows,
// per the comment already in db/schema.sql).

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { getLagnaRashiIndex } from "../lib/lagna";
import { buildRealChart } from "../lib/astro";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv {
  DB: D1Database;
}

const TIER_KUNDALI_LIMITS: Record<string, number> = {
  basic: 1,
  premium: 3,
  ultra: Infinity,
};

interface CreateKundaliBody {
  label?: string;
  birth_date: string;        // ISO datetime string (YYYY-MM-DDTHH:MM:SS)
  latitude: number;
  longitude: number;
  timezone: string;          // IANA timezone (e.g. "Asia/Kolkata")
  janma_nakshatra_idx?: number; // Ignored; computed server-side
}

export async function handleCreateKundali(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: CreateKundaliBody;
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }

  const { birth_date, latitude, longitude, timezone } = body;

  if (!birth_date || Number.isNaN(Date.parse(birth_date))) {
    return errorJson(
      "birth_date is required and must be a valid ISO-8601 timestamp.",
      400,
      "INVALID_BIRTH_DATE"
    );
  }
  if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
    return errorJson("latitude must be a number between -90 and 90.", 400, "INVALID_LAT");
  }
  if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
    return errorJson("longitude must be a number between -180 and 180.", 400, "INVALID_LON");
  }
  if (!timezone || typeof timezone !== "string") {
    return errorJson("timezone is required and must be a string.", 400, "INVALID_TIMEZONE");
  }

  // Sanitize optional label: trim whitespace, enforce max 100 chars
  const rawLabel: unknown = body.label;
  const label: string | null =
    typeof rawLabel === "string" && rawLabel.trim().length > 0
      ? rawLabel.trim().slice(0, 100)
      : null;

  // Tier-limit check.
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404);

  const limit = TIER_KUNDALI_LIMITS[user.tier] ?? 1;
  const countRow = await env.DB.prepare(`SELECT COUNT(*) as count FROM kundalis WHERE user_id = ?`)
    .bind(auth.userId)
    .first<{ count: number }>();
  const currentCount = countRow?.count ?? 0;

  if (currentCount >= limit) {
    return errorJson(
      `Your ${user.tier} tier allows at most ${limit} kundali${limit === 1 ? "" : "s"}. Upgrade to add more.`,
      403,
      "KUNDALI_LIMIT_REACHED"
    );
  }

  const birthDate = new Date(birth_date);
  const lagnaRashiIdx = getLagnaRashiIndex(birthDate, latitude, longitude);

  // janma_nakshatra_idx: computed server-side via astronomy-engine
  const realChart = buildRealChart(birthDate, latitude, longitude);
  const janmaNakshatraIdx = realChart.janmaNakIdx;

  const created = await env.DB.prepare(
    `INSERT INTO kundalis
       (user_id, label, birth_date, latitude, longitude, timezone, janma_nakshatra_idx, lagna_rashi_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`
  )
    .bind(
      auth.userId,
      label,
      birth_date,
      latitude,
      longitude,
      timezone,
      janmaNakshatraIdx,
      lagnaRashiIdx
    )
    .first<{ id: number }>();

  return json(
    {
      id: created!.id,
      lagna_rashi_idx: lagnaRashiIdx,
      janma_nakshatra_idx: janmaNakshatraIdx,
    },
    201
  );
}

export async function handleListKundalis(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const { results } = await env.DB.prepare(
    `SELECT id, label, birth_date, latitude, longitude, timezone, janma_nakshatra_idx, lagna_rashi_idx, created_at
     FROM kundalis WHERE user_id = ? ORDER BY created_at ASC`
  )
    .bind(auth.userId)
    .all();

  return json({ kundalis: results });
}

export async function handleGetKundali(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const idStr = url.pathname.split("/").pop();
  const id = parseInt(idStr || "", 10);

  if (isNaN(id)) return errorJson("Invalid kundali ID.", 400);

  const kundali = await env.DB.prepare(
    `SELECT id, label, birth_date, latitude, longitude, timezone, janma_nakshatra_idx, lagna_rashi_idx, created_at
     FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(id, auth.userId)
    .first();

  if (!kundali) return errorJson("Kundali not found.", 404);

  return json(kundali);
}

export async function handleDeleteKundali(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const idStr = url.pathname.split("/").pop();
  const id = parseInt(idStr || "", 10);

  if (isNaN(id)) return errorJson("Invalid kundali ID.", 400);

  const result = await env.DB.prepare(
    `DELETE FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(id, auth.userId)
    .run();

  if (!result.success || result.meta.changes === 0) {
    return errorJson("Kundali not found.", 404);
  }

  return json({ deleted: true }, 200);
}
