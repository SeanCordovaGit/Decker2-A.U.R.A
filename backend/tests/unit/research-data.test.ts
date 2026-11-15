import { describe, expect, it } from "vitest";
import { CREW_PROFILES } from "../../lib/research-data";
import { NOMINAL_READINGS, tickReadings } from "../../lib/simulation";
import { computeMhi } from "../../lib/mhi";
import { buildAlerts, evaluateCategories, evaluateMetrics } from "../../lib/evaluate";
import { scenarioById } from "../../lib/scenarios";

describe("supplied crew profiles", () => {
  it.each([["AST-001","nominal"],["AST-002","caution"],["AST-003","caution"],["AST-004","critical"],["AST-005","caution"]] as const)("grades %s from the supplied row", (id, expected) => {
    const crew = CREW_PROFILES.find((crew) => crew.id === id)!;
    const readings = { ...NOMINAL_READINGS, ...crew.readings };
    const mhi = computeMhi({ biometrics: 90, affect: 85, journal: null }, crew.mhiScore);
    expect(mhi.index).toBe(crew.mhiScore);
    expect(mhi.source).toBe("provided");
    const categories = evaluateCategories(readings, evaluateMetrics(readings), mhi);
    const worst = categories.some((category) => category.severity === "critical") ? "critical" : categories.some((category) => category.severity === "caution") ? "caution" : "nominal";
    expect(worst).toBe(expected);
  });
  it("does not invent an acute Gy value from cumulative mSv", () => {
    for (const crew of CREW_PROFILES) expect({ ...NOMINAL_READINGS, ...crew.readings }.absorbedDoseGy).toBe(0);
  });
});

describe("research scenarios", () => {
  it.each([["coLeak", "co", 425], ["acuteDose", "absorbedDoseGy", 1], ["sleepDeprivation", "pvtLapses", 5]] as const)("makes %s demonstrable", (id, metric, threshold) => {
    let readings = { ...NOMINAL_READINGS };
    const scenario = scenarioById(id)!;
    for (let tick = 1; tick <= 15; tick++) readings = tickReadings(readings, scenario.targets(tick), () => 0.5);
    expect(readings[metric]).toBeGreaterThanOrEqual(threshold);
  });
  it("never decreases accumulated dose when scenarios change", () => {
    const readings = { ...NOMINAL_READINGS, cumulativeDose: 640, absorbedDoseGy: 1.2 };
    const next = tickReadings(readings, { cumulativeDose: 150, absorbedDoseGy: 0 }, () => 0.5);
    expect(next.cumulativeDose).toBe(640);
    expect(next.absorbedDoseGy).toBe(1.2);
  });
  it("cites the project early warning separately from the NASA duration references", () => {
    const mhi = computeMhi({ biometrics: 95, affect: 95, journal: null });
    const r = { ...NOMINAL_READINGS, co: 10 };
    expect(buildAlerts(r, evaluateMetrics(r), mhi, 0).find((alert) => alert.metric === "co")!.citation.id).toBe("teamCoEarly");
  });
  it.each([[80,"nominal"],[79,"caution"],[50,"caution"],[49,"critical"]] as const)("uses MHI %s boundary", (index, severity) => {
    expect(computeMhi({}, index).severity).toBe(severity);
  });
});
