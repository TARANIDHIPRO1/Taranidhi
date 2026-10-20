import test from 'node:test';
import assert from 'node:assert/strict';
import { subLordOf, significators, horarySignal, DASHA_YEARS, PLANETS } from './kp-horary.mjs';

test('sub-spans per nakshatra sum to 13°20\' (F)', () => {
  const total = PLANETS.reduce((s, p) => s + (360 / 27) * DASHA_YEARS[p] / 120, 0);
  assert.ok(Math.abs(total - 360 / 27) < 1e-9);
});

test('0° is Ashwini, Ketu nakshatra and sub-lord (F)', () => {
  const r = subLordOf(0);
  assert.equal(r.nakshatraIndex, 0);
  assert.equal(r.nakshatraLord, 'Ketu');
  assert.equal(r.subLord, 'Ketu');
});

test('just past Ketu sub-span moves to Venus sub-lord (F)', () => {
  const ketuSpan = (360 / 27) * 7 / 120;
  assert.equal(subLordOf(ketuSpan + 0.0001).subLord, 'Venus');
});

test('sub-lord boundaries cover the full zodiac without gaps', () => {
  let prev = null;
  for (let lon = 0; lon < 360; lon += 0.01) {
    const s = subLordOf(lon);
    assert.ok(s.subLord && s.nakshatraIndex >= 0 && s.nakshatraIndex < 27);
    prev = s;
  }
  assert.ok(prev);
});

test('significator condition (a): planet in house signifies it (P)', () => {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);
  const planets = { Sun: 45 }; // Taurus 15° sits in house 2
  const sig = significators(planets, cusps);
  assert.ok(sig[2].has('Sun'));
});

test('significator condition (b): lord of house signifies it (P)', () => {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);
  const planets = { Mars: 200 };
  const sig = significators(planets, cusps);
  assert.ok(sig[1].has('Mars'));
  assert.ok(sig[8].has('Mars'));
});

test('horarySignal returns labelled P output with all required houses', () => {
  const cusps = Array.from({ length: 12 }, (_, i) => i * 30);
  const planets = { Sun: 45, Moon: 110, Mars: 200, Jupiter: 250, Saturn: 300 };
  const out = horarySignal({ planets, cusps, cuspIndex: 3, houses: [4, 11, 12] });
  assert.equal(out.status, 'P');
  assert.ok(['संकेत-पक्ष', 'आंशिक', 'संकेत-नहीं'].includes(out.signal));
});
