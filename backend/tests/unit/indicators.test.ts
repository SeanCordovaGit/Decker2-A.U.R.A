import { describe, expect, it } from "vitest";
import { CATEGORY_META, INDICATOR_COLORS, THRESHOLD_RULES, getIndicatorColor } from "../../config/aura";
import { buildAlerts, evaluateMetrics } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import type { HazardCategory } from "../../lib/types";

describe("action indicator colors", () => {
  it.each(Object.keys(CATEGORY_META) as HazardCategory[])("makes critical %s red", (category) => {
    expect(getIndicatorColor(category, "critical")).toBe(INDICATOR_COLORS.red);
  });

  it.each([
    ["radiation", "green"], ["air", "gray"], ["cabinCold", "blue"],
    ["cabinHot", "yellow"], ["mental", "yellow"], ["injury", "yellow"],
  ] as const)("uses %s caution color", (category, color) => {
    expect(getIndicatorColor(category, "caution")).toBe(INDICATOR_COLORS[color]);
  });

  it("shows low core temperature blue at caution and red at critical", () => {
    const context = { metric: "coreTemp", direction: "low" } as const;
    expect(getIndicatorColor("injury", "caution", context)).toBe(INDICATOR_COLORS.blue);
    expect(getIndicatorColor("injury", "critical", context)).toBe(INDICATOR_COLORS.red);
    expect(getIndicatorColor("injury", "caution", { metric: "coreTemp", direction: "high" })).toBe(INDICATOR_COLORS.yellow);
  });

  it("preserves temperature direction in evaluated alerts", () => {
    const rule = THRESHOLD_RULES.find((rule) => rule.metric === "coreTemp")!;
    const readings = { ...NOMINAL_READINGS, coreTemp: rule.cautionLow! - 0.1 };
    const metrics = evaluateMetrics(readings);
    const alerts = buildAlerts(readings, metrics, computeMhi({ biometrics: 90, affect: 90, journal: null }), 0);
    const alert = alerts.find((alert) => alert.metric === "coreTemp")!;
    expect(alert.direction).toBe("low");
    expect(getIndicatorColor(alert.category, alert.severity, alert)).toBe(INDICATOR_COLORS.blue);
  });

  it("makes every configured critical threshold red without changing evaluation", () => {
    for (const rule of THRESHOLD_RULES) {
      for (const [bound, exclusive, direction] of [[rule.criticalLow, rule.criticalLowExclusive, -1], [rule.criticalHigh, rule.criticalHighExclusive, 1]] as const) {
        if (bound === undefined) continue;
        const value = bound + (exclusive ? direction * 0.001 : 0);
        const metric = evaluateMetrics({ ...NOMINAL_READINGS, [rule.metric]: value }).find((metric) => metric.metric === rule.metric)!;
        expect(metric.severity).toBe("critical");
        expect(getIndicatorColor(metric.category, metric.severity, metric)).toBe(INDICATOR_COLORS.red);
      }
    }
  });
});
