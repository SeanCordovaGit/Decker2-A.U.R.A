import { CITATIONS } from "../config/aura";
import { URGENT_REPORT_ACTION, WORKFLOWS, type WorkflowKind } from "../config/workflows";
import { buildAlerts, evaluateMetrics, formatMetricValue, maxSeverity } from "./evaluate";
import { computeMhi } from "./mhi";
import { NOMINAL_READINGS } from "./simulation";
import type { Severity } from "./types";

export interface WorkflowInput {
  kind: WorkflowKind;
  report: string;
  answers: Record<string, "yes" | "no" | "unknown">;
  cabinTemp: number;
  coreTemp: number;
  injurySeverity: Severity;
  reportedUrgent?: boolean;
}

export function buildWorkflow(input: WorkflowInput) {
  const config = WORKFLOWS[input.kind];
  const urgentAnswers = config.questions.filter((question) => question.urgent && input.answers[question.id] === "yes");
  const urgentReport = !!input.reportedUrgent || urgentAnswers.length > 0;
  const readings = { ...NOMINAL_READINGS, cabinTemp: input.cabinTemp, coreTemp: input.coreTemp };
  const metricAlerts = buildAlerts(readings, evaluateMetrics(readings), computeMhi({}, 92), 0);
  const findings = input.kind === "hand" ? [{ id: "hand-report", text: `Simulated crew-reported right-hand injury: ${input.injurySeverity}.`, severity: input.injurySeverity, sourceId: "teamInjury" }] : metricAlerts.filter((alert) => alert.metric === "cabinTemp" || alert.metric === "coreTemp").map((alert) => ({ id: alert.metric!, text: `${alert.title}: ${alert.valueText}. ${alert.thresholdText}.`, severity: alert.severity, sourceId: alert.citation.id }));
  if (!findings.length) findings.push({ id: "cabinTemp", text: `Cabin temperature: ${formatMetricValue("cabinTemp", input.cabinTemp, 1)} °C; within configured demo bands.`, severity: "nominal", sourceId: "researchCabin" });
  if (urgentReport) findings.push({ id: `report-${input.kind}`, text: `${urgentAnswers.length ? `Crew answered Yes: ${urgentAnswers.map((question) => `${question.text} [${question.id}]`).join("; ")}` : "A previously confirmed urgent answer remains active until reset"}. Report-based escalation; not a sensor reading or diagnosis.`, severity: "critical", sourceId: config.sourceId });
  const severity = findings.reduce<Severity>((severity, finding) => maxSeverity(severity, finding.severity), "nominal");
  const responder = severity === "critical" ? "flightSurgeon" : "crew";
  const steps = [...config.steps, { id: "escalation", text: severity === "critical" ? URGENT_REPORT_ACTION : "Crew review is indicated by the current demo rules. Unanswered questions or unmeasured symptoms can still require medical assessment.", treatment: false }];
  return { title: config.title, severity, responder, urgentReport, protocolReview: "pending" as const, questions: config.questions, findings, steps, sources: findings.map((finding) => ({ id: finding.id, citation: CITATIONS[finding.sourceId] })) };
}

export type WorkflowPlan = ReturnType<typeof buildWorkflow>;
export interface GroundedExplanation { quotes: string[]; findingIds: string[]; questionIds: string[]; stepIds: string[] }

export function validateWorkflowInput(value: unknown): WorkflowInput {
  if (!value || typeof value !== "object") throw new Error("Invalid workflow request");
  const input = value as WorkflowInput;
  if (!(input.kind === "hand" || input.kind === "cold") || typeof input.report !== "string" || !input.report.trim() || input.report.length > 2000) throw new Error("Choose a workflow and provide a report of 1–2000 characters.");
  if (!Number.isFinite(input.cabinTemp) || !Number.isFinite(input.coreTemp) || !["nominal", "caution", "critical"].includes(input.injurySeverity)) throw new Error("Invalid readings");
  if (!input.answers || typeof input.answers !== "object" || Array.isArray(input.answers)) throw new Error("Invalid answers");
  const ids: readonly string[] = WORKFLOWS[input.kind].questions.map((question) => question.id);
  if (Object.entries(input.answers).some(([id, answer]) => !ids.includes(id) || !["yes", "no", "unknown"].includes(answer))) throw new Error("Invalid follow-up answer");
  if (input.reportedUrgent !== undefined && typeof input.reportedUrgent !== "boolean") throw new Error("Invalid report flag");
  return { kind: input.kind, report: input.report.trim(), answers: input.answers, cabinTemp: input.cabinTemp, coreTemp: input.coreTemp, injurySeverity: input.injurySeverity, reportedUrgent: input.reportedUrgent };
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
