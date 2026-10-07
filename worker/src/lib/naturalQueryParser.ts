// Natural Language Query Parser
//
// Converts free-text Hindi/English questions to KP activity slugs.
// ZERO external dependencies -- pure deterministic keyword matching.
// No LLM, no API calls, no runtime cost.
//
// Strategy: each activity slug has a keyword list (Hindi + English).
// We scan the lowercased question for each keyword, count matches, and
// pick the slug with the highest match score. Ties broken by primary-house
// specificity (fewer houses = more specific activity = preferred).
//
// Verified: all 35 slugs from houseActivityMap.ts are covered below.

export interface ParsedQuery {
  slug: string;
  label: string;
  confidence: number; // 0-100
  detectedTerms: string[];
  allMatches: Array<{ slug: string; score: number }>;
}

export interface ParseResult {
  matched: ParsedQuery | null;
  unrecognized: boolean; // true if nothing scored >= MIN_SCORE
}

const MIN_SCORE = 1; // At least 1 keyword match required

interface SlugKeywords {
  slug: string;
  label: string;
  keywords: string[]; // all lowercase; partial word match is fine
}

// ── Keyword map ─────────────────────────────────────────────────────────────
//
// Rules:
// - List the most specific phrases first (longer = more specific)
// - Include common misspellings and transliterations
// - Hindi keywords are transliterated (Roman script), not Devanagari,
//   because users type them in Roman script in most cases
// - Each keyword match increments the score by 1
//   (a 2-word phrase counts as 1 match, not 2)

const SLUG_KEYWORDS: SlugKeywords[] = [

  // ── Career ─────────────────────────────────────────────────────────────────

  {
    slug: "job-interview",
    label: "Job interview",
    keywords: [
      "interview ke liye ja", "interview dene ja", "interview jaana",
      "interview ke liye", "job interview", "interview dena",
      "interview", "naukri interview", "job ka interview",
    ],
  },
  {
    slug: "resume-application",
    label: "Sending resume / job application",
    keywords: [
      "resume bhejne", "resume bhejna", "cv bhejna", "apply karna naukri",
      "job application", "resume", "cv", "apply for job", "naukri ke liye apply",
      "job apply",
    ],
  },
  {
    slug: "salary-negotiation",
    label: "Salary negotiation",
    keywords: [
      "salary negotiate", "salary badhaana", "hike maangna",
      "increment ke liye", "salary negotiation", "pay raise",
      "salary hike", "increment", "ctc negotiate", "salary",
    ],
  },
  {
    slug: "job-change",
    label: "Job change / resignation",
    keywords: [
      "naukri badalna", "naukri chhodna", "resign karna",
      "job change karna", "resign dena", "resignation",
      "job change", "naukri chhodni", "company change",
    ],
  },
  {
    slug: "promotion",
    label: "Promotion",
    keywords: [
      "promotion ke liye", "promotion maangna", "terrakki", "tarakki",
      "promotion", "advance karna", "aagey badhna",
    ],
  },
  {
    slug: "new-business",
    label: "Starting a new business",
    keywords: [
      "business shuru karna", "naya business", "vyapaar shuru",
      "startup karna", "new business", "dukaan kholna",
      "business start", "business open", "shop kholna",
    ],
  },
  {
    slug: "business-partner-meeting",
    label: "Business partner meeting",
    keywords: [
      "client se milne jaana", "client se milna", "client ko milna",
      "business partner se milna", "client meeting ke liye",
      "client ke paas jaana", "client se milne",
      "client meeting", "partner meeting", "business meeting",
      "client", "partner se milna",
    ],
  },
  {
    slug: "business-contract",
    label: "Signing a business contract",
    keywords: [
      "contract sign karna", "agreement sign karna", "deed sign karna",
      "business contract", "samjhauta karna", "karar karna",
      "contract", "agreement sign", "deed",
    ],
  },

  // ── Finance ─────────────────────────────────────────────────────────────────

  {
    slug: "receiving-payment",
    label: "Receiving payment",
    keywords: [
      "payment lena", "paise milna", "payment receive karna",
      "paisa milega", "money receive", "payment milegi",
      "payment collect", "dues lena",
    ],
  },
  {
    slug: "making-payment",
    label: "Making a payment",
    keywords: [
      "payment karna", "bill pay karna", "paise dena",
      "payment bhejna", "paisa dena", "bill bhar na",
      "bill pay", "payment send",
    ],
  },
  {
    slug: "loan-application",
    label: "Applying for a loan",
    keywords: [
      "loan lena", "bank loan ke liye", "karz lena",
      "loan apply karna", "loan application",
      "loan ke liye jana", "rin lena",
    ],
  },
  {
    slug: "loan-repayment",
    label: "Repaying a loan",
    keywords: [
      "loan chukana", "emi bharna", "karz chukana",
      "loan pay karna", "emi pay", "rin chukana",
      "emi", "loan repay",
    ],
  },
  {
    slug: "large-purchase",
    label: "Large purchase (non-property)",
    keywords: [
      "bada kharidna", "costly cheez kharidna", "expensive item",
      "large purchase", "mahanga kharidna",
    ],
  },

  // ── Health ──────────────────────────────────────────────────────────────────

  {
    slug: "doctor-visit",
    label: "Doctor visit (routine)",
    keywords: [
      "doctor ke paas jaana", "doctor se milna", "hospital jaana",
      "doctor ko dikhana", "checkup ke liye jaana",
      "doctor visit", "doctor jaana", "checkup", "doctor",
    ],
  },
  {
    slug: "diagnostic-test",
    label: "Diagnostic test / lab work",
    keywords: [
      "blood test karwana", "lab test", "test karwana",
      "diagnostic test", "blood test", "report karwana",
      "pathology", "scan karwana", "mri", "xray",
    ],
  },
  {
    slug: "surgery",
    label: "Surgery",
    keywords: [
      "operation karwana", "surgery ke liye", "operation karana",
      "surgery", "operation",
    ],
  },
  {
    slug: "medical-treatment",
    label: "Starting medical treatment",
    keywords: [
      "treatment shuru karna", "dawa shuru karna",
      "medicine start karna", "ilaj shuru",
      "treatment", "dawa", "medicine shuru",
    ],
  },
  {
    slug: "hospitalization",
    label: "Hospitalization",
    keywords: [
      "hospital mein admit", "admit hona", "hospital admit",
      "hospitalization",
    ],
  },

  // ── Relationships ───────────────────────────────────────────────────────────

  {
    slug: "marriage-proposal",
    label: "Proposing marriage / romantic intent",
    keywords: [
      "shaadi ka proposal", "rishta bhejana", "propose karna",
      "marriage proposal", "ladki ko propose", "ladke ko propose",
      "rishta dena", "rishta",
    ],
  },
  {
    slug: "marriage-muhurta",
    label: "Marriage muhurta",
    keywords: [
      "shaadi ka muhurta", "wedding date", "vivah muhurta",
      "shaadi kab karein", "marriage muhurta",
      "shaadi", "vivah", "wedding",
    ],
  },
  {
    slug: "first-meeting-partner",
    label: "First meeting prospective partner",
    keywords: [
      "pehli baar milna", "pehli mulakat", "first meeting",
      "first date", "bride dekhna", "groom dekhna",
    ],
  },
  {
    slug: "relationship-conflict",
    label: "Resolving relationship conflict",
    keywords: [
      "ladai suljaana", "jhagda khatam", "patch up karna",
      "conflict resolve", "relationship solve", "ladai",
    ],
  },

  // ── Travel ──────────────────────────────────────────────────────────────────

  {
    slug: "short-travel",
    label: "Short / local travel",
    keywords: [
      "local trip", "bahar jaana", "paas ki jagah jaana",
      "short trip", "ghumne jaana", "yatra", "safar",
    ],
  },
  {
    slug: "long-travel",
    label: "Long-distance / foreign travel",
    keywords: [
      "foreign jaana", "pardesh jaana", "videsh jaana",
      "foreign trip", "abroad jaana", "long trip",
      "foreign", "abroad", "videsh",
    ],
  },
  {
    slug: "flight-departure",
    label: "Catching a flight / departure timing",
    keywords: [
      "flight pakadna", "airport jaana", "flight ke liye jaana",
      "flight", "airport", "udaan",
    ],
  },
  {
    slug: "visa-immigration",
    label: "Immigration / visa application",
    keywords: [
      "visa apply karna", "visa ke liye", "immigration",
      "visa", "pr ke liye",
    ],
  },

  // ── Education ───────────────────────────────────────────────────────────────

  {
    slug: "basic-schooling",
    label: "Basic schooling",
    keywords: [
      "school admission", "school mein dakhila", "school ke liye",
      "admission karna school",
    ],
  },
  {
    slug: "exam",
    label: "Exam / test",
    keywords: [
      "exam dena", "pariksha dena", "test dena",
      "exam ke liye jaana", "exam", "pariksha", "test",
      "paper dena",
    ],
  },
  {
    slug: "higher-education",
    label: "Higher education / research admission",
    keywords: [
      "college admission", "university ke liye", "masters ke liye",
      "phd ke liye", "higher education", "ug admission",
      "college", "university admission",
    ],
  },
  {
    slug: "research-occult",
    label: "Research / occult study",
    keywords: [
      "research karna", "jyotish seekhna", "occult",
      "research", "adhyayan",
    ],
  },

  // ── Property ────────────────────────────────────────────────────────────────

  {
    slug: "buy-rent-property",
    label: "Buying / renting property",
    keywords: [
      "property kharidna", "ghar kharidna", "makaan kharidna",
      "plot kharidna", "rent pe lena", "flat kharidna",
      "property", "ghar", "makaan", "plot", "flat",
    ],
  },
  {
    slug: "griha-pravesh",
    label: "Home inauguration (griha-pravesh)",
    keywords: [
      "griha pravesh", "greh pravesh", "ghar mein jaana naya",
      "naye ghar mein jaana", "gruha pravesh",
      "griha pravesh muhurta",
    ],
  },
  {
    slug: "vehicle-purchase",
    label: "Vehicle purchase",
    keywords: [
      "car kharidna", "bike kharidna", "gaadi kharidna",
      "vehicle kharidna", "scooter kharidna",
      "car", "bike kharidna", "gaadi",
    ],
  },

  // ── Legal ────────────────────────────────────────────────────────────────────

  {
    slug: "court-case-filing",
    label: "Filing a court case",
    keywords: [
      "case file karna", "muqadma dakhil karna", "fir darz karna",
      "complaint file", "case file",
    ],
  },
  {
    slug: "court-hearing",
    label: "Court hearing date",
    keywords: [
      "court jaana", "adalat mein jaana", "hearing ke liye",
      "court hearing", "muqadma", "case ki sunwai",
      "court", "adalat",
    ],
  },
  {
    slug: "legal-document",
    label: "Signing legal document (non-business)",
    keywords: [
      "papers sign karna", "legal papers", "document sign karna",
      "affidavit", "power of attorney", "poa sign",
    ],
  },

  // ── Spiritual ────────────────────────────────────────────────────────────────

  {
    slug: "spiritual-practice",
    label: "Starting spiritual practice",
    keywords: [
      "meditation shuru karna", "yoga shuru karna",
      "dhyan karna", "sadhana shuru", "tapasya",
      "meditation", "yoga", "dhyan", "sadhana",
    ],
  },
  {
    slug: "pilgrimage",
    label: "Pilgrimage",
    keywords: [
      "tirth yatra", "mandir jaana", "char dham",
      "tirtha", "pilgrimage", "tirth", "yatra mandir",
    ],
  },
  {
    slug: "puja-ritual",
    label: "Puja / ritual timing",
    keywords: [
      "puja karna", "havan karna", "pooja ka muhurta",
      "puja muhurta", "havan", "puja", "pooja", "ritual",
    ],
  },

  // ── Communication ────────────────────────────────────────────────────────────

  {
    slug: "important-call",
    label: "Important phone call",
    keywords: [
      "important call karna", "phone karna", "call lagana",
      "important call", "call karna", "phone",
    ],
  },
  {
    slug: "important-message",
    label: "Sending important email / message",
    keywords: [
      "important message bhejna", "email bhejna", "letter bhejna",
      "important email", "message bhejna", "email",
    ],
  },
  {
    slug: "public-announcement",
    label: "Public announcement",
    keywords: [
      "press conference", "announcement karna", "speech dena",
      "public announcement", "prasaran", "launch",
    ],
  },
];

// ── Parser core ──────────────────────────────────────────────────────────────

/**
 * Parse a free-text question and return the best matching activity slug.
 * Pure function, no I/O.
 */
export function parseNaturalQuery(question: string): ParseResult {
  const q = question.toLowerCase().trim();

  const scores: Array<{ slug: string; label: string; score: number; terms: string[] }> = [];

  for (const entry of SLUG_KEYWORDS) {
    let score = 0;
    const matched: string[] = [];

    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        score++;
        matched.push(kw);
      }
    }

    if (score > 0) {
      scores.push({ slug: entry.slug, label: entry.label, score, terms: matched });
    }
  }

  if (scores.length === 0) {
    return { matched: null, unrecognized: true };
  }

  // Sort: highest score first, then by keyword specificity (longer matched term)
  scores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreak: prefer longer matched keywords (more specific)
    const aLen = Math.max(...a.terms.map((t) => t.length));
    const bLen = Math.max(...b.terms.map((t) => t.length));
    return bLen - aLen;
  });

  const best = scores[0]!;
  // Confidence: scale score 1..5 → 50..95
  const confidence = Math.min(95, 50 + best.score * 9);

  return {
    matched: {
      slug: best.slug,
      label: best.label,
      confidence,
      detectedTerms: best.terms,
      allMatches: scores.slice(0, 5).map((s) => ({ slug: s.slug, score: s.score })),
    },
    unrecognized: false,
  };
}
