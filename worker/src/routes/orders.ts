// Orders + Payments endpoints. See lib/orders.ts for the rail-agnostic
// design this follows (ARCHITECTURE.md Section 6).

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { createOrder, maybeFinalizeOrder, type OrderPurpose, type Env as OrdersEnv } from "../lib/orders";
import { debitWallet, InsufficientBalanceError, type Env as WalletEnv } from "../lib/wallet";
import { maybeGrantReferralCommission, type Env as ReferralEnv } from "../lib/referral";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, OrdersEnv, WalletEnv, ReferralEnv {
  DB: D1Database;
}

const VALID_PURPOSES: OrderPurpose[] = ["new_activation", "renewal", "topup"];

export async function handleCreateOrder(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  let body: { purpose?: string; amount_due_paise?: number };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }

  if (!body.purpose || !VALID_PURPOSES.includes(body.purpose as OrderPurpose)) {
    return errorJson(`purpose must be one of: ${VALID_PURPOSES.join(", ")}.`, 400, "INVALID_PURPOSE");
  }
  if (typeof body.amount_due_paise !== "number" || !Number.isInteger(body.amount_due_paise) || body.amount_due_paise <= 0) {
    return errorJson("amount_due_paise is required and must be a positive integer (amount in paise).", 400, "INVALID_AMOUNT");
  }

  const order = await createOrder(env, auth.userId, body.purpose as OrderPurpose, body.amount_due_paise);
  return json({ order }, 201);
}

/**
 * Fund an order from the caller's wallet balance. Converts points to paise
 * using POINTS_TO_PAISE_RATE (see lib/orders.ts header -- a business
 * decision not yet finalized, so this fails loudly if unset rather than
 * assuming a rate). On success: debits the wallet, records a 'wallet'
 * payments row, and finalizes the order if now fully paid.
 */
export async function handleFundOrderFromWallet(request: Request, env: Env, orderId: number): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  if (!env.POINTS_TO_PAISE_RATE) {
    return errorJson(
      "POINTS_TO_PAISE_RATE is not configured. The points<->rupee exchange rate is a business " +
        "decision that hasn't been finalized yet (ARCHITECTURE.md Section 12, item 1: final pricing " +
        "not settled). Set it as a Worker var/secret once pricing is confirmed -- see lib/orders.ts.",
      503,
      "EXCHANGE_RATE_NOT_CONFIGURED"
    );
  }
  const rate = Number(env.POINTS_TO_PAISE_RATE);
  if (!Number.isFinite(rate) || rate <= 0) {
    return errorJson("POINTS_TO_PAISE_RATE is misconfigured (must be a positive number).", 500, "BAD_EXCHANGE_RATE");
  }

  const order = await env.DB.prepare(`SELECT id, user_id, amount_due, status FROM orders WHERE id = ?`)
    .bind(orderId)
    .first<{ id: number; user_id: number; amount_due: number; status: string }>();
  if (!order || order.user_id !== auth.userId) {
    return errorJson("Order not found for this account.", 404, "ORDER_NOT_FOUND");
  }
  if (order.status !== "pending") {
    return errorJson(`Order is already '${order.status}', not pending.`, 409, "ORDER_NOT_PENDING");
  }

  let body: { amount_paise?: number };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.");
  }
  if (typeof body.amount_paise !== "number" || !Number.isInteger(body.amount_paise) || body.amount_paise <= 0) {
    return errorJson("amount_paise is required and must be a positive integer.", 400, "INVALID_AMOUNT");
  }

  const pointsNeeded = Math.ceil(body.amount_paise / rate);

  try {
    await debitWallet(env, auth.userId, pointsNeeded, "new_id_activation", "new_id_activation", orderId);
  } catch (err) {
    if (err instanceof InsufficientBalanceError) {
      return errorJson(
        `Insufficient points balance (have ${err.available}, need ${err.requested}) to fund this amount.`,
        402,
        "INSUFFICIENT_BALANCE"
      );
    }
    throw err;
  }

  // Find the wallet_transactions row(s) just created for this order so
  // payments.wallet_transaction_id can reference one -- schema allows only
  // one FK though a debit can span multiple ledger batches, so we reference
  // the most recent one for this order as a traceability pointer; the full
  // audit trail lives in wallet_transactions itself via order_id.
  const txRow = await env.DB.prepare(
    `SELECT id FROM wallet_transactions WHERE order_id = ? ORDER BY id DESC LIMIT 1`
  )
    .bind(orderId)
    .first<{ id: number }>();

  await env.DB.prepare(
    `INSERT INTO payments (order_id, source, amount, wallet_transaction_id, status)
     VALUES (?, 'wallet', ?, ?, 'completed')`
  )
    .bind(orderId, body.amount_paise, txRow?.id ?? null)
    .run();

  const fullyPaid = await maybeFinalizeOrder(env, orderId);

  let referralCommission: string | null = null;
  if (fullyPaid) {
    // ARCHITECTURE.md Section 7: commission triggers on the referred user's
    // actual paid purchase, never mere signup -- checked here, right after
    // the order that just made this true.
    referralCommission = await maybeGrantReferralCommission(env, auth.userId, orderId);
  }

  return json({
    order_id: orderId,
    funded_paise: body.amount_paise,
    points_debited: pointsNeeded,
    fully_paid: fullyPaid,
    referral_commission: referralCommission,
  });
}

/**
 * Razorpay gateway funding -- deliberate stub, same pattern as
 * lib/otp.ts's sendOtpViaSmsGateway. No real Razorpay account/keys exist
 * yet (ARCHITECTURE.md Section 9 access-control notes it must be the
 * account owner's own Razorpay account, never a shared credential).
 */
export async function handleFundOrderFromGateway(_request: Request, _env: Env, _orderId: number): Promise<Response> {
  return errorJson(
    "Razorpay integration is not yet wired up. A real Razorpay account (with the account owner's own " +
      "keys, per ARCHITECTURE.md Section 9) is needed before this path can be implemented.",
    503,
    "PAYMENT_GATEWAY_NOT_CONFIGURED"
  );
}
