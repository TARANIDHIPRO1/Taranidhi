// GET /wallet/balance -- the caller's current spendable point balance.

import { requireAuth, unauthorized, type Env as AuthEnv } from "../lib/auth-middleware";
import { getSpendableBalance, type Env as WalletEnv } from "../lib/wallet";
import { json } from "../lib/response";

export interface Env extends AuthEnv, WalletEnv {
  DB: D1Database;
}

export async function handleGetBalance(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!auth) return unauthorized();

  const balance = await getSpendableBalance(env, auth.userId);
  return json({ balance });
}
