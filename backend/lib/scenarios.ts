import type { Scenario } from "./types";

/** Ramp helper: value moves from `from` to `to` over `seconds`. */
const ramp = (elapsed: number, seconds: number, from: number, to: number) =>
  from + (to - from) * Math.min(1, elapsed / seconds);

export const SCENARIOS: Scenario[] = [
  {
    id: "sep",
    label: "Solar particle event",
    description: "Radiation dose rate spikes during a solar energetic particle event.",
    targets: (t) => ({ doseRate: ramp(t, 8, 3, 14), cumulativeDose: ramp(t, 12, 140, 650), sepActive: true }),
  },
  {
    id: "acuteDose", label: "Acute absorbed dose", description: "Independent experimental absorbed-dose input in Gy; does not convert mSv or diagnose injury.",
    targets: (t) => ({ absorbedDoseGy: ramp(t, 8, 0, 1.3) }),
  },
  {
    id: "coLeak",
    label: "CO leak",
    description: "Overheating equipment releases carbon monoxide; brain and heart at risk.",
    targets: (t) => ({ co: ramp(t, 10, 20, 480) }),
  },
  {
    id: "co2Buildup",
    label: "CO₂ buildup",
    description: "Scrubber degradation raises CO₂; headaches and lower cognition.",
    targets: (t) => ({ co2: ramp(t, 8, 3.2, 4.4), affectScore: 62, pvtReactionMs: 330 }),
  },
  {
    id: "cabinOverheat",
    label: "Cabin overheat",
    description: "Thermal control fault raises cabin temperature.",
    targets: (t) => ({ cabinTemp: ramp(t, 8, 27.5, 29.6) }),
  },
  {
    id: "cabinCold",
    label: "Cabin cold",
    description: "Heater failure drops cabin temperature.",
    targets: (t) => ({ cabinTemp: ramp(t, 8, 17, 15.4) }),
  },
  {
    id: "fever",
    label: "Fever",
    description: "Core temperature rises above the astronaut's space baseline.",
    targets: (t) => ({ coreTemp: ramp(t, 8, 38.2, 39.2), restingHeartRate: 78 }),
  },
  {
    id: "sleepDeprivation",
    label: "Sleep deprivation",
    description: "Several nights of short sleep degrade mood and cognition.",
    targets: () => ({ sleepHours: 3.5, hrv: 25, restingHeartRate: 80, affectScore: 40, pvtReactionMs: 430, pvtLapses: 6 }),
  },
  {
    id: "evaHandInjury",
    label: "EVA hand injury",
    description: "Glove pressure injury on the right hand after a spacewalk.",
    targets: (t) => ({
      injuries: { rightHand: t < 4 ? "caution" : "critical" },
      activityLevel: 0.3,
    }),
  },
  {
    id: "imFine",
    label: "\"I'm fine\" mismatch",
    description: "Journal says fine, but biometrics and affect show strain.",
    targets: () => ({ sleepHours: 4, hrv: 26, restingHeartRate: 78, affectScore: 40, pvtReactionMs: 380, pvtLapses: 3 }),
    journalText: "I'm fine, everything is good. Feeling great and really productive today.",
  },
];

export function scenarioById(id: string | null): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
