import { MHI_CONFIG, PROFILE, ruleFor } from "../config/aura";
import type { AstronautProfile, MhiComponent, MhiResult, MhiSource, Readings, Severity } from "./types";

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/**
 * Biometric wellbeing score 0–100 (higher is better).
 * HRV, resting HR, sleep and a CO2 penalty. Resting-HR penalty is suppressed during exertion.
 */
export function biometricScore(r: Readings, profile: AstronautProfile = PROFILE): number {
  const hrvScore = clamp((r.hrv / profile.baselineHrv) * 100);
  const exertion = r.activityLevel >= MHI_CONFIG.exertionActivity;
  const hrDelta = r.restingHeartRate - profile.baselineRestingHR;
  const hrScore = exertion ? 100 : clamp(100 - Math.max(0, hrDelta) * 4);
  const sleepScore = clamp(((r.sleepHours - 3) / (7 - 3)) * 100);

  const co2Rule = ruleFor("co2");
  const co2Caution = co2Rule?.cautionHigh ?? 3;
  const co2Critical = co2Rule?.criticalHigh ?? 5.3;
  const co2Penalty =
    r.co2 <= co2Caution ? 0 : clamp(((r.co2 - co2Caution) / (co2Critical - co2Caution)) * 30, 0, 30);

  const base = 0.35 * hrvScore + 0.25 * hrScore + 0.4 * sleepScore;
  return clamp(base - co2Penalty);
}

/** PVT score 0–100: 100 at the 250 ms baseline, falling 0.4 pts per ms slower (team-defined). */
export function pvtScore(reactionMs: number): number {
  return clamp(100 - Math.max(0, reactionMs - MHI_CONFIG.pvtBaselineMs) * 0.4);
}

export function computeMhi(input: Partial<Record<MhiSource, number | null>>): MhiResult {
  const sources: MhiSource[] = ["biometrics", "affect", "journal", "pvt"];
  const scores = Object.fromEntries(sources.map((s) => [s, input[s] ?? null])) as Record<MhiSource, number | null>;
  const available = sources.filter((s) => scores[s] !== null);
  const totalWeight = available.reduce((sum, s) => sum + MHI_CONFIG.weights[s], 0);

  const components: MhiComponent[] = sources.map((s) => ({
    source: s,
    score: scores[s],
    weight: scores[s] === null || totalWeight === 0 ? 0 : MHI_CONFIG.weights[s] / totalWeight,
  }));

  const index =
    totalWeight === 0
      ? 100
      : components.reduce((sum, c) => sum + (c.score ?? 0) * c.weight, 0);

  let severity: Severity = "nominal";
  if (index < MHI_CONFIG.critical) severity = "critical";
  else if (index < MHI_CONFIG.caution) severity = "caution";

  let best: { pair: [MhiSource, MhiSource] | null; gap: number } = { pair: null, gap: 0 };
  for (let i = 0; i < available.length; i++) {
    for (let j = i + 1; j < available.length; j++) {
      const a = available[i];
      const b = available[j];
      const gap = Math.abs((scores[a] as number) - (scores[b] as number));
      if (gap > best.gap) best = { pair: [a, b], gap };
    }
  }

  return {
    index,
    severity,
    components,
    discrepancy: {
      active: best.gap > MHI_CONFIG.discrepancyGap,
      pair: best.gap > MHI_CONFIG.discrepancyGap ? best.pair : null,
      gap: best.gap,
    },
  };
}
