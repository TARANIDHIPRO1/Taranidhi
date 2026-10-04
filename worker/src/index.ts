// OCCULTVIISION API -- Worker entry point.
//
// Deliberately a hand-rolled router, not a framework (Hono etc.), while the
// route count is small. Revisit that choice once there are enough routes
// that manual if/else dispatch gets unreadable -- not before.

/// <reference types="@cloudflare/workers-types" />

import { handleRequestOtp, handleVerifyOtp } from "./routes/auth";
import { handleCreateKundali, handleListKundalis, handleGetKundali, handleDeleteKundali } from "./routes/kundali";
import { handleMuhurtaNow } from "./routes/muhurta";
import { handleGetBalance, handlePostRecharge } from "./routes/wallet";
import { handleCreateOrder, handleFundOrderFromWallet, handleFundOrderFromGateway } from "./routes/orders";
import { handleRazorpayWebhook } from "./routes/webhooks";
import { handleGetReferralCode, handleAttributeReferral } from "./routes/referral";
import {
  handleListUsers,
  handleGetUserDetail,
  handleDeactivateUser,
  handleListQueryLogs,
  handleGetSummary,
  handleUpgradeTier,
  handleListQueryLogsFiltered,
  handleGetSettings,
  handleUpdateSettings,
  handleGetAuditTrail,
} from "./routes/admin";
import { handleGetKpChart } from "./routes/kp";
import { handleKpQuery, handleListActivities } from "./routes/kpQuery";
import { handleMuhurtaScan } from "./routes/muhurtaScanner";
import { handleMuhurtaProfessional } from "./routes/muhurtaProfessional";
import { handleGetKundaliChart } from "./routes/kundaliChart";
import { handleGetNumerology } from "./routes/numerology";
import {
  handleKnowledgeQuery,
  handleKnowledgeSources,
  handleKnowledgeCache,
  handleDeleteKnowledgeCacheEntry,
  type Env as KnowledgeEnv,
} from "./routes/knowledge";
import { checkRateLimit, getClientIp, type Env as RateLimitEnv } from "./lib/rateLimit";
import { getUserIdFromSession, type Env as SessionEnv } from "./lib/session";
import { type Env as AuthEnv } from "./lib/auth-middleware";
import { type Env as WalletEnv } from "./lib/wallet";
import { type Env as OrdersEnv } from "./lib/orders";
import { type Env as ReferralEnv } from "./lib/referral";
import { errorJson, corsPreflight, type Env as ResponseEnv } from "./lib/response";

export interface Env
  extends AuthEnv,
    WalletEnv,
    OrdersEnv,
    ReferralEnv,
    RateLimitEnv,
    SessionEnv,
    KnowledgeEnv {
  DB: D1Database;
  ASSETS: {
    fetch(request: Request | string): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Browser preflight. CORS origin(s) scoped via FRONTEND_ORIGIN env var.
    if (request.method === "OPTIONS") {
      return corsPreflight(env as ResponseEnv);
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
    // /kundali/:id/chart  -- full computed birth chart (must be checked before /kundali/:id)
    const kundaliChartMatch = /^\/kundali\/(\d+)\/chart$/.exec(pathname);
    if (request.method === "GET" && kundaliChartMatch) {
      return handleGetKundaliChart(request, env);
    }
    const kundaliIdMatch = /^\/kundali\/(\d+)$/.exec(pathname);
    if (request.method === "GET" && kundaliIdMatch) {
      return handleGetKundali(request, env);
    }
    if (request.method === "DELETE" && kundaliIdMatch) {
      return handleDeleteKundali(request, env);
    }

    if (request.method === "GET" && pathname === "/muhurta/now") {
      return handleMuhurtaNow(request, env);
    }
    if (request.method === "GET" && pathname === "/muhurta/scan") {
      return handleMuhurtaScan(request, env);
    }
    if (request.method === "GET" && pathname === "/muhurta/professional") {
      return handleMuhurtaProfessional(request, env);
    }

    if (request.method === "GET" && pathname === "/numerology") {
      return handleGetNumerology(request, env);
    }

    if (request.method === "GET" && pathname === "/wallet/balance") {
      return handleGetBalance(request, env);
    }
    if (request.method === "POST" && pathname === "/wallet/recharge") {
      return handlePostRecharge(request, env);
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
      return handleListQueryLogsFiltered(request, env);
    }
    if (request.method === "GET" && (pathname === "/admin/summary" || pathname === "/admin/stats")) {
      return handleGetSummary(request, env);
    }
    if (request.method === "GET" && pathname === "/admin/settings") {
      return handleGetSettings(request, env);
    }
    if (request.method === "POST" && pathname === "/admin/settings") {
      return handleUpdateSettings(request, env);
    }
    if (request.method === "GET" && pathname === "/admin/audit-trail") {
      return handleGetAuditTrail(request, env);
    }
    const adminUserMatch = /^\/admin\/users\/(\d+)$/.exec(pathname);
    if (request.method === "GET" && adminUserMatch) {
      return handleGetUserDetail(request, env, Number(adminUserMatch[1]));
    }
    const adminDeactivateMatch = /^\/admin\/users\/(\d+)\/deactivate$/.exec(pathname);
    if (request.method === "POST" && adminDeactivateMatch) {
      return handleDeactivateUser(request, env, Number(adminDeactivateMatch[1]));
    }
    const adminUpgradeTierMatch = /^\/admin\/users\/(\d+)\/upgrade-tier$/.exec(pathname);
    if (request.method === "POST" && adminUpgradeTierMatch) {
      return handleUpgradeTier(request, env, Number(adminUpgradeTierMatch[1]));
    }

    const kpChartMatch = /^\/kp\/chart\/(\d+)$/.exec(pathname);
    if (request.method === "GET" && kpChartMatch) {
      return handleGetKpChart(request, env, Number(kpChartMatch[1]));
    }
    if (request.method === "POST" && pathname === "/kp/query") {
      return handleKpQuery(request, env);
    }
    if (request.method === "GET" && pathname === "/kp/activities") {
      return handleListActivities(request, env);
    }

    // ── Knowledge Search routes ──────────────────────────────────────────────
    if (request.method === "POST" && pathname === "/knowledge/query") {
      return handleKnowledgeQuery(request, env);
    }
    if (request.method === "GET" && pathname === "/knowledge/sources") {
      return handleKnowledgeSources(request, env);
    }
    if (request.method === "GET" && pathname === "/knowledge/cache") {
      return handleKnowledgeCache(request, env);
    }
    const knowledgeCacheDeleteMatch = /^\/knowledge\/cache\/([0-9a-f]{64})$/.exec(pathname);
    if (request.method === "DELETE" && knowledgeCacheDeleteMatch?.[1]) {
      return handleDeleteKnowledgeCacheEntry(request, env, knowledgeCacheDeleteMatch[1]);
    }

    // ── Webhook routes (no auth required, signature-verified) ──────────────────
    if (request.method === "POST" && pathname === "/webhooks/razorpay") {
      return handleRazorpayWebhook(request, env);
    }

    if (request.method === "POST" && pathname === "/api/log-error") {
      // Error logging from frontend -- store or log, don't fail
      try {
        const body = await request.json();
        console.error("[Frontend Error]", body);
      } catch {
        console.error("[Frontend Error] (malformed)");
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    // Fallback: Serve static assets or index.html for client-side SPA routing
    try {
      return await env.ASSETS.fetch(request);
    } catch (error) {
      // Fallback: Serve basic HTML for testing
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>OccultViision</title></head><body><h1>TaraNidhi Loading...</h1><p>API Health: <span id="health">checking...</span></p><script>fetch('/health').then(r=>r.text()).then(t=>{document.getElementById('health').textContent=t})</script></body></html>`;
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 200
      });
    }
  },
};
