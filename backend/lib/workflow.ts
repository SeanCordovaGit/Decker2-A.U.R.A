import { CITATIONS } from "../config/aura";
import { URGENT_REPORT_ACTION, WORKFLOWS, type WorkflowKind } from "../config/workflows";
import { buildAlerts, evaluateMetrics, formatMetricValue, maxSeverity } from "./evaluate";
import { computeMhi } from "./mhi";
import { NOMINAL_READINGS } from "./simulation";
import type { Severity } from "./types";

/** Readings a workflow may receive to rebuild its alert-based findings. */
export const WORKFLOW_METRICS = ["doseRate", "cumulativeDose", "absorbedDoseGy", "co", "co2", "cabinTemp", "coreTemp", "pvtReactionMs", "pvtLapses", "hrv"] as const;
type WorkflowMetric = (typeof WORKFLOW_METRICS)[number];

export interface WorkflowInput {
  kind: WorkflowKind;
  report: string;
  answers: Record<string, "yes" | "no" | "unknown">;
  cabinTemp: number;
  coreTemp: number;
  injurySeverity: Severity;
  reportedUrgent?: boolean;
  readings?: Partial<Record<WorkflowMetric, number>>;
  sepActive?: boolean;
  mhiIndex?: number;
}

export function buildWorkflow(input: WorkflowInput) {
  const config = WORKFLOWS[input.kind];
  const urgentAnswers = config.questions.filter((question) => question.urgent && input.answers[question.id] === "yes");
  const urgentReport = !!input.reportedUrgent || urgentAnswers.length > 0;
  const readings = { ...NOMINAL_READINGS, ...input.readings, cabinTemp: input.cabinTemp, coreTemp: input.coreTemp, sepActive: !!input.sepActive };
  const metricAlerts = buildAlerts(readings, evaluateMetrics(readings), computeMhi({}, input.mhiIndex ?? 92), 0);
  const alertKey = (alert: (typeof metricAlerts)[number]) => alert.metric ?? (alert.key.startsWith("sep") ? "sep" : alert.key);
  const findings = input.kind === "hand" ? [{ id: "hand-report", text: `Simulated crew-reported right-hand injury: ${input.injurySeverity}.`, severity: input.injurySeverity, sourceId: "teamInjury" }] : metricAlerts.filter((alert) => config.alertKeys?.includes(alertKey(alert))).map((alert) => ({ id: alertKey(alert), text: `${alert.title}: ${alert.valueText}. ${alert.thresholdText}.`, severity: alert.severity, sourceId: alert.citation.id }));
  if (!findings.length) findings.push(input.kind === "cold"
    ? { id: "cabinTemp", text: `Cabin temperature: ${formatMetricValue("cabinTemp", input.cabinTemp, 1)} °C; within configured demo bands.`, severity: "nominal", sourceId: "researchCabin" }
    : { id: "no-threshold", text: "No configured threshold is crossed in the current simulated readings.", severity: "nominal", sourceId: config.sourceId });
  if (urgentReport) findings.push({ id: `report-${input.kind}`, text: `${urgentAnswers.length ? `Crew answered Yes: ${urgentAnswers.map((question) => `${question.text} [${question.id}]`).join("; ")}` : "A previously confirmed urgent answer remains active until reset"}. Report-based escalation; not a sensor reading or diagnosis.`, severity: "critical", sourceId: config.sourceId });
  const severity = findings.reduce<Severity>((severity, finding) => maxSeverity(severity, finding.severity), "nominal");
  const responder = severity === "critical" ? "flightSurgeon" : "crew";
  // Tiered workflows carry their own critical escalation steps; hand and cold append the shared one.
  const steps = config.criticalSteps
    ? [...(severity === "critical" ? config.criticalSteps : config.steps)]
    : [...config.steps, { id: "escalation", text: severity === "critical" ? URGENT_REPORT_ACTION : "Crew review is indicated by the current demo rules. Unanswered questions or unmeasured symptoms can still require medical assessment.", treatment: false as const }];
  const status = config.status ? (severity === "critical" ? config.status.critical : severity === "caution" ? config.status.caution : "No configured threshold is crossed yet; keep monitoring.") : null;
  return { title: config.title, severity, responder, urgentReport, status, placeholder: config.placeholder ?? null, protocolReview: "pending" as const, questions: config.questions, findings, steps, sources: findings.map((finding) => ({ id: finding.id, citation: CITATIONS[finding.sourceId] })) };
}

export type WorkflowPlan = ReturnType<typeof buildWorkflow>;
export interface GroundedExplanation { quotes: string[]; findingIds: string[]; questionIds: string[]; stepIds: string[] }

export function validateWorkflowInput(value: unknown): WorkflowInput {
  if (!value || typeof value !== "object") throw new Error("Invalid workflow request");
  const input = value as WorkflowInput;
  if (typeof input.kind !== "string" || !Object.hasOwn(WORKFLOWS, input.kind) || typeof input.report !== "string" || !input.report.trim() || input.report.length > 2000) throw new Error("Choose a workflow and provide a report of 1–2000 characters.");
  if (!Number.isFinite(input.cabinTemp) || !Number.isFinite(input.coreTemp) || !["nominal", "caution", "critical"].includes(input.injurySeverity)) throw new Error("Invalid readings");
  if (!input.answers || typeof input.answers !== "object" || Array.isArray(input.answers)) throw new Error("Invalid answers");
  const ids: readonly string[] = WORKFLOWS[input.kind].questions.map((question) => question.id);
  if (Object.entries(input.answers).some(([id, answer]) => !ids.includes(id) || !["yes", "no", "unknown"].includes(answer))) throw new Error("Invalid follow-up answer");
  if (input.reportedUrgent !== undefined && typeof input.reportedUrgent !== "boolean") throw new Error("Invalid report flag");
  if (input.readings !== undefined && (!input.readings || typeof input.readings !== "object" || Array.isArray(input.readings) || Object.entries(input.readings).some(([key, value]) => !(WORKFLOW_METRICS as readonly string[]).includes(key) || !Number.isFinite(value)))) throw new Error("Invalid readings");
  if (input.sepActive !== undefined && typeof input.sepActive !== "boolean") throw new Error("Invalid SEP flag");
  if (input.mhiIndex !== undefined && (!Number.isFinite(input.mhiIndex) || input.mhiIndex < 0 || input.mhiIndex > 100)) throw new Error("Invalid MHI");
  return { kind: input.kind, report: input.report.trim(), answers: input.answers, cabinTemp: input.cabinTemp, coreTemp: input.coreTemp, injurySeverity: input.injurySeverity, reportedUrgent: input.reportedUrgent, readings: input.readings, sepActive: input.sepActive, mhiIndex: input.mhiIndex };
}

export function validateExplanation(value: unknown, report: string, plan: WorkflowPlan): GroundedExplanation {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid explanation");
  const object = value as Record<string, unknown>;
  const keys = ["quotes", "findingIds", "questionIds", "stepIds"];
  if (Object.keys(object).length !== keys.length || Object.keys(object).some((key) => !keys.includes(key))) throw new Error("Unexpected model authority");
  const allowed: Record<string, string[]> = { findingIds: plan.findings.map((item) => item.id), questionIds: plan.questions.map((item) => item.id), stepIds: plan.steps.map((item) => item.id) };
  for (const key of keys) {
    const items = object[key];
    if (!Array.isArray(items) || items.length > 4 || items.some((item) => typeof item !== "string" || item.length > 400 || (key === "quotes" ? !item.trim() || !report.includes(item) : !allowed[key].includes(item)))) throw new Error("Ungrounded model output");
  }
  if (plan.findings.some((finding) => finding.severity === "critical" && !(object.findingIds as string[]).includes(finding.id))) throw new Error("Critical finding omitted");
  return object as unknown as GroundedExplanation;
}
