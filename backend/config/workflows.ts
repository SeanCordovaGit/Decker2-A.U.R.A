import type { HazardCategory } from "../lib/types";

export type WorkflowKind = "hand" | "cold";
export const WORKFLOWS = {
  hand: {
    title: "Right-hand injury", scenarioId: "evaHandInjury", category: "injury" as HazardCategory,
    sourceId: "handUrgentReference", sourceUrl: "https://www.healthdirect.gov.au/accidents-and-injuries/hand-and-finger-fractures",
    questions: [
      { id: "hand-bleeding", text: "Is there heavy bleeding?", urgent: true },
      { id: "hand-sensation", text: "Is the finger or hand blue or numb?", urgent: true },
      { id: "hand-grip", text: "Does trying to grip something increase the pain?", urgent: false },
    ],
    steps: [
      { id: "hand-report", text: "Report what happened, the affected hand and any change in grip or sensation to the crew medical officer.", treatment: false },
      { id: "hand-protocol", text: "Request assessment using the mission-approved injury procedure. This prototype does not contain an approved treatment protocol.", treatment: false },
    ],
  },
  cold: {
    title: "Cabin cold", scenarioId: "cabinCold", category: "cabinCold" as HazardCategory,
    sourceId: "coldUrgentReference", sourceUrl: "https://www.nhs.uk/conditions/hypothermia/",
    questions: [
      { id: "cold-alertness", text: "Is anyone confused, unusually difficult to wake, or speaking unclearly?", urgent: true },
      { id: "cold-shivering", text: "Is anyone shivering or feeling unusually cold?", urgent: false },
      { id: "cold-location", text: "Does the cold affect more than one cabin area?", urgent: false },
    ],
    steps: [
      { id: "cold-report", text: "Report cabin location, temperature readings and any crew symptoms to mission control or the crew medical officer.", treatment: false },
      { id: "cold-protocol", text: "Use the mission-approved thermal-control and medical procedures. A low cabin reading alone does not diagnose hypothermia.", treatment: false },
    ],
  },
} as const;

export const URGENT_REPORT_ACTION = "Request prompt flight-surgeon or crew-medical-officer assessment and follow the mission-approved emergency procedure. Treatment instructions are withheld in this research prototype.";
