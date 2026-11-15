import { describe, expect, it } from "vitest";
import { buildAlerts, compareAlerts, evaluateMetrics, getAlertPriority } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import type { Alert } from "../../lib/types";

const baseline = buildAlerts({ ...NOMINAL_READINGS, co: 425 }, evaluateMetrics({ ...NOMINAL_READINGS, co: 425 }), computeMhi({}, 92), 0)[0];
const alert = (key: string, category: Alert["category"], metric?: Alert["metric"]): Alert => ({ ...baseline, key, category, metric, severity: "critical" });
const hierarchy = [
  alert("metric:co", "air", "co"),
  alert("metric:absorbedDoseGy", "injury", "absorbedDoseGy"),
  alert("metric:coreTemp", "injury", "coreTemp"),
  alert("injury:rightHand", "injury"),
  alert("metric:cabinTemp", "cabinCold", "cabinTemp"),
  alert("mhi", "mental"),
  alert("metric:cumulativeDose", "radiation", "cumulativeDose"),
];

describe("notification domain hierarchy", () => {
  it("applies all seven domains to equal-severity alerts", () => {
    expect(hierarchy.map(getAlertPriority)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect([...hierarchy].reverse().sort(compareAlerts).map(item => item.key)).toEqual(hierarchy.map(item => item.key));
  });
  it("keeps CO body-risk alerts with toxic gas and report flags with their condition", () => {
    expect(getAlertPriority(alert("injury:co-exposure", "injury"))).toBe(1);
    expect(getAlertPriority(alert("report:acuteDose", "injury"))).toBe(2);
    expect(getAlertPriority(alert("report:fever", "injury"))).toBe(3);
    expect(getAlertPriority(alert("report:hand", "injury"))).toBe(4);
  });
  it("ranks recorded and simulated SEP precautions separately from career dose", () => {
    expect(getAlertPriority(alert("sep:record-id", "radiation"))).toBe(2);
    expect(getAlertPriority(alert("sep", "radiation"))).toBe(2);
  });
});


it("places critical core temperature ahead of a caution CO warning", () => {
  const core = alert("metric:coreTemp", "injury", "coreTemp");
  const co = { ...alert("metric:co", "air", "co"), severity: "caution" as const };
  expect([co, core].sort(compareAlerts)[0]).toBe(core);
});
