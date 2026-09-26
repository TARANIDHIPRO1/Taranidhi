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

export class InsufficientBalanceError extends Error {
  constructor(public readonly available: number, public readonly requested: number) {
    super(`Insufficient balance: requested ${requested}, available ${available}.`);
    this.name = "InsufficientBalanceError";
  }
}

export type UseCase = "personal_use" | "new_id_activation";

/**
 * Atomically debits enough points to cover `valueNeeded` units of spending
 * VALUE (not necessarily raw points -- see usage_multipliers below), FIFO
 * across active batches (oldest expires_at first -- so trial points, which
 * expire soonest, get consumed before longer-lived subscription/top-up
 * batches, minimizing wasted expiry). This is THE function referenced by
 * ARCHITECTURE.md Section 8's "Wallet double-spend (race condition)" row --
 * do not reimplement a separate "read balance, then write deduction" path
 * anywhere else in the codebase. Every debit goes through this function.
 *
 * usage_multipliers (db/schema.sql): a batch's source determines its
 * effective value for a given use_case -- e.g. referral_commission points
 * are worth 100% for personal_use but only 50% for new_id_activation
 * (ARCHITECTURE.md Section 7's explicit anti-abuse rule). This function
 * looks up each batch's multiplier and consumes MORE raw points from a
 * discounted-source batch to deliver the same value. Getting this wrong
 * (treating all points as 100% face value regardless of source) would let
 * commission points be used for activation at double their intended value
 * -- exactly the kind of quiet business-rule violation ARCHITECTURE.md
 * Section 7 exists to prevent. Callers debiting for ordinary query/report
 * consumption should pass useCase='personal_use' (all sources are 100%
 * there, so behavior is a plain 1:1 point debit); order-funding callers
 * (routes/orders.ts) MUST pass 'new_id_activation' when that's what the
 * order is for.
 *
 * Concurrency: Cloudflare D1 does not (as of this writing) expose
 * client-driven multi-statement SERIALIZABLE transactions the way a
 * traditional Postgres/MySQL connection would -- `env.DB.batch([...])` runs
 * multiple statements atomically as a batch, but a batch is a fixed list of
 * prepared statements decided BEFORE execution, not a read-then-branch
 * transaction. Given that constraint, this function does the FIFO batch
 * selection as a single read, then issues the resulting UPDATEs as one
 * `env.DB.batch()` call -- atomic as a set, but with a real (if narrow) TOCTOU
 * gap between the read and the batch under high concurrent write volume on
 * the SAME user_id. This is a deliberate, documented interim choice given
 * D1's current transaction primitives, not the "check then deduct as two
 * separate uncoordinated steps" antipattern Section 8 warns against -- but it
 * is not a full row-lock/serializable guarantee either. Flagged here rather
 * than silently presented as fully solved: revisit if/when D1 ships a true
 * interactive transaction API, or move this specific hot path to Durable
 * Objects (one DO instance per user_id gives natural per-user serialization)
 * if concurrent-debit abuse is ever observed in production logs.
 */
export async function debitWallet(
  env: Env,
  userId: number,
  valueNeeded: number,
  reason: string,
  useCase: UseCase = "personal_use",
  orderId?: number
): Promise<void> {
  if (!Number.isInteger(valueNeeded) || valueNeeded <= 0) {
    throw new Error(`debitWallet: valueNeeded must be a positive integer, got ${valueNeeded}.`);
  }

  const now = new Date().toISOString();
  const { results: batches } = await env.DB.prepare(
    `SELECT id, amount_remaining, source
     FROM wallet_ledger
     WHERE user_id = ?
       AND status = 'active'
       AND expires_at > ?
       AND (holding_until IS NULL OR holding_until <= ?)
     ORDER BY expires_at ASC`
  )
    .bind(userId, now, now)
    .all<{ id: number; amount_remaining: number; source: string }>();

  const { results: multiplierRows } = await env.DB.prepare(
    `SELECT source, multiplier_pct FROM usage_multipliers WHERE use_case = ?`
  )
    .bind(useCase)
    .all<{ source: string; multiplier_pct: number }>();
  const multiplierBySource = new Map(multiplierRows.map((r) => [r.source, r.multiplier_pct / 100]));

  const availableValue = batches.reduce((sum, b) => {
    const mult = multiplierBySource.get(b.source) ?? 1;
    return sum + b.amount_remaining * mult;
  }, 0);
  if (availableValue < valueNeeded) {
    throw new InsufficientBalanceError(Math.floor(availableValue), valueNeeded);
  }

  let remainingValueToDebit = valueNeeded;
  const statements: D1PreparedStatement[] = [];
  for (const batch of batches) {
    if (remainingValueToDebit <= 0) break;
    const mult = multiplierBySource.get(batch.source) ?? 1;
    if (mult <= 0) continue; // a 0%-value source for this use_case contributes nothing; skip it

    // Raw points to take from THIS batch to deliver up to remainingValueToDebit
    // worth of value, capped at what the batch actually holds.
    const rawNeededForRemainder = Math.ceil(remainingValueToDebit / mult);
    const rawTaken = Math.min(batch.amount_remaining, rawNeededForRemainder);
    const valueProvided = rawTaken * mult;
    const newRemaining = batch.amount_remaining - rawTaken;

    statements.push(
      env.DB.prepare(
        `UPDATE wallet_ledger
         SET amount_remaining = ?,
             status = CASE WHEN ? = 0 THEN 'depleted' ELSE status END
         WHERE id = ?`
      ).bind(newRemaining, newRemaining, batch.id)
    );
    statements.push(
      env.DB.prepare(
        `INSERT INTO wallet_transactions (wallet_ledger_id, amount, reason, order_id)
         VALUES (?, ?, ?, ?)`
      ).bind(batch.id, -rawTaken, reason, orderId ?? null)
    );

    remainingValueToDebit -= valueProvided;
  }

  await env.DB.batch(statements);
}
