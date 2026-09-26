// Orders + Payments -- rail-agnostic, per ARCHITECTURE.md Section 6:
// "every chargeable action ... creates an orders row first. It can be funded
// by Razorpay (gateway rail), by wallet-ledger debit (internal rail), or a
// split of both in one order. The activation/entitlement logic checks only
// 'is this order fully paid' -- it must never branch on which rail funded it."
//
// amount_due / amount on both tables are in PAISE (integer), matching
// db/schema.sql's own comment ("to avoid float rounding issues").
//
// Open decision NOT resolved here (ARCHITECTURE.md Section 12, item 1:
// "Final Rs pricing for Premium and Ultra tiers" -- not yet settled, and no
// points<->rupee exchange rate is defined anywhere in the architecture doc
// at all): funding an order from the wallet requires converting POINTS
// (wallet_ledger's unit) into PAISE (orders/payments' unit). Rather than
// inventing a rate in code -- which is exactly the "resolve silently" the
// architecture doc forbids -- POINTS_TO_PAISE_RATE must be set as a Worker
// var/secret before fundOrderFromWallet can be used at all. It throws a
// loud, clear error if unset, the same pattern as the OTP gateway stub in
// lib/otp.ts. Do not hardcode a rate here even as a "temporary" default.

export interface Env {
  DB: D1Database;
  POINTS_TO_PAISE_RATE?: string; // e.g. "100" = 1 point is worth 100 paise (Rs 1). Business decision, not code's to make.
}

export type OrderPurpose = "new_activation" | "renewal" | "topup";

export interface Order {
  id: number;
  user_id: number;
  purpose: OrderPurpose;
  amount_due: number;
  status: "pending" | "paid" | "failed" | "cancelled";
}

export async function createOrder(env: Env, userId: number, purpose: OrderPurpose, amountDuePaise: number): Promise<Order> {
  if (!Number.isInteger(amountDuePaise) || amountDuePaise <= 0) {
    throw new Error(`createOrder: amountDuePaise must be a positive integer, got ${amountDuePaise}.`);
  }
  const created = await env.DB.prepare(
    `INSERT INTO orders (user_id, purpose, amount_due, status) VALUES (?, ?, ?, 'pending') RETURNING id, user_id, purpose, amount_due, status`
  )
    .bind(userId, purpose, amountDuePaise)
    .first<Order>();
  return created!;
}

/**
 * The ONE rail-agnostic check ARCHITECTURE.md Section 6 requires:
 * "is this order fully paid" -- sum of completed payments >= amount_due.
 * Entitlement/activation logic must call THIS, never inspect payment rows
 * directly or branch on payments[i].source.
 */
export async function isOrderFullyPaid(env: Env, orderId: number): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT o.amount_due as amount_due, COALESCE(SUM(p.amount), 0) as paid
     FROM orders o
     LEFT JOIN payments p ON p.order_id = o.id AND p.status = 'completed'
     WHERE o.id = ?
     GROUP BY o.id`
  )
    .bind(orderId)
    .first<{ amount_due: number; paid: number }>();
  if (!row) return false;
  return row.paid >= row.amount_due;
}

/**
 * Marks an order 'paid' if isOrderFullyPaid is now true. Idempotent-safe to
 * call after any payment row is added; a no-op if the order isn't fully
 * funded yet (e.g. a split payment where only one leg has landed so far).
 */
export async function maybeFinalizeOrder(env: Env, orderId: number): Promise<boolean> {
  const fullyPaid = await isOrderFullyPaid(env, orderId);
  if (fullyPaid) {
    await env.DB.prepare(`UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE id = ? AND status = 'pending'`)
      .bind(orderId)
      .run();
  }
  return fullyPaid;
}
