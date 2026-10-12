/**
 * Tier Upgrade Logic - Payment → Auto-Activation
 * 
 * Handles automatic tier upgrades when orders are marked as paid.
 * Tier mapping logic:
 * - new_activation → premium (first-time payment)
 * - renewal → preserve current tier (extend subscription)
 * - topup → preserve current tier (add wallet balance only)
 * 
 * ARCHITECTURE.md Section 6: "The activation/entitlement logic checks only
 * 'is this order fully paid' -- it must never branch on which rail funded it."
 * This applies to tier upgrades as well: tier upgrade is determined by order.purpose,
 * not by payment method.
 */

import type { D1Database } from "@cloudflare/workers-types";

export type OrderPurpose = "new_activation" | "renewal" | "topup";
export type UserTier = "basic" | "premium" | "ultra";

/**
 * Determine which tier a user should be upgraded to based on order purpose.
 * 
 * @param currentTier User's current tier
 * @param purpose Order purpose
 * @returns Target tier, or null if no upgrade should happen
 * 
 * VERIFICATION (2026-10-12):
 * - new_activation: Always upgrade to premium (first-time payment)
 * - renewal: Preserve current tier (subscription extension, no downgrade)
 * - topup: Preserve current tier (wallet top-up, no tier change)
 */
export function determineTierUpgrade(currentTier: UserTier, purpose: OrderPurpose): UserTier | null {
  if (purpose === "new_activation") {
    // First-time payment: always upgrade to premium
    // Future: could map to ultra if amount > threshold, but pricing not finalized yet
    return "premium";
  }
  
  if (purpose === "renewal") {
    // Renewal: keep current tier (no automatic downgrade, no upgrade unless paid more)
    // TODO: Future -- if renewal amount > premium_cost, upgrade to ultra
    return null; // No change
  }
  
  if (purpose === "topup") {
    // Wallet top-up: no tier change
    return null; // No change
  }
  
  throw new Error(`Unknown order purpose: ${purpose}`);
}

export interface TierUpgradeResult {
  upgraded: boolean;
  fromTier: UserTier;
  toTier: UserTier | null;
  reason: string;
}

/**
 * Execute tier upgrade for a user based on a completed order.
 * IDEMPOTENT: Safe to call multiple times for the same order.
 * 
 * @param env D1Database environment
 * @param userId User ID
 * @param orderId Order ID (for audit trail reference)
 * @param purpose Order purpose
 * @returns Upgrade result with before/after tiers
 */
export async function upgradeTierFromOrder(
  env: D1Database,
  userId: number,
  orderId: number,
  purpose: OrderPurpose
): Promise<TierUpgradeResult> {
  // 1. Fetch current user tier
  const user = await env.prepare(`SELECT tier FROM users WHERE id = ?`)
    .bind(userId)
    .first<{ tier: string }>();
  
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  
  const currentTier = user.tier as UserTier;
  
  // 2. Determine target tier
  const targetTier = determineTierUpgrade(currentTier, purpose);
  
  if (targetTier === null) {
    // No upgrade needed
    return {
      upgraded: false,
      fromTier: currentTier,
      toTier: null,
      reason: `Purpose "${purpose}" does not trigger tier upgrade`
    };
  }
  
  if (targetTier === currentTier) {
    // Already at target tier
    return {
      upgraded: false,
      fromTier: currentTier,
      toTier: null,
      reason: `User already at tier "${currentTier}"`
    };
  }
  
  // 3. Upgrade tier in database
  await env.prepare(
    `UPDATE users SET tier = ?, tier_upgraded_at = datetime('now') WHERE id = ?`
  )
    .bind(targetTier, userId)
    .run();
  
  return {
    upgraded: true,
    fromTier: currentTier,
    toTier: targetTier,
    reason: `Tier upgraded from order ${orderId} (purpose: ${purpose})`
  };
}

/**
 * Validation: Test the tier upgrade logic with known inputs.
 * VERIFICATION MATRIX (2026-10-12):
 */
export const TIER_UPGRADE_TESTS = {
  "new_activation from basic": {
    input: { currentTier: "basic" as UserTier, purpose: "new_activation" as OrderPurpose },
    expected: "premium" as UserTier,
    reason: "First-time payment should grant premium access"
  },
  "new_activation from premium": {
    input: { currentTier: "premium" as UserTier, purpose: "new_activation" as OrderPurpose },
    expected: "premium" as UserTier,
    reason: "Repeated new_activation (e.g., for testing) should not downgrade"
  },
  "renewal preserves premium": {
    input: { currentTier: "premium" as UserTier, purpose: "renewal" as OrderPurpose },
    expected: null,
    reason: "Subscription renewal should preserve tier"
  },
  "renewal preserves ultra": {
    input: { currentTier: "ultra" as UserTier, purpose: "renewal" as OrderPurpose },
    expected: null,
    reason: "Renewal should never downgrade from ultra"
  },
  "topup preserves basic": {
    input: { currentTier: "basic" as UserTier, purpose: "topup" as OrderPurpose },
    expected: null,
    reason: "Wallet top-up should not change tier"
  },
  "topup preserves premium": {
    input: { currentTier: "premium" as UserTier, purpose: "topup" as OrderPurpose },
    expected: null,
    reason: "Wallet top-up should not trigger tier change"
  }
};

/**
 * Run validation tests to verify tier upgrade logic.
 */
export function validateTierUpgradeLogic(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  
  for (const [testName, test] of Object.entries(TIER_UPGRADE_TESTS)) {
    const result = determineTierUpgrade(test.input.currentTier, test.input.purpose);
    
    if (result !== test.expected) {
      errors.push(
        `FAIL: ${testName}\n` +
        `  Input: tier=${test.input.currentTier}, purpose=${test.input.purpose}\n` +
        `  Expected: ${test.expected}\n` +
        `  Got: ${result}\n` +
        `  Reason: ${test.reason}`
      );
    }
  }
  
  return {
    passed: Object.keys(TIER_UPGRADE_TESTS).length - errors.length,
    failed: errors.length,
    errors
  };
}
