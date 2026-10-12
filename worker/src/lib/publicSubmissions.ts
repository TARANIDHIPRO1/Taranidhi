// Validation for public website submissions (contact form, testimonials).
// Pure functions only -- no D1/KV access -- so they can be unit-tested.
//
// Rules are deliberately strict: these endpoints are unauthenticated, so
// anything that reaches the database must be bounded in size and shape.

export const CONTACT_TOPICS = [
  "muhurta-property",
  "muhurta-marriage",
  "muhurta-business",
  "muhurta-medical",
  "kundali",
  "numerology",
  "vastu",
  "subscription",
  "b2b",
  "other",
] as const;

export const TESTIMONIAL_SERVICES = [
  "muhurta",
  "kundali",
  "numerology",
  "vastu",
  "app",
  "other",
] as const;

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  cityMax: 60,
  messageMax: 1000,
  quoteMin: 20,
  quoteMax: 600,
  bodyBytesMax: 8 * 1024,
} as const;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; field: string; error: string };

export interface ContactInput {
  name: string;
  phone: string;
  topic: string;
  message: string;
}

export interface TestimonialInput {
  name: string;
  city: string;
  service: string;
  rating: number | null;
  quote: string;
  phone: string;
}

// Strip ASCII control characters. Newlines/tabs are kept only when
// allowMultiline is true (message / quote fields).
export function cleanText(raw: unknown, allowMultiline = false): string {
  if (typeof raw !== "string") return "";
  const pattern = allowMultiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  let s = raw.replace(pattern, allowMultiline ? "" : " ");
  if (allowMultiline) s = s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n");
  else s = s.replace(/\s+/g, " ");
  return s.trim();
}

// Accepts "9876543210", "+91 98765 43210", "09876543210", "91-9876543210".
// Returns the bare 10-digit number, or null if it is not a valid Indian
// mobile (must start with 6-9).
export function normalizeIndianMobile(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  let digits = String(raw).replace(/[^\d]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const LINK_OR_MARKUP = /(https?:\/\/|www\.|<[a-z/!])/i;

function validateName(raw: unknown): ValidationResult<string> {
  const name = cleanText(raw);
  if (name.length < LIMITS.nameMin) return { ok: false, field: "name", error: "Please enter your name." };
  if (name.length > LIMITS.nameMax) return { ok: false, field: "name", error: `Name must be ${LIMITS.nameMax} characters or fewer.` };
  if (LINK_OR_MARKUP.test(name)) return { ok: false, field: "name", error: "Name cannot contain links or markup." };
  return { ok: true, value: name };
}

export function validateContact(body: unknown): ValidationResult<ContactInput> {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const name = validateName(b.name);
  if (!name.ok) return name;

  const phone = normalizeIndianMobile(b.phone);
  if (!phone) return { ok: false, field: "phone", error: "Enter a valid 10-digit Indian mobile number." };

  const topicRaw = typeof b.topic === "string" && b.topic ? b.topic : "other";
  if (!(CONTACT_TOPICS as readonly string[]).includes(topicRaw)) {
    return { ok: false, field: "topic", error: "Unknown topic." };
  }

  const message = cleanText(b.message, true);
  if (message.length > LIMITS.messageMax) {
    return { ok: false, field: "message", error: `Message must be ${LIMITS.messageMax} characters or fewer.` };
  }

  return { ok: true, value: { name: name.value, phone, topic: topicRaw, message } };
}

export function validateTestimonial(body: unknown): ValidationResult<TestimonialInput> {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const name = validateName(b.name);
  if (!name.ok) return name;

  const phone = normalizeIndianMobile(b.phone);
  if (!phone) return { ok: false, field: "phone", error: "Enter a valid 10-digit Indian mobile number." };

  const city = cleanText(b.city);
  if (city.length > LIMITS.cityMax) return { ok: false, field: "city", error: `City must be ${LIMITS.cityMax} characters or fewer.` };
  if (LINK_OR_MARKUP.test(city)) return { ok: false, field: "city", error: "City cannot contain links or markup." };

  const service = typeof b.service === "string" && b.service ? b.service : "other";
  if (!(TESTIMONIAL_SERVICES as readonly string[]).includes(service)) {
    return { ok: false, field: "service", error: "Unknown service." };
  }

  let rating: number | null = null;
  if (b.rating !== undefined && b.rating !== null && b.rating !== "") {
    const r = Number(b.rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return { ok: false, field: "rating", error: "Rating must be a whole number from 1 to 5." };
    rating = r;
  }

  const quote = cleanText(b.quote, true);
  if (quote.length < LIMITS.quoteMin) return { ok: false, field: "quote", error: `Please write at least ${LIMITS.quoteMin} characters.` };
  if (quote.length > LIMITS.quoteMax) return { ok: false, field: "quote", error: `Feedback must be ${LIMITS.quoteMax} characters or fewer.` };
  if (LINK_OR_MARKUP.test(quote)) return { ok: false, field: "quote", error: "Feedback cannot contain links or markup." };

  if (b.consent !== true) {
    return { ok: false, field: "consent", error: "Please confirm that we may publish your feedback." };
  }

  return { ok: true, value: { name: name.value, city, service, rating, quote, phone } };
}

// Honeypot: a hidden "website" field real users never fill in.
export function isHoneypotTripped(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>).website;
  return typeof v === "string" && v.trim().length > 0;
}

// Public display: first name + last initial ("Ravi Sharma" -> "Ravi S.").
// Single-word names are shown as given.
export function publicDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";
  return `${parts[0]} ${Array.from(last)[0] ?? ""}.`;
}
