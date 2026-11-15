import { describe, expect, it } from "vitest";
import cache from "../../data/donki-sep-cache.json";
import { parseSepEvents } from "../../lib/donki";
import { buildWorkflow } from "../../lib/workflow";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { useAuraStore } from "../../../frontend/store/useAuraStore";

describe("judging checklist: report authority", () => {
  const input = { kind: "hand" as const, report: "I injured my right hand while moving stuff. I can't feel my hands.", answers: {}, cabinTemp: 22, coreTemp: 37, injurySeverity: "caution" as const };
  it("does not interpret report text as an autonomous critical diagnosis", () => {
    const plan = buildWorkflow(input);
    expect(plan.urgentReport).toBe(false);
    expect(plan.severity).toBe("caution");
    expect(plan.findings.some((finding) => finding.id === "report-hand")).toBe(false);
  });
  it("traces numbness escalation to an explicit structured answer", () => {
    const plan = buildWorkflow({ ...input, answers: { "hand-sensation": "yes" } });
    expect(plan.severity).toBe("critical");
    expect(plan.responder).toBe("flightSurgeon");
    expect(plan.findings.find((finding) => finding.id === "report-hand")!.text).toContain("hand-sensation");
  });
  it("keeps a simulated critical grade distinct from an urgent answer", () => {
    const plan = buildWorkflow({ ...input, injurySeverity: "critical" });
    expect(plan.severity).toBe("critical");
    expect(plan.urgentReport).toBe(false);
  });
});

describe("judging checklist: functional real NASA input", () => {
  const event = parseSepEvents(cache.raw).find((event) => event.instruments.some((instrument) => instrument.startsWith("GOES")))!;
  it("changes the alert using an actual cached event without inventing dose", () => {
    expect(event.id).toBeTruthy();
    useAuraStore.getState().selectCrew("AST-001");
    const before = useAuraStore.getState();
    useAuraStore.getState().replaySep(event);
    const after = useAuraStore.getState();
    expect(after.readings.cumulativeDose).toBe(before.readings.cumulativeDose);
    expect(after.readings.doseRate).toBe(before.readings.doseRate);
    expect(after.readings.absorbedDoseGy).toBe(before.readings.absorbedDoseGy);
    expect(after.mhi.index).toBe(92);
    expect(after.categories.find((item) => item.category === "radiation")!.severity).toBe("caution");
    const alert = after.alerts.find((item) => item.key === `sep:${event.id}`)!;
    expect(alert.valueText).toContain(event.id);
    expect(alert.valueText).toContain(event.eventTime);
    expect(alert.thresholdText).toContain("not a crew-dose measurement");
    useAuraStore.getState().selectCrew(null);
  });
  it("preserves a hand incident while adding or clearing a NASA event", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("evaHandInjury");
    const before = useAuraStore.getState();
    useAuraStore.getState().replaySep(event);
    expect(useAuraStore.getState().scenarioId).toBe("evaHandInjury");
    expect(useAuraStore.getState().readings.injuries).toEqual(before.readings.injuries);
    useAuraStore.getState().clearSepReplay();
    expect(useAuraStore.getState().readings.sepActive).toBe(false);
    expect(useAuraStore.getState().readings.injuries).toEqual(before.readings.injuries);
    useAuraStore.getState().selectCrew(null);
  });
  it("labels a synthetic SEP scenario as simulation", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("sep");
    const alert = useAuraStore.getState().alerts.find((item) => item.key === "sep")!;
    expect(alert.valueText).toContain("Simulated");
    expect(useAuraStore.getState().readings.absorbedDoseGy).toBe(NOMINAL_READINGS.absorbedDoseGy);
    useAuraStore.getState().selectCrew(null);
  });
  it("stops the synthetic SEP dose ramp when a real catalog replay is chosen", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("sep");
    const before = useAuraStore.getState().readings.cumulativeDose;
    useAuraStore.getState().replaySep(event);
    expect(useAuraStore.getState().scenarioId).toBeNull();
    expect(useAuraStore.getState().readings.cumulativeDose).toBe(before);
    useAuraStore.getState().selectCrew(null);
  });
  it("does not infer prolonged crew exposure from time spent viewing a historical NASA replay", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("evaHandInjury");
    useAuraStore.getState().replaySep(event);
    for (let tick = 0; tick < 30; tick++) useAuraStore.getState().tick();
    const alert = useAuraStore.getState().alerts.find((item) => item.key === `sep:${event.id}`)!;
    expect(alert.severity).toBe("caution");
    expect(alert.escalated).toBe(false);
    expect(alert.escalation).toBe("crew");
    useAuraStore.getState().selectCrew(null);
  });
});


describe("incident evidence lifetime", () => {
  it("preserves the report and answers across NASA replay, then clears on scenario change", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("evaHandInjury");
    const report = "My right hand is numb after moving equipment.";
    const answers = { "hand-sensation": "yes" as const };
    useAuraStore.getState().setIncidentReport("hand", report, answers);
    useAuraStore.getState().reportUrgentConcern("hand");
    const event = parseSepEvents(cache.raw)[0];
    useAuraStore.getState().replaySep(event);
    useAuraStore.getState().clearSepReplay();
    expect(useAuraStore.getState().incidentReports.hand).toEqual({ report, answers });
    expect(useAuraStore.getState().readings.reportedConcerns?.hand).toBe(true);
    useAuraStore.getState().triggerScenario("cabinCold");
    expect(useAuraStore.getState().incidentReports).toEqual({});
    useAuraStore.getState().reset();
  });
});


describe("feedback replay dose separation", () => {
  it("keeps personal dose unchanged through ticks of a recorded event alongside an injury", () => {
    useAuraStore.getState().selectCrew(null);
    useAuraStore.getState().triggerScenario("evaHandInjury");
    const before = useAuraStore.getState().readings.cumulativeDose;
    useAuraStore.getState().replaySep(parseSepEvents(cache.raw)[0]);
    for (let i = 0; i < 30; i++) useAuraStore.getState().tick();
    expect(useAuraStore.getState().readings.cumulativeDose).toBe(before);
    expect(useAuraStore.getState().readings.injuries.rightHand).toBe("critical");
    useAuraStore.getState().selectCrew(null);
  });
  it("advances history after manually editing a CSV snapshot", () => {
    useAuraStore.getState().selectCrew("AST-001");
    useAuraStore.getState().setManualVital("coreTemp", 39.4);
    const count = useAuraStore.getState().history.length;
    useAuraStore.getState().tick();
    expect(useAuraStore.getState().history.length).toBe(count + 1);
    expect(useAuraStore.getState().alerts.find((alert) => alert.metric === "coreTemp")?.severity).toBe("critical");
    expect(useAuraStore.getState().readings.coreTemp).toBe(39.4);
    useAuraStore.getState().selectCrew(null);
  });
});
