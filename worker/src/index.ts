// OCCULTVIISION API -- Worker entry point.
//
// Deliberately a hand-rolled router, not a framework (Hono etc.), while the
// route count is small. Revisit that choice once there are enough routes
// that manual if/else dispatch gets unreadable -- not before.

import { handleRequestOtp, handleVerifyOtp, type Env as AuthEnv } from "./routes/auth";
import { handleCreateKundali, handleListKundalis, type Env as KundaliEnv } from "./routes/kundali";
import { errorJson } from "./lib/response";

export interface Env extends AuthEnv, KundaliEnv {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

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

    if (pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    return errorJson("Not found.", 404);
  },
};
