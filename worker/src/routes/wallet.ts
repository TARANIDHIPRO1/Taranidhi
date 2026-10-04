// Wallet routes:
//
//   GET  /wallet/balance    -- spendable point balance + batch breakdown + recent activity
//   POST /wallet/recharge   -- initiate Razorpay topup order (skeleton pending credentials)
//
// Billing model: 1 point per query (Basic tier); Premium/Ultra unlimited.
// Wallet ledger is FIFO across batches with per-batch expiry (see lib/wallet.ts).

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { getSpendableBalance, grantPoints, type Env as WalletEnv } from "../lib/wallet";
import { createOrder, type Env as OrdersEnv } from "../lib/orders";
import { json, errorJson } from "../lib/response";

export interface Env extends AuthEnv, WalletEnv, OrdersEnv {
  DB: D1Database;
  RAZORPAY_KEY_ID?: string;        // from Worker secret — set once Naveen creates Razorpay account
  RAZORPAY_KEY_SECRET?: string;    // from Worker secret — needed to create signed orders
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /wallet/balance
// Returns balance + active batch breakdown + last 20 activity rows.
// The frontend wallet screen depends on this shape:
//   { balance, batches: [...], transactions: [...] }
// ─────────────────────────────────────────────────────────────────────────────

export async function handleGetBalance(request: Request, env: Env): Promise<Response> {
  try {
    const auth = await requireAuth(request, env);
    if (!auth) return unauthorized();

    // Total spendable balance (triggers lazy expiry cleanup)
    const balance = await getSpendableBalance(env, auth.userId);

    // Active batch breakdown — ordered by expiry asc so frontend can show
    // "expiring soon" warnings accurately.
    const batchesRes = await env.DB.prepare(`
      SELECT
        id,
        source,
        amount_granted,
        amount_remaining   AS points_available,
        granted_at,
        expires_at,
        status,
        holding_until
      FROM wallet_ledger
      WHERE user_id = ?
        AND status IN ('active', 'held')
        AND expires_at > datetime('now')
        AND amount_remaining > 0
      ORDER BY expires_at ASC
      LIMIT 20
    `).bind(auth.userId).all();

    const batches = batchesRes.results ?? [];

    // Last 20 activity rows: credits from wallet_ledger + debits from wallet_transactions.
    // Union query sorted by timestamp desc for a unified activity feed.
    const txRes = await env.DB.prepare(`
      SELECT
        wt.id,
        wt.amount,
        wt.reason,
        wt.created_at,
        CASE WHEN wt.amount < 0 THEN 'debit' ELSE 'credit' END AS type,
        COALESCE(wt.reason, 'query') AS description
      FROM wallet_transactions wt
      WHERE wt.wallet_ledger_id IN (
        SELECT id FROM wallet_ledger WHERE user_id = ?
      )
      ORDER BY wt.created_at DESC
      LIMIT 20
    `).bind(auth.userId).all();

    const transactions = (txRes.results ?? []).map((row: any) => ({
      id:          row.id,
      type:        row.type as "debit" | "credit",
      amount:      Math.abs(row.amount as number),
      description: row.description as string,
      created_at:  row.created_at as string,
    }));

    return json({ balance, batches, transactions });
  } catch (err: any) {
    console.error("[handleGetBalance] unhandled error:", err?.message ?? err);
    return errorJson(`Server error: ${err?.message ?? "unknown"}`, 500, "INTERNAL_ERROR");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /wallet/recharge
// Initiates a Razorpay topup order. Returns the Razorpay order ID for the
// frontend to load into the Razorpay checkout JS SDK.
//
// Body: { amount_paise: number }   -- positive integer, minimum 100 (₹1)
//
// When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not yet set (pre-launch),
// returns 503 clearly so dev testing doesn't silently fall through.
//
// Flow:
//   1. Validate amount_paise (≥100, integer)
//   2. Create orders row (purpose=topup) -- always happens, even in skeleton mode
//   3. Call Razorpay Orders API to get a razorpay_order_id
//   4. Return { order_id, razorpay_order_id, amount_paise, key_id }
//      Frontend uses these to open the Razorpay checkout modal.
//
// After successful Razorpay payment, the frontend must call:
//   POST /webhooks/razorpay  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// (or the backend webhook receives it automatically from Razorpay's dashboard config).
// ─────────────────────────────────────────────────────────────────────────────

const MIN_TOPUP_PAISE = 100;   // ₹1 minimum
const MAX_TOPUP_PAISE = 500000; // ₹5,000 maximum per transaction

// Points granted per paise paid. Business decision: 1 point per ₹1 (= 100 paise).
// This constant is intentionally NOT in a Worker var -- it's a product rule
// (marketing decides it, not ops), and must be changed with a code deploy.
const POINTS_PER_HUNDRED_PAISE = 1;

export async function handlePostRecharge(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  // Check Razorpay credentials (must be set before this route does anything real)
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return errorJson(
      "Razorpay credentials are not yet configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET " +
        "as Worker secrets once Naveen creates the Razorpay account. Until then, topup is unavailable.",
      503,
      "PAYMENT_GATEWAY_NOT_CONFIGURED"
    );
  }

  // Parse and validate body
  let body: { amount_paise?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorJson("Request body must be JSON.", 400, "INVALID_JSON");
  }

  const amountPaise = body.amount_paise;
  if (typeof amountPaise !== "number" || !Number.isInteger(amountPaise)) {
    return errorJson("amount_paise must be a positive integer.", 400, "INVALID_AMOUNT");
  }
  if (amountPaise < MIN_TOPUP_PAISE) {
    return errorJson(
      `Minimum topup is ₹${MIN_TOPUP_PAISE / 100} (${MIN_TOPUP_PAISE} paise).`,
      400,
      "AMOUNT_TOO_LOW"
    );
  }
  if (amountPaise > MAX_TOPUP_PAISE) {
    return errorJson(
      `Maximum topup per transaction is ₹${MAX_TOPUP_PAISE / 100}. Split into multiple transactions.`,
      400,
      "AMOUNT_TOO_HIGH"
    );
  }

  // Create internal order row first (rail-agnostic, ARCHITECTURE.md Section 6)
  let internalOrder: Awaited<ReturnType<typeof createOrder>>;
  try {
    internalOrder = await createOrder(env, auth.userId, "topup", amountPaise);
  } catch (err: any) {
    console.error("[recharge] createOrder failed:", err?.message);
    return errorJson("Failed to create order. Please retry.", 500, "ORDER_CREATE_FAILED");
  }

  // Create Razorpay order via their REST API.
  // Razorpay orders API: POST https://api.razorpay.com/v1/orders
  // Auth: Basic <base64(key_id:key_secret)>
  const rzpCredentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

  let rzpOrderId: string;
  try {
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${rzpCredentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount:   amountPaise,        // Razorpay also uses paise
        currency: "INR",
        receipt:  `ov_order_${internalOrder.id}`,   // ties back to our orders row
        notes: {
          occultviision_order_id: String(internalOrder.id),
          user_id:                String(auth.userId),
        },
      }),
    });

    if (!rzpRes.ok) {
      const errBody = await rzpRes.text().catch(() => "(unreadable)");
      console.error("[recharge] Razorpay API error:", rzpRes.status, errBody);
      return errorJson(
        `Razorpay rejected the order request (HTTP ${rzpRes.status}). ` +
          "Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are from a live account.",
        502,
        "RAZORPAY_API_ERROR"
      );
    }

    const rzpData = await rzpRes.json() as { id: string };
    rzpOrderId = rzpData.id;
  } catch (err: any) {
    console.error("[recharge] Razorpay fetch failed:", err?.message);
    return errorJson("Payment gateway unreachable. Please retry.", 502, "GATEWAY_UNREACHABLE");
  }

  // Persist the Razorpay order ID in our payments table as a pending gateway row
  await env.DB.prepare(
    `INSERT INTO payments (order_id, source, amount, razorpay_order_id, status)
     VALUES (?, 'gateway', ?, ?, 'pending')`
  )
    .bind(internalOrder.id, amountPaise, rzpOrderId)
    .run();

  // Calculate points the user will receive once payment completes.
  // POINTS_PER_HUNDRED_PAISE × (amount_paise / 100), floored.
  const pointsOnSuccess = Math.floor((amountPaise / 100) * POINTS_PER_HUNDRED_PAISE);

  return json({
    order_id:          internalOrder.id,      // our internal order id
    razorpay_order_id: rzpOrderId,            // pass to Razorpay checkout JS
    amount_paise:      amountPaise,
    key_id:            env.RAZORPAY_KEY_ID,   // public key for Razorpay checkout modal
    points_on_success: pointsOnSuccess,
    currency:          "INR",
  }, 201);
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported constant so webhooks handler can use the same points math
// ─────────────────────────────────────────────────────────────────────────────
export const WALLET_POINTS_PER_HUNDRED_PAISE = POINTS_PER_HUNDRED_PAISE;
