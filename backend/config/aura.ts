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
  MetricStatus,
  Severity,
  ThresholdRule,
} from "../lib/types";

export const CITATIONS: Record<string, Citation> = {
  donkiSep: { id: "donkiSep", text: "NASA CCMC DONKI recorded SEP event. A replay activates a project-defined space-weather precaution only; it is not current telemetry or a crew-dose measurement.", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", verified: true, teamDefined: true },
  handUrgentReference: { id: "handUrgentReference", text: "Public hand/finger-injury urgent-assessment reference (healthdirect). Mission adaptation and medical review pending; not an onboard treatment protocol.", url: "https://www.healthdirect.gov.au/accidents-and-injuries/hand-and-finger-fractures", verified: false, teamDefined: true },
  teamSymptomReport: { id: "teamSymptomReport", text: "Team-supplied clarifying questions and next steps. A Yes to a symptom question escalates by project rule; it is not a sensor reading, diagnosis or mission-approved protocol.", verified: true, teamDefined: true },
  coldUrgentReference: { id: "coldUrgentReference", text: "NHS hypothermia emergency-recognition reference. Mission adaptation and medical review pending; cabin temperature alone is not a hypothermia diagnosis.", url: "https://www.nhs.uk/conditions/hypothermia/", verified: false, teamDefined: true },
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
    text: "Retained A.U.R.A. CO2 demo bands (project-defined). The supplied update does not replace these values; JSC-20584 Rev. D no longer includes CO2 SMACs.",
    verified: false,
    teamDefined: true,
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
    text: "Team research Table 7: MHI 80-100 nominal, 50 to below 80 caution, below 50 critical. Composite weights are project-defined; PVT+ is graded independently.",
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
  jsc20584Co: { id: "jsc20584Co", text: "NASA JSC-20584 Rev D: CO reference concentrations 425 ppm (1 hour), 55 ppm (7 days), 15 ppm (30-180 days). Demo warning/red/escalation tiers are project-defined concentration comparisons; actual exposure duration is not measured.", url: "https://standards.nasa.gov/standard/JSC/JSC-20584-D", verified: false, teamDefined: true },
  teamCoEarly: { id: "teamCoEarly", text: "Team research, Nasa Space Apps 26 (1).pdf p.5-6: project-defined early CO warning at 10 ppm.", verified: true, teamDefined: true },
  researchRadiation: { id: "researchRadiation", text: "Updated team paper p.4: cumulative warning above 150 mSv is project-defined, not a validated acute threshold. NASA V1 4030 requires career effective dose below 600 mSv. The red tier requests career-dose review, not an acute-emergency diagnosis.", verified: false, teamDefined: true },
  researchCabin: { id: "researchCabin", text: "Team research Table 5, p.6: cabin nominal 18.3-26.7 C; critical below 16.0 C or above 29.0 C. NASA-STD-3001 Vol.2 / RR-1 EDA / Tu et al. (2021) are cited by the team; bands are project-defined.", verified: false, teamDefined: true },
  researchCore: { id: "researchCore", text: "Team research Table 6, p.6-7: core nominal 36.5-37.5 C; critical below 35.0 C or at/above 39.0 C. Intermediate gaps remain caution per team clarification. Stahn et al. (2017) provides spaceflight context, not these clinical cutoffs.", url: "https://doi.org/10.1038/s41598-017-15560-w", verified: false, teamDefined: true },
  pvtPlus: { id: "pvtPlus", text: "Team research Table 7: reaction time 250-350 ms caution, above 350 ms critical; 3-4 lapses caution, 5+ critical per 300 s test. NASA PVT+ User Guide (2026) describes the test protocol; alert bands are project-defined.", url: "https://www.nasa.gov/wp-content/uploads/2026/02/2026-02-27-nasa-pvtuser-guide.pdf", verified: false, teamDefined: true },
  researchHrv: { id: "researchHrv", text: "Team research Table 7: HRV RMSSD 30-50 ms caution, below 30 ms critical. Absolute bands used because individual crew baselines were not supplied.", verified: true, teamDefined: true },
  poplaskiGi: { id: "poplaskiGi", text: "Team research p.4-5: 1.0 Gy absorbed dose used as an experimental GI-risk trigger, informed by Poplaski et al. (2025), human intestinal organoids. Not a validated human injury diagnosis; Gy is not converted to mSv.", url: "https://doi.org/10.1152/ajpgi.00186.2025", verified: false, teamDefined: true },
};

export const INDICATOR_COLORS = {
  red: "#FF4D4D", yellow: "#FFD23F", blue: "#4D7CFF", green: "#00FF90", gray: "#A3AEC2",
} as const;

export const INDICATOR_LEGEND = [
  { label: "Red", color: INDICATOR_COLORS.red, meaning: "Critical tier or career-dose review. The alert states its scope; color alone does not diagnose an acute emergency." },
  { label: "Yellow", color: INDICATOR_COLORS.yellow, meaning: "Caution: elevated or sustained general parameters." },
  { label: "Blue", color: INDICATOR_COLORS.blue, meaning: "Lowered temperature at caution level." },
  { label: "Green", color: INDICATOR_COLORS.green, meaning: "Elevated radiation exposure at caution level." },
  { label: "Gray", color: INDICATOR_COLORS.gray, meaning: "Subpar air quality at caution level." },
] as const;

export type IndicatorContext = Pick<Partial<MetricStatus>, "metric" | "direction">;

export function getIndicatorColor(category: HazardCategory, severity: Severity, context?: IndicatorContext): string {
  if (severity === "critical") return INDICATOR_COLORS.red;
  if (context?.metric === "coreTemp" && context.direction === "low") return INDICATOR_COLORS.blue;
  return CATEGORY_META[category].color;
}

export const CATEGORY_META: Record<
  HazardCategory,
  { label: string; short: string; color: string; regions: BodyRegion[] }
> = {
  radiation: { label: "Radiation", short: "RAD", color: INDICATOR_COLORS.green, regions: [] },
  air: { label: "Air quality (CO / CO₂)", short: "AIR", color: INDICATOR_COLORS.gray, regions: [] },
  cabinHot: { label: "Cabin heat", short: "HOT", color: INDICATOR_COLORS.yellow, regions: [] },
  cabinCold: { label: "Cabin cold", short: "COLD", color: INDICATOR_COLORS.blue, regions: [] },
  mental: { label: "Mental / cognitive", short: "MIND", color: INDICATOR_COLORS.yellow, regions: ["head", "chest"] },
  injury: { label: "Injury / cardiovascular", short: "BODY", color: INDICATOR_COLORS.yellow, regions: [] },
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; badgeColor: string; opacity: number; pulse: boolean; rank: number }
> = {
  nominal: { label: "Nominal", badgeColor: "#22c55e", opacity: 0, pulse: false, rank: 0 },
  caution: { label: "Caution", badgeColor: INDICATOR_COLORS.yellow, opacity: 0.22, pulse: false, rank: 1 },
  critical: { label: "Critical", badgeColor: INDICATOR_COLORS.red, opacity: 0.38, pulse: true, rank: 2 },
};

export const NOTIFICATION_PRIORITIES: readonly {
  rank: number;
  label: string;
  metrics?: readonly string[];
  keys?: readonly string[];
  keyPrefixes?: readonly string[];
  categories?: readonly HazardCategory[];
}[] = [
  { rank: 1, label: "Toxic gas (CO / CO2)", categories: ["air"], keys: ["injury:co-exposure"] },
  { rank: 2, label: "Acute absorbed dose / SEP precaution", metrics: ["absorbedDoseGy"], keys: ["report:acuteDose", "report:sep", "sep"], keyPrefixes: ["sep:"] },
  { rank: 3, label: "Core thermoregulation", metrics: ["coreTemp"], keys: ["report:fever"] },
  { rank: 4, label: "Physical injury / cardiovascular", categories: ["injury"] },
  { rank: 5, label: "Cabin thermal conditions", categories: ["cabinHot", "cabinCold"] },
  { rank: 6, label: "Cognitive / mental fatigue", categories: ["mental"] },
  { rank: 7, label: "Cumulative career-dose review", categories: ["radiation"] },
];

export const MENTAL_ACTIONS = {
  caution: "Protect sleep time, reduce workload, repeat the PVT+ assessment and arrange a private check-in.",
  critical: "Contact the flight surgeon; adjust the work-rest schedule and delay high-risk tasks.",
  discrepancy: "Your self-report and sensor signals differ. Check in privately; you decide whether to share the discrepancy.",
};

export const THRESHOLD_RULES: ThresholdRule[] = [
  {
    metric: "cumulativeDose",
    label: "Cumulative effective dose",
    unit: "mSv",
    category: "radiation",
    cautionHigh: 150,
    cautionHighExclusive: true,
    criticalHigh: 600,
    context: "150 mSv is a project-defined cumulative warning. The 600 mSv NASA career effective-dose reference is not an acute emergency-dose threshold; the red tier requests career-dose review. Actual career assessment needs validated lifetime dosimetry history.",
    citationId: "researchRadiation",
    actions: {
      caution: "Cumulative dose is above the project warning level; review shielding, EVA plans, and dose trends.",
      critical: "Career-dose reference reached; limit further exposure and contact the flight surgeon for assessment.",
    },
  },
  {
    metric: "co",
    label: "Carbon monoxide",
    unit: "ppm",
    category: "air",
    cautionHigh: 10,
    escalateHigh: 55,
    criticalHigh: 425,
    earlyWarningBelow: 15,
    earlyCitationId: "teamCoEarly",
    context: "Reference limits: 15 ppm (30-180 days), 55 ppm (7 days), 425 ppm (1 hour). Actual exposure duration is not measured.",
    citationId: "jsc20584Co",
    actions: {
      caution: "Report the CO concentration, location and symptoms; request medical assessment at the configured referral reference and use the applicable atmosphere procedure.",
      critical: "Request prompt flight-surgeon and mission-control assessment using the approved toxic-atmosphere procedure. Potential CNS effects and cardiac arrhythmia; this alert does not confirm a fire.",
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
      caution: "Report CO2 partial pressure, ventilation status and any symptoms for mission-control review.",
      critical: "Request prompt mission-control and flight-surgeon assessment using the applicable environmental-control procedure.",
    },
  },
  {
    metric: "cabinTemp",
    label: "Cabin temperature",
    unit: "°C",
    category: "cabinHot",
    lowCategory: "cabinCold",
    cautionHigh: 26.7,
    cautionHighExclusive: true,
    criticalHigh: 29,
    criticalHighExclusive: true,
    cautionLow: 18.3,
    cautionLowExclusive: true,
    criticalLow: 16,
    criticalLowExclusive: true,
    citationId: "researchCabin",
    actions: {
      caution: "Report cabin temperature, location and symptoms; request review of the applicable thermal-control procedure.",
      critical: "Request prompt mission-control assessment of cabin temperature, crew symptoms and the approved thermal response.",
    },
  },
  {
    metric: "coreTemp",
    label: "Core body temperature",
    unit: "°C",
    category: "injury",
    cautionHigh: 37.5,
    cautionHighExclusive: true,
    criticalHigh: 39.0,
    cautionLow: 36.5,
    cautionLowExclusive: true,
    criticalLow: 35.0,
    criticalLowExclusive: true,
    citationId: "researchCore",
    actions: {
      caution: "Report core temperature, trend and symptoms for crew-medical-officer review; confirm the recheck schedule in the applicable procedure.",
      critical: "Request prompt flight-surgeon assessment of core temperature and symptoms using the applicable mission medical procedure.",
    },
    regions: ["chest"],
  },
  { metric: "pvtReactionMs", label: "PVT+ mean reaction time", unit: "ms", category: "mental", cautionHigh: 250, criticalHigh: 350, criticalHighExclusive: true, citationId: "pvtPlus", actions: MENTAL_ACTIONS },
  { metric: "pvtLapses", label: "PVT+ lapses", unit: "lapses / 300 s", category: "mental", cautionHigh: 3, criticalHigh: 5, citationId: "pvtPlus", actions: MENTAL_ACTIONS },
  { metric: "hrv", label: "HRV (RMSSD)", unit: "ms", category: "mental", cautionLow: 50, criticalLow: 30, criticalLowExclusive: true, citationId: "researchHrv", actions: MENTAL_ACTIONS },
  { metric: "absorbedDoseGy", label: "Acute absorbed dose / GI risk", unit: "Gy", category: "injury", criticalHigh: 1, citationId: "poplaskiGi", regions: ["abdomen"], actions: { caution: "Review dosimetry and symptoms.", critical: "Contact the flight surgeon, review acute dosimetry, and assess possible GI symptoms. Experimental risk indicator, not a diagnosis." } },
];

export const INJURY_ACTIONS = {
  caution: "Log the affected region and symptoms and request crew-medical-officer assessment using the approved injury procedure.",
  critical: "Stop current task; flight surgeon consultation for treatment plan.",
};

export const MHI_CONFIG = {
  weights: { biometrics: 0.4 / 0.8, affect: 0.15 / 0.8, journal: 0.25 / 0.8 },
  /** NASA-PVT style mean reaction time considered rested (team-defined) */
  pvtBaselineMs: 250,
  caution: 80,
  critical: 50,
  discrepancyGap: 30,
  /** activity level above which elevated heart rate is attributed to exertion */
  exertionActivity: 0.6,
  actions: MENTAL_ACTIONS,
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
