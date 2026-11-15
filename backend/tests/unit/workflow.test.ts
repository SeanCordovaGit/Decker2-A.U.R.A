import { describe, expect, it } from "vitest";
import { buildWorkflow, validateExplanation } from "../../lib/workflow";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { buildAlerts, evaluateCategories, evaluateMetrics } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";

const input = { kind: "hand" as const, report: "I injured my right hand. It hurts when I grip equipment.", answers: {}, cabinTemp: 22, coreTemp: 37, injurySeverity: "caution" as const };
describe("grounded research workflow", () => {
  it("uses rules for injury severity and withholds unreviewed treatment", () => {
    const plan = buildWorkflow(input);
    expect(plan.severity).toBe("caution");
    expect(plan.protocolReview).toBe("pending");
    expect(plan.steps.every((step) => step.treatment === false)).toBe(true);
  });
  it("escalates an explicit urgent hand answer without an LLM", () => {
    const plan = buildWorkflow({ ...input, answers: { "hand-bleeding": "yes" } });
    expect(plan.urgentReport).toBe(true);
    expect(plan.severity).toBe("critical");
    expect(plan.responder).toBe("flightSurgeon");
  });
  it("distinguishes a cold cabin from a measured low core temperature", () => {
    const plan = buildWorkflow({ ...input, kind: "cold", cabinTemp: 16.5 });
    expect(plan.severity).toBe("caution");
    expect(plan.findings.some((finding) => finding.id === "coreTemp")).toBe(false);
    expect(buildWorkflow({ ...input, kind: "cold", cabinTemp: 15.9 }).severity).toBe("critical");
  });
  it("explains urgent crew reports separately from sensor thresholds", () => {
    const readings = { ...NOMINAL_READINGS, reportedConcerns: { hand: true, cold: true } };
    const mhi = computeMhi({}, 92);
    const categories = evaluateCategories(readings, evaluateMetrics(readings), mhi);
    expect(categories.find((item) => item.category === "injury")!.regions.rightHand).toBe("critical");
    expect(categories.find((item) => item.category === "cabinCold")!.severity).toBe("critical");
    expect(readings.coreTemp).toBe(37);
    expect(buildAlerts(readings, evaluateMetrics(readings), mhi, 0).filter((alert) => alert.key.startsWith("report:")).every((alert) => alert.escalation === "flightSurgeon")).toBe(true);
  });
  it("accepts only exact report quotes and known source IDs", () => {
    const plan = buildWorkflow(input);
    const valid = { quotes: ["It hurts when I grip equipment."], findingIds: [plan.findings[0].id], questionIds: [plan.questions[0].id], stepIds: [plan.steps[0].id] };
    expect(validateExplanation(valid, input.report, plan)).toEqual(valid);
    expect(() => validateExplanation({ ...valid, severity: "nominal" }, input.report, plan)).toThrow();
    expect(() => validateExplanation({ ...valid, stepIds: ["take-medication"] }, input.report, plan)).toThrow();
    expect(() => validateExplanation({ ...valid, quotes: ["Take medication now."] }, input.report, plan)).toThrow();
  });
});
