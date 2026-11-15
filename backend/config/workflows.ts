import type { BodyRegion, HazardCategory } from "../lib/types";
import { ruleFor } from "./aura";

export type WorkflowKind = "hand" | "cold" | "sep" | "acuteDose" | "co" | "co2" | "overheat" | "fever" | "sleep";
export interface WorkflowStep { id: string; text: string; treatment: false }
export interface WorkflowQuestion { id: string; text: string; urgent: boolean }
export interface WorkflowConfig {
  title: string;
  scenarioId: string;
  category: HazardCategory;
  /** Citation for report-based escalation and the no-threshold finding. */
  sourceId: string;
  sourceUrl?: string;
  questions: readonly WorkflowQuestion[];
  /** Steps shown below critical (or always, when criticalSteps is absent). */
  steps: readonly WorkflowStep[];
  criticalSteps?: readonly WorkflowStep[];
  /** Live alerts that feed "Why this was flagged": alert metric names, "sep" or "mhi". */
  alertKeys?: readonly string[];
  status?: { caution: string; critical: string };
  placeholder?: string;
  /** Body regions marked critical when the crew reports an urgent symptom. */
  regions?: readonly BodyRegion[];
}

const step = (id: string, text: string): WorkflowStep => ({ id, text, treatment: false });
const CRITICAL_STATUS = "Flight surgeon / crew medical officer assessment indicated.";

export const WORKFLOWS: Record<WorkflowKind, WorkflowConfig> = {
  hand: {
    title: "Right-hand injury", scenarioId: "evaHandInjury", category: "injury", regions: ["rightHand"],
    sourceId: "handUrgentReference", sourceUrl: "https://www.healthdirect.gov.au/accidents-and-injuries/hand-and-finger-fractures",
    questions: [
      { id: "hand-bleeding", text: "Is there heavy bleeding?", urgent: true },
      { id: "hand-sensation", text: "Is the finger or hand blue or numb?", urgent: true },
      { id: "hand-grip", text: "Does trying to grip something increase the pain?", urgent: false },
    ],
    steps: [
      step("hand-report", "Report what happened, the affected hand and any change in grip or sensation to the crew medical officer."),
      step("hand-protocol", "Request assessment using the mission-approved injury procedure. This prototype does not contain an approved treatment protocol."),
    ],
  },
  cold: {
    title: "Cabin cold", scenarioId: "cabinCold", category: "cabinCold", alertKeys: ["cabinTemp", "coreTemp"],
    sourceId: "coldUrgentReference", sourceUrl: "https://www.nhs.uk/conditions/hypothermia/",
    questions: [
      { id: "cold-alertness", text: "Is anyone confused, unusually difficult to wake, or speaking unclearly?", urgent: true },
      { id: "cold-shivering", text: "Is anyone shivering or feeling unusually cold?", urgent: false },
      { id: "cold-location", text: "Does the cold affect more than one cabin area?", urgent: false },
    ],
    steps: [
      step("cold-report", "Report cabin location, temperature readings and any crew symptoms to mission control or the crew medical officer."),
      step("cold-protocol", "Use the mission-approved thermal-control and medical procedures. A low cabin reading alone does not diagnose hypothermia."),
    ],
  },
  sep: {
    title: "Solar radiation", scenarioId: "sep", category: "radiation", alertKeys: ["sep", "cumulativeDose"], sourceId: "teamSymptomReport",
    status: { caution: "SEP precaution active; verify the event record and personal dosimetry.", critical: CRITICAL_STATUS },
    placeholder: "Describe the module location, shielding status, and how the crew feels.",
    questions: [
      { id: "sep-symptoms", text: "Is anyone experiencing sudden nausea, vomiting, or unusual fatigue?", urgent: true },
      { id: "sep-exposure", text: "Were any crew members outside shielded modules or near viewports during the alert?", urgent: false },
      { id: "sep-dosimeters", text: "Are multiple cabin dosimeters showing elevated readings simultaneously?", urgent: false },
    ],
    steps: [
      step("sep-c1", "Log current module location and verify personal dosimeter readings."),
      step("sep-c2", "Ask mission control to review location, shielding and any EVA exposure history."),
      step("sep-c3", "Request the applicable mission-approved space-weather procedure and record its identifier."),
    ],
    criticalSteps: [
      step("sep-r1", "Report module location, cumulative dosimeter readings, and any crew symptoms to mission control or the crew medical officer."),
      step("sep-r2", "Ask mission control to assess sheltering needs using current dosimetry and the applicable mission procedure."),
      step("sep-r3", "Request prompt flight-surgeon assessment and follow mission-approved radiation emergency procedures."),
    ],
  },
  acuteDose: {
    title: "Acute dose", scenarioId: "acuteDose", category: "injury", alertKeys: ["absorbedDoseGy"], regions: ["abdomen"], sourceId: "teamSymptomReport",
    status: { caution: "Review the independent absorbed-dose input and dosimeter evidence.", critical: CRITICAL_STATUS },
    placeholder: "Describe the module location, radiation spike readings, and physical symptoms.",
    questions: [
      { id: "acute-gi", text: "Are any crew members suffering from sudden abdominal pain, nausea, or cramping?", urgent: true },
      { id: "acute-shielded", text: "Have personnel moved into shielded spaces away from unshielded sources?", urgent: false },
      { id: "acute-dosimeters", text: "Do crew dosimeters validate the environmental telemetry alerts?", urgent: false },
    ],
    steps: [
      step("acute-c1", "Report the suspected exposure location and log independently measured personal dosimeter totals."),
      step("acute-c2", "Perform a baseline status assessment to report any early gastrointestinal discomfort."),
      step("acute-c3", "Follow mission-approved radiation exposure logging until evaluated by the flight surgeon."),
    ],
    criticalSteps: [
      step("acute-r1", "Transmit accumulated exposure dose, anatomical indicator status (lower abdomen/GI), and symptoms to mission control or the crew medical officer."),
      step("acute-r2", "Request mission-control assessment of location, exposure duration and shielding before selecting an exposure response."),
      step("acute-r3", "Request immediate flight-surgeon evaluation and execute mission-approved acute radiation protocols."),
    ],
  },
  co: {
    title: "Carbon monoxide leak", scenarioId: "coLeak", category: "air", alertKeys: ["co"], sourceId: "teamSymptomReport",
    status: { caution: "Elevated cabin CO levels; air scrubbing & monitoring advised.", critical: CRITICAL_STATUS },
    placeholder: "Describe the affected module, hardware combustion status, and crew vitals.",
    questions: [
      { id: "co-symptoms", text: "Is anyone reporting headaches, dizziness, confusion, or elevated heart rates?", urgent: true },
      { id: "co-hardware", text: "Are there signs of hardware overheating, electrical burning, or smoke?", urgent: true },
      { id: "co-spread", text: "Are secondary cabin sensors detecting widespread gas accumulation?", urgent: false },
    ],
    steps: [
      step("co-c1", "Log ambient CO levels and report the impacted module location to ground control."),
      step("co-c2", "Report atmospheric-system status and available telemetry from neighboring modules for mission-control review."),
      step("co-c3", "Track heart rate shifts and cognitive symptoms using established air-quality standards."),
    ],
    criticalSteps: [
      step("co-r1", "Report module location, carbon monoxide concentration, and any physiological symptoms to flight surgeons."),
      step("co-r2", "Request the applicable mission-approved toxic-atmosphere procedure and a review of sensor readings and crew symptoms."),
      step("co-r3", "Request prompt flight-surgeon assessment and follow mission-approved environmental emergency procedures."),
    ],
  },
  co2: {
    title: "Carbon dioxide buildup", scenarioId: "co2Buildup", category: "air", alertKeys: ["co2"], sourceId: "teamSymptomReport",
    status: { caution: "Elevated cabin CO₂; ventilation & workload adjustment advised.", critical: CRITICAL_STATUS },
    placeholder: "Describe local ventilation performance, crew activity, and physical symptoms.",
    questions: [
      { id: "co2-symptoms", text: "Are crew members experiencing dyspnea, throbbing headaches, or lethargy?", urgent: true },
      { id: "co2-ventilation", text: "Are cabin ventilation fans and local scrubbers functioning nominally?", urgent: false },
      { id: "co2-stagnation", text: "Is there localized air stagnation from multiple crew members in unventilated areas?", urgent: false },
    ],
    steps: [
      step("co2-c1", "Log cabin CO2 partial pressure and report available ventilation-system readings."),
      step("co2-c2", "Ask the crew medical officer to review workload and reported symptoms alongside cabin readings."),
      step("co2-c3", "Request the applicable environmental-control procedure and record any reported symptoms."),
    ],
    criticalSteps: [
      step("co2-r1", "Report module location, hypercapnia metrics, and crew vital trends to flight surgeons."),
      step("co2-r2", "Request mission-control direction using the installed ventilation equipment and its approved procedure."),
      step("co2-r3", "Request immediate flight-surgeon assessment and follow mission-approved hypercapnia protocols."),
    ],
  },
  overheat: {
    title: "Thermal overheat", scenarioId: "cabinOverheat", category: "cabinHot", alertKeys: ["cabinTemp", "coreTemp"], sourceId: "teamSymptomReport",
    status: { caution: "Elevated cabin ambient temperature; thermal regulation advised.", critical: CRITICAL_STATUS },
    placeholder: "Describe module thermal status, cooling loop hardware, and crew vitals.",
    questions: [
      { id: "heat-symptoms", text: "Is anyone displaying profuse sweating, dizziness, nausea, or altered mental status?", urgent: true },
      { id: "heat-core", text: `Is astronaut core temperature rising above the ${ruleFor("coreTemp")?.cautionHigh} °C threshold?`, urgent: false },
      { id: "heat-spread", text: "Are active thermal alerts expanding across adjacent module sectors?", urgent: false },
    ],
    steps: [
      step("heat-c1", "Record ambient module temperatures and inspect ECLSS cooling loop performance."),
      step("heat-c2", "Report activity level and hydration concerns for crew-medical-officer assessment."),
      step("heat-c3", "Follow thermal-control procedures; environmental spikes require correlation with physiological vitals."),
    ],
    criticalSteps: [
      step("heat-r1", "Report module location, ambient thermal data, and physiological vitals to flight surgeons."),
      step("heat-r2", "Request a mission-specific thermal response after reviewing cabin readings and core temperature separately."),
      step("heat-r3", "Request immediate flight-surgeon consultation and proceed with hyperthermia emergency steps."),
    ],
  },
  fever: {
    title: "Fever", scenarioId: "fever", category: "injury", alertKeys: ["coreTemp"], regions: ["chest"], sourceId: "teamSymptomReport",
    status: { caution: "Mild core temperature elevation; rest & symptom tracking advised.", critical: CRITICAL_STATUS },
    placeholder: "Describe how long the fever has lasted and any other physical symptoms.",
    questions: [
      { id: "fever-symptoms", text: "Is the astronaut experiencing chills, body aches, sore throat, or respiratory symptoms?", urgent: false },
      { id: "fever-others", text: "Is anyone else on the crew reporting similar symptoms or elevated temperatures?", urgent: false },
      { id: "fever-alertness", text: "Is the astronaut confused, severely lethargic, or struggling to stay hydrated?", urgent: true },
    ],
    steps: [
      step("fever-c1", "Log core temperature reading, heart rate variability (HRV), and any accompanying symptoms."),
      step("fever-c2", "Rest from non-essential tasks, maintain hydration, and recheck core temperature per schedule."),
      step("fever-c3", "Follow mission-approved health monitoring procedures; a single elevated reading requires trend verification."),
    ],
    criticalSteps: [
      step("fever-r1", "Report core temperature readings, duration, and any crew symptoms to mission control or the crew medical officer."),
      step("fever-r2", "Ask the crew medical officer to determine monitoring and any isolation requirements using the applicable procedure."),
      step("fever-r3", "Request prompt flight-surgeon assessment and follow mission-approved emergency medical procedures."),
    ],
  },
  sleep: {
    title: "Sleep loss", scenarioId: "sleepDeprivation", category: "mental", alertKeys: ["pvtReactionMs", "pvtLapses", "hrv", "mhi"], sourceId: "teamSymptomReport",
    status: { caution: "Moderate cognitive fatigue; schedule & recovery adjustment advised.", critical: CRITICAL_STATUS },
    placeholder: "Report uninterrupted sleep hours in the last 24-48 hours, workload strain, and current alertness.",
    questions: [
      { id: "sleep-deficit", text: "Has the astronaut had less uninterrupted sleep than scheduled in the last 24–48 hours?", urgent: false },
      { id: "sleep-operations", text: "Is the astronaut scheduled for high-risk or safety-critical operations today?", urgent: false },
      { id: "sleep-signs", text: "Is anyone noticing slowed reaction times, irritability, or difficulty concentrating?", urgent: false },
    ],
    steps: [
      step("sleep-c1", "Review recent sleep architecture, HRV trends, and PVT+ reaction-time results."),
      step("sleep-c2", "Defer non-urgent, high-precision tasks and schedule a protected rest block per mission guidelines."),
      step("sleep-c3", "Follow mission-approved fatigue management procedures and log subjective alertness."),
    ],
    criticalSteps: [
      step("sleep-r1", "Report PVT+ test lapses, MHI score, and sleep deficit history to mission control or the crew medical officer."),
      step("sleep-r2", "Request a review of fitness for high-risk operations against the mission-approved fatigue criteria."),
      step("sleep-r3", "Request prompt flight-surgeon assessment to restructure work-rest cycles."),
    ],
  },
};

export const URGENT_REPORT_ACTION = "Request prompt flight-surgeon or crew-medical-officer assessment and follow the mission-approved emergency procedure. Treatment instructions are withheld in this research prototype.";

export function workflowForScenario(scenarioId: string | null): WorkflowKind | null {
  return (Object.keys(WORKFLOWS) as WorkflowKind[]).find((kind) => WORKFLOWS[kind].scenarioId === scenarioId) ?? null;
}
