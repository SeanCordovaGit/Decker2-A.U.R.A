import type { Readings } from "./types";

export interface CrewProfile {
  id: string;
  mhiScore: number;
  readings: Partial<Readings>;
}

// Exact rows from data/crew-sample.csv, matching Nasa Space Apps 26.pdf p.1; no observation timestamps supplied.
export const CREW_PROFILES: CrewProfile[] = [
  { id: "AST-001", mhiScore: 92, readings: { doseRate: 1, cumulativeDose: 145, co: 8, cabinTemp: 22.8, coreTemp: 37, pvtReactionMs: 215, pvtLapses: 1, hrv: 64 } },
  { id: "AST-002", mhiScore: 84, readings: { doseRate: 1.2, cumulativeDose: 310, co: 14, cabinTemp: 23.4, coreTemp: 37.2, pvtReactionMs: 240, pvtLapses: 2, hrv: 55 } },
  { id: "AST-003", mhiScore: 65, readings: { doseRate: 1.8, cumulativeDose: 580, co: 52, cabinTemp: 27.5, coreTemp: 37.9, pvtReactionMs: 295, pvtLapses: 3, hrv: 41 } },
  { id: "AST-004", mhiScore: 42, readings: { doseRate: 2.4, cumulativeDose: 640, co: 120, cabinTemp: 29.4, coreTemp: 39.1, pvtReactionMs: 380, pvtLapses: 6, hrv: 24 } },
  { id: "AST-005", mhiScore: 74, readings: { doseRate: 0.9, cumulativeDose: 95, co: 5, cabinTemp: 16.5, coreTemp: 35.8, pvtReactionMs: 260, pvtLapses: 3, hrv: 46 } },
];

export function crewProfile(id: string | null): CrewProfile | undefined {
  return CREW_PROFILES.find((profile) => profile.id === id);
}

export const REFERENCE_LABS = [
  { analyte: "Serum potassium", range: "3.5–5.3 mmol/L", observed: "3.0 mmol/L", subject: "C003" },
  { analyte: "Blood urea nitrogen", range: "7.0–25.0 mg/dL", observed: "26.0 mg/dL", subject: "C004" },
  { analyte: "Fasting glucose", range: "65.0–99.0 mg/dL", observed: "103.0 mg/dL", subject: "C003" },
  { analyte: "AST", range: "10.0–40.0 U/L", observed: "48.0 U/L", subject: "C004" },
] as const;
