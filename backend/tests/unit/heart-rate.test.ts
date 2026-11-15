import { describe, expect, it } from "vitest";
import { ruleFor } from "../../config/aura";
import { buildAlerts, evaluateCategories, evaluateMetrics, severityFor } from "../../lib/evaluate";
import { buildWorkflow, validateWorkflowInput } from "../../lib/workflow";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { computeMhi } from "../../lib/mhi";

describe("confirmed heart-rate demonstration bands", () => {
  it.each([[40,"critical"],[59,"critical"],[60,"nominal"],[100,"nominal"],[100.1,"caution"],[101,"caution"],[139,"caution"],[140,"critical"],[180,"critical"]] as const)("grades %s bpm as %s", (value, severity) => {
    expect(severityFor(ruleFor("heartRate")!, value).severity).toBe(severity);
  });
  it("links critical pulse to chest, source and referral without changing other readings", () => {
    const readings = { ...NOMINAL_READINGS, heartRate: 180 };
    const mhi = computeMhi({}, 92);
    const metrics = evaluateMetrics(readings);
    const alert = buildAlerts(readings, metrics, mhi, 0).find(item => item.metric === "heartRate")!;
    expect(alert.severity).toBe("critical");
    expect(alert.escalation).toBe("flightSurgeon");
    expect(alert.citation.teamDefined).toBe(true);
    expect(evaluateCategories(readings, metrics, mhi).find(item => item.category === "injury")!.regions.chest).toBe("critical");
    expect(readings.coreTemp).toBe(NOMINAL_READINGS.coreTemp);
  });
  it("accepts pulse in workflow evidence inputs", () => {
    const input = validateWorkflowInput({ kind:"hand", report:"My hand hurts", answers:{}, cabinTemp:22, coreTemp:37, injurySeverity:"caution", readings:{heartRate:180} });
    expect(input.readings?.heartRate).toBe(180);
    expect(buildWorkflow(input).severity).toBe("caution");
  });
});
