import { describe, expect, it } from "vitest";
import { WORKFLOWS, workflowForScenario, type WorkflowKind } from "../../config/workflows";
import { buildWorkflow, validateWorkflowInput, type WorkflowInput } from "../../lib/workflow";
import { evaluateCategories, evaluateMetrics } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { SCENARIOS } from "../../lib/scenarios";

const base = (kind: WorkflowKind, extra: Partial<WorkflowInput> = {}): WorkflowInput => ({
  kind, report: "Crew report", answers: {}, cabinTemp: 22, coreTemp: 37, injurySeverity: "nominal", ...extra,
});
const ids = (plan: ReturnType<typeof buildWorkflow>) => plan.steps.map((step) => step.id);

describe("condition workflows", () => {
  it("maps every workflow to a real condition with unique step and question ids", () => {
    const stepIds = Object.values(WORKFLOWS).flatMap((workflow) => [...workflow.steps, ...(workflow.criticalSteps ?? [])].map((step) => step.id));
    const questionIds = Object.values(WORKFLOWS).flatMap((workflow) => workflow.questions.map((question) => question.id));
    expect(new Set(stepIds).size).toBe(stepIds.length);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    for (const [kind, workflow] of Object.entries(WORKFLOWS)) {
      expect(SCENARIOS.some((scenario) => scenario.id === workflow.scenarioId)).toBe(true);
      expect(workflowForScenario(workflow.scenarioId)).toBe(kind);
    }
    expect(workflowForScenario("imFine")).toBeNull();
  });

  it("switches fever steps and status between caution and critical from the core reading", () => {
    const caution = buildWorkflow(base("fever", { coreTemp: 38.2 }));
    expect(caution.severity).toBe("caution");
    expect(caution.status).toBe(WORKFLOWS.fever.status!.caution);
    expect(ids(caution)).toEqual(["fever-c1", "fever-c2", "fever-c3"]);
    expect(caution.findings.map((finding) => finding.id)).toEqual(["coreTemp"]);
    const critical = buildWorkflow(base("fever", { coreTemp: 39.2 }));
    expect(critical.severity).toBe("critical");
    expect(critical.responder).toBe("flightSurgeon");
    expect(ids(critical)).toEqual(["fever-r1", "fever-r2", "fever-r3"]);
  });

  it("takes solar event findings from the SEP precaution and the cumulative dose", () => {
    const caution = buildWorkflow(base("sep", { sepActive: true, readings: { cumulativeDose: 140 } }));
    expect(caution.severity).toBe("caution");
    expect(caution.findings.map((finding) => finding.id)).toEqual(["sep"]);
    const critical = buildWorkflow(base("sep", { sepActive: true, readings: { cumulativeDose: 650 } }));
    expect(critical.severity).toBe("critical");
    expect(critical.findings.map((finding) => finding.id).sort()).toEqual(["cumulativeDose", "sep"]);
  });

  it("cites the configured Gy rule for acute dose and never converts Gy to mSv", () => {
    const below = buildWorkflow(base("acuteDose", { readings: { absorbedDoseGy: 0.4 } }));
    expect(below.severity).toBe("nominal");
    expect(below.findings[0].id).toBe("no-threshold");
    const critical = buildWorkflow(base("acuteDose", { readings: { absorbedDoseGy: 1.3 } }));
    expect(critical.severity).toBe("critical");
    expect(critical.sources[0].citation.id).toBe("poplaskiGi");
    expect(JSON.stringify(critical)).not.toMatch(/1,000 mSv/);
  });

  it("covers CO, CO₂, overheat and sleep from their own alerts only", () => {
    expect(buildWorkflow(base("co", { readings: { co: 60 } })).findings.map((finding) => finding.id)).toEqual(["co"]);
    expect(buildWorkflow(base("co2", { readings: { co2: 5.5 } })).severity).toBe("critical");
    expect(buildWorkflow(base("overheat", { cabinTemp: 28 })).severity).toBe("caution");
    const sleep = buildWorkflow(base("sleep", { readings: { pvtReactionMs: 430, pvtLapses: 6, hrv: 25 }, mhiIndex: 40 }));
    expect(sleep.severity).toBe("critical");
    expect(sleep.findings.map((finding) => finding.id).sort()).toEqual(["hrv", "mhi", "pvtLapses", "pvtReactionMs"]);
  });

  it("escalates only symptom questions", () => {
    const urgent = buildWorkflow(base("co", { readings: { co: 12 }, answers: { "co-symptoms": "yes" } }));
    expect(urgent.urgentReport).toBe(true);
    expect(urgent.severity).toBe("critical");
    expect(ids(urgent)).toEqual(["co-r1", "co-r2", "co-r3"]);
    expect(buildWorkflow(base("co", { readings: { co: 12 }, answers: { "co-spread": "yes" } })).urgentReport).toBe(false);
    for (const question of WORKFLOWS.sleep.questions) {
      expect(buildWorkflow(base("sleep", { answers: { [question.id]: "yes" } })).urgentReport).toBe(false);
    }
  });

  it("turns the matching aura category and body region critical after an urgent report", () => {
    const readings = { ...NOMINAL_READINGS, reportedConcerns: { fever: true, acuteDose: true, co: true } };
    const categories = evaluateCategories(readings, evaluateMetrics(readings), computeMhi({}, 92));
    const injury = categories.find((category) => category.category === "injury")!;
    expect(injury.regions.chest).toBe("critical");
    expect(injury.regions.abdomen).toBe("critical");
    expect(categories.find((category) => category.category === "air")!.severity).toBe("critical");
  });

  it("validates new kinds and rejects unknown readings", () => {
    const valid = validateWorkflowInput(base("fever", { readings: { coreTemp: 38 }, mhiIndex: 70, sepActive: false }));
    expect(valid.kind).toBe("fever");
    expect(() => validateWorkflowInput(base("fever", { readings: { unrecognizedSensor: 90 } as never }))).toThrow();
    expect(() => validateWorkflowInput({ ...base("fever"), kind: "toString" })).toThrow();
    expect(() => validateWorkflowInput(base("fever", { mhiIndex: 140 }))).toThrow();
  });
});


it("retains flight-surgeon referral at the CO caution escalation reference", () => {
  const plan = buildWorkflow(base("co", { readings: { co: 55 } }));
  expect(plan.severity).toBe("caution");
  expect(plan.responder).toBe("flightSurgeon");
  expect(plan.status).toContain("Flight surgeon");
});


it("uses assessment guidance for unreviewed equipment responses", () => {
  const co2 = buildWorkflow(base("co2", { readings: { co2: 5.5 } }));
  expect(co2.steps.find(step => step.id === "co2-r2")!.text).toContain("mission-control direction");
  expect(co2.steps.some(step => step.text.includes("Activate emergency CDRA"))).toBe(false);
  expect(co2.protocolReview).toBe("pending");
});


it("keeps gamma simulation evidence distinct from recorded solar particles", () => {
  const plan = buildWorkflow(base("sep", { gammaActive: true, readings: { cumulativeDose: 140 } }));
  expect(plan.title).toBe("Gamma Radiation (simulated)");
  expect(plan.findings[0].id).toBe("gamma");
  expect(plan.sources[0].citation.id).toBe("teamGammaDemo");
});
