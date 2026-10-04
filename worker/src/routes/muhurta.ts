// GET /muhurta/now -- current Hora/Uphora/Rahu-Kaal for a location, with
// personalized Tarabala-gated scoring when a saved kundali_id is given.
//
// This is the first real consumer of lib/muhurta.ts + lib/horaScoring.ts
// (ported from the verified TaraNidhi Floot prototype) inside the Worker,
// per ARCHITECTURE.md Section 8: scoring must run server-side, never on the
// client. It now supplies all 5 of horaScoring.ts's implemented layers
// (Purpose, Functional-Nature, Dasha-Gate, Tarabala, Chandrabala) when a
// kundali_id is given, rebuilding the natal chart on-demand via
// buildRealChart() to get the natal Moon rashi + Vimshottari Dasha -- see
// lib/horaScoring.ts header for why "Lagna-Gate" (the 6th, undefined layer)
// is deliberately NOT included.
//
// Billing (ARCHITECTURE.md Section 5, "General lookups" row): Basic tier is
// pay-per-use at 1 point/query; Premium/Ultra are unlimited. This is a
// "general_lookup" query_type in query_logs terms (Section 2, step 8), NOT
// a "kp_query_window" -- this endpoint is the Muhurta/Hora side, not the KP
// Horary side (that's a separate not-yet-built module, also pay-per-use for
// everyone per Section 5's KP row). Basic-tier debit failure (insufficient
// balance) returns 402, matching how a real payment-required flow should
// read on the wire.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { trueSiderealLongitude, realSunriseSunset, julianDayFromUtc, buildRealChart, getCurrentDasha, getCombustion, NAKSHATRA_NAMES } from "../lib/astro";
import {
  buildHoraWindows,
  getActiveHora,
  getHoraNumber,
  getHoraQuality,
  getNextHora,
  getNextGoodHora,
  HORA_NATURE,
  buildUphoras,
  getActiveUphora,
  getRahuKaal,
  isWithinRahuKaal,
  computeTara,
  getPanchakaDosha,
  getGandaMoola,
  getDishashool,
  getTithi,
  getTithiType,
  getKshayaVridhi,
  getNityaYoga,
  getKarana,
  getNakshatraNature,
  getAbhijitMuhurta,
  getAmritSiddhiYoga,
  getSarvarthaSiddhiYoga,
  getMasaPaksha,
  isVishtiKarana,
  getYamghanda,
  getGulikaKaal,
  isDurmuhurta,
} from "../lib/muhurta";
import { getPakshiAtTime, scorePakshiFavorability } from "../lib/panchaPakshi";
import { scoreHora, type LagnaOnlyChart, type DashaContext, type ChandrabalaContext } from "../lib/horaScoring";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

const GENERAL_LOOKUP_COST = 1;
const UNLIMITED_TIERS = new Set(["premium", "ultra"]);

export async function handleMuhurtaNow(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const now = new Date();

  const url = new URL(request.url);
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const purpose = url.searchParams.get("purpose") ?? "general";
  const kundaliIdParam = url.searchParams.get("kundali_id");

  const lat = latParam !== null ? Number(latParam) : NaN;
  const lon = lonParam !== null ? Number(lonParam) : NaN;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return errorJson("lat query param is required and must be between -90 and 90.", 400, "INVALID_LAT");
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return errorJson("lon query param is required and must be between -180 and 180.", 400, "INVALID_LON");
  }

  let lagnaOnlyChart: LagnaOnlyChart | null = null;
  let janmaNakIdx: number | null = null;
  let kundaliId: number | null = null;
  let dashaContext: DashaContext | null = null;
  let chandrabalaContext: ChandrabalaContext | null = null;

  if (kundaliIdParam !== null) {
    kundaliId = Number(kundaliIdParam);
    if (!Number.isInteger(kundaliId)) {
      return errorJson("kundali_id must be an integer.", 400, "INVALID_KUNDALI_ID");
    }
    // Scoped to the caller's own kundali -- never let one user personalize a
    // score using another user's saved birth data.
    const row = await env.DB.prepare(
      `SELECT lagna_rashi_idx, janma_nakshatra_idx, birth_date, latitude, longitude
       FROM kundalis WHERE id = ? AND user_id = ?`
    )
      .bind(kundaliId, auth.userId)
      .first<{
        lagna_rashi_idx: number | null;
        janma_nakshatra_idx: number | null;
        birth_date: string;
        latitude: number;
        longitude: number;
      }>();
    if (!row) {
      return errorJson("Kundali not found for this account.", 404, "KUNDALI_NOT_FOUND");
    }
    if (row.lagna_rashi_idx !== null) lagnaOnlyChart = { lagnaRashi: row.lagna_rashi_idx };
    janmaNakIdx = row.janma_nakshatra_idx;

    // Rebuild the natal chart on-demand from stored birth data to get the
    // natal Moon rashi (Chandrabala-Gate) and Vimshottari Dasha (Dasha-Gate).
    // Neither is stored as its own column -- see lib/horaScoring.ts /
    // lib/astro.ts headers for why recomputing here (instead of adding new
    // schema columns) was the chosen approach: it reuses the same
    // already-verified buildRealChart() as kundali creation, so there's only
    // one place natal-chart math can go wrong, not two.
    const birthUtc = new Date(row.birth_date);
    if (!Number.isNaN(birthUtc.getTime())) {
      const natalChart = buildRealChart(birthUtc, row.latitude, row.longitude);
      const natalMoon = natalChart.planets.find((p) => p.planet === "Moon");
      if (natalMoon) {
        // currentMoonRashi filled in below once moonLon is computed.
        chandrabalaContext = { natalMoonRashi: natalMoon.rashi, currentMoonRashi: -1 };
      }
      const dasha = getCurrentDasha(natalChart, now);
      dashaContext = { mahaLord: dasha?.maha.lord ?? null, antarLord: dasha?.antar.lord ?? null };
    }
  }

  // Tier + billing check, AFTER all input validation -- a request that would
  // fail validation anyway (bad lat/lon, a kundali_id that isn't the
  // caller's) must never charge a point first.
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");

  const isUnlimitedTier = UNLIMITED_TIERS.has(user.tier);
  if (!isUnlimitedTier) {
    try {
      await debitWallet(env, auth.userId, GENERAL_LOOKUP_COST, "query");
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return errorJson(
          `Insufficient points balance (have ${err.available}, need ${err.requested}). Top up or upgrade your tier.`,
          402,
          "INSUFFICIENT_BALANCE"
        );
      }
      throw err;
    }
  }

  const { sunrise, sunset, nextSunrise } = realSunriseSunset(now, lat, lon);
  const horaWindows = buildHoraWindows(sunrise, sunset, nextSunrise, now);
  const activeHora = getActiveHora(horaWindows, now);
  const horaNumber = getHoraNumber(horaWindows, activeHora);
  const horaQuality = activeHora ? getHoraQuality(activeHora.lord, purpose) : null;
  const nextHora = getNextHora(horaWindows, now);
  const nextGoodHora = getNextGoodHora(horaWindows, now, purpose);
  const activeUphora = activeHora ? getActiveUphora(buildUphoras(activeHora), now) : null;

  const rahuKaal = getRahuKaal(sunrise, sunset, now.getUTCDay());
  const inRahuKaal = isWithinRahuKaal(now, rahuKaal);

  const jd = julianDayFromUtc(now);
  const moonLon = trueSiderealLongitude("Moon", jd);
  const currentNakIdx = Math.floor(moonLon / (360 / 27));
  const currentNakDeg = moonLon % (360 / 27);

  if (chandrabalaContext) {
    chandrabalaContext = { ...chandrabalaContext, currentMoonRashi: Math.floor(moonLon / 30) };
  }

  let tara: { number: number; name: string; beneficence: "benefic" | "neutral" | "malefic" } | null = null;
  if (janmaNakIdx !== null) {
    tara = computeTara(janmaNakIdx, currentNakIdx);
  }

  // Panchaka Dosha / Ganda Moola / Dishashool -- ARCHITECTURE.md Section 4.
  // All three are general (not personalized to a kundali) checks based on
  // the current moment's nakshatra/weekday, so they run unconditionally.
  // See lib/muhurta.ts for the sourcing caveats on the weekday-name tables.
  const panchaka = getPanchakaDosha(currentNakIdx, currentNakDeg, now.getUTCDay());
  const gandaMoola = getGandaMoola(currentNakIdx);
  const dishashool = getDishashool(now.getUTCDay());

  // Combustion -- ARCHITECTURE.md Section 4: checked for Venus and Jupiter
  // specifically, since those are the two planets it names as governing
  // sanskaras (marriage, upanayan, etc.) that combustion classically
  // prohibits. Other planets' combustion states aren't part of that
  // documented rule, so they're not computed here.
  const venusCombustion = getCombustion("Venus", jd);
  const jupiterCombustion = getCombustion("Jupiter", jd);

  // ── Tithi / Karana / Muhurta dosha + Full Panchang Phase 2 ──
  // Computed here so /muhurta/now exposes the complete Panchang picture.
  // All functions implemented and verified in lib/muhurta.ts (Oct 4, 2026).
  const sunLon = trueSiderealLongitude("Sun", jd);
  const currentTithi = getTithi(moonLon, sunLon);

  // Phase 2: Full Panchang (Tithi Type, Yoga, Karana, Nakshatra Nature, Special Yogas, Masa)
  const tithiType = getTithiType(currentTithi);

  // Kshaya/Vridhi: compute tithi at NEXT sunrise to detect anomalies
  const jdNextSunrise = julianDayFromUtc(nextSunrise);
  const moonLonNextSunrise = trueSiderealLongitude("Moon", jdNextSunrise);
  const sunLonNextSunrise = trueSiderealLongitude("Sun", jdNextSunrise);
  const tithiAtNextSunrise = getTithi(moonLonNextSunrise, sunLonNextSunrise);
  const kshayaVridhi = getKshayaVridhi(currentTithi, tithiAtNextSunrise);

  const nityaYoga = getNityaYoga(sunLon, moonLon);
  const karana = getKarana(moonLon, sunLon);
  const nakshatraNature = getNakshatraNature(currentNakIdx);
  const abhijitMuhurta = getAbhijitMuhurta(sunrise, sunset, now, now.getUTCDay());
  const amritSiddhiYoga = getAmritSiddhiYoga(currentNakIdx, now.getUTCDay());
  const sarvarthaSiddhiYoga = getSarvarthaSiddhiYoga(currentNakIdx, now.getUTCDay());
  const masaPaksha = getMasaPaksha(sunLon, currentTithi);

  // Legacy Vishti-only check (kept for backward compat; karana.name === "Vishti" is equivalent)
  const inVishtiKarana = isVishtiKarana(moonLon, sunLon);
  const yamghanda = getYamghanda(sunrise, sunset, now.getUTCDay());
  const inYamghanda = now.getTime() >= yamghanda.start.getTime() && now.getTime() < yamghanda.end.getTime();
  const gulikaKaal = getGulikaKaal(sunrise, sunset, now.getUTCDay());
  const inGulikaKaal = now.getTime() >= gulikaKaal.start.getTime() && now.getTime() < gulikaKaal.end.getTime();
  const inDurmuhurta = isDurmuhurta(sunrise, sunset, now.getUTCDay(), now);

  // Pancha Pakshi (5-bird cycles) -- real yama timing wired to sunrise/sunset.
  // Bird is personalized only when kundali nakshatra is known; timing is accurate
  // for all users now that sunrise/sunset are passed in.
  const pakshi = getPakshiAtTime(now, "STANDARD", { sunriseTime: sunrise, sunsetTime: sunset });
  const pakshiScore = scorePakshiFavorability(now, "STANDARD");

  let score: ReturnType<typeof scoreHora> | null = null;
  if (activeHora) {
    score = scoreHora(
      activeHora.lord,
      purpose,
      lagnaOnlyChart,
      janmaNakIdx,
      currentNakIdx,
      currentNakDeg,
      dashaContext,
      chandrabalaContext
    );
  }

  // Query log -- per ARCHITECTURE.md Section 2 step 8 ("Query + result are
  // logged to D1") and Section 8 (this table is also the substrate for
  // future API-scraping rate-limit checks). Fire-and-forget-safe: logging
  // failure should not fail an otherwise-successful, already-billed request,
  // but is still awaited here so a D1 outage surfaces as a real error rather
  // than a silently-lost log line -- revisit if this ever needs to be
  // decoupled from the request's latency budget.
  await env.DB.prepare(
    `INSERT INTO query_logs (user_id, kundali_id, query_type, muhurta_pct, points_charged)
     VALUES (?, ?, 'general_lookup', ?, ?)`
  )
    .bind(auth.userId, kundaliId, score?.score ?? null, isUnlimitedTier ? 0 : GENERAL_LOOKUP_COST)
    .run();

  return json({
    as_of: now.toISOString(),
    location: { lat, lon },
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    active_hora: activeHora
      ? {
          lord: activeHora.lord,
          hora_number: horaNumber,        // 1-24 within the day
          start: activeHora.start.toISOString(),
          end: activeHora.end.toISOString(),
          is_daytime: activeHora.isDaytime,
          quality: horaQuality,            // nature + purpose recommendation
        }
      : null,
    next_hora: nextHora
      ? {
          lord: nextHora.lord,
          starts_at: nextHora.start.toISOString(),
          ends_at: nextHora.end.toISOString(),
          is_daytime: nextHora.isDaytime,
          quality: getHoraQuality(nextHora.lord, purpose),
        }
      : null,
    next_good_hora: nextGoodHora
      ? {
          lord: nextGoodHora.lord,
          starts_at: nextGoodHora.start.toISOString(),
          ends_at: nextGoodHora.end.toISOString(),
          is_daytime: nextGoodHora.isDaytime,
          quality: nextGoodHora.quality,
        }
      : null,
    all_horas: horaWindows.map((w, i) => ({
      hora_number: i + 1,
      lord: w.lord,
      start: w.start.toISOString(),
      end: w.end.toISOString(),
      is_daytime: w.isDaytime,
      nature: HORA_NATURE[w.lord] ?? "neutral",
    })),
    active_uphora: activeUphora
      ? { sub: activeUphora.sub, start: activeUphora.start.toISOString(), end: activeUphora.end.toISOString() }
      : null,
    pancha_pakshi: {
      bird: pakshi.bird,
      yama_number: pakshi.yamaNumber,
      is_daytime: pakshi.isDayTime,
      confidence: pakshi.confidence,
      cycle_start: pakshi.startTime.toISOString(),
      cycle_end: pakshi.endTime.toISOString(),
      precision_minutes: pakshi.precisionMinutes,
      favorability_score: pakshiScore,
      note: pakshi.note,
    },
    rahu_kaal: { start: rahuKaal.start.toISOString(), end: rahuKaal.end.toISOString(), active_now: inRahuKaal },
    current_nakshatra: { idx: currentNakIdx, name: NAKSHATRA_NAMES[currentNakIdx] },
    tara,
    panchaka_dosha: panchaka,
    ganda_moola: gandaMoola,
    dishashool,
    combustion: { venus: venusCombustion, jupiter: jupiterCombustion },

    // ── Complete Panchang panel (Phase 1 + Phase 2, 100% coverage) ──
    tithi: {
      number: currentTithi,
      type: tithiType.type,
      auspicious: tithiType.auspicious,
      activities: tithiType.activities,
      note: tithiType.note,
    },
    kshaya_vridhi: kshayaVridhi,
    nitya_yoga: nityaYoga,
    karana,
    nakshatra_nature: nakshatraNature,
    masa_paksha: masaPaksha,
    abhijit_muhurta: {
      start: abhijitMuhurta.start.toISOString(),
      end: abhijitMuhurta.end.toISOString(),
      active_now: abhijitMuhurta.isActive,
      note: abhijitMuhurta.note,
    },
    amrit_siddhi_yoga: amritSiddhiYoga,
    sarvartha_siddhi_yoga: sarvarthaSiddhiYoga,
    // Legacy dosha fields retained for backward compatibility
    vishti_karana: { active: inVishtiKarana, note: inVishtiKarana ? "Vishti (Bhadra) Karana active -- avoid auspicious work" : "No Vishti Karana" },
    yamghanda_kaal: { start: yamghanda.start.toISOString(), end: yamghanda.end.toISOString(), active_now: inYamghanda },
    gulika_kaal: { start: gulikaKaal.start.toISOString(), end: gulikaKaal.end.toISOString(), active_now: inGulikaKaal },
    durmuhurta: { active: inDurmuhurta, note: inDurmuhurta ? "Durmuhurta active -- avoid starting new work" : "No Durmuhurta" },

    score,
    personalized: lagnaOnlyChart !== null || janmaNakIdx !== null,
  });
}
