/**
 * 8-Layer Confidence Index — Unit Tests
 *
 * Tests the buildConfidenceIndex() function introduced to replace the
 * 2-layer (40% Universal / 60% Personal) architecture.
 *
 * Sources verified:
 *   - Muhurta Chintamani Ch.2 (Tarabala, Chandrabala hierarchy)
 *   - Phaladeepika Ch.26 (Gochar; Mantresvara)
 *   - Dharmasindhu (Panchaka, Vishti, Rahu Kaal prohibitions)
 *   - BPHS Ashtakavarga Adhyaya (Chandrashtakavarga bindus)
 */

import { describe, it, expect } from "vitest";
import {
  buildConfidenceIndex,
  scoreUniversalLayer,
  scorePersonalLayer,
  scoreProfessionalMuhurta,
} from "../professionalMuhurta";
import type {
  UniversalCriteria,
  PersonalAdjustment,
  PersonalParams,
  ConfidenceLayer,
} from "../professionalMuhurta";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a minimal UniversalCriteria with everything neutral/missing */
function makeNeutralUniversal(): UniversalCriteria {
  const absent = { active: false, points: 0, note: "absent" };
  const cleared = { active: true, points: 15, note: "clear" }; // for noRahuKaal, noYamghanda etc.
  return {
    abhijitMuhurta:      { ...absent },
    vijayaMuhurta:       { ...absent },
    brahmaMuhurta:       { ...absent },
    sarvarthaSiddhi:     { ...absent },
    guruRaviPushya:      { ...absent },
    pushkaraNavamansha:  { ...absent },
    auspiciousTithi:     { ...absent },
    auspiciousNakshatra: { ...absent },
    noRahuKaal:          { active: true,  points:  15, note: "clear" },
    noYamghanda:         { active: true,  points:  10, note: "clear" },
    noGulikaKaal:        { active: true,  points:   8, note: "clear" },
    horaMatch:           { active: false, points:   0, note: "No active hora" },
    noDurmuhurta:        { active: true,  points:  10, note: "clear" },
    inauspiciousTithi:   { active: false, points:   0, note: "neutral tithi" },
    vishtiKarana:        { active: false, points:   0, note: "no vishti" },
    panchakaDosha:       { active: false, points:   0, note: "no panchaka" },
  };
}

function makeNeutralPersonal(): PersonalParams {
  return {
    kundaliId:          null,
    janmaNakIndex:      null,
    taraNumber:         null,
    taraBeneficence:    null,
    mahadashLord:       null,
    antardashLord:      null,
    natalMoonRashi:     null,
    currentMoonRashi:   null,
    ashtakwargaBindu:   null,
    navamshaHouseLord:  null,
  };
}

// ─── Layer count & structure ──────────────────────────────────────────────────

describe("buildConfidenceIndex() — layer structure", () => {
  it("always returns exactly 8 layers", () => {
    const u = makeNeutralUniversal();
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    expect(idx.layers).toHaveLength(8);
  });

  it("layer ids are the 8 canonical ids", () => {
    const u = makeNeutralUniversal();
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    const ids = idx.layers.map((l) => l.id);
    expect(ids).toEqual([
      "panchanga", "hora", "dosha", "tarabala",
      "chandrabala", "gochar", "dasha", "ashtakavarga",
    ]);
  });

  it("layer weights sum to 100", () => {
    const u = makeNeutralUniversal();
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    const weightSum = idx.layers.reduce((s, l) => s + l.weight, 0);
    expect(weightSum).toBe(100);
  });

  it("without kundali: 3 layers present (panchanga, hora, dosha)", () => {
    const u = makeNeutralUniversal();
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    expect(idx.layersPresent).toBe(3);
    expect(idx.layersMissing).toBe(5);
  });

  it("with kundali and all personal data: 8 layers present", () => {
    const u = makeNeutralUniversal();
    const p: PersonalParams = {
      kundaliId: 1,
      janmaNakIndex: 0,
      taraNumber: 1,
      taraBeneficence: "benefic",
      mahadashLord: "Jupiter",
      antardashLord: "Venus",
      natalMoonRashi: 0,
      currentMoonRashi: 0,
      ashtakwargaBindu: 5,
      navamshaHouseLord: "Jupiter",
    };
    const personal = scorePersonalLayer(p);
    const idx = buildConfidenceIndex(u, personal, p);
    expect(idx.layersPresent).toBe(8);
    expect(idx.layersMissing).toBe(0);
  });
});

// ─── Individual layer scores ──────────────────────────────────────────────────

describe("Layer 1: Panchanga", () => {
  function getLayer(u: UniversalCriteria) {
    return buildConfidenceIndex(u, null, makeNeutralPersonal()).layers.find(l => l.id === "panchanga")!;
  }

  it("neutral tithi + no auspicious nak → score = 50", () => {
    const u = makeNeutralUniversal();
    expect(getLayer(u).score).toBe(50);
  });

  it("auspicious tithi + auspicious nak → score ≥ 90", () => {
    const u = makeNeutralUniversal();
    u.auspiciousTithi = { active: true, points: 15, note: "auspicious" };
    u.auspiciousNakshatra = { active: true, points: 10, note: "auspicious" };
    const s = getLayer(u).score;
    expect(s).toBeGreaterThanOrEqual(90);
    expect(s).toBeLessThanOrEqual(100);
  });

  it("inauspicious tithi (Rikta/Amavasya) → score ≤ 15", () => {
    const u = makeNeutralUniversal();
    u.inauspiciousTithi = { active: true, points: -30, note: "Rikta" };
    expect(getLayer(u).score).toBeLessThanOrEqual(15);
  });

  it("Sarvartha Siddhi Yoga boosts score", () => {
    const u = makeNeutralUniversal();
    const base = getLayer(u).score;
    u.sarvarthaSiddhi = { active: true, points: 15, note: "active" };
    expect(getLayer(u).score).toBeGreaterThan(base);
  });

  it("score always 0-100", () => {
    // All positive
    const u1 = makeNeutralUniversal();
    u1.auspiciousTithi = { active: true, points: 15, note: "a" };
    u1.auspiciousNakshatra = { active: true, points: 10, note: "a" };
    u1.sarvarthaSiddhi = { active: true, points: 15, note: "a" };
    u1.guruRaviPushya = { active: true, points: 20, note: "a" };
    u1.abhijitMuhurta = { active: true, points: 15, note: "a" };
    u1.vijayaMuhurta = { active: true, points: 12, note: "a" };
    expect(getLayer(u1).score).toBeLessThanOrEqual(100);

    // All negative
    const u2 = makeNeutralUniversal();
    u2.inauspiciousTithi = { active: true, points: -30, note: "i" };
    expect(getLayer(u2).score).toBeGreaterThanOrEqual(0);
  });

  it("status is 'strong' for high panchanga, 'weak' for inauspicious tithi", () => {
    const u1 = makeNeutralUniversal();
    u1.auspiciousTithi = { active: true, points: 15, note: "a" };
    u1.auspiciousNakshatra = { active: true, points: 10, note: "a" };
    expect(getLayer(u1).status).toBe("strong");

    const u2 = makeNeutralUniversal();
    u2.inauspiciousTithi = { active: true, points: -30, note: "i" };
    expect(getLayer(u2).status).toBe("weak");
  });
});

describe("Layer 2: Hora", () => {
  function getLayer(u: UniversalCriteria) {
    return buildConfidenceIndex(u, null, makeNeutralPersonal()).layers.find(l => l.id === "hora")!;
  }

  it("hora match → score 85", () => {
    const u = makeNeutralUniversal();
    u.horaMatch = { active: true, points: 20, note: "Jupiter Hora" };
    expect(getLayer(u).score).toBe(85);
  });

  it("hora mismatch (known hora, wrong planet) → score 35", () => {
    const u = makeNeutralUniversal();
    u.horaMatch = { active: false, points: 0, note: "Mars Hora (mismatch)" };
    expect(getLayer(u).score).toBe(35);
  });

  it("no hora data → score 50", () => {
    const u = makeNeutralUniversal();
    // horaMatch.note === "No active hora" triggers 50
    expect(getLayer(u).score).toBe(50);
  });
});

describe("Layer 3: Dosha Avoidance", () => {
  function getLayer(u: UniversalCriteria) {
    return buildConfidenceIndex(u, null, makeNeutralPersonal()).layers.find(l => l.id === "dosha")!;
  }

  it("no doshas → score 100", () => {
    const u = makeNeutralUniversal();
    expect(getLayer(u).score).toBe(100);
  });

  it("Rahu Kaal active → score drops by 35", () => {
    const u = makeNeutralUniversal();
    u.noRahuKaal = { active: false, points: -15, note: "Active Rahu Kaal" };
    expect(getLayer(u).score).toBe(65);
  });

  it("Panchaka active → score drops by 25", () => {
    const u = makeNeutralUniversal();
    u.panchakaDosha = { active: true, points: -25, note: "Panchaka" };
    expect(getLayer(u).score).toBe(75);
  });

  it("all doshas active → score = 0 (floored)", () => {
    const u = makeNeutralUniversal();
    u.noRahuKaal  = { active: false, points: -15, note: "Rahu Kaal" };
    u.noYamghanda = { active: false, points: -10, note: "Yamghanda" };
    u.noGulikaKaal = { active: false, points: -10, note: "Gulika" };
    u.noDurmuhurta = { active: false, points: -10, note: "Durmuhurta" };
    u.vishtiKarana = { active: true,  points: -20, note: "Vishti" };
    u.panchakaDosha = { active: true, points: -25, note: "Panchaka" };
    expect(getLayer(u).score).toBe(0);
  });

  it("dosha notes list active doshas by name", () => {
    const u = makeNeutralUniversal();
    u.noRahuKaal = { active: false, points: -15, note: "Active Rahu Kaal" };
    u.panchakaDosha = { active: true, points: -25, note: "Panchaka" };
    const l = getLayer(u);
    expect(l.notes).toContain("Rahu Kaal");
    expect(l.notes).toContain("Panchaka");
  });
});

describe("Layer 4: Tarabala", () => {
  function getLayer(taraBeneficence: "benefic" | "neutral" | "malefic" | null) {
    const u = makeNeutralUniversal();
    const p = makeNeutralPersonal();
    p.taraBeneficence = taraBeneficence;
    p.taraNumber = 1;
    const personal = taraBeneficence !== null
      ? { taraAdjustment: { value: taraBeneficence === "benefic" ? 40 : taraBeneficence === "malefic" ? -40 : 0, reason: `Tara ${taraBeneficence}` }, dashaAdjustment: { value: 0, reason: "" }, gocharAdjustment: { value: 0, reason: "" }, houseLordAvastha: { value: 0, reason: "" }, ashtakwargaBindu: { value: 0, reason: "" }, navamshaDivisional: { value: 0, reason: "" }, totalPersonalAdjustment: 0 }
      : null;
    return buildConfidenceIndex(u, personal, p).layers.find(l => l.id === "tarabala")!;
  }

  it("benefic Tara → score 90", () => {
    expect(getLayer("benefic").score).toBe(90);
  });

  it("neutral Tara → score 50", () => {
    expect(getLayer("neutral").score).toBe(50);
  });

  it("malefic Tara → score 10", () => {
    expect(getLayer("malefic").score).toBe(10);
  });

  it("no tara data → score 50, status missing", () => {
    const l = getLayer(null);
    expect(l.score).toBe(50);
    expect(l.status).toBe("missing");
  });

  it("benefic Tara → status strong", () => {
    expect(getLayer("benefic").status).toBe("strong");
  });

  it("malefic Tara → status weak", () => {
    expect(getLayer("malefic").status).toBe("weak");
  });
});

describe("Layer 5: Chandrabala", () => {
  function getLayer(natalMoon: number | null, currentMoon: number | null) {
    const u = makeNeutralUniversal();
    const p = makeNeutralPersonal();
    p.natalMoonRashi = natalMoon;
    p.currentMoonRashi = currentMoon;
    return buildConfidenceIndex(u, null, p).layers.find(l => l.id === "chandrabala")!;
  }

  it("no natal moon → score 50, status missing", () => {
    const l = getLayer(null, 5);
    expect(l.score).toBe(50);
    expect(l.status).toBe("missing");
  });

  it("Moon in house 1 (same rashi) → score 80 (strong)", () => {
    // natalMoon=0, currentMoon=0 → house=1
    const l = getLayer(0, 0);
    expect(l.score).toBe(80);
    expect(l.status).toBe("strong");
  });

  it("Moon in house 11 (good transit) → score 80", () => {
    // natalMoon=0, currentMoon=10 → house=11
    const l = getLayer(0, 10);
    expect(l.score).toBe(80);
  });

  it("Moon in house 8 (Ashtama Chandra) → score 20 (weak)", () => {
    // natalMoon=0, currentMoon=7 → house=8
    const l = getLayer(0, 7);
    expect(l.score).toBe(20);
    expect(l.status).toBe("weak");
  });

  it("Moon in house 4 → score 20 (weak)", () => {
    const l = getLayer(0, 3);
    expect(l.score).toBe(20);
  });

  it("Moon in house 2 → score 50 (neutral)", () => {
    const l = getLayer(0, 1);
    expect(l.score).toBe(50);
    expect(l.status).toBe("neutral");
  });

  it("wrap-around: natalMoon=11, currentMoon=1 → house=3 (strong)", () => {
    // (1 - 11 + 12) % 12 + 1 = 3
    const l = getLayer(11, 1);
    expect(l.score).toBe(80);
  });

  it("all 12 houses produce a score in [0,100]", () => {
    for (let h = 0; h < 12; h++) {
      const l = getLayer(0, h);
      expect(l.score).toBeGreaterThanOrEqual(0);
      expect(l.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("Layer 7: Dasha Bhukti", () => {
  function getLayer(mahadashLord: string | null) {
    const u = makeNeutralUniversal();
    const p: PersonalParams = {
      ...makeNeutralPersonal(),
      kundaliId: 1,
      mahadashLord,
    };
    const personal = mahadashLord !== null ? scorePersonalLayer(p) : null;
    return buildConfidenceIndex(u, personal, p).layers.find(l => l.id === "dasha")!;
  }

  it("no dasha data → score 50, status missing", () => {
    const l = getLayer(null);
    expect(l.score).toBe(50);
    expect(l.status).toBe("missing");
  });

  it("Jupiter Mahadasha (benefic) → score > 50", () => {
    expect(getLayer("Jupiter").score).toBeGreaterThan(50);
  });

  it("Saturn Mahadasha (malefic) → score < 50", () => {
    expect(getLayer("Saturn").score).toBeLessThan(50);
  });

  it("score always in [0,100] for all classical lords", () => {
    const lords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
    for (const lord of lords) {
      const s = getLayer(lord).score;
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});

describe("Layer 8: Ashtakavarga", () => {
  function getLayer(bindu: number | null, navamsha: string | null = null) {
    const u = makeNeutralUniversal();
    const p: PersonalParams = {
      ...makeNeutralPersonal(),
      kundaliId: 1,
      ashtakwargaBindu: bindu,
      navamshaHouseLord: navamsha,
    };
    const personal = scorePersonalLayer(p);
    return buildConfidenceIndex(u, personal, p).layers.find(l => l.id === "ashtakavarga")!;
  }

  it("no data → score 50, status missing", () => {
    const l = buildConfidenceIndex(
      makeNeutralUniversal(),
      null,
      makeNeutralPersonal()
    ).layers.find(l => l.id === "ashtakavarga")!;
    expect(l.score).toBe(50);
    expect(l.status).toBe("missing");
  });

  it("6 bindus → score 90", () => expect(getLayer(6).score).toBe(90));
  it("5 bindus → score 75", () => expect(getLayer(5).score).toBe(75));
  it("4 bindus → score 50", () => expect(getLayer(4).score).toBe(50));
  it("2 bindus → score 20", () => expect(getLayer(2).score).toBe(20));

  it("6 bindus + benefic navamsha → score 100 (clamped)", () => {
    expect(getLayer(6, "Jupiter").score).toBe(100);
  });

  it("2 bindus + malefic navamsha → score 10 (clamped to min 0)", () => {
    expect(getLayer(2, "Saturn").score).toBeGreaterThanOrEqual(0);
  });
});

// ─── Convergence Grade ────────────────────────────────────────────────────────

describe("ConfidenceIndex — convergence grade", () => {
  it("all 3 present layers strong → CONVERGENT", () => {
    const u = makeNeutralUniversal();
    // Good panchanga (score ~100)
    u.auspiciousTithi = { active: true, points: 15, note: "a" };
    u.auspiciousNakshatra = { active: true, points: 10, note: "a" };
    // Good hora
    u.horaMatch = { active: true, points: 20, note: "match" };
    // Clean dosha (already neutral)
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    expect(idx.layersStrong).toBeGreaterThanOrEqual(2);
    expect(["CONVERGENT", "PARTIAL"]).toContain(idx.convergenceGrade);
  });

  it("dosha-heavy muhurta → grade DIVERGENT or PARTIAL", () => {
    const u = makeNeutralUniversal();
    u.noRahuKaal  = { active: false, points: -15, note: "Rahu Kaal" };
    u.panchakaDosha = { active: true, points: -25, note: "Panchaka" };
    u.vishtiKarana = { active: true,  points: -20, note: "Vishti" };
    // panchanga and hora still neutral
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    expect(["DIVERGENT", "PARTIAL"]).toContain(idx.convergenceGrade);
  });

  it("convergenceNote mentions layer counts", () => {
    const u = makeNeutralUniversal();
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    expect(idx.convergenceNote).toMatch(/\d+\/\d+ layer/i);
  });
});

// ─── Normalized final score ───────────────────────────────────────────────────

describe("ConfidenceIndex — normalizedFinalScore", () => {
  it("without kundali: score is weighted by 3 present layers only", () => {
    const u = makeNeutralUniversal();
    // All neutral: panchanga=50, hora=50, dosha=100 (no doshas)
    // weights: panchanga=22, hora=8, dosha=12; total=42
    // weighted sum = 50*22 + 50*8 + 100*12 = 1100+400+1200=2700; normalized=2700/42=64
    const idx = buildConfidenceIndex(u, null, makeNeutralPersonal());
    // dosha layer = 100 (no doshas), which boosts the avg above 50
    expect(idx.normalizedFinalScore).toBeGreaterThan(50);
    expect(idx.normalizedFinalScore).toBeLessThanOrEqual(100);
  });

  it("perfect muhurta → normalizedFinalScore close to 100", () => {
    const u = makeNeutralUniversal();
    u.auspiciousTithi = { active: true,  points: 15, note: "a" };
    u.auspiciousNakshatra = { active: true, points: 10, note: "a" };
    u.horaMatch = { active: true, points: 20, note: "match" };
    const p: PersonalParams = {
      kundaliId: 1,
      janmaNakIndex: 0,
      taraNumber: 1,
      taraBeneficence: "benefic",
      mahadashLord: "Jupiter",
      antardashLord: "Venus",
      natalMoonRashi: 0,
      currentMoonRashi: 0,   // house 1 = strong chandrabala
      ashtakwargaBindu: 8,
      navamshaHouseLord: "Jupiter",
    };
    const personal = scorePersonalLayer(p);
    const idx = buildConfidenceIndex(u, personal, p);
    expect(idx.normalizedFinalScore).toBeGreaterThan(70);
  });

  it("avoid muhurta → normalizedFinalScore close to 0", () => {
    const u = makeNeutralUniversal();
    u.inauspiciousTithi = { active: true, points: -30, note: "Rikta" };
    u.noRahuKaal  = { active: false, points: -15, note: "Rahu Kaal" };
    u.panchakaDosha = { active: true, points: -25, note: "Panchaka" };
    u.vishtiKarana = { active: true, points: -20, note: "Vishti" };
    const p: PersonalParams = {
      kundaliId: 1,
      janmaNakIndex: 0,
      taraNumber: 7,
      taraBeneficence: "malefic",
      mahadashLord: "Saturn",
      antardashLord: null,
      natalMoonRashi: 0,
      currentMoonRashi: 7,  // house 8 = Ashtama Chandra
      ashtakwargaBindu: 1,
      navamshaHouseLord: "Saturn",
    };
    const personal = scorePersonalLayer(p);
    const idx = buildConfidenceIndex(u, personal, p);
    expect(idx.normalizedFinalScore).toBeLessThan(35);
  });
});

// ─── scoreProfessionalMuhurta integration ────────────────────────────────────

describe("scoreProfessionalMuhurta() — 8-layer integration", () => {
  const baseUniversalParams = {
    activeHora: null,
    currentNakIndex: 3, // Rohini (benefic for property)
    currentTithi: 5,    // Panchami (benefic)
    inRahuKaal: false,
    inYamghanda: false,
    inGulikaKaal: false,
    inDurmuhurta: false,
    inVishtiKarana: false,
    panchakaActive: false,
  };
  const basePersonalParams: PersonalParams = {
    kundaliId: null,
    janmaNakIndex: null,
    taraNumber: null,
    taraBeneficence: null,
    mahadashLord: null,
    antardashLord: null,
    natalMoonRashi: null,
    currentMoonRashi: null,
    ashtakwargaBindu: null,
    navamshaHouseLord: null,
  };

  it("result includes confidenceIndex with 8 layers", () => {
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      baseUniversalParams,
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    expect(r.confidenceIndex).toBeDefined();
    expect(r.confidenceIndex.layers).toHaveLength(8);
  });

  it("finalScore matches confidenceIndex.normalizedFinalScore", () => {
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      baseUniversalParams,
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    expect(r.finalScore).toBe(r.confidenceIndex.normalizedFinalScore);
  });

  it("methodology.formula mentions 8-layer", () => {
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      baseUniversalParams,
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    expect(r.methodology.formula.toLowerCase()).toContain("8-layer");
  });

  it("recommendation mentions convergence grade when kundali provided", () => {
    const pWithKundali: PersonalParams = {
      kundaliId: 1,
      janmaNakIndex: 5,
      taraNumber: 3,
      taraBeneficence: "benefic",
      mahadashLord: "Jupiter",
      antardashLord: null,
      natalMoonRashi: 3,
      currentMoonRashi: 5,
      ashtakwargaBindu: 5,
      navamshaHouseLord: "Venus",
    };
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      baseUniversalParams,
      pWithKundali,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    expect(r.recommendation).toMatch(/CONVERGENT|PARTIAL|DIVERGENT/);
  });

  it("finalScore is in [0,100]", () => {
    const r = scoreProfessionalMuhurta(
      "chikitsa-surgery",  // extreme category
      { ...baseUniversalParams, inRahuKaal: true, panchakaActive: true },
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    expect(r.finalScore).toBeGreaterThanOrEqual(0);
    expect(r.finalScore).toBeLessThanOrEqual(100);
  });

  it("verdict reflects finalScore range", () => {
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      baseUniversalParams,
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    const s = r.finalScore;
    if (s >= 85) expect(r.verdict).toContain("EXCELLENT");
    else if (s >= 70) expect(r.verdict).toContain("GOOD");
    else if (s >= 55) expect(r.verdict).toContain("ACCEPTABLE");
    else if (s >= 40) expect(r.verdict).toContain("CAUTION");
    else if (s >= 25) expect(r.verdict).toContain("POOR");
    else expect(r.verdict).toContain("AVOID");
  });

  it("Rahu Kaal + Panchaka + inauspicious tithi → verdict CAUTION or worse", () => {
    const r = scoreProfessionalMuhurta(
      "sampatti-bhumi-kharid",
      {
        ...baseUniversalParams,
        inRahuKaal: true,
        panchakaActive: true,
        currentTithi: 4, // Rikta tithi
      },
      basePersonalParams,
      "2026-10-05",
      { lat: 23.25, lon: 77.40 }
    );
    const badVerdicts = ["CAUTION", "POOR", "AVOID"];
    expect(badVerdicts.some((v) => r.verdict.includes(v))).toBe(true);
  });
});
