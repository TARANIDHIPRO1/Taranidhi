// GET /muhurta/commercial -- Commercial Activity Muhurta with Classical Verification
//
// Specialized endpoint for 15 commercial activities + marriage (Vivah).
// Each activity configured with verified classical rules from Muhurta Chintamani, BPHS.
//
// SPECIFICATION: commercialMuhurta.ts (verified 2026-10-12 against TARANIDHI eBook)
// SOURCES: Muhurta Chintamani, Brihat Parashara Hora Shastra, Panchanga texts
//
// Returns:
// - Preferred Tithis (Lunar days) with Panchang class
// - Preferred Varas (Weekdays)
// - Best Nakshatras (27 stars) with classification
// - Yoga preferences (27 Nitya Yogas)
// - Hora preferences (24 planetary hours)
// - Tarabala requirements (9-point Nakshatra relationship)
// - Chandrabala validation (Moon strength)
// - Hard blocks (Vyatipata, Vaidhriti, combustion, Rahu Kaal, Amavasya)
// - Classical source verses
//
// Billing: 1 point for Basic tier, free for Premium/Ultra.
// Query type: "commercial_muhurta"

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { json, errorJson } from "../lib/response";
import {
  COMMERCIAL_ACTIVITIES,
  isSiddha,
  validateChandrabala,
  calculateTarabala,
  isDagdhaTithiVara,
} from "../lib/commercialMuhurta";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

const COMMERCIAL_LOOKUP_COST = 1;
const UNLIMITED_TIERS = new Set(["premium", "ultra"]);

export interface CommercialMuhurtaResponse {
  activity: {
    id: string;
    name: string;
    description: string;
  };
  rules: {
    preferredTithis: number[];
    forbiddenTithis: number[];
    preferredVaras: number[];
    forbiddenVaras: number[];
    bestNakshatras: number[];
    forbiddenNakshatras: number[];
    preferredYogas: number[];
    forbiddenYogas: number[];
    preferredHoraLords: string[];
    tarabalaMust: number[];
    tarabalaAvoid: number[];
    requireStrongChandrabala: boolean;
    hardBlocks: {
      vyatipata: boolean;
      vaidhriti: boolean;
      amavasya: boolean;
      rahuKaal: boolean;
      combustion: { venus: boolean; jupiter: boolean };
    };
  };
  recommendations: string[];
  source: {
    verse: string;
    text: string;
    verification: string;
  };
}

export async function handleMuhurtaCommercial(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const url = new URL(request.url);
  const activityId = url.searchParams.get("activity");
  const kundaliIdParam = url.searchParams.get("kundali_id");

  // Validate activity
  if (!activityId || !COMMERCIAL_ACTIVITIES[activityId]) {
    return errorJson(
      `activity is required and must be one of: ${Object.keys(COMMERCIAL_ACTIVITIES).join(", ")}`,
      400,
      "INVALID_ACTIVITY"
    );
  }

  const activity = COMMERCIAL_ACTIVITIES[activityId]!;

  // Check user tier for billing
  const user = await env.DB.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(auth.userId)
    .first<{ tier: string }>();

  if (!user) {
    return errorJson("User not found.", 404, "NOT_FOUND");
  }

  // Debit wallet if not premium/ultra
  if (!UNLIMITED_TIERS.has(user.tier)) {
    try {
      await debitWallet(env, auth.userId, COMMERCIAL_LOOKUP_COST, "commercial_muhurta");
    } catch (e) {
      if (e instanceof InsufficientBalanceError) {
        return errorJson("Insufficient wallet balance.", 402, "INSUFFICIENT_BALANCE");
      }
      throw e;
    }
  }

  // Build response
  const response: CommercialMuhurtaResponse = {
    activity: {
      id: activity.id,
      name: activity.name,
      description: activity.description,
    },
    rules: {
      preferredTithis: activity.preferredTithis,
      forbiddenTithis: activity.forbiddenTithis,
      preferredVaras: activity.preferredVaras,
      forbiddenVaras: activity.forbiddenVaras,
      bestNakshatras: activity.bestNakshatras,
      forbiddenNakshatras: activity.forbiddenNakshatras,
      preferredYogas: activity.preferredYogas,
      forbiddenYogas: activity.forbiddenYogas,
      preferredHoraLords: activity.preferredHoraLords,
      tarabalaMust: activity.tarabalaMust,
      tarabalaAvoid: activity.tarabalaAvoid,
      requireStrongChandrabala: activity.requireStrongChandrabala,
      hardBlocks: activity.hardBlocks,
    },
    recommendations: [
      "1. Eliminate absolute hard blocks first (Vyatipata, Vaidhriti, combustion, Rahu Kaal, Amavasya)",
      "2. Check Tarabala & Chandrabala for native(s)",
      "3. Select supportive Nakshatra for activity type",
      "4. Prefer auspicious Yoga, Tithi, and Vara",
      "5. Confirm Lagna is strong and free from major afflictions",
      "6. Use Hora as final polish",
    ],
    source: activity.source,
  };

  return json(response);
}
