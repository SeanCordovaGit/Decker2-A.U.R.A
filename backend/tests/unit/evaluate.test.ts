import { describe, expect, it } from "vitest";
import { CITATIONS, MHI_CONFIG, THRESHOLD_RULES, ruleFor } from "../../config/aura";
import { buildAlerts, evaluateCategories, evaluateMetrics, severityFor } from "../../lib/evaluate";
import { computeMhi } from "../../lib/mhi";
import { NOMINAL_READINGS } from "../../lib/simulation";
import type { HazardCategory, Readings } from "../../lib/types";

const nominalMhi = computeMhi({ biometrics: 90, affect: 80, journal: null });

function categories(r: Partial<Readings>, mhi = nominalMhi) {
  const readings = { ...NOMINAL_READINGS, ...r };
  const metrics = evaluateMetrics(readings);
  const cats = evaluateCategories(readings, metrics, mhi);
  return Object.fromEntries(cats.map((c) => [c.category, c])) as Record<
    HazardCategory,
    (typeof cats)[number]
  >;
}

describe("config invariants", () => {
  it("MHI weights sum to 1", () => {
    const { biometrics, affect, journal, pvt } = MHI_CONFIG.weights;
    expect(biometrics + affect + journal + pvt).toBeCloseTo(1);
  });

  it("threshold ordering is consistent and citations exist", () => {
    for (const r of THRESHOLD_RULES) {
      if (r.cautionHigh !== undefined && r.criticalHigh !== undefined)
        expect(r.cautionHigh).toBeLessThanOrEqual(r.criticalHigh);
      if (r.cautionLow !== undefined && r.criticalLow !== undefined)
        expect(r.cautionLow).toBeGreaterThanOrEqual(r.criticalLow);
      expect(CITATIONS[r.citationId]).toBeDefined();
    }
  });
});

describe("severityFor", () => {
  const core = ruleFor("coreTemp")!;

  it("is inclusive at boundaries", () => {
    expect(severityFor(core, 38.0).severity).toBe("caution");
    expect(severityFor(core, 40.0).severity).toBe("critical");
    expect(severityFor(core, 35.0).severity).toBe("caution");
    expect(severityFor(core, 33.0).severity).toBe("critical");
  });

  it("reports direction and nominal in range", () => {
    expect(severityFor(core, 37.0)).toEqual({ severity: "nominal", direction: null, threshold: null });
    expect(severityFor(core, 38.5).direction).toBe("high");
    expect(severityFor(core, 34).direction).toBe("low");
  });
});

describe("evaluateCategories", () => {
  it("all nominal → no active categories", () => {
    const cats = categories({});
    expect(Object.values(cats).every((c) => c.severity === "nominal")).toBe(true);
  });

  it("cabin temp high → cabinHot, low → cabinCold", () => {
    expect(categories({ cabinTemp: 28 }).cabinHot.severity).toBe("caution");
    expect(categories({ cabinTemp: 28 }).cabinCold.severity).toBe("nominal");
    expect(categories({ cabinTemp: 14 }).cabinCold.severity).toBe("critical");
  });

  it("critical CO highlights head and chest as injury", () => {
    const cats = categories({ co: 60 });
    expect(cats.air.severity).toBe("critical");
    expect(cats.injury.regions.head).toBe("critical");
    expect(cats.injury.regions.chest).toBe("critical");
  });

  it("caution CO does not highlight body regions", () => {
    const cats = categories({ co: 20 });
    expect(cats.air.severity).toBe("caution");
    expect(cats.injury.severity).toBe("nominal");
  });

  it("fever maps to injury on chest", () => {
    const cats = categories({ coreTemp: 38.6 });
    expect(cats.injury.severity).toBe("caution");
    expect(cats.injury.regions.chest).toBe("caution");
  });

  it("localized injury only marks its region", () => {
    const cats = categories({ injuries: { rightHand: "critical" } });
    expect(cats.injury.regions).toEqual({ rightHand: "critical" });
  });

  it("active SEP forces radiation to at least caution", () => {
    expect(categories({ sepActive: true }).radiation.severity).toBe("caution");
    expect(categories({ sepActive: true, doseRate: 12 }).radiation.severity).toBe("critical");
  });

  it("low MHI drives the mental category", () => {
    const low = computeMhi({ biometrics: 30, affect: 30, journal: 30 });
    expect(categories({}, low).mental.severity).toBe("critical");
  });
});

describe("buildAlerts", () => {
  it("critical alerts go to flight surgeon, caution to crew, with citation and action", () => {
    const readings = { ...NOMINAL_READINGS, co: 60, cabinTemp: 28 };
    const alerts = buildAlerts(readings, evaluateMetrics(readings), nominalMhi, 0);
    const co = alerts.find((a) => a.key === "metric:co")!;
    const cabin = alerts.find((a) => a.key === "metric:cabinTemp")!;
    expect(co.escalation).toBe("flightSurgeon");
    expect(cabin.escalation).toBe("crew");
    for (const a of alerts) {
      expect(a.citation.text.length).toBeGreaterThan(0);
      expect(a.action.length).toBeGreaterThan(0);
    }
  });

  it("critical CO adds an injury alert explaining the head and chest markers", () => {
    const readings = { ...NOMINAL_READINGS, co: 60 };
    const alerts = buildAlerts(readings, evaluateMetrics(readings), nominalMhi, 0);
    const exposure = alerts.find((a) => a.key === "injury:co-exposure")!;
    expect(exposure.category).toBe("injury");
    expect(exposure.escalation).toBe("flightSurgeon");
    const caution = { ...NOMINAL_READINGS, co: 20 };
    expect(buildAlerts(caution, evaluateMetrics(caution), nominalMhi, 0).some((a) => a.key === "injury:co-exposure")).toBe(false);
  });

  it("discrepancy alert is astronaut-only and not escalated", () => {
    const mhi = computeMhi({ biometrics: 30, affect: 40, journal: 95 });
    const alerts = buildAlerts(NOMINAL_READINGS, evaluateMetrics(NOMINAL_READINGS), mhi, 0);
    const d = alerts.find((a) => a.key === "discrepancy")!;
    expect(d.toAstronautOnly).toBe(true);
    expect(d.escalation).toBe("none");
  });
});
