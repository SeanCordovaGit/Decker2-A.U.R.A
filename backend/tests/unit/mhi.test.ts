import { describe, expect, it } from "vitest";
import { MHI_CONFIG } from "../../config/aura";
import { biometricScore, computeMhi, pvtScore } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";

describe("computeMhi", () => {
  it("weighted sum with all sources", () => {
    const r = computeMhi({ biometrics: 80, affect: 60, journal: 40 });
    const { biometrics, affect, journal } = MHI_CONFIG.weights;
    expect(r.index).toBeCloseTo(80 * biometrics + 60 * affect + 40 * journal);
  });

  it("redistributes weight of missing sources proportionally", () => {
    const r = computeMhi({ biometrics: 80, affect: 60, journal: null });
    const { biometrics, affect } = MHI_CONFIG.weights;
    const total = biometrics + affect;
    expect(r.index).toBeCloseTo((80 * biometrics + 60 * affect) / total);
    expect(r.components.find((c) => c.source === "journal")!.weight).toBe(0);
    const sum = r.components.reduce((s, c) => s + c.weight, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("severity thresholds", () => {
    expect(computeMhi({ biometrics: 80, affect: 80, journal: 80 }).severity).toBe("nominal");
    expect(computeMhi({ biometrics: 50, affect: 50, journal: 50 }).severity).toBe("caution");
    expect(computeMhi({ biometrics: 30, affect: 30, journal: 30 }).severity).toBe("critical");
  });

  it("flags discrepancy when sources disagree beyond the gap", () => {
    const r = computeMhi({ biometrics: 30, affect: 45, journal: 92 });
    expect(r.discrepancy.active).toBe(true);
    expect(r.discrepancy.pair).toEqual(["biometrics", "journal"]);
  });

  it("no discrepancy when sources agree", () => {
    expect(computeMhi({ biometrics: 70, affect: 75, journal: 80 }).discrepancy.active).toBe(false);
  });
});

describe("pvtScore", () => {
  it("is 100 at or below baseline and drops with slower reactions", () => {
    expect(pvtScore(MHI_CONFIG.pvtBaselineMs)).toBe(100);
    expect(pvtScore(200)).toBe(100);
    expect(pvtScore(MHI_CONFIG.pvtBaselineMs + 125)).toBeCloseTo(50);
    expect(pvtScore(2000)).toBe(0);
  });
});

describe("biometricScore", () => {
  it("nominal readings score high", () => {
    expect(biometricScore(NOMINAL_READINGS)).toBeGreaterThan(90);
  });

  it("sleep deprivation lowers the score", () => {
    const tired = { ...NOMINAL_READINGS, sleepHours: 3.5, hrv: 25, restingHeartRate: 80 };
    expect(biometricScore(tired)).toBeLessThan(50);
  });

  it("elevated resting HR during exertion is not penalized", () => {
    const stressed = { ...NOMINAL_READINGS, restingHeartRate: 85, activityLevel: 0.1 };
    const exercising = { ...stressed, activityLevel: 0.8 };
    expect(biometricScore(exercising)).toBeGreaterThan(biometricScore(stressed));
  });

  it("elevated CO2 lowers the score", () => {
    const highCo2 = { ...NOMINAL_READINGS, co2: 5 };
    expect(biometricScore(highCo2)).toBeLessThan(biometricScore(NOMINAL_READINGS));
  });
});
