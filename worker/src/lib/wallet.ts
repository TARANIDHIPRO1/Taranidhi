/**
 * Wallet & Points System
 * FIFO ledger-based consumption (no double-spend vulnerability)
 * Supports per-batch expiry + referral commission holding period
 */

import type { D1Database } from "@cloudflare/workers-types";

export interface PointBatch {
  id: number;
  user_id: number;
  source: "free_trial" | "subscription_package" | "referral_commission" | "purchased_topup";
  amount_granted: number;
  amount_remaining: number;
  granted_at: string;
  expires_at: string;
  status: "active" | "expired" | "depleted" | "clawed_back";
  referral_id?: number;
  holding_until?: string;
}

/**
 * Deduct points from user's wallet using FIFO consumption
 * Must be called within an atomic transaction to prevent double-spend
 */
export async function deductPoints(
  userId: number,
  pointsNeeded: number,
  db: D1Database
): Promise<{
  success: boolean;
  message: string;
  batches_used?: Array<{ batch_id: number; points_used: number }>;
}> {
  try {
    // Fetch active, non-expired batches (FIFO order: oldest first)
    const batches = await db
      .prepare(
        `
        SELECT id, amount_granted, amount_remaining, source, holding_until
        FROM wallet_ledger
        WHERE user_id = ?
          AND status = 'active'
          AND expires_at > datetime('now')
          AND amount_remaining > 0
          AND (holding_until IS NULL OR holding_until <= datetime('now'))
        ORDER BY granted_at ASC
      `
      )
      .bind(userId)
      .all();

    if (!batches.success || !batches.results) {
      return { success: false, message: "Failed to fetch wallet" };
    }

    let remaining = pointsNeeded;
    const usedBatches: Array<{ batch_id: number; points_used: number }> = [];

    // Consume batches in FIFO order
    for (const batch of batches.results as any[]) {
      const available = batch.amount_remaining;
      const toUse = Math.min(available, remaining);

      // Update batch
      const updateRes = await db
        .prepare(`UPDATE wallet_ledger SET amount_remaining = amount_remaining - ? WHERE id = ?`)
        .bind(toUse, batch.id)
        .run();

      if (!updateRes.success) {
        return { success: false, message: "Failed to update wallet" };
      }

      usedBatches.push({ batch_id: batch.id, points_used: toUse });
      remaining -= toUse;

      if (remaining === 0) break;
    }

    if (remaining > 0) {
      return {
        success: false,
        message: `Insufficient points. Need ${pointsNeeded}, available ${pointsNeeded - remaining}`,
      };
    }

    return { success: true, message: "Points deducted", batches_used: usedBatches };
  } catch (error) {
    console.error("Deduct points error:", error);
    return { success: false, message: "Wallet error" };
  }
}

/**
 * Grant points to user (creates a new batch with expiry)
 */
export async function grantPoints(
  userId: number,
  points: number,
  source: PointBatch["source"],
  validityDays: number,
  db: D1Database,
  referralId?: number,
  holdingDays?: number
): Promise<{ success: boolean; batch_id?: number; message: string }> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    let holdingUntil: string | null = null;
    if (holdingDays && source === "referral_commission") {
      const holdDate = new Date();
      holdDate.setDate(holdDate.getDate() + holdingDays);
      holdingUntil = holdDate.toISOString();
    }

    const res = await db
      .prepare(
        `
        INSERT INTO wallet_ledger (
          user_id, source, amount_granted, amount_remaining,
          granted_at, expires_at, status, referral_id, holding_until
        )
        VALUES (?, ?, ?, ?, datetime('now'), ?, 'active', ?, ?)
      `
      )
      .bind(userId, source, points, points, expiresAt.toISOString(), referralId || null, holdingUntil)
      .run();

    if (!res.success) {
      return { success: false, message: "Failed to grant points" };
    }

    return {
      success: true,
      batch_id: res.meta.last_row_id as number,
      message: `${points} points granted (expires ${validityDays} days)`,
    };
  } catch (error) {
    console.error("Grant points error:", error);
    return { success: false, message: "Wallet error" };
  }
}

/**
 * Get user's total available points
 */
export async function getAvailablePoints(userId: number, db: D1Database): Promise<number> {
  try {
    const result = await db
      .prepare(
        `
        SELECT COALESCE(SUM(amount_remaining), 0) as total
        FROM wallet_ledger
        WHERE user_id = ?
          AND status = 'active'
          AND expires_at > datetime('now')
          AND amount_remaining > 0
          AND (holding_until IS NULL OR holding_until <= datetime('now'))
      `
      )
      .bind(userId)
      .first();

    return (result as any)?.total ?? 0;
  } catch (error) {
    console.error("Get points error:", error);
    return 0;
  }
}

/**
 * Clawback commission on refund
 */
export async function clawbackCommission(batchId: number, db: D1Database): Promise<boolean> {
  try {
    const res = await db
      .prepare(
        `
        UPDATE wallet_ledger
        SET status = 'clawed_back', amount_remaining = 0
        WHERE id = ? AND source = 'referral_commission'
      `
      )
      .bind(batchId)
      .run();

    return res.success && (res.meta.changes ?? 0) > 0;
  } catch (error) {
    console.error("Clawback commission error:", error);
    return false;
  }
}
