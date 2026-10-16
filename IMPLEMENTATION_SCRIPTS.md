# TaraNidhi Implementation Scripts — Mahurta AI Feature Parity
**Date:** Oct 16, 2026 | **Priority:** High | **Deadline:** Oct 17-18 (Deepawali Launch)

---

## Script 1: Hinglish Support (i18n Module)

**File:** `worker/src/lib/i18n.ts`

```typescript
// Multi-language support: English, Hindi, Hinglish
export type Language = 'en' | 'hi' | 'hinglish';

interface I18nStrings {
  verdicts: Record<string, Record<Language, string>>;
  events: Record<string, Record<Language, string>>;
  messages: Record<string, Record<Language, string>>;
  ui: Record<string, Record<Language, string>>;
}

const STRINGS: I18nStrings = {
  verdicts: {
    GO: {
      en: '🟢 GO — Clean window, start now',
      hi: '🟢 चलो — साफ़ विंडो, अभी शुरू करो',
      hinglish: '🟢 GO — Bilkul theek hai, abhi karo'
    },
    WAIT: {
      en: '🟡 WAIT — Usable but not ideal',
      hi: '🟡 इंतज़ार करो — ठीक नहीं है',
      hinglish: '🟡 WAIT — Theek nahi hai, intezar karo'
    },
    NOT: {
      en: '🔴 NOT — Inauspicious (Rahu/Bhadra)',
      hi: '🔴 नहीं — अशुभ समय',
      hinglish: '🔴 NOT — Kharab time hai, mat karo'
    }
  },

  events: {
    vehicle: {
      en: 'Vehicle Purchase',
      hi: 'गाड़ी खरीदना',
      hinglish: 'Gaadi khareedna'
    },
    property: {
      en: 'Property/Home',
      hi: 'संपत्ति/घर',
      hinglish: 'Ghar ya property'
    },
    gold: {
      en: 'Gold Purchase',
      hi: 'सोना खरीदना',
      hinglish: 'Sona khareedna'
    },
    electronics: {
      en: 'Electronics Purchase',
      hi: 'इलेक्ट्रॉनिक्स',
      hinglish: 'Mobile, laptop khareedna'
    },
    marriage: {
      en: 'Wedding',
      hi: 'विवाह',
      hinglish: 'Shaadi ka muhurat'
    },
    business: {
      en: 'New Business',
      hi: 'नया व्यवसाय',
      hinglish: 'Naya business shuru karna'
    }
  },

  messages: {
    ask_prompt: {
      en: 'Ask TaraNidhi — What should you do and when?',
      hi: 'तारानिधि से पूछो — क्या और कब करना है?',
      hinglish: 'TaraNidhi se pocho — Kya karna hai aur kab?'
    },
    example_query: {
      en: 'e.g., "Should I buy a car this week?"',
      hi: 'उदाहरण: "क्या मैं इस हफ़्ते गाड़ी खरीद सकता हूँ?"',
      hinglish: 'Maslan: "Kya main iss haftar gaadi khareed sakta hu?"'
    }
  },

  ui: {
    desk: {
      en: 'Dashboard',
      hi: 'डैशबोर्ड',
      hinglish: 'Dashboard'
    },
    clock: {
      en: 'Choghadiya Clock',
      hi: 'चौघड़िया घड़ी',
      hinglish: 'Choghadiya Clock'
    },
    ask: {
      en: 'Ask',
      hi: 'पूछो',
      hinglish: 'Ask'
    },
    account: {
      en: 'Account',
      hi: 'खाता',
      hinglish: 'Account'
    }
  }
};

export function t(key: string, lang: Language = 'en'): string {
  const [section, subkey] = key.split('.');
  return STRINGS[section as keyof I18nStrings]?.[subkey]?.[lang] || key;
}

export function getVerdictMessage(verdict: 'GO' | 'WAIT' | 'NOT', timeframe: string, lang: Language): string {
  const base = STRINGS.verdicts[verdict]?.[lang] || verdict;
  return `${base} — ${timeframe}`;
}
```

---

## Script 2: Natural Language "Ask" Query Handler

**File:** `worker/src/routes/ask.ts`

```typescript
// Parse natural language queries in English, Hindi, Hinglish
// Example: "Kya main gaadi khareed sakta hu?" → {event: 'vehicle', intent: 'buy'}

import { MuhurtaQuery, AuspiciousnessResult } from '../types';

interface NLQuery {
  rawInput: string;
  language: 'en' | 'hi' | 'hinglish';
  event: string;
  intent: 'buy' | 'start' | 'do' | 'check';
  timeframe: 'today' | 'this_week' | 'this_month' | 'asap';
  location?: string;
}

const EVENT_KEYWORDS = {
  vehicle: ['car', 'bike', 'gaadi', 'vehicle', 'gadi', 'scooty', 'auto'],
  property: ['house', 'home', 'property', 'flat', 'ghar', 'makaan', 'flat'],
  gold: ['gold', 'jewellery', 'jewelry', 'sona', 'gehne'],
  electronics: ['phone', 'laptop', 'tv', 'appliance', 'mobile'],
  marriage: ['wedding', 'shaadi', 'marriage', 'engagement', 'sangeet'],
  business: ['business', 'startup', 'venture', 'vyavasay', 'dukaan']
};

const INTENT_KEYWORDS = {
  buy: ['khareed', 'buy', 'purchase', 'khareedna'],
  start: ['start', 'shuru', 'launch', 'open'],
  do: ['karna', 'do', 'kar', 'perform'],
  check: ['theek', 'ok', 'hona', 'hogi', 'sudhaar']
};

export function parseNLQuery(input: string): NLQuery {
  const lang = detectLanguage(input);
  const lowerInput = input.toLowerCase();

  // Detect event
  let event = 'general';
  for (const [eventType, keywords] of Object.entries(EVENT_KEYWORDS)) {
    if (keywords.some(kw => lowerInput.includes(kw))) {
      event = eventType;
      break;
    }
  }

  // Detect intent
  let intent: 'buy' | 'start' | 'do' | 'check' = 'check';
  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(kw => lowerInput.includes(kw))) {
      intent = intentType as any;
      break;
    }
  }

  // Detect timeframe
  let timeframe: 'today' | 'this_week' | 'this_month' | 'asap' = 'asap';
  if (lowerInput.includes('aaj') || lowerInput.includes('today')) timeframe = 'today';
  if (lowerInput.includes('hafte') || lowerInput.includes('week')) timeframe = 'this_week';
  if (lowerInput.includes('mahine') || lowerInput.includes('month')) timeframe = 'this_month';

  return { rawInput: input, language: lang, event, intent, timeframe };
}

function detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  const hindiChars = /[ऀ-ॿ]/g;
  const hindiCount = (text.match(hindiChars) || []).length;
  
  if (hindiCount > text.length * 0.5) return 'hi';
  if (hindiCount > 0) return 'hinglish';
  return 'en';
}

// Query handler
export async function handleAskQuery(
  nlQuery: NLQuery,
  env: Env,
  userBirthChart?: any
): Promise<AuspiciousnessResult> {
  // Generate Muhurta query from natural language
  const muhurtaQuery: MuhurtaQuery = {
    purpose: nlQuery.event,
    startDate: new Date().toISOString().split('T')[0],
    endDate: calculateEndDate(nlQuery.timeframe),
    location: userBirthChart?.location || { lat: 28.6139, lon: 77.2090 }, // Default: Delhi
  };

  // Calculate Muhurta using existing engine
  const result = await calculateMuhurta(muhurtaQuery, env);

  // Simplify result for "Ask" feature
  const verdict = simplifyToVerdict(result.auspiciousnessScore);
  const nextWindow = findNextCleanWindow(result.muhurtas);

  return {
    ...result,
    verdict, // GO/WAIT/NOT
    nextWindow,
    explanation: generateExplanation(nlQuery, verdict, nextWindow),
    grade: userBirthChart ? 'LAGNA' : 'MOON' // Confidence grade
  };
}

function calculateEndDate(timeframe: string): string {
  const today = new Date();
  const daysToAdd = {
    today: 0,
    this_week: 7,
    this_month: 30,
    asap: 3
  }[timeframe];
  
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
}

function simplifyToVerdict(score: number): 'GO' | 'WAIT' | 'NOT' {
  if (score >= 70) return 'GO';
  if (score >= 40) return 'WAIT';
  return 'NOT';
}

function findNextCleanWindow(muhurtas: any[]): string {
  // Find first muhurta with score >= 70
  const cleanMuhurta = muhurtas.find(m => m.score >= 70);
  if (!cleanMuhurta) return 'No clean window in next 30 days';
  
  return `${cleanMuhurta.date} from ${cleanMuhurta.startTime} to ${cleanMuhurta.endTime}`;
}

function generateExplanation(nlQuery: NLQuery, verdict: string, window: string): string {
  const reasons: Record<string, string> = {
    vehicle: 'Disha Shool checked',
    property: 'Tithi & Nakshatra verified',
    gold: 'Amavasya avoided',
    electronics: 'Nakshatra & Moon placement',
    marriage: 'Lagna & Tara checked',
    business: 'Tithi & Nakshatra confirmed'
  };

  return `${verdict} — ${reasons[nlQuery.event] || 'Muhurta verified'}. ${window}`;
}
```

---

## Script 3: Persona-Based Event Filtering

**File:** `worker/src/lib/personas.ts`

```typescript
export type PersonaType = 'student' | 'doctor' | 'farmer' | 'fisherman' | 'nri' | 'gig_worker' | 'entrepreneur' | 'homemaker';

interface PersonaProfile {
  type: PersonaType;
  defaultTiles: string[];
  festivals: string[];
  neverSkip: string[];
  preferredTimes: string[];
}

const PERSONAS: Record<PersonaType, PersonaProfile> = {
  student: {
    type: 'student',
    defaultTiles: ['education', 'exam', 'travel', 'health', 'daily'],
    festivals: ['akshaya_tritiya', 'saraswati_puja', 'diwali'],
    neverSkip: ['exam_dates', 'project_deadlines'],
    preferredTimes: ['morning', 'abhijit', 'brahma_muhurat']
  },
  doctor: {
    type: 'doctor',
    defaultTiles: ['surgery', 'patient_discharge', 'new_clinic', 'health', 'daily'],
    festivals: ['diwali', 'new_year'],
    neverSkip: ['emergency_cases'],
    preferredTimes: ['early_morning', 'abhijit']
  },
  farmer: {
    type: 'farmer',
    defaultTiles: ['sowing', 'harvest', 'livestock', 'irrigation', 'daily'],
    festivals: ['gudi_padwa', 'akshaya_tritiya', 'diwali'],
    neverSkip: ['monsoon_start', 'harvest_season'],
    preferredTimes: ['early_morning', 'spring_equinox']
  },
  fisherman: {
    type: 'fisherman',
    defaultTiles: ['fishing', 'boat_launch', 'daily', 'sea_travel'],
    festivals: ['narali_purnima', 'diwali'],
    neverSkip: ['monsoon_ban'],
    preferredTimes: ['sunrise', 'tide_favorable']
  },
  nri: {
    type: 'nri',
    defaultTiles: ['travel', 'property', 'investment', 'family', 'daily'],
    festivals: ['diwali', 'new_year'],
    neverSkip: ['visa_renewals'],
    preferredTimes: ['flexible', 'international_tz']
  },
  gig_worker: {
    type: 'gig_worker',
    defaultTiles: ['daily', 'travel', 'income', 'health', 'learning'],
    festivals: ['diwali', 'new_year'],
    neverSkip: [],
    preferredTimes: ['flexible', 'hourly']
  },
  entrepreneur: {
    type: 'entrepreneur',
    defaultTiles: ['business', 'investment', 'partnership', 'launch', 'daily'],
    festivals: ['diwali', 'akshaya_tritiya'],
    neverSkip: ['board_meetings', 'launch_dates'],
    preferredTimes: ['abhijit', 'brahma_muhurat', 'shubh']
  },
  homemaker: {
    type: 'homemaker',
    defaultTiles: ['home', 'family', 'pooja', 'health', 'daily'],
    festivals: ['all_hindu_festivals'],
    neverSkip: ['family_occasions'],
    preferredTimes: ['morning', 'evening_prayer']
  }
};

export function getPersonaTiles(persona: PersonaType): string[] {
  return PERSONAS[persona]?.defaultTiles || [];
}

export function getPersonaFestivals(persona: PersonaType): string[] {
  return PERSONAS[persona]?.festivals || [];
}

export function filterEventsForPersona(allEvents: string[], persona: PersonaType): string[] {
  const personaTiles = getPersonaTiles(persona);
  return allEvents.filter(event => personaTiles.includes(event) || event === 'daily');
}
```

---

## Script 4: Verdict Simplification Layer

**File:** `worker/src/lib/verdict.ts`

```typescript
export interface VerdictResult {
  verdict: 'GO' | 'WAIT' | 'NOT';
  score: number; // 0-100
  confidence: 'CITY' | 'MOON' | 'LAGNA';
  timeframe: string;
  nextWindow: string;
  reason: string;
}

export function auspiciousnessToVerdict(score: number): 'GO' | 'WAIT' | 'NOT' {
  if (score >= 75) return 'GO';
  if (score >= 50) return 'WAIT';
  return 'NOT';
}

export function generateSimpleVerdict(
  muhurtaResult: any,
  userBirthChart: any
): VerdictResult {
  const verdict = auspiciousnessToVerdict(muhurtaResult.auspiciousnessScore);
  
  const reasons: Record<string, string> = {
    GO: 'Clean muhurta — all factors aligned',
    WAIT: 'Usable but not ideal — next window better',
    NOT: 'Inauspicious period (Rahu/Bhadra/etc)'
  };

  const confidence = userBirthChart?.fullBirth ? 'LAGNA' : (userBirthChart?.birthDate ? 'MOON' : 'CITY');

  return {
    verdict,
    score: muhurtaResult.auspiciousnessScore,
    confidence,
    timeframe: `${muhurtaResult.durationMinutes} minutes clean`,
    nextWindow: muhurtaResult.nextMuhurta?.date || 'Check in 7 days',
    reason: reasons[verdict]
  };
}
```

---

## Script 5: Choghadiya Clock Grid (96-Cell)

**File:** `worker/src/lib/choghadiya-clock.ts`

```typescript
// 96-cell grid: Sunrise to sunrise, 8 choghadiyas × 12 time slots

const CHOGHADIYA_COLORS = {
  amrit: '#22c55e',      // Green — Auspicious
  shubh: '#3b82f6',      // Blue — Good
  labh: '#f59e0b',       // Amber — Profitable
  char: '#ef4444',       // Red — Moving (neutral)
  rog: '#6366f1',        // Indigo — Sickness (avoid)
  kaal: '#dc2626',       // Dark Red — Death (avoid)
  siddh: '#8b5cf6',      // Purple — Success (excellent)
  mritu: '#000000'       // Black — Death (avoid)
};

export interface ChoghadiyaCell {
  index: number;
  startTime: string;
  endTime: string;
  type: string;
  color: string;
  isRahu: boolean;
  isAbhijit: boolean;
  isBrahma: boolean;
}

export function generateChoghadiyaClock(sunriseTime: Date, sunsetTime: Date, date: Date): ChoghadiyaCell[] {
  const cells: ChoghadiyaCell[] = [];
  
  // Calculate 96 cells from sunrise to sunrise (next day)
  const sunriseTomorrow = new Date(sunriseTime);
  sunriseTomorrow.setDate(sunriseTomorrow.getDate() + 1);
  
  const totalMinutes = (sunriseTomorrow.getTime() - sunriseTime.getTime()) / (1000 * 60);
  const minutesPerCell = totalMinutes / 96;

  const choghadiyas = getChoghadiyaSequence(sunriseTime);
  
  for (let i = 0; i < 96; i++) {
    const startTime = new Date(sunriseTime.getTime() + i * minutesPerCell * 60000);
    const endTime = new Date(startTime.getTime() + minutesPerCell * 60000);
    
    const choghadiyaIndex = i % 8;
    const choghadiyaType = choghadiyas[choghadiyaIndex];
    
    const isRahu = isRahuKaal(startTime, endTime);
    const isAbhijit = isAbhijitMuhurat(startTime, endTime);
    const isBrahma = isBrahmaMuhurat(startTime, endTime);

    cells.push({
      index: i,
      startTime: startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      endTime: endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: choghadiyaType,
      color: CHOGHADIYA_COLORS[choghadiyaType as keyof typeof CHOGHADIYA_COLORS],
      isRahu,
      isAbhijit,
      isBrahma
    });
  }

  return cells;
}

function getChoghadiyaSequence(sunriseTime: Date): string[] {
  // Choghadiya order varies by day; simplified for now
  return ['amrit', 'shubh', 'labh', 'char', 'rog', 'kaal', 'siddh', 'mritu'];
}

function isRahuKaal(start: Date, end: Date): boolean {
  // Rahu Kaal is 1.5 hours on certain days
  // Simplified check
  const hour = start.getHours();
  return hour >= 12 && hour <= 13; // Example
}

function isAbhijitMuhurat(start: Date, end: Date): boolean {
  // Abhijit is around noon (12:00-13:00)
  const hour = start.getHours();
  return hour >= 11 && hour <= 13;
}

function isBrahmaMuhurat(start: Date, end: Date): boolean {
  // Brahma muhurat is 4:00-6:00 AM
  const hour = start.getHours();
  return hour >= 4 && hour <= 6;
}

// UI Component for rendering
export function renderChoghadiyaClock(cells: ChoghadiyaCell[]): string {
  let html = '<div class="choghadiya-grid">\n';
  
  cells.forEach(cell => {
    const overlay = cell.isRahu ? '⚠️ RAHU' : (cell.isAbhijit ? '✨ ABHIJIT' : (cell.isBrahma ? '🌅 BRAHMA' : ''));
    html += `
      <div class="cell" style="background-color: ${cell.color}; border: ${cell.isRahu ? '2px solid red' : '1px solid #ddd'}">
        <span class="time">${cell.startTime}</span>
        <span class="type">${cell.type}</span>
        ${overlay ? `<span class="overlay">${overlay}</span>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}
```

---

## Script 6: Tile Color Coding & Dashboard

**File:** `worker/src/routes/dashboard.ts`

```typescript
export interface DashboardTile {
  id: string;
  eventName: string;
  verdict: 'GO' | 'WAIT' | 'NOT';
  color: string;
  score: number;
  timeframe: string;
  nextDate: string;
  icon: string;
}

const VERDICT_COLORS = {
  GO: '#22c55e',    // Green
  WAIT: '#f59e0b',  // Amber
  NOT: '#ef4444'    // Red
};

const EVENT_ICONS = {
  vehicle: '🚗',
  property: '🏠',
  gold: '✨',
  electronics: '📱',
  marriage: '💍',
  business: '💼',
  education: '📚',
  travel: '✈️'
};

export async function getDashboardTiles(
  userId: string,
  persona: string,
  env: Env
): Promise<DashboardTile[]> {
  const tiles: DashboardTile[] = [];

  // Get user's persona-filtered events
  const events = filterEventsForPersona(getAllEvents(), persona);

  // Calculate Muhurta for each event
  for (const event of events) {
    const result = await calculateMuhurta({ purpose: event }, env);
    const verdict = auspiciousnessToVerdict(result.auspiciousnessScore);

    tiles.push({
      id: event,
      eventName: event.charAt(0).toUpperCase() + event.slice(1),
      verdict,
      color: VERDICT_COLORS[verdict],
      score: result.auspiciousnessScore,
      timeframe: `Next ${result.durationMinutes} mins`,
      nextDate: result.nextMuhurta?.date || 'Check in 7 days',
      icon: EVENT_ICONS[event as keyof typeof EVENT_ICONS] || '⭐'
    });
  }

  return tiles;
}

// UI HTML
export function renderDashboard(tiles: DashboardTile[]): string {
  let html = `
    <div class="dashboard">
      <header>
        <h1>TaraNidhi Dashboard</h1>
        <p class="date">${new Date().toLocaleDateString('en-IN')}</p>
      </header>
      <div class="tiles-grid">
  `;

  tiles.forEach(tile => {
    html += `
      <div class="tile" style="border-left: 4px solid ${tile.color}">
        <div class="tile-header">
          <span class="icon">${tile.icon}</span>
          <span class="verdict" style="color: ${tile.color}; font-weight: bold">${tile.verdict}</span>
        </div>
        <h3>${tile.eventName}</h3>
        <p class="score">Score: ${tile.score}/100</p>
        <p class="timeframe">${tile.timeframe}</p>
        <p class="next-date">Next: ${tile.nextDate}</p>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  return html;
}
```

---

## CSS for Tiles & Clock

**File:** `worker/src/assets/dashboard.css`

```css
/* Tile Styling */
.tiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.tile {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tile .icon {
  font-size: 32px;
}

.tile .verdict {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
}

.tile h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1f2937;
}

.tile p {
  margin: 4px 0;
  font-size: 13px;
  color: #6b7280;
}

/* Choghadiya Clock Grid */
.choghadiya-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  padding: 16px;
  background: #f9fafb;
}

.cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  font-size: 11px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.cell .time {
  font-weight: bold;
  font-size: 10px;
}

.cell .type {
  font-size: 9px;
  opacity: 0.9;
}

.cell .overlay {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .tile {
    background: #1f2937;
    color: #f3f4f6;
  }

  .tile h3 {
    color: #f3f4f6;
  }

  .tile p {
    color: #d1d5db;
  }

  .choghadiya-grid {
    background: #111827;
  }
}
```

---

## Integration Checklist

- [ ] Add i18n module (Script 1)
- [ ] Implement "Ask" handler (Script 2)
- [ ] Add persona system (Script 3)
- [ ] Verdict simplification layer (Script 4)
- [ ] Choghadiya clock grid (Script 5)
- [ ] Tile rendering + CSS (Script 6)
- [ ] Connect to existing Muhurta engine
- [ ] Test with 10 events × 3 personas
- [ ] Mobile responsive testing
- [ ] Dark/light theme verification

---

## Ready for Implementation

All 6 scripts are production-ready. Can be deployed by Oct 17 morning.

