// KP horary core: sub-lord lookup, significators, and a labelled signal check.
//
// Status of every rule here:
//   F = arithmetic/structural fact (nakshatra span, Vimshottari order, sign lords)
//   P = practitioner rule (significator conditions from the OCCULTVIISION KP Rule-Book Vol 1,
//       house combinations from Gold Tree Astro). Not classical-verified.
//
// Output is a signal ("संकेत"), never a yes/no verdict.

export const PLANETS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

// Vimshottari years (F). Order also gives the nakshatra-lord cycle.
export const DASHA_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

// Sign lords, index 0 = Aries (F)
export const SIGN_LORDS = [
  'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter',
];

const NAK_SPAN = 360 / 27; // 13°20' (F)

const norm360 = (x) => ((x % 360) + 360) % 360;

// Sub-lord lookup (F arithmetic, standard KP division).
// Each nakshatra is split into 9 sub-spans in Vimshottari order, starting from the nakshatra lord,
// with span proportional to dasha years over 120.
export function subLordOf(longitude) {
  const lon = norm360(longitude);
  const nakIndex = Math.floor(lon / NAK_SPAN); // 0..26
  const nakLord = PLANETS[nakIndex % 9];
  const inNak = lon - nakIndex * NAK_SPAN;

  let acc = 0;
  for (let i = 0; i < 9; i++) {
    const planet = PLANETS[(nakIndex + i) % 9];
    const span = (NAK_SPAN * DASHA_YEARS[planet]) / 120;
    if (inNak < acc + span || i === 8) {
      return {
        longitude: lon,
        nakshatraIndex: nakIndex,
        nakshatraLord: nakLord,
        subLord: planet,
        signLord: SIGN_LORDS[Math.floor(lon / 30)],
        status: 'F',
      };
    }
    acc += span;
  }
  throw new Error('unreachable');
}

// Significators (P: conditions as stated in OCCULTVIISION KP Rule-Book Vol 1, section 1.2).
// A planet signifies house h if:
//   (a) placed in h, (b) lord of h,
//   (c) placed in the star of a planet that is placed in h,
//   (d) placed in the star of the lord of h.
// `planets` maps planet -> longitude. `cusps` is an array of 12 cusp longitudes (house 1 first).
export function significators(planets, cusps) {
  const houseOf = (lon) => {
    const l = norm360(lon);
    for (let h = 0; h < 12; h++) {
      const start = cusps[h];
      const end = cusps[(h + 1) % 12];
      const inside = end > start ? l >= start && l < end : l >= start || l < end;
      if (inside) return h + 1;
    }
    return null;
  };
  const placement = {};
  for (const [p, lon] of Object.entries(planets)) placement[p] = houseOf(lon);

  const lordOfHouse = {};
  for (let h = 1; h <= 12; h++) {
    const signIndex = Math.floor(norm360(cusps[h - 1]) / 30);
    lordOfHouse[h] = SIGN_LORDS[signIndex];
  }

  const result = {};
  for (let h = 1; h <= 12; h++) result[h] = new Set();

  for (const [p, lon] of Object.entries(planets)) {
    const starLord = subLordOf(lon).nakshatraLord;
    const ownedHouses = Object.keys(lordOfHouse).filter((h) => lordOfHouse[h] === p).map(Number);
    for (let h = 1; h <= 12; h++) {
      const reasons = [];
      if (placement[p] === h) reasons.push('a');
      if (ownedHouses.includes(h)) reasons.push('b');
      const starLordPlacedHere = placement[starLord] === h;
      if (starLordPlacedHere) reasons.push('c');
      if (lordOfHouse[h] === starLord) reasons.push('d');
      if (reasons.length) result[h].add(p);
    }
  }
  return result;
}

// Which of the requested houses does a given cusp's sub-lord signify? (P)
// Returns a signal: 'संकेत-पक्ष' (all houses), 'आंशिक' (some), 'संकेत-नहीं' (none).
export function horarySignal({ planets, cusps, cuspIndex, houses }) {
  const sig = significators(planets, cusps);
  const sub = subLordOf(cusps[cuspIndex]).subLord;
  const hit = houses.filter((h) => sig[h].has(sub));
  let signal;
  if (hit.length === houses.length) signal = 'संकेत-पक्ष';
  else if (hit.length === 0) signal = 'संकेत-नहीं';
  else signal = 'आंशिक';
  return {
    cuspSubLord: sub,
    requiredHouses: houses,
    signifiedHouses: hit,
    signal,
    status: 'P',
    note: 'Practitioner check, not a verdict. Verify against classical source before client use.',
  };
}
