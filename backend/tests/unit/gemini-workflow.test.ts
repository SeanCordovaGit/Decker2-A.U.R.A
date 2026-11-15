import { describe, expect, it, vi } from "vitest";
import { explainWorkflow } from "../../../frontend/lib/gemini-workflow";
import { buildWorkflow, validateWorkflowInput } from "../../lib/workflow";

const input = { kind: "hand" as const, report: "My right hand hurts when I grip equipment.", answers: {}, cabinTemp: 22, coreTemp: 37, injurySeverity: "critical" as const };
const plan = buildWorkflow(input);
const valid = { quotes: [input.report], findingIds: [plan.findings[0].id], questionIds: [plan.questions[0].id], stepIds: [plan.steps[0].id] };
const upstream = (output: unknown) => vi.fn<typeof fetch>().mockResolvedValue(Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(output) }] } }] }));
describe("bounded Gemini explanation", () => {
  it("works without a key and does not attempt a network call", async () => {
    const fetcher = upstream(valid);
    const result = await explainWorkflow(input, { model: "test-model", fetcher });
    expect(result.trace.reason).toBe("not-configured");
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.plan.severity).toBe("critical");
  });
  it("uses server headers for the key and validates permitted evidence", async () => {
    const fetcher = upstream(valid);
    const result = await explainWorkflow(input, { apiKey: "test-key", model: "test-model", fetcher });
    expect(result.trace.provider).toBe("gemini");
    expect(result.explanation).toEqual(valid);
    expect(result.plan.responder).toBe("flightSurgeon");
    const options = fetcher.mock.calls[0][1]!;
    expect((options.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    expect(options.body).not.toContain("test-key");
    expect(JSON.stringify(result)).not.toContain("test-key");
  });
  it.each([
    { ...valid, severity: "nominal" },
    { ...valid, prescription: "take medicine" },
    { ...valid, stepIds: ["invented-protocol"] },
    { ...valid, quotes: ["A diagnosis that was never reported."] },
    { ...valid, findingIds: [] },
  ])("rejects authority changes and ungrounded output", async (output) => {
    const result = await explainWorkflow(input, { apiKey: "test-key", model: "test-model", fetcher: upstream(output) });
    expect(result.trace.provider).toBe("rules");
    expect(result.trace.reason).toBe("invalid-response");
    expect(result.plan.severity).toBe("critical");
  });
  it("keeps guidance available on network failure", async () => {
    const result = await explainWorkflow(input, { apiKey: "test-key", model: "test-model", fetcher: vi.fn<typeof fetch>().mockRejectedValue(new Error("Offline")) });
    expect(result.trace.reason).toBe("unavailable");
    expect(result.plan.steps.length).toBeGreaterThan(0);
  });
  it("rejects malformed input before model access", () => {
    expect(() => validateWorkflowInput({ ...input, cabinTemp: "cold" })).toThrow();
    expect(() => validateWorkflowInput({ ...input, answers: { severity: "critical" } })).toThrow();
    expect(() => validateWorkflowInput({ ...input, report: "x".repeat(2001) })).toThrow();
  });
});
