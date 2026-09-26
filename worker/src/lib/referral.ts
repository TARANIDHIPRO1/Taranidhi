// Referral system -- single-level only, per ARCHITECTURE.md Section 7's
// "Final Locked Rules." Re-read that section before touching this file: two
// specific lines must never be crossed to stay in the legal safe zone
// (Amway v. Union of India test) --
//   1. Never introduce a second commission tier (referrer-of-a-referrer).
//   2. Never require a purchase to become eligible to refer.
//
// Two business numbers are NOT finalized in the architecture doc and are
// therefore config-gated here rather than guessed:
//   - REFERRAL_COMMISSION_POINTS: how many points a commission is worth.
//     Not specified anywhere in ARCHITECTURE.md. Commission grants are
//     SKIPPED (order still completes normally) if this isn't set, with a
//     clear flag in the response so it's visible, not silently dropped.
//   - REFERRAL_HOLDING_DAYS: chargeback holding period before a commission
//     becomes spendable. Section 7 proposes 15 as a DEFAULT, explicitly
//     "not yet finally confirmed" -- used here as a real default (unlike the
//     points-to-paise rate, which has no proposed number at all), but still
//     overridable via env var once confirmed.

export interface Env {
  DB: D1Database;
  REFERRAL_COMMISSION_POINTS?: string;
  REFERRAL_HOLDING_DAYS?: string;
}

const DEFAULT_HOLDING_DAYS = 15; // ARCHITECTURE.md Section 7's own proposed default, not yet finally confirmed.

function generateReferralCode(): string {
  // Cryptographically random, NOT sequential -- ARCHITECTURE.md Section 8's
  // "Referral-code hijacking / attribution theft" row requires this.
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").toUpperCase().slice(0, 8);
}

export async function getOrCreateReferralCode(env: Env, userId: number): Promise<string> {
  const existing = await env.DB.prepare(`SELECT code FROM referral_codes WHERE user_id = ?`)
    .bind(userId)
    .first<{ code: string }>();
  if (existing) return existing.code;

  // Retry on the (astronomically unlikely) chance of a code collision --
  // UNIQUE constraint on referral_codes.code will reject a duplicate.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      await env.DB.prepare(`INSERT INTO referral_codes (user_id, code) VALUES (?, ?)`).bind(userId, code).run();
      return code;
    } catch {
      continue;
    }
  }
  throw new Error("getOrCreateReferralCode: failed to generate a unique code after 5 attempts.");
}

export class SelfReferralError extends Error {
  constructor() {
    super("A user cannot refer themselves.");
    this.name = "SelfReferralError";
  }
}

export class AlreadyReferredError extends Error {
  constructor() {
    super("This user already has a referrer (first-touch attribution is locked at signup).");
    this.name = "AlreadyReferredError";
  }
}

export class InvalidReferralCodeError extends Error {
  constructor() {
    super("Referral code not found.");
    this.name = "InvalidReferralCodeError";
  }
}

/**
 * Attributes a newly-signed-up user to a referrer, by code. First-touch,
 * locked -- the UNIQUE constraint on referrals.referred_user_id makes a
 * second attribution attempt fail, which this surfaces as
 * AlreadyReferredError rather than a raw D1 constraint error.
 */
export async function attributeReferral(env: Env, referredUserId: number, code: string): Promise<void> {
  const referrerRow = await env.DB.prepare(
    `SELECT user_id FROM referral_codes WHERE code = ?`
  )
    .bind(code)
    .first<{ user_id: number }>();
  if (!referrerRow) throw new InvalidReferralCodeError();

  if (referrerRow.user_id === referredUserId) throw new SelfReferralError();

  const existing = await env.DB.prepare(`SELECT id FROM referrals WHERE referred_user_id = ?`)
    .bind(referredUserId)
    .first<{ id: number }>();
  if (existing) throw new AlreadyReferredError();

  await env.DB.prepare(
    `INSERT INTO referrals (referrer_user_id, referred_user_id, commission_status) VALUES (?, ?, 'pending')`
  )
    .bind(referrerRow.user_id, referredUserId)
    .run();
}

/**
 * Call after an order is marked 'paid' (routes/orders.ts, after
 * maybeFinalizeOrder returns true). Grants the referrer's commission ONLY
 * if: (a) the paying user was referred, (b) no commission has fired for
 * them yet, and (c) THIS is that user's first-ever paid order -- "the
 * referred person's actual paid recharge/subscription purchase -- never
 * mere signup" (Section 7). Returns null if nothing applied (not referred,
 * already fired, or not the first paid order) or a status string if it did
 * (or would have, but REFERRAL_COMMISSION_POINTS is unset).
 */
export async function maybeGrantReferralCommission(
  env: Env,
  payingUserId: number,
  orderId: number
): Promise<"granted" | "skipped_not_configured" | null> {
  const referral = await env.DB.prepare(
    `SELECT id, referrer_user_id, commission_status FROM referrals WHERE referred_user_id = ?`
  )
    .bind(payingUserId)
    .first<{ id: number; referrer_user_id: number; commission_status: string }>();
  if (!referral || referral.commission_status !== "pending") return null;

  const firstPaidOrder = await env.DB.prepare(
    `SELECT id FROM orders WHERE user_id = ? AND status = 'paid' ORDER BY paid_at ASC LIMIT 1`
  )
    .bind(payingUserId)
    .first<{ id: number }>();
  if (!firstPaidOrder || firstPaidOrder.id !== orderId) return null; // not their first paid order

  if (!env.REFERRAL_COMMISSION_POINTS) {
    return "skipped_not_configured";
  }
  const commissionPoints = Number(env.REFERRAL_COMMISSION_POINTS);
  if (!Number.isFinite(commissionPoints) || commissionPoints <= 0) {
    return "skipped_not_configured";
  }

  const holdingDays = env.REFERRAL_HOLDING_DAYS ? Number(env.REFERRAL_HOLDING_DAYS) : DEFAULT_HOLDING_DAYS;
  const now = new Date();
  const holdingUntil = new Date(now.getTime() + holdingDays * 86400000);
  const expiresAt = new Date(now.getTime() + 365 * 86400000); // 1 year, per Section 6's general batch-expiry rule

  const inserted = await env.DB.prepare(
    `INSERT INTO wallet_ledger
       (user_id, source, amount_granted, amount_remaining, granted_at, expires_at, status, referral_id, holding_until)
     VALUES (?, 'referral_commission', ?, ?, ?, ?, 'active', ?, ?)
     RETURNING id`
  )
    .bind(
      referral.referrer_user_id,
      commissionPoints,
      commissionPoints,
      now.toISOString(),
      expiresAt.toISOString(),
      referral.id,
      holdingUntil.toISOString()
    )
    .first<{ id: number }>();

  await env.DB.prepare(
    `UPDATE referrals SET first_paid_order_id = ?, commission_amount = ?, commission_status = 'held' WHERE id = ?`
  )
    .bind(orderId, commissionPoints, referral.id)
    .run();

  await env.DB.prepare(
    `INSERT INTO wallet_transactions (wallet_ledger_id, amount, reason) VALUES (?, ?, 'grant')`
  )
    .bind(inserted!.id, commissionPoints)
    .run();

  return "granted";
}

/**
 * NOT YET IMPLEMENTED: the scheduled job that flips a 'held' commission to
 * 'active' once its holding period has passed (mirrors the wallet-expiry
 * sweep gap already documented in lib/wallet.ts / worker/README.md). Until
 * built, getSpendableBalance's holding_until check already defensively
 * excludes a still-held commission from being spent -- so this is a display
 * ("your commission is pending") gap, not a spend-correctness gap. Also not
 * implemented: chargeback clawback (flip 'held'/'active' to 'clawed_back' and
 * reverse the wallet_ledger batch if the triggering payment is
 * refunded/disputed within the holding window) -- blocked on having a real
 * payment gateway webhook to react to in the first place.
 */
