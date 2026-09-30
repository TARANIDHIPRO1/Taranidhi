// GET /muhurta/professional -- dual-layer professional muhurta scoring for 59 life categories
//
// Dual-layer architecture:
//   Layer 1 (Universal, 40%): No kundali needed -- Hora, Nakshatra, Tithi, Panchaka, Ganda Moola
//   Layer 2 (Personal, 60%): Kundali-based adjustments (Tara, Dasha, Gochar, Ashtakwarga)
//
// Source: MUHURTA_PROFESSIONAL_SPECIFICATION.md (committed fd9636e)
// Library: worker/src/lib/professionalMuhurta.ts
//
// Billing: same as /muhurta/now -- 1 point for basic tier, free for premium/ultra.
// This is NOT a KP query; it is a "professional_muhurta" query_type in query_logs.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import {
  trueSiderealLongitude,
  realSunriseSunset,
  julianDayFromUtc,
  buildRealChart,
  getCurrentDasha,
  getNavamshaLord,
  NAKSHATRA_NAMES,
} from "../lib/astro";
import {
  buildHoraWindows,
  getActiveHora,
  buildUphoras,
  getActiveUphora,
  getRahuKaal,
  isWithinRahuKaal,
  computeTara,
  getPanchakaDosha,
  getGandaMoola,
  getDishashool,
  getTithi,
  isVishtiKarana,
  getYamghanda,
  getGulikaKaal,
  isDurmuhurta,
} from "../lib/muhurta";
import { computeChandrashtakavarga } from "../lib/ashtakwarga";
import {
  type ProfessionalCategory,
  type UniversalParams,
  type PersonalParams,
  scoreProfessionalMuhurta,
} from "../lib/professionalMuhurta";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

const PROFESSIONAL_MUHURTA_COST = 1;
const UNLIMITED_TIERS = new Set(["premium", "ultra"]);

// All valid professional categories (59 total across 7 domains)
const VALID_CATEGORIES = new Set<ProfessionalCategory>([
  // Sampatti (Property)
  "sampatti-bhumi-kharid",
  "sampatti-bhumi-puja",
  "sampatti-griha-pravesh",
  "sampatti-registry",
  "sampatti-construction-start",
  "sampatti-interior-work",
  "sampatti-office-shop-start",
  "sampatti-flat-booking",
  // Vyapar (Business)
  "vyapar-dukan-khol",
  "vyapar-naya-vyapar",
  "vyapar-ecommerce-start",
  "vyapar-partnership-start",
  "vyapar-trade-agreement",
  "vyapar-wholesale-start",
  "vyapar-expansion",
  "vyapar-franchise-license",
  // Dhan (Finance)
  "dhan-sona-kharid",
  "dhan-bank-account",
  "dhan-loan-lena",
  "dhan-loan-dana",
  "dhan-stock-mutual",
  "dhan-share-trading",
  "dhan-insurance",
  "dhan-cryptocurrency",
  "dhan-property-tax",
  "dhan-salary-negotiation",
  // Career
  "career-govt-job",
  "career-interview",
  "career-promotion",
  "career-resignation",
  "career-teaching-start",
  "career-admin-start",
  "career-tech-job",
  "career-promotion-interview",
  "career-relocation-for-job",
  "career-freelance-start",
  // Vivah (Marriage)
  "vivah-engagement",
  "vivah-mehendi",
  "vivah-wedding-day",
  "vivah-vivah-muhurta",
  "vivah-reception",
  "vivah-honeymoon-start",
  "vivah-wedding-agreement",
  "vivah-first-night",
  // Samjhauta (Agreements)
  "samjhauta-kundali-milan",
  "samjhauta-partnership-deed",
  "samjhauta-sale-deed",
  "samjhauta-rental-agreement",
  "samjhauta-employment-contract",
  "samjhauta-loan-agreement",
  "samjhauta-will-signing",
  "samjhauta-power-of-attorney",
  "samjhauta-insurance-policy",
  "samjhauta-shareholders-pact",
  // Chikitsa (Medical)
  "chikitsa-surgery",
  "chikitsa-hospital-admission",
  "chikitsa-medicine-start",
  "chikitsa-doctor-appointment",
  "chikitsa-chemotherapy",
  "chikitsa-physiotherapy",
  "chikitsa-vaccination",
  "chikitsa-dental-work",
  "chikitsa-ayurvedic-treatment",
]);

export async function handleMuhurtaProfessional(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const now = new Date();
  const url = new URL(request.url);

  // Input validation
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const categoryParam = url.searchParams.get("category");
  const kundaliIdParam = url.searchParams.get("kundali_id");

  const lat = latParam !== null ? Number(latParam) : NaN;
  const lon = lonParam !== null ? Number(lonParam) : NaN;

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return errorJson("lat query param is required and must be between -90 and 90.", 400, "INVALID_LAT");
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return errorJson("lon query param is required and must be between -180 and 180.", 400, "INVALID_LON");
  }
  if (!categoryParam) {
    return errorJson(
      `category is required. Valid categories: ${[...VALID_CATEGORIES].join(", ")}`,
      400,
      "MISSING_CATEGORY"
    );
  }
  if (!VALID_CATEGORIES.has(categoryParam as ProfessionalCategory)) {
    return errorJson(
      `Invalid category '${categoryParam}'. Valid categories: ${[...VALID_CATEGORIES].join(", ")}`,
      400,
      "INVALID_CATEGORY"
    );
  }
  const category = categoryParam as ProfessionalCategory;

  // Kundali lookup (optional -- personal layer only activates if provided)
  let kundaliId: number | null = null;
  let janmaNakIdx: number | null = null;
  let natalMoonRashi: number | null = null;
  let mahadashLord: string | null = null;
  let antardashLord: string | null = null;
  let navamshaHouseLord: string | null = null;
  // natalChartRef held here so ashtakwarga can use it after astronomical calculations below
  let natalChartRef: ReturnType<typeof buildRealChart> | null = null;

  if (kundaliIdParam !== null) {
    kundaliId = Number(kundaliIdParam);
    if (!Number.isInteger(kundaliId)) {
      return errorJson("kundali_id must be an integer.", 400, "INVALID_KUNDALI_ID");
    }
    // Scoped to caller's own kundali -- never allow cross-user scoring.
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
    janmaNakIdx = row.janma_nakshatra_idx;

    // Rebuild natal chart on-demand (same approach as /muhurta/now).
    // We need natal Moon rashi for Chandrabala + Dasha for Dasha-Gate +
    // natal Moon degree for Navamsha + full chart for Chandrashtakavarga.
    const birthUtc = new Date(row.birth_date);
    if (!Number.isNaN(birthUtc.getTime())) {
      const natalChart = buildRealChart(birthUtc, row.latitude, row.longitude);
      natalChartRef = natalChart;
      const natalMoon = natalChart.planets.find((p) => p.planet === "Moon");
      if (natalMoon) {
        natalMoonRashi = natalMoon.rashi;
        // Navamsha lord of natal Moon -- used in personal layer scoring.
        // deg is the full sidereal ecliptic longitude (not just degInSign).
        navamshaHouseLord = getNavamshaLord(natalMoon.deg);
      }
      const dasha = getCurrentDasha(natalChart, now);
      mahadashLord = dasha?.maha.lord ?? null;
      antardashLord = dasha?.antar.lord ?? null;
    }
  }

  // Billing -- AFTER validation, BEFORE computation (matches /muhurta/now pattern)
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();
  if (!user) return errorJson("User not found.", 404, "USER_NOT_FOUND");

  const isUnlimitedTier = UNLIMITED_TIERS.has(user.tier);
  if (!isUnlimitedTier) {
    try {
      await debitWallet(env, auth.userId, PROFESSIONAL_MUHURTA_COST, "query");
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

  // ── Astronomical Calculations ──
  const { sunrise, sunset, nextSunrise } = realSunriseSunset(now, lat, lon);
  const horaWindows = buildHoraWindows(sunrise, sunset, nextSunrise, now);
  const activeHora = getActiveHora(horaWindows, now);
  const activeUphora = activeHora ? getActiveUphora(buildUphoras(activeHora), now) : null;

  const rahuKaal = getRahuKaal(sunrise, sunset, now.getUTCDay());
  const inRahuKaal = isWithinRahuKaal(now, rahuKaal);

  const jd = julianDayFromUtc(now);
  const moonLon = trueSiderealLongitude("Moon", jd);
  const sunLon = trueSiderealLongitude("Sun", jd);
  const currentNakIdx = Math.floor(moonLon / (360 / 27));
  const currentNakDeg = moonLon % (360 / 27);
  const currentMoonRashi = Math.floor(moonLon / 30);
  const dow = now.getUTCDay();

  // Panchaka / Ganda Moola / Dishashool
  const panchaka = getPanchakaDosha(currentNakIdx, currentNakDeg, dow);
  const gandaMoola = getGandaMoola(currentNakIdx);
  const dishashool = getDishashool(dow);

  // Tara (personal, requires kundali)
  let tara: { number: number; name: string; beneficence: "benefic" | "neutral" | "malefic" } | null = null;
  if (janmaNakIdx !== null) {
    tara = computeTara(janmaNakIdx, currentNakIdx);
  }

  // ── Tithi / Karana / Muhurta dosha calculations ──
  const currentTithi = getTithi(moonLon, sunLon);
  const inVishtiKarana = isVishtiKarana(moonLon, sunLon);
  const yamghanda = getYamghanda(sunrise, sunset, dow);
  const inYamghanda = now.getTime() >= yamghanda.start.getTime() && now.getTime() < yamghanda.end.getTime();
  const gulikaKaal = getGulikaKaal(sunrise, sunset, dow);
  const inGulikaKaal = now.getTime() >= gulikaKaal.start.getTime() && now.getTime() < gulikaKaal.end.getTime();
  const inDurmuhurta = isDurmuhurta(sunrise, sunset, dow, now);

  // ── Ashtakwarga (requires full natal chart) ──
  let ashtakwargaBindu: number | null = null;
  if (natalChartRef !== null) {
    ashtakwargaBindu = computeChandrashtakavarga(natalChartRef, currentMoonRashi);
  }

  // ── Universal Params (Layer 1) ──
  const universalParams: UniversalParams = {
    activeHora: activeHora?.lord ?? null,
    currentNakIndex: currentNakIdx,
    currentTithi,
    inRahuKaal,
    inYamghanda,
    inGulikaKaal,
    inDurmuhurta,
    inVishtiKarana,
    panchakaActive: panchaka.active && !panchaka.auspicious,
  };

  // ── Personal Params (Layer 2) ──
  const personalParams: PersonalParams = {
    kundaliId,
    janmaNakIndex: janmaNakIdx,
    taraNumber: tara?.number ?? null,
    taraBeneficence: tara?.beneficence ?? null,
    mahadashLord,
    antardashLord,
    natalMoonRashi,
    currentMoonRashi,
    ashtakwargaBindu,
    navamshaHouseLord,
  };

  // ── Professional Scoring ──
  const result = scoreProfessionalMuhurta(category, universalParams, personalParams, now.toISOString().split("T")[0]!, {
    lat,
    lon,
  });

  // ── Query Log ──
  await env.DB.prepare(
    `INSERT INTO query_logs (user_id, kundali_id, query_type, muhurta_pct, points_charged)
     VALUES (?, ?, 'professional_muhurta', ?, ?)`
  )
    .bind(auth.userId, kundaliId, result.finalScore, isUnlimitedTier ? 0 : PROFESSIONAL_MUHURTA_COST)
    .run();

  // ── Response ──
  return json({
    as_of: now.toISOString(),
    location: { lat, lon },
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),

    // Category metadata
    category: result.category,
    category_domain: result.categoryDomain,
    category_name: result.categoryName,

    // Active astronomical state
    active_hora: activeHora
      ? { lord: activeHora.lord, start: activeHora.start.toISOString(), end: activeHora.end.toISOString() }
      : null,
    active_uphora: activeUphora
      ? { sub: activeUphora.sub, start: activeUphora.start.toISOString(), end: activeUphora.end.toISOString() }
      : null,
    rahu_kaal: {
      start: rahuKaal.start.toISOString(),
      end: rahuKaal.end.toISOString(),
      active_now: inRahuKaal,
    },
    current_nakshatra: {
      idx: currentNakIdx,
      name: NAKSHATRA_NAMES[currentNakIdx],
    },
    tara,
    panchaka_dosha: panchaka,
    ganda_moola: gandaMoola,
    dishashool,

    // Professional scoring result
    scoring: {
      final_score: result.finalScore,
      verdict: result.verdict,
      verdict_emoji: result.verdictEmoji,
      recommendation: result.recommendation,
      methodology: result.methodology,
      personalized: kundaliId !== null,

      universal_layer: {
        weight_pct: result.methodology.universalWeight,
        score_pct: result.universalScore.percentage,
        points_earned: result.universalScore.totalPoints,
        points_max: result.universalScore.maxPoints,
        criteria: result.universalScore.criteria,
      },

      personal_layer:
        result.personalAdjustment !== null
          ? {
              weight_pct: result.methodology.personalWeight,
              adjustments: result.personalAdjustment,
              total_adjustment: result.personalAdjustment.totalPersonalAdjustment,
            }
          : {
              weight_pct: result.methodology.personalWeight,
              note: "No kundali provided. Add ?kundali_id= for personalized 60% scoring.",
              adjustments: null,
              total_adjustment: 0,
            },
    },

    // Dasha context (if kundali was provided)
    dasha:
      mahadashLord !== null
        ? {
            maha_lord: mahadashLord,
            antar_lord: antardashLord,
          }
        : null,
  });
}
