// API client — all backend calls go through here.
//
// CORS_TODO: In production, API_BASE must match the real Worker URL.
// For dev, the Vite proxy or a localhost Worker serves the API.

import { navigate } from "./router";

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

let sessionToken: string | null = localStorage.getItem("ov_session");

export function setSession(token: string | null) {
  sessionToken = token;
  if (token) localStorage.setItem("ov_session", token);
  else localStorage.removeItem("ov_session");
}

export function getSession(): string | null {
  return sessionToken;
}

export function isLoggedIn(): boolean {
  return sessionToken !== null;
}

async function apiFetch(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> ?? {}),
  };
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
  if (opts.body && typeof opts.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  // Global 401 handler: session expired or invalidated server-side.
  // Clear local token and redirect to login so user re-authenticates cleanly.
  if (res.status === 401) {
    setSession(null);
    navigate("/login");
  }

  return { ok: res.ok, status: res.status, data };
}

// ── Auth ──
export const requestOtp = (phone: string) =>
  apiFetch("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone_number: phone }) });

export const verifyOtp = (phone: string, code: string, fingerprint: string) =>
  apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone_number: phone, code, fingerprint_hash: fingerprint }),
  });

// ── Kundali ──
export const listKundalis = () => apiFetch("/kundali");

export const createKundali = (body: {
  label: string;
  birth_date: string;
  latitude: number;
  longitude: number;
  timezone: string;
}) => apiFetch("/kundali", { method: "POST", body: JSON.stringify(body) });

export const deleteKundali = (id: number) =>
  apiFetch(`/kundali/${id}`, { method: "DELETE" });

export const getKundali = (id: number) => apiFetch(`/kundali/${id}`);

// ── Muhurta ──
export const muhurtaNow = (lat: number, lon: number, purpose?: string, kundaliId?: number) => {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  if (purpose) params.set("purpose", purpose);
  if (kundaliId !== undefined) params.set("kundali_id", String(kundaliId));
  return apiFetch(`/muhurta/now?${params}`);
};

export const muhurtaScan = (params: {
  lat: number;
  lon: number;
  purpose?: string;
  kundali_id?: number;
  from?: string;
  to?: string;
  top_n?: number;
}) => {
  const qs = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon) });
  if (params.purpose) qs.set("purpose", params.purpose);
  if (params.kundali_id !== undefined) qs.set("kundali_id", String(params.kundali_id));
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.top_n !== undefined) qs.set("top_n", String(params.top_n));
  return apiFetch(`/muhurta/scan?${qs}`);
};

// ── Professional Muhurta ──
export const muhurtaProfessional = (params: {
  lat: number;
  lon: number;
  category: string;
  kundali_id?: number;
}) => {
  const qs = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), category: params.category });
  if (params.kundali_id !== undefined) qs.set("kundali_id", String(params.kundali_id));
  return apiFetch(`/muhurta/professional?${qs}`);
};

// ── Kundali Chart (full computed birth chart) ──
export const getKundaliChart = (kundaliId: number) => apiFetch(`/kundali/${kundaliId}/chart`);

// ── KP ──
export const kpChart = (kundaliId: number) => apiFetch(`/kp/chart/${kundaliId}`);
export const kpQuery = (kundaliId: number, activitySlug: string) =>
  apiFetch("/kp/query", {
    method: "POST",
    body: JSON.stringify({ kundali_id: kundaliId, activity_slug: activitySlug }),
  });
export const kpActivities = () => apiFetch("/kp/activities");

// ── Wallet ──
export const walletBalance = () => apiFetch("/wallet/balance");
export const walletRecharge = (amountPaise: number) =>
  apiFetch("/wallet/recharge", {
    method: "POST",
    body: JSON.stringify({ amount_paise: amountPaise }),
  });

// ── Referral ──
export const referralCode = () => apiFetch("/referral/code");

// ── Admin ──
export const adminStats = () => apiFetch("/admin/stats");
export const adminListUsers = () => apiFetch("/admin/users");
export const adminGetUserDetail = (userId: number) => apiFetch(`/admin/users/${userId}`);
export const adminDeactivateUser = (userId: number) =>
  apiFetch(`/admin/users/${userId}/deactivate`, { method: "POST" });
export const adminUpgradeTier = (userId: number, tier: string) =>
  apiFetch(`/admin/users/${userId}/upgrade-tier`, { method: "POST", body: JSON.stringify({ tier }) });
export const adminListQueryLogs = (filters?: { query_type?: string; user_id?: number; limit?: number; offset?: number }) => {
  const params = new URLSearchParams();
  if (filters?.query_type) params.set("query_type", filters.query_type);
  if (filters?.user_id) params.set("user_id", String(filters.user_id));
  if (filters?.limit) params.set("limit", String(filters.limit));
  if (filters?.offset) params.set("offset", String(filters.offset));
  return apiFetch(`/admin/query-logs${params.toString() ? "?" + params.toString() : ""}`);
};
export const adminGetSettings = () => apiFetch("/admin/settings");
export const adminUpdateSettings = (settings: Record<string, any>) =>
  apiFetch("/admin/settings", { method: "POST", body: JSON.stringify(settings) });
export const adminGetAuditTrail = (limit?: number, offset?: number) => {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (offset) params.set("offset", String(offset));
  return apiFetch(`/admin/audit-trail${params.toString() ? "?" + params.toString() : ""}`);
};

// ── Knowledge Search ──
export const knowledgeQuery = (query: string, context?: Record<string, unknown>) =>
  apiFetch("/knowledge/query", {
    method: "POST",
    body: JSON.stringify({ query, context }),
  });
export const knowledgeSources = () => apiFetch("/knowledge/sources");

// Alias for Muhurta Dashboard — matches the expected import name in muhurta-dashboard.ts
export const getMuhurtaNow = muhurtaNow;
