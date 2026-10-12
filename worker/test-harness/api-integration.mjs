// Integration test against `wrangler dev --local` (real Workers runtime + local D1).
const B = "http://127.0.0.1:8787";
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`); };
const req = async (method, path, body, token, ip = "10.0.0.1") => {
  const headers = { "content-type": "application/json", "CF-Connecting-IP": ip };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(B + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch {}
  return { s: r.status, j };
};
const login = async (phone) => {
  await req("POST", "/auth/request-otp", { phone_number: phone }, null, "10.9.9.9");
  const r = await req("POST", "/auth/verify-otp", { phone_number: phone, code: "000000", fingerprint_hash: "fp-" + phone }, null, "10.9.9.9");
  return r.j?.session_token ?? r.j?.token ?? null;
};

// ── Public config
let r = await req("GET", "/public/config");
ok("GET /public/config", r.s === 200 && r.j.whatsapp_number === "919669756111", JSON.stringify(r.j));

// ── Contact form
r = await req("POST", "/public/contact", { name: "Ravi Sharma", phone: "+91 98765 43210", topic: "vastu", message: "Need Vastu help", website: "" });
ok("contact valid -> 201", r.s === 201 && r.j.ok && r.j.whatsapp_number === "919669756111", JSON.stringify(r.j));
r = await req("POST", "/public/contact", { name: "Ravi", phone: "12345" });
ok("contact bad phone -> 400 field=phone", r.s === 400 && r.j.field === "phone", JSON.stringify(r.j));
r = await req("POST", "/public/contact", { name: "Bot", phone: "9876543210", website: "http://spam" });
ok("contact honeypot -> 200, not stored", r.s === 200 && r.j.ok && r.j.id === undefined);
r = await fetch(B + "/public/contact", { method: "POST", headers: { "content-type": "application/json", "CF-Connecting-IP": "10.0.0.2" }, body: "{bad json" });
ok("contact malformed JSON -> 400", r.status === 400);
r = await req("POST", "/public/contact", { name: "Big", phone: "9876543210", message: "x".repeat(9000) }, null, "10.0.0.3");
ok("contact oversized body -> 413", r.s === 413, String(r.s));

// ── Testimonials
r = await req("POST", "/public/testimonials", { name: "Anita Verma", phone: "9876500000", city: "Indore", service: "muhurta", rating: 5, quote: "The registration date worked out well for our family.", consent: true }, null, "10.0.1.1");
ok("testimonial valid -> 201 pending", r.s === 201 && r.j.status === "pending", JSON.stringify(r.j));
const tId = r.j?.id;
r = await req("POST", "/public/testimonials", { name: "No Consent", phone: "9876500001", quote: "Good experience overall with the app.", consent: false }, null, "10.0.1.1");
ok("testimonial without consent -> 400 field=consent", r.s === 400 && r.j.field === "consent");
r = await req("GET", "/public/testimonials");
ok("public list empty before approval", r.s === 200 && r.j.testimonials.length === 0);

// ── Rate limit: 5 submissions/hour/IP (IP 10.0.2.x is fresh)
let codes = [];
for (let i = 0; i < 6; i++) codes.push((await req("POST", "/public/contact", { name: "Rate Test", phone: "9876543210" }, null, "10.0.2.2")).s);
ok("6th submission from same IP -> 429", codes.slice(0, 5).every((c) => c === 201) && codes[5] === 429, codes.join(","));

// ── Auth on admin routes
r = await req("GET", "/admin/testimonials");
ok("admin route without token -> 401", r.s === 401);
const userTok = await login("9713455566");
ok("non-admin login works", !!userTok);
r = await req("GET", "/admin/testimonials", undefined, userTok);
ok("admin route as non-admin -> 403", r.s === 403, String(r.s));

const adminTok = await login("9669756111");
ok("admin login works", !!adminTok);

r = await req("GET", "/admin/contact-messages", undefined, adminTok);
ok("admin list contacts (new)", r.s === 200 && r.j.messages.length === 6 && r.j.messages.every((m) => m.name !== "Bot"), `count=${r.j?.messages?.length}`);
const cId = r.j?.messages?.find((m) => m.name === "Ravi Sharma")?.id;
ok("contact phone stored normalised", r.j?.messages?.find((m) => m.id === cId)?.phone === "9876543210");
r = await req("POST", `/admin/contact-messages/${cId}/status`, { status: "contacted" }, adminTok);
ok("mark contact contacted", r.s === 200 && r.j.status === "contacted");
r = await req("POST", `/admin/contact-messages/99999/status`, { status: "closed" }, adminTok);
ok("unknown contact id -> 404", r.s === 404);

r = await req("GET", "/admin/testimonials?status=pending", undefined, adminTok);
ok("admin sees pending testimonial with phone", r.s === 200 && r.j.testimonials.some((t) => t.id === tId && t.phone === "9876500000"));
r = await req("POST", `/admin/testimonials/${tId}/review`, { status: "approved" }, adminTok);
ok("approve testimonial", r.s === 200 && r.j.status === "approved");
r = await req("POST", `/admin/testimonials/${tId}/review`, { status: "maybe" }, adminTok);
ok("invalid review status -> 400", r.s === 400);
r = await req("GET", "/public/testimonials");
const pub = r.j?.testimonials?.[0];
ok("public list shows approved, name shortened, no phone", r.j.testimonials.length === 1 && pub.name === "Anita V." && !("phone" in pub), JSON.stringify(pub));

// ── Settings: change WhatsApp number, confirm public config, revert
r = await req("POST", "/admin/app-settings", { whatsapp_number: "97134 55566" }, adminTok);
ok("update whatsapp number", r.s === 200 && r.j.settings.whatsapp_number === "919713455566");
r = await req("GET", "/public/config");
ok("public config reflects new number", r.j.whatsapp_number === "919713455566");
r = await req("POST", "/admin/app-settings", { whatsapp_number: "123" }, adminTok);
ok("invalid number rejected", r.s === 400);
r = await req("POST", "/admin/app-settings", { whatsapp_number: "9669756111" }, adminTok);
ok("revert whatsapp number", r.j?.settings?.whatsapp_number === "919669756111");

// ── Activation tool
r = await req("GET", "/admin/users/lookup?phone=9812345678", undefined, adminTok);
ok("lookup unknown number -> found:false", r.s === 200 && r.j.found === false);
r = await req("POST", "/admin/users/activate", { phone: "9812345678", tier: "premium", points: 100, validity_days: 30, source: "subscription_package", note: "Paid via UPI" }, adminTok);
ok("activate new client (premium + 100 pts)", r.s === 200 && r.j.user.tier === "premium" && r.j.balance === 100, JSON.stringify({ tier: r.j?.user?.tier, balance: r.j?.balance }));
const exp = r.j?.batches?.[0]?.expires_at;
const days = exp ? (Date.parse(exp.replace(" ", "T") + "Z") - Date.now()) / 86400000 : NaN;
ok("points expire in ~30 days, SQLite datetime format", /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(exp) && days > 29.9 && days < 30.1, `${exp} (${days.toFixed(3)} d)`);
r = await req("POST", "/admin/users/activate", { phone: "9812345678", points: 50, source: "purchased_topup", validity_days: 90 }, adminTok);
ok("top-up 50 pts -> balance 150, tier unchanged", r.j?.balance === 150 && r.j?.user?.tier === "premium", JSON.stringify({ b: r.j?.balance, t: r.j?.user?.tier }));
r = await req("POST", "/admin/users/activate", { phone: "9812345678" }, adminTok);
ok("activation with nothing to change -> 400", r.s === 400);
r = await req("POST", "/admin/users/activate", { phone: "9812345678", points: 10, source: "referral_commission" }, adminTok);
ok("disallowed credit source -> 400", r.s === 400);

// Client logs in later with OTP on the same number -> same account, sees balance
const clientTok = await login("9812345678");
r = await req("GET", "/wallet/balance", undefined, clientTok);
ok("activated client logs in and sees 150 points", r.s === 200 && JSON.stringify(r.j).includes("150"), JSON.stringify(r.j).slice(0, 160));

// ── Audit trail
r = await req("GET", "/admin/audit-trail", undefined, adminTok);
const actions = (r.j?.audit_trail ?? []).map((a) => a.action);
ok("audit trail recorded every admin write", ["contact_status", "testimonial_approved", "app_settings_update", "user_activate"].every((a) => actions.includes(a)), actions.join(","));
ok("404 requests left no audit row", actions.filter((a) => a === "contact_status").length === 1, `contact_status x${actions.filter((a) => a === "contact_status").length}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
