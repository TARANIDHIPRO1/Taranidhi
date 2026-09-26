// House-Activity Mapping -- the taxonomy layer from ARCHITECTURE.md Section
// 2-3 and docs/HOUSE_ACTIVITY_MAPPING.md. The user picks a category from a
// menu; this table resolves it to the house(s) the Universal KP Engine
// evaluates. Extending coverage = adding a row here, not new calc logic.
//
// IMPORTANT: when an activity maps to >1 house, the combination logic (AND
// vs weighted average) is NOT YET DECIDED -- see ARCHITECTURE.md. The engine
// must evaluate each house independently and return per-house verdicts. The
// caller decides how to combine them once the domain owner specifies the rule.

export interface HouseMapping {
  /** Unique slug for this activity, used as the API identifier. */
  slug: string;
  /** Human-readable label for the UI category picker. */
  label: string;
  /** Parent category for UI grouping. */
  category: string;
  /** Primary house(s) to evaluate. Order matters: first = most relevant. */
  houses: number[];
  /** Natural significator planet(s), for display/educational context only --
   *  the verdict is driven by sub-lord analysis, not by natural significators. */
  naturalSignificators?: string[];
  /** Notes from HOUSE_ACTIVITY_MAPPING.md, preserved for domain-owner review. */
  notes?: string;
}

export const HOUSE_ACTIVITY_MAP: HouseMapping[] = [
  // ── Career/Profession ──
  { slug: "job-interview", label: "Job interview", category: "Career", houses: [6, 10], naturalSignificators: ["Saturn", "Sun"] },
  { slug: "resume-application", label: "Sending resume / job application", category: "Career", houses: [6, 10] },
  { slug: "salary-negotiation", label: "Salary negotiation", category: "Career", houses: [2, 6, 10], naturalSignificators: ["Jupiter"] },
  { slug: "job-change", label: "Job change / resignation", category: "Career", houses: [10], naturalSignificators: ["Sun"] },
  { slug: "promotion", label: "Promotion", category: "Career", houses: [10, 6], naturalSignificators: ["Sun"], notes: "6th if competitive" },
  { slug: "new-business", label: "Starting a new business", category: "Career", houses: [7, 10], naturalSignificators: ["Mercury"] },
  { slug: "business-partner-meeting", label: "Business partner meeting", category: "Career", houses: [7], naturalSignificators: ["Mercury"] },
  { slug: "business-contract", label: "Signing a business contract", category: "Career", houses: [7, 3], naturalSignificators: ["Mercury"], notes: "3rd for document/communication" },

  // ── Finance ──
  { slug: "receiving-payment", label: "Receiving payment", category: "Finance", houses: [2, 11], naturalSignificators: ["Jupiter"] },
  { slug: "making-payment", label: "Making a payment", category: "Finance", houses: [2, 12], naturalSignificators: ["Jupiter", "Saturn"], notes: "12th for expenditure" },
  { slug: "loan-application", label: "Applying for a loan", category: "Finance", houses: [6, 11], naturalSignificators: ["Saturn"], notes: "6th=debt, 11th if goal is gain" },
  { slug: "loan-repayment", label: "Repaying a loan", category: "Finance", houses: [6, 8], naturalSignificators: ["Saturn"], notes: "8th if joint funds" },
  { slug: "large-purchase", label: "Large purchase (non-property)", category: "Finance", houses: [2], naturalSignificators: ["Jupiter"] },

  // ── Health ──
  { slug: "doctor-visit", label: "Doctor visit (routine)", category: "Health", houses: [6], naturalSignificators: ["Mars", "Saturn"] },
  { slug: "diagnostic-test", label: "Diagnostic test / lab work", category: "Health", houses: [8], naturalSignificators: ["Saturn", "Mars"], notes: "Karyesh-Bala reversal: 8th strength here is wanted, not feared" },
  { slug: "surgery", label: "Surgery", category: "Health", houses: [6, 8], naturalSignificators: ["Mars", "Saturn"], notes: "Classically both checked together" },
  { slug: "medical-treatment", label: "Starting medical treatment", category: "Health", houses: [6] },
  { slug: "hospitalization", label: "Hospitalization", category: "Health", houses: [8, 12], notes: "12th for confinement" },

  // ── Relationships ──
  { slug: "marriage-proposal", label: "Proposing marriage / romantic intent", category: "Relationships", houses: [5, 7], naturalSignificators: ["Venus"], notes: "Multi-house: evaluate both" },
  { slug: "marriage-muhurta", label: "Marriage muhurta", category: "Relationships", houses: [7], naturalSignificators: ["Venus", "Jupiter"] },
  { slug: "first-meeting-partner", label: "First meeting prospective partner", category: "Relationships", houses: [7, 5], naturalSignificators: ["Venus"] },
  { slug: "relationship-conflict", label: "Resolving relationship conflict", category: "Relationships", houses: [7], naturalSignificators: ["Venus"] },

  // ── Travel ──
  { slug: "short-travel", label: "Short / local travel", category: "Travel", houses: [3], naturalSignificators: ["Mars"] },
  { slug: "long-travel", label: "Long-distance / foreign travel", category: "Travel", houses: [9, 12], naturalSignificators: ["Jupiter"], notes: "12th if relocating abroad" },
  { slug: "flight-departure", label: "Catching a flight / departure timing", category: "Travel", houses: [3], naturalSignificators: ["Mars"] },
  { slug: "visa-immigration", label: "Immigration / visa application", category: "Travel", houses: [9, 12] },

  // ── Education ──
  { slug: "basic-schooling", label: "Basic schooling", category: "Education", houses: [4], naturalSignificators: ["Mercury", "Jupiter"] },
  { slug: "exam", label: "Exam / test", category: "Education", houses: [5, 6], naturalSignificators: ["Mercury"], notes: "5th=intelligence, 6th=competition" },
  { slug: "higher-education", label: "Higher education / research admission", category: "Education", houses: [9], naturalSignificators: ["Jupiter"] },
  { slug: "research-occult", label: "Research / occult study", category: "Education", houses: [8], naturalSignificators: ["Saturn"], notes: "Karyesh-Bala reversal case" },

  // ── Property ──
  { slug: "buy-rent-property", label: "Buying / renting property", category: "Property", houses: [4], naturalSignificators: ["Mars", "Venus"] },
  { slug: "griha-pravesh", label: "Home inauguration (griha-pravesh)", category: "Property", houses: [4], notes: "Full-election, super-premium tier feature" },
  { slug: "vehicle-purchase", label: "Vehicle purchase", category: "Property", houses: [4], naturalSignificators: ["Venus"] },

  // ── Legal ──
  { slug: "court-case-filing", label: "Filing a court case", category: "Legal", houses: [6], naturalSignificators: ["Saturn"], notes: "Karyesh-Bala reversal case" },
  { slug: "court-hearing", label: "Court hearing date", category: "Legal", houses: [6] },
  { slug: "legal-document", label: "Signing legal document (non-business)", category: "Legal", houses: [6, 3] },

  // ── Spiritual/Religious ──
  { slug: "spiritual-practice", label: "Starting spiritual practice", category: "Spiritual", houses: [9, 12], naturalSignificators: ["Jupiter", "Ketu"], notes: "9th=belief/dharma; 12th=liberation" },
  { slug: "pilgrimage", label: "Pilgrimage", category: "Spiritual", houses: [9, 12], naturalSignificators: ["Jupiter"] },
  { slug: "puja-ritual", label: "Puja / ritual timing", category: "Spiritual", houses: [9], naturalSignificators: ["Jupiter"] },

  // ── Communication ──
  { slug: "important-call", label: "Important phone call", category: "Communication", houses: [3], naturalSignificators: ["Mercury"] },
  { slug: "important-message", label: "Sending important email / message", category: "Communication", houses: [3], naturalSignificators: ["Mercury"] },
  { slug: "public-announcement", label: "Public announcement", category: "Communication", houses: [3, 10], naturalSignificators: ["Mercury"], notes: "10th if career-related" },
];

/** Look up a mapping by slug. Returns undefined if the slug is not in the table. */
export function getHouseMapping(slug: string): HouseMapping | undefined {
  return HOUSE_ACTIVITY_MAP.find((m) => m.slug === slug);
}

/** Return all unique category names, in the order they first appear in the table. */
export function getCategories(): string[] {
  const seen = new Set<string>();
  const cats: string[] = [];
  for (const m of HOUSE_ACTIVITY_MAP) {
    if (!seen.has(m.category)) {
      seen.add(m.category);
      cats.push(m.category);
    }
  }
  return cats;
}

/** Return all mappings in a given category. */
export function getMappingsForCategory(category: string): HouseMapping[] {
  return HOUSE_ACTIVITY_MAP.filter((m) => m.category === category);
}
