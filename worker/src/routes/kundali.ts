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
  // Birth moment MUST be sent as a UTC ISO-8601 string (e.g.
  // "1973-04-08T06:15:00Z"). This endpoint deliberately does NOT accept a
  // local time + timezone-name pair and convert it server-side -- that
  // needs an IANA timezone database and DST-history handling
  // (ARCHITECTURE.md's own research flagged this as the #1 real-world bug
  // source in these calculations). Doing the local->UTC conversion is the
  // frontend's job for now; revisit if that turns out to be the wrong
  // place for it once the actual birth-data form exists.
  birth_datetime_utc?: string;
  birth_place_lat?: number;
  birth_place_lon?: number;
  birth_place_name?: string;
  // No longer required from the caller. lib/astro.ts now computes this
  // server-side via astronomy-engine (real Moon sidereal longitude at
  // birth), ported from the verified TaraNidhi Floot prototype. If a caller
  // still sends this field it is IGNORED, not trusted -- the server-computed
  // value is always authoritative, since a client-supplied value could be
  // wrong or (worse) spoofed to manipulate Tarabala-gated scoring downstream.
  janma_nakshatra_idx?: number;
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

  const { birth_datetime_utc, birth_place_lat, birth_place_lon } = body;

  if (!birth_datetime_utc || Number.isNaN(Date.parse(birth_datetime_utc))) {
    return errorJson(
      "birth_datetime_utc is required and must be a valid ISO-8601 UTC timestamp.",
      400,
      "INVALID_BIRTH_DATETIME"
    );
  }
  if (typeof birth_place_lat !== "number" || birth_place_lat < -90 || birth_place_lat > 90) {
    return errorJson("birth_place_lat must be a number between -90 and 90.", 400, "INVALID_LAT");
  }
  if (typeof birth_place_lon !== "number" || birth_place_lon < -180 || birth_place_lon > 180) {
    return errorJson("birth_place_lon must be a number between -180 and 180.", 400, "INVALID_LON");
  }

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

  const birthDate = new Date(birth_datetime_utc);
  const lagnaRashiIdx = getLagnaRashiIndex(birthDate, birth_place_lat, birth_place_lon);

  // janma_nakshatra_idx: now computed server-side from the Moon's real
  // sidereal longitude at birth via astronomy-engine (lib/astro.ts), ported
  // from the verified TaraNidhi Floot prototype. Any client-supplied value
  // for this field (see the CreateKundaliBody comment above) is ignored.
  const realChart = buildRealChart(birthDate, birth_place_lat, birth_place_lon);
  const janmaNakshatraIdx = realChart.janmaNakIdx;

  const isoDate = birthDate.toISOString();
  const created = await env.DB.prepare(
    `INSERT INTO kundalis
       (user_id, label, birth_date, birth_time, birth_place_lat, birth_place_lon, birth_place_name,
        janma_nakshatra_idx, lagna_rashi_idx)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`
  )
    .bind(
      auth.userId,
      body.label ?? null,
      isoDate.slice(0, 10),
      isoDate.slice(11, 19),
      birth_place_lat,
      birth_place_lon,
      body.birth_place_name ?? null,
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
    `SELECT id, label, birth_date, birth_time, birth_place_lat, birth_place_lon,
            birth_place_name, janma_nakshatra_idx, lagna_rashi_idx, created_at
     FROM kundalis WHERE user_id = ? ORDER BY created_at ASC`
  )
    .bind(auth.userId)
    .all();

  return json({ kundalis: results });
}
