/**
 * A.U.R.A. single source of truth (Constitution IV).
 * Thresholds, colors, actions, escalation rules and citations live here only.
 *
 * Values flagged `verified: false` were taken from the team's research draft or recalled NASA
 * references and MUST be checked against the cited document before the pitch.
 */
import type {
  AstronautProfile,
  BodyRegion,
  Citation,
  HazardCategory,
  Severity,
  ThresholdRule,
} from "../lib/types";

export const CITATIONS: Record<string, Citation> = {
  std3001Radiation: {
    id: "std3001Radiation",
    text: "NASA-STD-3001 Vol. 1 — career effective dose limit 600 mSv",
    verified: false,
    teamDefined: false,
  },
  teamDoseRate: {
    id: "teamDoseRate",
    text: "A.U.R.A. demo threshold (team-defined); ISS baseline ≈0.5–1 mSv/day, deep-space cruise ≈1.8 mSv/day (MSL RAD)",
    verified: false,
    teamDefined: true,
  },
  smacCo: {
    id: "smacCo",
    text: "NASA Spacecraft Maximum Allowable Concentrations (SMAC) — CO: 15 ppm long-duration, 55 ppm 7-day",
    verified: false,
    teamDefined: false,
  },
  std3001Co2: {
    id: "std3001Co2",
    text: "NASA-STD-3001 Vol. 2 / SMAC — CO2 partial pressure limits (≈3 mmHg operational target; 7,000 ppm ≈5.3 mmHg SMAC)",
    verified: false,
    teamDefined: false,
  },
  std3001Cabin: {
    id: "std3001Cabin",
    text: "NASA-STD-3001 Vol. 2 — habitable cabin temperature range 18–27 °C (critical bounds team-defined)",
    verified: false,
    teamDefined: false,
  },
  clinicalTemp: {
    id: "clinicalTemp",
    text: "Clinical core temperature bands (fever ≥38 °C, hyperthermia ≥40 °C, hypothermia ≤35 °C); Stahn et al. 2017, Sci. Reports — core temp rises toward ~38 °C on long missions",
    verified: false,
    teamDefined: false,
  },
  teamMhi: {
    id: "teamMhi",
    text: "A.U.R.A. Mental Health Index thresholds (team-defined); journal-based monitoring precedent: NASA ISS 'Journals' behavioral study",
    verified: false,
    teamDefined: true,
  },
  pvt: {
    id: "pvt",
    text: "Psychomotor Vigilance Test (PVT): reaction-time test used for fatigue in spaceflight studies (e.g. NASA 'Reaction Self Test' on ISS); score mapping team-defined",
    verified: false,
    teamDefined: true,
  },
  teamInjury: {
    id: "teamInjury",
    text: "Crew-reported injury / onboard medical assessment (simulated)",
    verified: false,
    teamDefined: true,
  },
};

export const CATEGORY_META: Record<
  HazardCategory,
  { label: string; short: string; color: string; regions: BodyRegion[] }
> = {
  radiation: { label: "Radiation", short: "RAD", color: "#00FF90", regions: [] },
  air: { label: "Air quality (CO / CO₂)", short: "AIR", color: "#A3AEC2", regions: [] },
  cabinHot: { label: "Cabin heat", short: "HOT", color: "#FF8A3D", regions: [] },
  cabinCold: { label: "Cabin cold", short: "COLD", color: "#4D7CFF", regions: [] },
  mental: { label: "Mental / cognitive", short: "MIND", color: "#FFD23F", regions: ["head", "chest"] },
  injury: { label: "Injury / cardiovascular", short: "BODY", color: "#FF3366", regions: [] },
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; badgeColor: string; opacity: number; pulse: boolean; rank: number }
> = {
  nominal: { label: "Nominal", badgeColor: "#22c55e", opacity: 0, pulse: false, rank: 0 },
  caution: { label: "Caution", badgeColor: "#f59e0b", opacity: 0.22, pulse: false, rank: 1 },
  critical: { label: "Critical", badgeColor: "#ef4444", opacity: 0.38, pulse: true, rank: 2 },
};

export const THRESHOLD_RULES: ThresholdRule[] = [
  {
    metric: "doseRate",
    label: "Radiation dose rate",
    unit: "mSv/day",
    category: "radiation",
    cautionHigh: 2,
    criticalHigh: 10,
    citationId: "teamDoseRate",
    actions: {
      caution: "Monitor dosimeter; limit time in low-shielding modules.",
      critical: "Shelter in the most shielded area (e.g. crew quarters / water-wall) until the event subsides.",
    },
  },
  {
    metric: "cumulativeDose",
    label: "Cumulative mission dose",
    unit: "mSv",
    category: "radiation",
    cautionHigh: 300,
    criticalHigh: 480,
    citationId: "std3001Radiation",
    actions: {
      caution: "50% of career limit reached: review remaining EVA and mission plan with flight surgeon.",
      critical: "80% of career limit: minimize further exposure; flight surgeon to review mission continuation.",
    },
  },
  {
    metric: "co",
    label: "Carbon monoxide",
    unit: "ppm",
    category: "air",
    cautionHigh: 15,
    criticalHigh: 55,
    citationId: "smacCo",
    actions: {
      caution: "Check for overheating equipment; increase ventilation and track trend.",
      critical: "Don masks, isolate the affected module, treat as possible fire/thermal event.",
    },
    regions: ["head", "chest"],
  },
  {
    metric: "co2",
    label: "Carbon dioxide",
    unit: "mmHg",
    category: "air",
    cautionHigh: 3.0,
    criticalHigh: 5.3,
    citationId: "std3001Co2",
    actions: {
      caution: "Increase airflow near sleep station; check CO₂ scrubber status. Expect headaches.",
      critical: "Activate backup CO₂ removal; reduce crew activity in the module.",
    },
  },
  {
    metric: "cabinTemp",
    label: "Cabin temperature",
    unit: "°C",
    category: "cabinHot",
    lowCategory: "cabinCold",
    cautionHigh: 27,
    criticalHigh: 30,
    cautionLow: 18,
    criticalLow: 15,
    citationId: "std3001Cabin",
    actions: {
      caution: "Adjust thermal control setpoint; hydrate / add layers.",
      critical: "Check thermal control system; relocate crew to a nominal module.",
    },
  },
  {
    metric: "coreTemp",
    label: "Core body temperature",
    unit: "°C",
    category: "injury",
    cautionHigh: 38.0,
    criticalHigh: 40.0,
    cautionLow: 35.0,
    criticalLow: 33.0,
    citationId: "clinicalTemp",
    actions: {
      caution: "Rest, hydrate, re-measure in 30 min; compare with personal space baseline.",
      critical: "Begin cooling/warming protocol and contact flight surgeon immediately.",
    },
    regions: ["chest"],
  },
];

export const INJURY_ACTIONS = {
  caution: "Apply first aid from the onboard medical kit; log symptoms.",
  critical: "Stop current task; flight surgeon consultation for treatment plan.",
};

export const MHI_CONFIG = {
  weights: { biometrics: 0.4, affect: 0.15, journal: 0.25, pvt: 0.2 },
  /** NASA-PVT style mean reaction time considered rested (team-defined) */
  pvtBaselineMs: 250,
  caution: 60,
  critical: 40,
  discrepancyGap: 30,
  /** activity level above which elevated heart rate is attributed to exertion */
  exertionActivity: 0.6,
  actions: {
    caution: "Protect sleep window; reduce workload; schedule a private family/psych conference.",
    critical: "Private check-in with flight surgeon / behavioral health; adjust work-rest schedule.",
    discrepancy:
      "Your self-report and body signals disagree. Take a moment to check in with yourself — you decide whether to share this.",
  },
};

export const ESCALATION = {
  /** caution alerts persisting this long (demo seconds) escalate to the flight surgeon */
  cautionPersistSeconds: 20,
  demoTimeNote: "Demo time is compressed: 20 s here represents hours of persistent caution.",
};

export const PROFILE: AstronautProfile = {
  callsign: "AURA-1",
  baselineCoreTemp: 37.0,
  baselineRestingHR: 62,
  baselineHrv: 55,
  careerDoseLimit: 600,
};

export const MEASUREMENTS: { metric: string; device: string; why: string }[] = [
  {
    metric: "Radiation dose (rate & cumulative)",
    device: "Personal & area dosimeters; tissue-equivalent counters",
    why: "Space radiation raises cancer, CNS and cardiovascular risk; solar particle events can deliver large doses within hours.",
  },
  {
    metric: "CO and CO₂",
    device: "Cabin air quality / combustion product monitors",
    why: "Closed loop air: CO signals fire or overheating; elevated CO₂ causes headaches and reduces cognitive performance.",
  },
  {
    metric: "Cabin temperature",
    device: "Environmental control system thermal sensors",
    why: "Heat stress and cold reduce performance; thermal control failures must be caught early.",
  },
  {
    metric: "Core body temperature",
    device: "Wearable core-temperature sensor (e.g. heat-flux forehead sensor)",
    why: "Microgravity impairs heat dissipation; fever may signal infection with limited treatment options onboard.",
  },
  {
    metric: "Heart rate, HRV, resting HR",
    device: "Wearable ECG / smart shirt (e.g. Bio-Monitor type garment)",
    why: "Cardiovascular deconditioning and stress show up as changes in heart rate and its variability.",
  },
  {
    metric: "Sleep duration",
    device: "Actigraphy wristband",
    why: "Sleep loss is common in orbit and degrades mood, cognition and safety.",
  },
  {
    metric: "PVT reaction time",
    device: "Psychomotor Vigilance Test on a station tablet (simulated in this prototype)",
    why: "Slower reactions flag fatigue and sleep loss before the astronaut notices them.",
  },
  {
    metric: "Affect / voice",
    device: "Check-in voice analysis (simulated in this prototype)",
    why: "Behavioral context helps separate stress from physical exertion.",
  },
  {
    metric: "Journal sentiment",
    device: "Private daily journal (on-device text analysis)",
    why: "Captures subjective stressors such as isolation and crew friction that sensors miss.",
  },
];

export const CHALLENGE_OBJECTIVES = [
  { question: "Which measurements can be performed in space, and why?", where: "Measurements panel" },
  { question: "How do spaceflight hazards affect health indicators?", where: "Auras + linked effects (e.g. CO₂ lowers the mental index, CO highlights brain & heart)" },
  { question: "When does a result need the crew vs. flight surgeons?", where: "Alert escalation: caution → crew, critical or persistent → flight surgeon" },
  { question: "What actions prevent a critical condition?", where: "Recommended action on every alert" },
];

export function ruleFor(metric: string): ThresholdRule | undefined {
  return THRESHOLD_RULES.find((r) => r.metric === metric);
}
