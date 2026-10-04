// Webhook routes: Payment Gateway callbacks
//
//   POST /webhooks/razorpay  -- Razorpay payment.captured + payment.failed callbacks
//
// Razorpay sends webhook events after the user completes checkout. We validate
// the signature (HMAC-SHA256) and idempotently grant wallet points on success.
//
// Signature verification (ARCHITECTURE.md Section 9):
//   1. Request body is the raw JSON string (not parsed)
//   2. X-Razorpay-Signature header contains the HMAC
//   3. Compute: HMAC-SHA256(body, RAZORPAY_KEY_SECRET)
//   4. Compare with header value (constant-time)
//   5. Reject if mismatch

import { crypto } from "@cloudflare/workers-types";
import { grantPoints, type Env as WalletEnv } from "../lib/wallet";
import { isOrderFullyPaid, maybeFinalizeOrder, type Env as OrdersEnv } from "../lib/orders";
import { json, errorJson } from "../lib/response";
import { WALLET_POINTS_PER_HUNDRED_PAISE } from "./wallet";

export interface Env extends WalletEnv, OrdersEnv {
  DB: D1Database;
  RAZORPAY_KEY_SECRET?: string; // needed for signature verification
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /webhooks/razorpay
// Idempotent webhook handler for Razorpay events.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constant-time string comparison to prevent timing attacks on signature validation.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify Razorpay webhook signature.
 * Returns true if signature is valid, false if tampered or missing.
 */
async function verifyRazorpaySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;

  try {
    // HMAC-SHA256(body, secret)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const computedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const hex = Array.from(new Uint8Array(computedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return timingSafeEqual(hex, signature);
  } catch (err) {
    console.error("[webhooks] Signature verification error:", err);
    return false;
  }
}

export async function handleRazorpayWebhook(request: Request, env: Env): Promise<Response> {
  // Reject unless secret is configured
  if (!env.RAZORPAY_KEY_SECRET) {
    return errorJson(
      "Razorpay webhook secret not configured. Set RAZORPAY_KEY_SECRET in Worker secrets.",
      503,
      "WEBHOOK_NOT_CONFIGURED"
    );
  }

  // Read raw body for signature verification
  const rawBody = await request.text();
  if (!rawBody) {
    return errorJson("Request body is empty.", 400, "INVALID_BODY");
  }

  // Verify signature
  const signature = request.headers.get("X-Razorpay-Signature");
  const isValid = await verifyRazorpaySignature(rawBody, signature, env.RAZORPAY_KEY_SECRET);

  if (!isValid) {
    console.warn("[webhooks] Razorpay signature mismatch. Rejecting webhook.");
    // Return 403 to Razorpay so it retries (may help catch misconfiguration)
    return errorJson("Webhook signature verification failed.", 403, "SIGNATURE_INVALID");
  }

  // Parse the webhook event
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return errorJson("Webhook body is not valid JSON.", 400, "INVALID_JSON");
  }

  const eventType = event.event as string | null;
  const eventData = event.payload?.payment as any;

  if (!eventType) {
    return errorJson("event type missing.", 400, "MISSING_EVENT_TYPE");
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Handle payment.captured
  // ──────────────────────────────────────────────────────────────────────────

  if (eventType === "payment.captured") {
    // Extract keys from event
    const razorpayPaymentId = eventData?.id;
    const razorpayOrderId = eventData?.order_id;
    const amountPaise = eventData?.amount;
    const status = eventData?.status;

    if (!razorpayPaymentId || !razorpayOrderId || typeof amountPaise !== "number") {
      console.warn("[webhooks] payment.captured missing required fields:", {
        razorpayPaymentId,
        razorpayOrderId,
        amountPaise,
      });
      return errorJson("payment.captured missing required fields.", 400, "INCOMPLETE_EVENT");
    }

    if (status !== "captured") {
      // Payment event exists but not captured yet; ignore for now
      return json({ received: true });
    }

    // Find the internal order by razorpay_order_id
    const orderRow = await env.DB.prepare(
      `SELECT id, user_id, amount_due FROM orders
       WHERE id IN (
         SELECT order_id FROM payments WHERE razorpay_order_id = ?
       )
       LIMIT 1`
    )
      .bind(razorpayOrderId)
      .first<{ id: number; user_id: number; amount_due: number }>();

    if (!orderRow) {
      console.warn(`[webhooks] No order found for Razorpay order ${razorpayOrderId}`);
      // Return 200 anyway (Razorpay doesn't care, and we avoid retries for "ghost" orders)
      return json({ received: true });
    }

    const { id: orderId, user_id: userId, amount_due: orderAmountDue } = orderRow;

    // Update the payments row to mark this payment completed
    const updateRes = await env.DB.prepare(
      `UPDATE payments
       SET status = 'completed', razorpay_payment_id = ?
       WHERE razorpay_order_id = ? AND status = 'pending'`
    )
      .bind(razorpayPaymentId, razorpayOrderId)
      .run();

    // Check if order is now fully paid
    const fullyPaid = await maybeFinalizeOrder(env, orderId);

    // If this payment completes the order, grant wallet points
    if (fullyPaid && (updateRes.meta?.changes ?? 0) > 0) {
      // Calculate points: amount_paise / 100 * POINTS_PER_HUNDRED_PAISE
      const pointsToGrant = Math.floor((orderAmountDue / 100) * WALLET_POINTS_PER_HUNDRED_PAISE);

      // Grant points with 1-year expiry (standard topup)
      const grantRes = await grantPoints(userId, pointsToGrant, "purchased_topup", 365, env.DB);

      if (!grantRes.success) {
        console.error("[webhooks] Failed to grant points after payment capture:", grantRes.message);
        // Order is marked paid but points not granted — this is a data consistency issue.
        // Log it for manual review; do NOT fail the webhook response (Razorpay retries will
        // cause duplicate updates if we return error).
      } else {
        console.log(
          `[webhooks] Granted ${pointsToGrant} points to user ${userId} ` +
            `(order ${orderId}, batch ${grantRes.batch_id})`
        );
      }
    }

    return json({ received: true });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Handle payment.failed
  // ──────────────────────────────────────────────────────────────────────────

  if (eventType === "payment.failed") {
    const razorpayPaymentId = eventData?.id;
    const razorpayOrderId = eventData?.order_id;

    if (!razorpayPaymentId || !razorpayOrderId) {
      return errorJson("payment.failed missing required fields.", 400, "INCOMPLETE_EVENT");
    }

    // Update payments row to failed
    await env.DB.prepare(
      `UPDATE payments
       SET status = 'failed', razorpay_payment_id = ?
       WHERE razorpay_order_id = ? AND status IN ('pending', 'failed')`
    )
      .bind(razorpayPaymentId, razorpayOrderId)
      .run();

    console.log(`[webhooks] Payment failed: ${razorpayPaymentId} (order ${razorpayOrderId})`);
    return json({ received: true });
  }

  // Unknown event type — acknowledge receipt but don't process
  console.log(`[webhooks] Ignoring event type: ${eventType}`);
  return json({ received: true });
}
