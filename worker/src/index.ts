// OCCULTVIISION API -- Worker entry point.
//
// Deliberately a hand-rolled router, not a framework (Hono etc.), while the
// route count is small. Revisit that choice once there are enough routes
// that manual if/else dispatch gets unreadable -- not before.

import { handleRequestOtp, handleVerifyOtp, type Env as AuthEnv } from "./routes/auth";
import { handleCreateKundali, handleListKundalis, type Env as KundaliEnv } from "./routes/kundali";
import { handleMuhurtaNow, type Env as MuhurtaEnv } from "./routes/muhurta";
import { handleGetBalance, type Env as WalletRouteEnv } from "./routes/wallet";
import { handleCreateOrder, handleFundOrderFromWallet, handleFundOrderFromGateway, type Env as OrdersRouteEnv } from "./routes/orders";
import { errorJson, corsPreflight } from "./lib/response";

export interface Env extends AuthEnv, KundaliEnv, MuhurtaEnv, WalletRouteEnv, OrdersRouteEnv {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Browser preflight for the test harness / any future frontend. See the
    // CORS_TODO note in lib/response.ts before relying on this in production.
    if (request.method === "OPTIONS") {
      return corsPreflight();
    }

    if (request.method === "POST" && pathname === "/auth/request-otp") {
      return handleRequestOtp(request, env);
    }
    if (request.method === "POST" && pathname === "/auth/verify-otp") {
      return handleVerifyOtp(request, env);
    }

    if (request.method === "POST" && pathname === "/kundali") {
      return handleCreateKundali(request, env);
    }
    if (request.method === "GET" && pathname === "/kundali") {
      return handleListKundalis(request, env);
    }

    if (request.method === "GET" && pathname === "/muhurta/now") {
      return handleMuhurtaNow(request, env);
    }

    if (request.method === "GET" && pathname === "/wallet/balance") {
      return handleGetBalance(request, env);
    }

    if (request.method === "POST" && pathname === "/orders") {
      return handleCreateOrder(request, env);
    }
    const fundMatch = /^\/orders\/(\d+)\/fund\/(wallet|gateway)$/.exec(pathname);
    if (request.method === "POST" && fundMatch) {
      const orderId = Number(fundMatch[1]);
      const rail = fundMatch[2];
      return rail === "wallet"
        ? handleFundOrderFromWallet(request, env, orderId)
        : handleFundOrderFromGateway(request, env, orderId);
    }

    if (pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    return errorJson("Not found.", 404);
  },
};
