export type Severity = "nominal" | "caution" | "critical";

export type HazardCategory =
  | "radiation"
  | "air"
  | "cabinHot"
  | "cabinCold"
  | "mental"
  | "injury";

export type BodyRegion =
  | "head"
  | "chest"
  | "back"
  | "leftArm"
  | "rightArm"
  | "leftHand"
  | "rightHand"
  | "leftLeg"
  | "rightLeg";

export type EscalationTarget = "none" | "crew" | "flightSurgeon";

export type DataSource = "simulated" | "nasaLive" | "nasaCached";

export interface Readings {
  doseRate: number; // mSv/day
  cumulativeDose: number; // mSv
  co: number; // ppm
  co2: number; // mmHg
  cabinTemp: number; // °C
  coreTemp: number; // °C
  heartRate: number; // bpm
  restingHeartRate: number; // bpm
  hrv: number; // ms RMSSD
  sleepHours: number; // h
  activityLevel: number; // 0–1
  affectScore: number; // 0–100
  injuries: Partial<Record<BodyRegion, Severity>>;
  sepActive: boolean;
}

export type NumericMetric = {
  [K in keyof Readings]: Readings[K] extends number ? K : never;
}[keyof Readings];

export interface Citation {
  id: string;
  text: string;
  url?: string;
  /** true once the team has checked the value against the source document */
  verified: boolean;
  /** true when the threshold is a team-defined demo value rather than a published limit */
  teamDefined: boolean;
}

export interface ThresholdRule {
  metric: NumericMetric;
  label: string;
  unit: string;
  /** category when the value is high (or the only category) */
  category: HazardCategory;
  /** category when the value is low, if different */
  lowCategory?: HazardCategory;
  cautionHigh?: number;
  criticalHigh?: number;
  cautionLow?: number;
  criticalLow?: number;
  citationId: string;
  actions: { caution: string; critical: string };
  regions?: BodyRegion[];
}

export interface MetricStatus {
  metric: NumericMetric;
  value: number;
  severity: Severity;
  direction: "high" | "low" | null;
  threshold: number | null;
  category: HazardCategory;
  rule: ThresholdRule;
}

export interface CategoryStatus {
  category: HazardCategory;
  severity: Severity;
  regions: Partial<Record<BodyRegion, Severity>>;
}

export interface Alert {
  key: string;
  category: HazardCategory;
  title: string;
  severity: Severity;
  valueText: string;
  thresholdText: string;
  citation: Citation;
  action: string;
  escalation: EscalationTarget;
  escalated: boolean;
  toAstronautOnly: boolean;
  createdAt: number;
}

export interface AlertLogEntry {
  id: number;
  time: number;
  key: string;
  category: HazardCategory;
  title: string;
  severity: Severity;
  escalation: EscalationTarget;
  event: "opened" | "escalated" | "changed" | "cleared";
}

export type MhiSource = "biometrics" | "affect" | "journal";

export interface MhiComponent {
  source: MhiSource;
  score: number | null;
  weight: number;
}

export interface MhiResult {
  index: number;
  severity: Severity;
  components: MhiComponent[];
  discrepancy: { active: boolean; pair: [MhiSource, MhiSource] | null; gap: number };
}

export interface JournalEntry {
  text: string;
  createdAt: number;
  sentiment: number | null; // −1..1
  score: number | null; // 0–100
}

export interface SpaceWeatherEvent {
  id: string;
  eventTime: string;
  instruments: string[];
  link?: string;
}

export interface SpaceWeatherResponse {
  source: "nasaLive" | "nasaCached";
  fetchedAt: string | null;
  events: SpaceWeatherEvent[];
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  /** target readings the simulation drifts toward while the scenario is active */
  targets: (elapsed: number) => Partial<Readings>;
  journalText?: string;
}

export interface AstronautProfile {
  callsign: string;
  baselineCoreTemp: number;
  baselineRestingHR: number;
  baselineHrv: number;
  careerDoseLimit: number;
}
