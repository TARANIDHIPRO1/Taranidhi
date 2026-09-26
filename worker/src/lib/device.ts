// Device-fingerprint bookkeeping. See ARCHITECTURE.md Section 8:
// "Free-trial cycling" and "Deactivate-and-rejoin trial abuse" rows.
//
// Important scope note: the client is responsible for COMPUTING the
// fingerprint hash (from whatever stable device signal the frontend uses --
// browser/canvas fingerprint, Android ID, etc.) and sending it as
// `fingerprint_hash` on signup. This module only records/checks it. Do not
// try to derive a fingerprint server-side from request headers alone --
// that's weak and easily spoofed; it belongs client-side, and this is
// intentionally left as an open integration point until the frontend exists.

export interface Env {
  DB: D1Database;
}

interface DeviceRow {
  id: number;
  trial_used: number;
  blacklisted: number;
}

/**
 * Looks up (or creates) a device_fingerprints row for the given hash.
 * Returns whether this device is eligible for a fresh free trial:
 * eligible only if it has never received a trial before AND is not
 * blacklisted (blacklisting happens on deactivate-and-rejoin abuse,
 * per ARCHITECTURE.md -- that flow isn't built yet, this just respects
 * the flag once something else sets it).
 */
export async function checkAndRegisterDevice(
  env: Env,
  fingerprintHash: string,
  userId: number
): Promise<{ deviceId: number; trialEligible: boolean }> {
  const existing = await env.DB.prepare(
    `SELECT id, trial_used, blacklisted FROM device_fingerprints WHERE fingerprint_hash = ?`
  )
    .bind(fingerprintHash)
    .first<DeviceRow>();

  if (existing) {
    await env.DB.prepare(
      `INSERT INTO user_devices (user_id, fingerprint_id) VALUES (?, ?)
       ON CONFLICT (user_id, fingerprint_id) DO NOTHING`
    )
      .bind(userId, existing.id)
      .run();

    const trialEligible = existing.trial_used === 0 && existing.blacklisted === 0;
    return { deviceId: existing.id, trialEligible };
  }

  const inserted = await env.DB.prepare(
    `INSERT INTO device_fingerprints (fingerprint_hash, first_seen_user_id, trial_used, blacklisted)
     VALUES (?, ?, 0, 0) RETURNING id`
  )
    .bind(fingerprintHash, userId)
    .first<{ id: number }>();

  const deviceId = inserted!.id;

  await env.DB.prepare(
    `INSERT INTO user_devices (user_id, fingerprint_id) VALUES (?, ?)`
  )
    .bind(userId, deviceId)
    .run();

  return { deviceId, trialEligible: true };
}

export async function markTrialUsed(env: Env, deviceId: number): Promise<void> {
  await env.DB.prepare(`UPDATE device_fingerprints SET trial_used = 1 WHERE id = ?`)
    .bind(deviceId)
    .run();
}
