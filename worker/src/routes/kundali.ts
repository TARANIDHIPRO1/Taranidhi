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
  // Required client-supplied value for now. Computing this server-side
  // needs the Moon's sidereal longitude at birth, which needs a real
  // ephemeris library (astronomy-engine) -- a dependency ARCHITECTURE.md
  // Section 4 flags as "not yet added." Lagna, by contrast, IS computed
  // server-side below because it has a genuine closed-form solution that
  // doesn't need ephemeris data. Do not silently guess this value if it's
  // missing -- reject the request instead (see validation below).
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

  const { birth_datetime_utc, birth_place_lat, birth_place_lon, janma_nakshatra_idx } = body;

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
  if (
    typeof janma_nakshatra_idx !== "number" ||
    !Number.isInteger(janma_nakshatra_idx) ||
    janma_nakshatra_idx < 0 ||
    janma_nakshatra_idx > 26
  ) {
    return errorJson(
      "janma_nakshatra_idx is required (0-26) -- this endpoint does not compute it server-side yet. " +
        "See the comment in routes/kundali.ts for why.",
      400,
      "MISSING_NAKSHATRA"
    );
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
      janma_nakshatra_idx,
      lagnaRashiIdx
    )
    .first<{ id: number }>();

  return json(
    {
      id: created!.id,
      lagna_rashi_idx: lagnaRashiIdx,
      janma_nakshatra_idx,
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
