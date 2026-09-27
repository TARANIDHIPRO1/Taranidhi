/**
 * Background Jobs
 * Lazy cleanup tasks that run opportunistically during API calls
 * (Batch expiry, commission hold release)
 */

import type { D1Database } from "@cloudflare/workers-types";

/**
 * Mark expired wallet batches as 'expired'
 * Called on demand when user checks balance or spends points
 */
export async function cleanupExpiredBatches(db: D1Database, userId: number): Promise<number> {
  try {
    const res = await db.prepare(
      `UPDATE wallet_ledger
       SET status = 'expired'
       WHERE user_id = ? AND status = 'active' AND expires_at <= datetime('now')`
    )
      .bind(userId)
      .run();

    return res.meta.changes ?? 0;
  } catch (error) {
    console.error("Cleanup expired batches error:", error);
    return 0;
  }
}

/**
 * Release referral commissions from 'held' to 'active' after holding period
 * Called on demand when user checks balance or spends points
 */
export async function releaseHeldCommissions(db: D1Database, userId: number): Promise<number> {
  try {
    const res = await db.prepare(
      `UPDATE wallet_ledger
       SET status = 'active'
       WHERE user_id = ? AND status = 'held' AND holding_until IS NOT NULL AND holding_until <= datetime('now')`
    )
      .bind(userId)
      .run();

    return res.meta.changes ?? 0;
  } catch (error) {
    console.error("Release held commissions error:", error);
    return 0;
  }
}

/**
 * Run all background cleanup jobs for a user
 */
export async function runBackgroundCleanup(db: D1Database, userId: number): Promise<void> {
  await Promise.all([
    cleanupExpiredBatches(db, userId),
    releaseHeldCommissions(db, userId),
  ]);
}
