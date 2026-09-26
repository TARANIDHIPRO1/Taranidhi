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
import { handleGetReferralCode, handleAttributeReferral, type Env as ReferralRouteEnv } from "./routes/referral";
import {
  handleListUsers,
  handleGetUserDetail,
  handleDeactivateUser,
  handleListQueryLogs,
  handleGetSummary,
  type Env as AdminRouteEnv,
} from "./routes/admin";
import { checkRateLimit, getClientIp, type Env as RateLimitEnv } from "./lib/rateLimit";
import { getUserIdFromSession, type Env as SessionEnv } from "./lib/session";
import { errorJson, corsPreflight } from "./lib/response";

export interface Env
  extends AuthEnv,
    KundaliEnv,
    MuhurtaEnv,
    WalletRouteEnv,
    OrdersRouteEnv,
    ReferralRouteEnv,
    AdminRouteEnv,
    RateLimitEnv,
    SessionEnv {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Browser preflight for the test harness / any future frontend. See the
    // CORS_TODO note in lib/response.ts before relying on this in production.
    if (request.method === "OPTIONS") {
      return corsPreflight();
    }

    // Global per-account + per-IP rate limiting -- ARCHITECTURE.md Section 8's
    // "API scraping to reverse-engineer the proprietary scoring formula" row.
    // Applied to every route except /health (so uptime checks are never
    // themselves rate-limited) and preflight (already returned above).
    // Best-effort: a session lookup here is a second KV read on top of each
    // route's own requireAuth() call -- acceptable duplication for now to
    // keep this a single early gate rather than threading rate-limit calls
    // into every individual route handler; revisit if the extra KV read
    // becomes a real latency concern.
    if (pathname !== "/health") {
      const ip = getClientIp(request);
      const authHeader = request.headers.get("authorization") ?? "";
      const tokenMatch = /^Bearer\s+(.+)$/i.exec(authHeader);
      const userId = tokenMatch?.[1] ? await getUserIdFromSession(env, tokenMatch[1]) : null;

      const decision = await checkRateLimit(
        env,
        { bucket: "global", windowSeconds: 60, maxRequests: 60, captchaThreshold: 40 },
        ip,
        userId
      );
      if (!decision.allowed) {
        return errorJson(
          "Too many requests. Please slow down and try again shortly.",
          429,
          "RATE_LIMITED"
        );
      }
      // decision.shouldCaptcha is intentionally not enforced yet -- no
      // CAPTCHA provider is wired up (see lib/rateLimit.ts header for why).
      // Once one is (Cloudflare Turnstile is the natural fit), a request
      // flagged here should return a distinct 429 telling the client to
      // solve a challenge before retrying, rather than the plain
      // RATE_LIMITED response above.
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

    if (request.method === "GET" && pathname === "/referral/code") {
      return handleGetReferralCode(request, env);
    }
    if (request.method === "POST" && pathname === "/referral/attribute") {
      return handleAttributeReferral(request, env);
    }
    const fundMatch = /^\/orders\/(\d+)\/fund\/(wallet|gateway)$/.exec(pathname);
    if (request.method === "POST" && fundMatch) {
      const orderId = Number(fundMatch[1]);
      const rail = fundMatch[2];
      return rail === "wallet"
        ? handleFundOrderFromWallet(request, env, orderId)
        : handleFundOrderFromGateway(request, env, orderId);
    }

    if (request.method === "GET" && pathname === "/admin/users") {
      return handleListUsers(request, env);
    }
    if (request.method === "GET" && pathname === "/admin/query-logs") {
      return handleListQueryLogs(request, env);
    }
    if (request.method === "GET" && pathname === "/admin/summary") {
      return handleGetSummary(request, env);
    }
    const adminUserMatch = /^\/admin\/users\/(\d+)$/.exec(pathname);
    if (request.method === "GET" && adminUserMatch) {
      return handleGetUserDetail(request, env, Number(adminUserMatch[1]));
    }
    const adminDeactivateMatch = /^\/admin\/users\/(\d+)\/deactivate$/.exec(pathname);
    if (request.method === "POST" && adminDeactivateMatch) {
      return handleDeactivateUser(request, env, Number(adminDeactivateMatch[1]));
    }

    if (pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    return errorJson("Not found.", 404);
  },
};
