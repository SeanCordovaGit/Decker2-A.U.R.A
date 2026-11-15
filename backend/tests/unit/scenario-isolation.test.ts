import { afterEach, describe, expect, it } from "vitest";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { useAuraStore } from "../../../frontend/store/useAuraStore";

const store = () => useAuraStore.getState();
const run = (id: string, ticks: number) => {
  store().triggerScenario(id);
  for (let i = 0; i < ticks; i++) store().tick();
};

afterEach(() => store().selectCrew(null));

describe("scenario isolation", () => {
  it("clears earlier hazards, doses and timers when another scenario starts", () => {
    run("coLeak", 20);
    run("sep", 20);
    run("acuteDose", 20);
    store().triggerScenario("fever");
    const s = store();
    expect(s.alerts.some((alert) => alert.metric === "co" || alert.category === "radiation")).toBe(false);
    expect(s.alerts.some((alert) => alert.metric === "absorbedDoseGy")).toBe(false);
    expect(s.readings.cumulativeDose).toBe(NOMINAL_READINGS.cumulativeDose);
    expect(s.readings.absorbedDoseGy).toBe(0);
    expect(s.replayEvent).toBeNull();
    expect(s.alerts.every((alert) => !alert.escalated || alert.severity === "critical")).toBe(true);
  });

  it("restores the selected crew profile as the baseline, not the previous scenario", () => {
    store().selectCrew("AST-003");
    run("cabinCold", 20);
    store().triggerScenario("imFine");
    expect(store().readings.cabinTemp).toBeCloseTo(27.5, 0);
    expect(store().selectedCrewId).toBe("AST-003");
  });

  it("shows the discrepancy alert as soon as I'm fine starts, even after other scenarios", () => {
    run("sleepDeprivation", 20);
    store().submitJournal("I feel awful, exhausted and lonely today");
    run("coLeak", 20);
    store().triggerScenario("imFine");
    const s = store();
    expect(s.mhi.discrepancy.active).toBe(true);
    const alert = s.alerts.find((item) => item.key === "discrepancy")!;
    expect(alert.toAstronautOnly).toBe(true);
    expect(s.alerts.some((item) => item.metric === "co")).toBe(false);
  });

  it("does not carry the I'm fine journal entry into the next scenario", () => {
    run("imFine", 5);
    store().triggerScenario("fever");
    expect(store().journal).toEqual([]);
    expect(store().mhi.discrepancy.active).toBe(false);
  });

  it("applies manual vitals immediately, keeps them through ticks, and clears them on a new scenario", () => {
    store().setManualVital("coreTemp", 39.4);
    store().setManualVital("pvtReactionMs", 400);
    store().setManualVital("heartRate", 150);
    for (let i = 0; i < 10; i++) store().tick();
    const s = store();
    expect(s.readings.coreTemp).toBe(39.4);
    expect(s.metrics.find((metric) => metric.metric === "coreTemp")!.severity).toBe("critical");
    expect(s.metrics.find((metric) => metric.metric === "pvtReactionMs")!.severity).toBe("critical");
    expect(s.readings.heartRate).toBe(150);
    expect(s.alerts.some((alert) => alert.metric === "heartRate")).toBe(false);
    store().triggerScenario("fever");
    expect(store().manual).toEqual({});
  });

  it("treats a manually edited crew row as simulated rather than a supplied snapshot", async () => {
    const { isSnapshot } = await import("../../../frontend/store/useAuraStore");
    store().selectCrew("AST-001");
    expect(isSnapshot(store())).toBe(true);
    store().setManualVital("coreTemp", 38.2);
    expect(isSnapshot(store())).toBe(false);
    expect(store().metrics.find((metric) => metric.metric === "coreTemp")!.severity).toBe("caution");
  });

  it("logs the previous scenario's alerts as cleared", () => {
    run("coLeak", 5);
    store().triggerScenario("fever");
    expect(store().log.some((entry) => entry.metric === "co" && entry.event === "cleared")).toBe(true);
  });
});
