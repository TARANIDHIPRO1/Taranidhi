// API client — all backend calls go through here.
//
// CORS_TODO: In production, API_BASE must match the real Worker URL.
// For dev, the Vite proxy or a localhost Worker serves the API.

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

// ── Referral ──
export const referralCode = () => apiFetch("/referral/code");

// ── Admin ──
export const adminStats = () => apiFetch("/admin/stats");

// ── Knowledge Search ──
export const knowledgeQuery = (query: string, context?: Record<string, unknown>) =>
  apiFetch("/knowledge/query", {
    method: "POST",
    body: JSON.stringify({ query, context }),
  });
export const knowledgeSources = () => apiFetch("/knowledge/sources");

// Alias for Muhurta Dashboard — matches the expected import name in muhurta-dashboard.ts
export const getMuhurtaNow = muhurtaNow;
