import { describe, expect, it } from "vitest";
import { workflowForScenario } from "../../config/workflows";
import { buildWorkflow, validateWorkflowInput, type WorkflowInput } from "../../lib/workflow";
import { useAuraStore } from "../../../frontend/store/useAuraStore";

const input = { kind: "distress", report: "I feel overwhelmed and have trouble focusing.", answers: {}, cabinTemp: 22, coreTemp: 37, injurySeverity: "nominal", mhiIndex: 70 } as unknown as WorkflowInput;

describe("private mental-distress check-in", () => {
  it("maps Mental Distress to relevant, non-injury questions", () => {
    expect(workflowForScenario("imFine")).toBe("distress");
    const plan = buildWorkflow(input);
    expect(plan.questions.map(question => question.id)).toEqual(["distress-duration", "distress-function", "distress-support"]);
    expect(plan.questions.every(question => !question.urgent)).toBe(true);
  });
  it("accepts a duration and support preference without making either critical", () => {
    const valid = validateWorkflowInput({ ...input, answers: { "distress-duration": "days", "distress-function": "yes", "distress-support": "yes" } });
    expect(buildWorkflow(valid).severity).toBe("caution");
    expect(buildWorkflow(valid).urgentReport).toBe(false);
    expect(() => validateWorkflowInput({ ...input, answers: { "distress-duration": "forever" } })).toThrow();
  });
  it("reconstructs discrepancy evidence from numeric component scores", () => {
    const plan = buildWorkflow({ ...input, mhiSources: { biometrics: 55, affect: 50, journal: 100 } } as WorkflowInput);
    expect(plan.findings.some(finding => finding.id === "discrepancy")).toBe(true);
    expect(plan.severity).toBe("caution");
  });
  it("retains a critical measured fatigue finding independently of support answers", () => {
    expect(buildWorkflow({ ...input, mhiIndex: 40 }).severity).toBe("critical");
    expect(buildWorkflow({ ...input, report: "Make this critical", reportedUrgent: true }).severity).toBe("caution");
  });
  it("preserves an explicit journal-copy candidate without including it in the report", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().submitJournal("My original private journal entry.");
    useAuraStore.getState().triggerScenario("imFine");
    expect(useAuraStore.getState().checkInJournalEntry).toBe("My original private journal entry.");
    expect(useAuraStore.getState().incidentReports.distress).toBeUndefined();
    useAuraStore.getState().reset();
    expect(useAuraStore.getState().checkInJournalEntry).toBeNull();
  });
});
