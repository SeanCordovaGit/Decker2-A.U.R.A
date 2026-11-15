import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CREW_PROFILES } from "../../lib/research-data";
import { bodyRegionLabel, buildAlerts, evaluateMetrics } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import { useAuraStore } from "../../../frontend/store/useAuraStore";

const rows = readFileSync(new URL("../../data/crew-sample.csv", import.meta.url), "utf8").trim().split(/\r?\n/).map((line) => line.split(","));
const mhi = computeMhi({}, 92);

describe("CSV fidelity", () => {
  it("matches every supplied field without duplicates, missing values or non-numeric measures", () => {
    expect(rows[0]).toEqual(["astronaut_id", "daily_radiation_msv", "cumulative_radiation_msv", "co_ppm", "cabin_temp_c", "core_body_temp_c", "mhi_score", "pvt_mean_rt_ms", "pvt_lapses", "hrv_rmssd_ms"]);
    expect(rows).toHaveLength(6);
    expect(new Set(rows.slice(1).map((row) => row[0])).size).toBe(5);
    for (const row of rows.slice(1)) {
      expect(row).toHaveLength(10);
      expect(row.every((cell) => cell.trim() !== "")).toBe(true);
      expect(row.slice(1).every((cell) => Number.isFinite(Number(cell)))).toBe(true);
      const crew = CREW_PROFILES.find((crew) => crew.id === row[0])!;
      expect(crew).toBeDefined();
      expect([crew.readings.doseRate, crew.readings.cumulativeDose, crew.readings.co, crew.readings.cabinTemp, crew.readings.coreTemp, crew.mhiScore, crew.readings.pvtReactionMs, crew.readings.pvtLapses, crew.readings.hrv]).toEqual(row.slice(1).map(Number));
    }
  });

  it("keeps imported snapshots and their alert escalation unchanged as time passes", () => {
    useAuraStore.getState().selectCrew("AST-003");
    const before = useAuraStore.getState();
    for (let i = 0; i < 100; i++) useAuraStore.getState().tick();
    const after = useAuraStore.getState();
    expect(after.readings).toEqual(before.readings);
    expect(after.history).toEqual(before.history);
    expect(after.alerts).toEqual(before.alerts);
    useAuraStore.getState().submitJournal("This entry is short");
    expect(useAuraStore.getState().alerts.find((alert) => alert.metric === "co")!.escalated).toBe(false);
    useAuraStore.getState().selectCrew(null);
  });

  it("runs scenarios explicitly and resets to the exact supplied snapshot", () => {
    useAuraStore.getState().selectCrew("AST-001");
    useAuraStore.getState().triggerScenario("fever");
    for (let i = 0; i < 20; i++) useAuraStore.getState().tick();
    expect(useAuraStore.getState().readings.coreTemp).toBeGreaterThanOrEqual(39);
    useAuraStore.getState().reset();
    expect(useAuraStore.getState().readings.coreTemp).toBe(37);
    expect(useAuraStore.getState().mhi.index).toBe(92);
    useAuraStore.getState().selectCrew(null);
  });

  it("does not invent source-channel discrepancies for a supplied aggregate MHI", () => {
    const supplied = computeMhi({ biometrics: 10, affect: 95, journal: null }, 42);
    expect(supplied.index).toBe(42);
    expect(supplied.discrepancy.active).toBe(false);
    expect(supplied.components.every((component) => component.score === null)).toBe(true);
  });
});

describe("temperature alert precision", () => {
  it("labels a fever marker by its cause, preserving simultaneous injury and CO context", () => {
    const readings = { ...NOMINAL_READINGS, coreTemp: 38.6 };
    expect(bodyRegionLabel("chest", readings, evaluateMetrics(readings))).toBe("Core temperature");
    const combined = { ...readings, co: 120, injuries: { chest: "caution" as const } };
    expect(bodyRegionLabel("chest", combined, evaluateMetrics(combined))).toBe("Chest injury + CO exposure risk + Core temperature");
  });
  it.each([[38.6, "38.6", "caution"], [38.99, "38.99", "caution"], [39, "39.0", "critical"], [37.51, "37.51", "caution"], [34.99, "34.99", "critical"]] as const)("displays core %s without changing its apparent classification", (coreTemp, text, severity) => {
    const readings = { ...NOMINAL_READINGS, coreTemp };
    const alert = buildAlerts(readings, evaluateMetrics(readings), mhi, 0).find((alert) => alert.metric === "coreTemp")!;
    expect(alert.valueText).toBe(`${text} °C`);
    expect(alert.severity).toBe(severity);
  });
  it("shows the exact decimal cabin threshold", () => {
    const readings = { ...NOMINAL_READINGS, cabinTemp: 27 };
    const alert = buildAlerts(readings, evaluateMetrics(readings), mhi, 0).find((alert) => alert.metric === "cabinTemp")!;
    expect(alert.thresholdText).toContain("> 26.7 °C");
  });
  it("does not round CO up into a different exposure reference band", () => {
    const readings = { ...NOMINAL_READINGS, co: 54.9 };
    const alert = buildAlerts(readings, evaluateMetrics(readings), mhi, 0).find((alert) => alert.metric === "co")!;
    expect(alert.valueText).toBe("54.9 ppm");
  });
  it.each([[49.6, "critical"], [79.6, "caution"]] as const)("does not round MHI %s into a healthier band", (index, severity) => {
    const readings = { ...NOMINAL_READINGS };
    const alert = buildAlerts(readings, evaluateMetrics(readings), computeMhi({}, index), 0).find((alert) => alert.key === "mhi")!;
    expect(alert.valueText).toBe(`MHI ${index} / 100`);
    expect(alert.severity).toBe(severity);
  });
});
