import { describe, it, expect } from "vitest";
import {
  cleanText,
  normalizeIndianMobile,
  validateContact,
  validateTestimonial,
  isHoneypotTripped,
  publicDisplayName,
  LIMITS,
} from "../publicSubmissions";
import { validateActivation, validateSettingsPatch, ACTIVATION_LIMITS } from "../../routes/adminSite";

describe("normalizeIndianMobile", () => {
  it.each([
    ["9669756111", "9669756111"],
    ["+91 96697 56111", "9669756111"],
    ["919669756111", "9669756111"],
    ["09669756111", "9669756111"],
    ["+91-96697-56111", "9669756111"],
  ])("accepts %s", (input, out) => expect(normalizeIndianMobile(input)).toBe(out));

  it.each([
    ["5669756111"], // must start 6-9
    ["966975611"], // 9 digits
    ["97134555766"], // 11 digits, not 0/91 prefixed
    ["abcdefghij"],
    [""],
  ])("rejects %s", (input) => expect(normalizeIndianMobile(input)).toBeNull());

  it("rejects non-string input", () => {
    expect(normalizeIndianMobile(null)).toBeNull();
    expect(normalizeIndianMobile({})).toBeNull();
  });
});

describe("cleanText", () => {
  it("collapses whitespace and strips control characters on single-line fields", () => {
    expect(cleanText("  Ravi \u0000 Sharma\n ")).toBe("Ravi Sharma");
  });
  it("keeps newlines in multiline fields but caps blank runs", () => {
    expect(cleanText("a\r\n\r\n\r\n\r\nb", true)).toBe("a\n\nb");
  });
  it("keeps Hindi text intact", () => {
    expect(cleanText("नवीन राय")).toBe("नवीन राय");
  });
});

describe("validateContact", () => {
  const good = { name: "Ravi Sharma", phone: "9876543210", topic: "vastu", message: "Need a consultation." };

  it("accepts a valid enquiry and normalises the phone", () => {
    const r = validateContact({ ...good, phone: "+91 98765 43210" });
    expect(r).toEqual({ ok: true, value: { ...good } });
  });
  it("defaults an empty topic to 'other'", () => {
    const r = validateContact({ ...good, topic: "" });
    expect(r.ok && r.value.topic).toBe("other");
  });
  it("rejects unknown topics", () => {
    expect(validateContact({ ...good, topic: "hack" })).toMatchObject({ ok: false, field: "topic" });
  });
  it("rejects short names, links in names, bad phones", () => {
    expect(validateContact({ ...good, name: "R" })).toMatchObject({ ok: false, field: "name" });
    expect(validateContact({ ...good, name: "Buy http://x.io" })).toMatchObject({ ok: false, field: "name" });
    expect(validateContact({ ...good, phone: "12345" })).toMatchObject({ ok: false, field: "phone" });
  });
  it("enforces the message length limit at the boundary", () => {
    expect(validateContact({ ...good, message: "x".repeat(LIMITS.messageMax) }).ok).toBe(true);
    expect(validateContact({ ...good, message: "x".repeat(LIMITS.messageMax + 1) })).toMatchObject({ ok: false, field: "message" });
  });
  it("handles a non-object body", () => {
    expect(validateContact(null)).toMatchObject({ ok: false, field: "name" });
  });
});

describe("validateTestimonial", () => {
  const good = {
    name: "Anita Verma",
    phone: "9876543210",
    city: "Indore",
    service: "muhurta",
    rating: 5,
    quote: "The property registration date worked out well for us.",
    consent: true,
  };

  it("accepts valid feedback", () => {
    const r = validateTestimonial(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ name: "Anita Verma", rating: 5, phone: "9876543210" });
  });
  it("requires explicit boolean consent", () => {
    expect(validateTestimonial({ ...good, consent: false })).toMatchObject({ ok: false, field: "consent" });
    expect(validateTestimonial({ ...good, consent: "true" })).toMatchObject({ ok: false, field: "consent" });
  });
  it("treats rating as optional but bounded 1-5 integers", () => {
    expect(validateTestimonial({ ...good, rating: undefined }).ok).toBe(true);
    expect(validateTestimonial({ ...good, rating: 0 })).toMatchObject({ ok: false, field: "rating" });
    expect(validateTestimonial({ ...good, rating: 6 })).toMatchObject({ ok: false, field: "rating" });
    expect(validateTestimonial({ ...good, rating: 4.5 })).toMatchObject({ ok: false, field: "rating" });
  });
  it("enforces quote length boundaries", () => {
    expect(validateTestimonial({ ...good, quote: "x".repeat(LIMITS.quoteMin) }).ok).toBe(true);
    expect(validateTestimonial({ ...good, quote: "x".repeat(LIMITS.quoteMin - 1) })).toMatchObject({ ok: false, field: "quote" });
    expect(validateTestimonial({ ...good, quote: "x".repeat(LIMITS.quoteMax + 1) })).toMatchObject({ ok: false, field: "quote" });
  });
  it("rejects links and markup in the quote", () => {
    expect(validateTestimonial({ ...good, quote: "Great service, visit www.spam.example now" })).toMatchObject({ ok: false, field: "quote" });
    expect(validateTestimonial({ ...good, quote: "<script>alert(1)</script> lovely experience" })).toMatchObject({ ok: false, field: "quote" });
  });
});

describe("honeypot and display name", () => {
  it("trips only when the hidden field has content", () => {
    expect(isHoneypotTripped({ website: "" })).toBe(false);
    expect(isHoneypotTripped({ website: "  " })).toBe(false);
    expect(isHoneypotTripped({ website: "http://bot" })).toBe(true);
    expect(isHoneypotTripped(null)).toBe(false);
  });
  it("shortens to first name plus last initial", () => {
    expect(publicDisplayName("Ravi Kumar Sharma")).toBe("Ravi S.");
    expect(publicDisplayName("Ravi")).toBe("Ravi");
    expect(publicDisplayName("नवीन राय")).toBe("नवीन र.");
  });
});

describe("validateActivation", () => {
  it("normalises phone to +91 and applies the default validity", () => {
    const r = validateActivation({ phone: "96697 56111", tier: "premium", points: 100 });
    expect(r).toEqual({
      ok: true,
      value: {
        phoneE164: "+919669756111",
        tier: "premium",
        points: 100,
        validityDays: ACTIVATION_LIMITS.validityDaysDefault,
        source: "subscription_package",
        note: "",
      },
    });
  });
  it("allows tier-only and points-only activations", () => {
    expect(validateActivation({ phone: "9669756111", tier: "ultra" }).ok).toBe(true);
    expect(validateActivation({ phone: "9669756111", points: 50, validity_days: 30, source: "purchased_topup" }).ok).toBe(true);
  });
  it("rejects an activation that changes nothing", () => {
    expect(validateActivation({ phone: "9669756111" })).toMatchObject({ ok: false });
  });
  it("rejects bad tiers, points and validity at the boundaries", () => {
    expect(validateActivation({ phone: "9669756111", tier: "gold" }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: 0 }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: -5 }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: 1.5 }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: ACTIVATION_LIMITS.pointsMax }).ok).toBe(true);
    expect(validateActivation({ phone: "9669756111", points: ACTIVATION_LIMITS.pointsMax + 1 }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: 10, validity_days: 0 }).ok).toBe(false);
    expect(validateActivation({ phone: "9669756111", points: 10, validity_days: ACTIVATION_LIMITS.validityDaysMax + 1 }).ok).toBe(false);
  });
  it("rejects credit sources outside the wallet_ledger CHECK list", () => {
    expect(validateActivation({ phone: "9669756111", points: 10, source: "referral_commission" }).ok).toBe(false);
  });
});

describe("validateSettingsPatch", () => {
  it("stores WhatsApp numbers in wa.me format (91 + 10 digits)", () => {
    expect(validateSettingsPatch({ whatsapp_number: "+91 97134 55566" })).toEqual({ ok: true, patch: { whatsapp_number: "919713455566" } });
  });
  it("validates email and rejects empty patches", () => {
    expect(validateSettingsPatch({ contact_email: "Info@OccultViision.com" })).toEqual({ ok: true, patch: { contact_email: "info@occultviision.com" } });
    expect(validateSettingsPatch({ contact_email: "not-an-email" }).ok).toBe(false);
    expect(validateSettingsPatch({}).ok).toBe(false);
    expect(validateSettingsPatch(null).ok).toBe(false);
  });
  it("rejects an invalid number without touching other keys", () => {
    expect(validateSettingsPatch({ whatsapp_number: "12345", contact_email: "a@b.co" }).ok).toBe(false);
  });
});
