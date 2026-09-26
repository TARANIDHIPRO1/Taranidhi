// Wallet-ledger operations. See ARCHITECTURE.md Section 6: this is a FIFO
// batch ledger, not a single balance column. Every grant is its own row with
// its own expiry. Do not add a `users.wallet_balance` column anywhere --
// balance is always a computed SUM over active, unexpired batches.

export interface Env {
  DB: D1Database;
}

const FREE_TRIAL_POINTS = 25;
const FREE_TRIAL_DAYS = 3;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Grants the one-time 25-point / 3-day free trial batch.
 * Caller (routes/auth.ts) is responsible for the eligibility check
 * (phone + device fingerprint combo has never received a trial before) --
 * this function only performs the grant, it does not decide eligibility.
 * Keeping that split explicit so the anti-abuse check in ARCHITECTURE.md
 * Section 8 stays in one place and is easy to audit.
 */
export async function grantFreeTrial(env: Env, userId: number): Promise<void> {
  const now = new Date();
  const expiresAt = addDays(now, FREE_TRIAL_DAYS).toISOString();

  await env.DB.prepare(
    `INSERT INTO wallet_ledger (user_id, source, amount_granted, amount_remaining, granted_at, expires_at, status)
     VALUES (?, 'free_trial', ?, ?, ?, ?, 'active')`
  )
    .bind(userId, FREE_TRIAL_POINTS, FREE_TRIAL_POINTS, now.toISOString(), expiresAt)
    .run();
}

/**
 * Computes a user's spendable point balance: sum of amount_remaining across
 * all batches that are status='active' AND not yet past their expires_at.
 * This does NOT mutate anything -- expiring stale batches is a separate
 * scheduled job (not yet built; see the "expiry sweep" note in
 * ARCHITECTURE.md Section 8, "Point-batch expiry manipulation" row). A read
 * like this one must still exclude expired-but-not-yet-swept batches, so the
 * expiry check happens both here (defensively, on read) and in the sweep
 * job (to actually flip status -> 'expired' and free up storage/indexes).
 */
export async function getSpendableBalance(env: Env, userId: number): Promise<number> {
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount_remaining), 0) as balance
     FROM wallet_ledger
     WHERE user_id = ?
       AND status = 'active'
       AND expires_at > ?
       -- referral_commission batches inside their chargeback holding period
       -- are not yet spendable even though status='active':
       AND (holding_until IS NULL OR holding_until <= ?)`
  )
    .bind(userId, now, now)
    .first<{ balance: number }>();

  return row?.balance ?? 0;
}
