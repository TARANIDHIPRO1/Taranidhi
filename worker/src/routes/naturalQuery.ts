// POST /kp/query-natural -- Natural-language KP + today's Panchang verdict.
//
// Accepts a free-text question in Hindi or English, e.g.:
//   "Kya mein aaj interview ke liye ja sakta hoon?"
//   "Can I go meet my client today?"
//   "Kya aaj shaadi ka rishta bhejne ka sahi waqt hai?"
//
// Returns:
//   1. Detected intent (activity slug) with confidence %
//   2. KP horary verdict (PROMISED / DENIED / NEUTRAL) from natal houses
//   3. Today's live Panchang layer (Hora, Rahu Kaal window, Tarabala score)
//   4. Combined verdict: PROCEED / WAIT / AVOID
//   5. Plain Hindi reasoning the consultant can read directly to the client
//
// BILLING: same as kp/query (1 point for basic tier, unlimited for premium/ultra)

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { json, errorJson } from "../lib/response";
import { parseNaturalQuery } from "../lib/naturalQueryParser";
import { getHouseMapping } from "../lib/houseActivityMap";
import { solvePlacidusCusps, DEFAULT_AYANAMSA_CAVEAT } from "../lib/kp";
import { evaluateHouse, checkDashaSupport } from "../lib/kpVerdict";
import {
  trueSiderealLongitude,
  rahuLongitude,
  julianDayFromUtc,
  buildRealChart,
  getCurrentDasha,
  lahiriAyanamsa,
  krishnamurtiAyanamsa,
  realSunriseSunset,
  NAKSHATRA_NAMES,
} from "../lib/astro";
import {
  buildHoraWindows,
  getActiveHora,
  getHoraQuality,
  getRahuKaal,
  isWithinRahuKaal,
  computeTara,
  HORA_NATURE,
  getVara,
} from "../lib/muhurta";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

const KP_QUERY_COST = 1;
const UNLIMITED_TIERS = new Set(["premium", "ultra"]);

// Tarabala benefic tara numbers (BPHS-verified)
// Janma (1) is deliberately excluded as "neutral" — per RULES_VERIFICATION_2026-10
const TARA_BENEFIC = new Set([2, 4, 6, 8, 9]);
const TARA_MALEFIC = new Set([3, 5, 7]);

const norm360 = (x: number): number => ((x % 360) + 360) % 360;
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// ── Hindi/English plain-language verdict builder ─────────────────────────────

function buildPlainReasoning(params: {
  activityLabel: string;
  slug: string;
  kpVerdict: "PROMISED" | "DENIED" | "NEUTRAL";
  kpDetails: string;
  isRahuKaal: boolean;
  rahuKaalEndTime: string | null;
  taraScore: number;
  taraName: string;
  horaLord: string;
  horaQuality: "GOOD" | "MIXED" | "BAD";
  combinedVerdict: "PROCEED" | "WAIT" | "AVOID";
}): { hi: string; en: string } {
  const {
    activityLabel,
    kpVerdict,
    isRahuKaal,
    rahuKaalEndTime,
    taraScore,
    taraName,
    horaLord,
    horaQuality,
    combinedVerdict,
  } = params;

  // Build Hindi reasoning
  let hi = "";
  let en = "";

  if (combinedVerdict === "PROCEED") {
    hi = `✅ Haan, aaj ${activityLabel} ke liye sahi samay hai. `;
    en = `✅ Yes, today is favorable for ${activityLabel}. `;

    if (kpVerdict === "PROMISED") {
      hi += `KP chart ke anusar yeh karya ke liye yogkarak grah sthiti theek hai. `;
      en += `KP chart shows the relevant houses are positively promised. `;
    }

    if (!isRahuKaal) {
      hi += `Abhi Rahu Kaal nahi chal raha — koi ruk-ruk nahi hai. `;
      en += `Rahu Kaal is not active right now — no timing obstacle. `;
    }

    if (TARA_BENEFIC.has(taraScore)) {
      hi += `Tarabala bhi acchi hai (${taraName}, Tara ${taraScore}). `;
      en += `Tarabala is favorable (${taraName}, Tara ${taraScore}). `;
    }

    if (horaQuality === "GOOD") {
      hi += `${horaLord} ki Hora chal rahi hai jo is karya ke liye shubh hai.`;
      en += `${horaLord} Hora is active, auspicious for this activity.`;
    }
  } else if (combinedVerdict === "WAIT") {
    hi = `⏳ Thoda intezaar karein. `;
    en = `⏳ Wait a short while before proceeding. `;

    if (isRahuKaal && rahuKaalEndTime) {
      hi += `Abhi Rahu Kaal chal raha hai — ${rahuKaalEndTime} ke baad jaiye. `;
      en += `Rahu Kaal is active — please go after ${rahuKaalEndTime}. `;
    }

    if (TARA_MALEFIC.has(taraScore)) {
      hi += `Tarabala thodi kamzor hai aaj (${taraName}, Tara ${taraScore}) — `;
      hi += `koshish karein ki thodi der baad shuru karein. `;
      en += `Tarabala is slightly weak today (${taraName}, Tara ${taraScore}) — `;
      en += `starting slightly later is recommended. `;
    }

    if (horaQuality === "BAD") {
      hi += `${horaLord} ki Hora chal rahi hai jo is kaam ke liye utni acchi nahi. `;
      en += `${horaLord} Hora is currently less favorable for this. `;
    }

    if (kpVerdict === "PROMISED") {
      hi += `KP se kaam ho sakta hai, bas timing ka dhyan rakhein.`;
      en += `KP shows potential — just mind the timing.`;
    }
  } else {
    // AVOID
    hi = `🚫 Aaj ${activityLabel} ke liye sahi samay nahi hai. `;
    en = `🚫 Today is not favorable for ${activityLabel}. `;

    if (kpVerdict === "DENIED") {
      hi += `KP chart ke anusar is karya ke relevant gharaon ka sub-lord anukoolan nahi de raha. `;
      en += `KP chart shows the relevant house sub-lords are not supporting this activity. `;
    }

    if (isRahuKaal) {
      hi += `Upar se Rahu Kaal bhi chal raha hai. `;
      en += `Rahu Kaal is also active at this time. `;
    }

    if (TARA_MALEFIC.has(taraScore)) {
      hi += `Tarabala bhi kamzor hai (${taraName}, Tara ${taraScore}). `;
      en += `Tarabala is also unfavorable (${taraName}, Tara ${taraScore}). `;
    }

    hi += `Kisi aur din ki koshish karein.`;
    en += `Consider rescheduling to a more favorable day.`;
  }

  return { hi, en };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function handleNaturalQuery(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: { kundali_id?: number; question?: string };
  try {
    body = (await request.json()) as { kundali_id?: number; question?: string };
  } catch {
    return errorJson("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const { kundali_id, question } = body;
  if (!kundali_id || !question || typeof question !== "string") {
    return errorJson("Both kundali_id and question are required.", 400, "MISSING_FIELDS");
  }

  if (question.trim().length < 3) {
    return errorJson("Question is too short. Please describe your query.", 400, "QUESTION_TOO_SHORT");
  }

  // ── 1. Parse intent ──────────────────────────────────────────────────────
  const parseResult = parseNaturalQuery(question);

  if (parseResult.unrecognized || !parseResult.matched) {
    // Provide today's panchang only with a "cannot determine" note
    return errorJson(
      "Could not identify the activity from your question. Try mentioning: interview, " +
        "client milna, doctor, shaadi, court, ghar kharidna, exam, flight, visa, etc.",
      422,
      "INTENT_UNRECOGNIZED"
    );
  }

  const { slug, label: activityLabel, confidence, detectedTerms, allMatches } = parseResult.matched;

  const mapping = getHouseMapping(slug);
  if (!mapping) {
    return errorJson(
      `Activity "${slug}" recognized but not mapped. Report this as a bug.`,
      500,
      "MAPPING_BUG"
    );
  }

  // ── 2. Load kundali ──────────────────────────────────────────────────────
  const row = await env.DB.prepare(
    `SELECT birth_date, latitude, longitude FROM kundalis WHERE id = ? AND user_id = ?`
  )
    .bind(kundali_id, auth.userId)
    .first<{ birth_date: string; latitude: number; longitude: number }>();

  if (!row) return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");

  const birthUtc = new Date(row.birth_date);
  if (Number.isNaN(birthUtc.getTime())) {
    return errorJson("Stored birth date could not be parsed.", 500, "INVALID_BIRTH_DATA");
  }

  // ── 3. Debit wallet ──────────────────────────────────────────────────────
  const userRow = await env.DB.prepare("SELECT tier FROM users WHERE id = ?")
    .bind(auth.userId)
    .first<{ tier: string }>();
  const tier = userRow?.tier ?? "basic";

  if (!UNLIMITED_TIERS.has(tier)) {
    try {
      await debitWallet(env, auth.userId, KP_QUERY_COST, "kp_query_window");
    } catch (e) {
      if (e instanceof InsufficientBalanceError) {
        return errorJson(
          "Insufficient wallet balance. Please recharge to continue.",
          402,
          "INSUFFICIENT_BALANCE"
        );
      }
      throw e;
    }
  }

  const now = new Date();

  // ── 4. KP verdict ────────────────────────────────────────────────────────
  const { cusps } = solvePlacidusCusps(birthUtc, row.latitude, row.longitude);
  const jd = julianDayFromUtc(birthUtc);
  const kpAyanamsa = krishnamurtiAyanamsa(jd);
  const lahiri = lahiriAyanamsa(jd);
  const ayanamsaDiff = lahiri - kpAyanamsa;

  const allPlanetLons: Record<string, number> = {};
  for (const p of PLANETS) {
    allPlanetLons[p] = norm360(trueSiderealLongitude(p, jd) + ayanamsaDiff);
  }
  allPlanetLons["Rahu"] = norm360(rahuLongitude(jd) + ayanamsaDiff);
  allPlanetLons["Ketu"] = norm360(allPlanetLons["Rahu"]! + 180);

  const moonLon = allPlanetLons["Moon"]!;
  const janmaNakIdx = Math.floor(moonLon / (360 / 27));
  const janmaNakName = NAKSHATRA_NAMES[janmaNakIdx] ?? "Unknown";

  // Evaluate primary house for combined verdict
  const primaryHouse = mapping.houses[0]!;
  const primaryVerdict = evaluateHouse(primaryHouse, cusps, allPlanetLons, janmaNakIdx);

  // Evaluate all houses (for detailed display)
  const houseVerdicts = mapping.houses.map((house) =>
    evaluateHouse(house, cusps, allPlanetLons, janmaNakIdx)
  );

  // Dasha support check
  const natalChart = buildRealChart(birthUtc, row.latitude, row.longitude);
  const kpNatalChart = { ...natalChart, janmaNakIdx };
  const dasha = getCurrentDasha(kpNatalChart, now);
  const dashaChecks = dasha
    ? mapping.houses.map((h) => checkDashaSupport(h, dasha, cusps, allPlanetLons))
    : null;

  // Synthesize KP verdict from primary house
  let kpVerdict: "PROMISED" | "DENIED" | "NEUTRAL" = "NEUTRAL";
  const pv = primaryVerdict.verdict;
  // evaluateHouse returns lowercase "promised" | "denied" (see kpVerdict.ts).
  if (pv === "promised") kpVerdict = "PROMISED";
  else if (pv === "denied") kpVerdict = "DENIED";

  // If multiple houses, require all to be PROMISED; one DENIED → DENIED
  for (const hv of houseVerdicts) {
    if (hv.verdict === "denied") {
      kpVerdict = "DENIED";
      break;
    }
  }

  // ── 5. Today's Panchang layer ────────────────────────────────────────────
  // Use birth location for Rahu Kaal & Hora (most users in India, birth location is fine)
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const { sunrise, sunset, nextSunrise } = realSunriseSunset(todayUtc, row.latitude, row.longitude);
  const todayDow = now.getUTCDay(); // 0=Sun … 6=Sat, same convention as routes/muhurta.ts

  // Hora
  const vara = getVara(todayDow);
  const horaWindows = buildHoraWindows(sunrise, sunset, nextSunrise, now);
  const activeHora = getActiveHora(horaWindows, now);
  const horaLord = activeHora?.lord ?? "Unknown";
  // getHoraQuality returns { nature: benefic|neutral|malefic }; map to the
  // GOOD/MIXED/BAD labels this route uses downstream.
  const natureToLabel = { benefic: "GOOD", neutral: "MIXED", malefic: "BAD" } as const;
  const horaQuality: "GOOD" | "MIXED" | "BAD" = natureToLabel[getHoraQuality(horaLord, slug).nature];

  // Rahu Kaal
  const rahuKaalWindow = getRahuKaal(sunrise, sunset, todayDow);
  const rahuActive = isWithinRahuKaal(now, rahuKaalWindow);
  let rahuKaalEndTime: string | null = null;
  if (rahuActive && rahuKaalWindow) {
    rahuKaalEndTime = rahuKaalWindow.end.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }

  // Tarabala — current Moon nakshatra vs birth Moon nakshatra
  const nowJd = julianDayFromUtc(now);
  const nowMoonLon = trueSiderealLongitude("Moon", nowJd); // Lahiri for tarabala
  const todayNakIdx = Math.floor(((nowMoonLon % 360) + 360) % 360 / (360 / 27));
  const todayNakName = NAKSHATRA_NAMES[todayNakIdx] ?? "Unknown";
  const taraResult = computeTara(janmaNakIdx, todayNakIdx);
  const taraScore: number = taraResult.number;
  const taraName: string = taraResult.name;

  // ── 6. Combined verdict ──────────────────────────────────────────────────
  let combinedVerdict: "PROCEED" | "WAIT" | "AVOID";

  if (kpVerdict === "DENIED") {
    combinedVerdict = "AVOID";
  } else if (rahuActive) {
    combinedVerdict = "WAIT";
  } else if (TARA_MALEFIC.has(taraScore)) {
    // Tarabala bad: downgrade PROCEED to WAIT, keep NEUTRAL as WAIT
    combinedVerdict = "WAIT";
  } else if (kpVerdict === "PROMISED") {
    combinedVerdict = "PROCEED";
  } else {
    // NEUTRAL KP + no critical obstacles
    combinedVerdict = horaQuality === "BAD" ? "WAIT" : "PROCEED";
  }

  // ── 7. Build plain reasoning ─────────────────────────────────────────────
  const reasoning = buildPlainReasoning({
    activityLabel,
    slug,
    kpVerdict,
    kpDetails: `Cusp sub-lord ${primaryVerdict.cuspSubLord}; favourable houses ${primaryVerdict.favorableCount}, unfavourable ${primaryVerdict.unfavorableCount}.`,
    isRahuKaal: rahuActive,
    rahuKaalEndTime,
    taraScore,
    taraName,
    horaLord,
    horaQuality,
    combinedVerdict,
  });

  // ── 8. Log to query_logs ─────────────────────────────────────────────────
  try {
    await env.DB.prepare(
      // Columns must match the live query_logs schema (migration 0005).
      // The question text itself is not stored.
      `INSERT INTO query_logs (user_id, kundali_id, query_type, points_charged)
       VALUES (?, ?, 'kp_query_natural', ?)`
    )
      .bind(auth.userId, kundali_id, KP_QUERY_COST)
      .run();
  } catch {
    // Non-fatal: continue even if logging fails
  }

  // ── 9. Response ──────────────────────────────────────────────────────────
  return json({
    // Intent detection
    intent: {
      question,
      slug,
      label: activityLabel,
      confidence,
      detectedTerms,
      otherMatches: allMatches.slice(1, 4),
    },

    // Combined verdict (top-level for UI)
    combinedVerdict,
    reasoningHindi: reasoning.hi,
    reasoningEnglish: reasoning.en,

    // KP layer
    kp: {
      verdict: kpVerdict,
      houses: mapping.houses,
      houseVerdicts,
      dashaChecks,
      ayanamsaCaveat: DEFAULT_AYANAMSA_CAVEAT,
    },

    // Today's Panchang layer
    panchang: {
      vara,
      hora: {
        lord: horaLord,
        quality: horaQuality,
        horaWindows: horaWindows.map((h) => ({
          lord: h.lord,
          from: h.start.toISOString(),
          to: h.end.toISOString(),
        })),
      },
      rahuKaal: {
        active: rahuActive,
        window: rahuKaalWindow
          ? {
              from: rahuKaalWindow.start.toISOString(),
              to: rahuKaalWindow.end.toISOString(),
            }
          : null,
        endTime: rahuKaalEndTime,
      },
      tarabala: {
        janmaNakshatra: janmaNakName,
        todayNakshatra: todayNakName,
        taraScore,
        taraName,
        isBenefic: TARA_BENEFIC.has(taraScore),
      },
    },

    // Timestamp
    queryTime: now.toISOString(),
  });
}
