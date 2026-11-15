import type { Readings } from "./types";

export const NOMINAL_READINGS: Readings = {
  doseRate: 0.6,
  cumulativeDose: 120,
  co: 2,
  co2: 2.2,
  cabinTemp: 22,
  coreTemp: 37.0,
  heartRate: 68,
  restingHeartRate: 62,
  hrv: 55,
  sleepHours: 7.5,
  activityLevel: 0.1,
  affectScore: 85,
  pvtReactionMs: 230,
  pvtLapses: 1,
  absorbedDoseGy: 0,
  injuries: {},
  gammaActive: false,
  sepActive: false,
};

const LIMITS: Partial<Record<keyof Readings, [number, number]>> = {
  doseRate: [0, 200],
  cumulativeDose: [0, 1000],
  co: [0, 1000],
  co2: [0, 20],
  cabinTemp: [5, 45],
  coreTemp: [30, 43],
  heartRate: [35, 200],
  restingHeartRate: [35, 140],
  hrv: [5, 150],
  sleepHours: [0, 12],
  activityLevel: [0, 1],
  affectScore: [0, 100],
  pvtReactionMs: [150, 1000],
  pvtLapses: [0, 30],
  absorbedDoseGy: [0, 20],
};

export function clampReadings(r: Readings): Readings {
  const out = { ...r };
  for (const [k, [lo, hi]] of Object.entries(LIMITS) as [keyof Readings, [number, number]][]) {
    (out[k] as number) = Math.max(lo, Math.min(hi, out[k] as number));
  }
  return out;
}

/** Small symmetric noise so the vitals look alive. Deterministic when rand is injected. */
const NOISE: Partial<Record<keyof Readings, number>> = {
  doseRate: 0.03,
  co: 0.2,
  co2: 0.03,
  cabinTemp: 0.05,
  coreTemp: 0.02,
  heartRate: 1.2,
  hrv: 0.8,
  pvtReactionMs: 6,
};

/** Fraction of the remaining gap closed per tick when drifting toward a scenario target. */
const DRIFT = 0.25;

export function tickReadings(
  prev: Readings,
  targets: Partial<Readings>,
  rand: () => number = Math.random,
): Readings {
  const next: Readings = { ...prev, injuries: { ...prev.injuries } };
  const goal: Readings = { ...NOMINAL_READINGS, ...targets };

  for (const key of Object.keys(LIMITS) as (keyof Readings)[]) {
    if (key === "cumulativeDose" || key === "absorbedDoseGy" || key === "pvtLapses") continue;
    const cur = prev[key] as number;
    const target = goal[key] as number;
    const noise = ((rand() - 0.5) * 2 * (NOISE[key] ?? 0));
    (next[key] as number) = cur + (target - cur) * DRIFT + noise;
  }

  // Heart rate follows resting HR plus activity
  next.heartRate = next.restingHeartRate + next.activityLevel * 70 + ((rand() - 0.5) * 2);

  // Only simulated radiation integrates dose; a recorded catalog event supplies no personal dosimetry.
  next.cumulativeDose = Math.max(prev.cumulativeDose, targets.cumulativeDose ?? prev.cumulativeDose + ((targets.gammaActive || targets.sepActive) && !targets.sepEvent ? next.doseRate * 0.02 : 0));

  next.pvtLapses = Math.round(goal.pvtLapses);
  next.absorbedDoseGy = Math.max(prev.absorbedDoseGy, targets.absorbedDoseGy ?? prev.absorbedDoseGy);
  next.injuries = { ...(targets.injuries ?? {}) };
  next.gammaActive = targets.gammaActive ?? false;
  next.sepActive = targets.sepActive ?? false;
  next.sepEvent = targets.sepEvent;
  return clampReadings(next);
}
