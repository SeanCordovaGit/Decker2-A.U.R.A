import {
  CATEGORY_META,
  CITATIONS,
  INJURY_ACTIONS,
  MHI_CONFIG,
  SEVERITY_META,
  THRESHOLD_RULES,
} from "@/config/aura";
import type {
  Alert,
  BodyRegion,
  CategoryStatus,
  HazardCategory,
  MetricStatus,
  MhiResult,
  Readings,
  Severity,
  ThresholdRule,
} from "./types";

export const CATEGORIES: HazardCategory[] = [
  "radiation",
  "air",
  "cabinHot",
  "cabinCold",
  "mental",
  "injury",
];

export function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_META[a].rank >= SEVERITY_META[b].rank ? a : b;
}

/** Inclusive threshold evaluation (FR-010). */
export function severityFor(
  rule: ThresholdRule,
  value: number,
): { severity: Severity; direction: "high" | "low" | null; threshold: number | null } {
  if (rule.criticalHigh !== undefined && value >= rule.criticalHigh)
    return { severity: "critical", direction: "high", threshold: rule.criticalHigh };
  if (rule.criticalLow !== undefined && value <= rule.criticalLow)
    return { severity: "critical", direction: "low", threshold: rule.criticalLow };
  if (rule.cautionHigh !== undefined && value >= rule.cautionHigh)
    return { severity: "caution", direction: "high", threshold: rule.cautionHigh };
  if (rule.cautionLow !== undefined && value <= rule.cautionLow)
    return { severity: "caution", direction: "low", threshold: rule.cautionLow };
  return { severity: "nominal", direction: null, threshold: null };
}

export function evaluateMetrics(readings: Readings): MetricStatus[] {
  return THRESHOLD_RULES.map((rule) => {
    const value = readings[rule.metric];
    const { severity, direction, threshold } = severityFor(rule, value);
    const category =
      direction === "low" && rule.lowCategory ? rule.lowCategory : rule.category;
    return { metric: rule.metric, value, severity, direction, threshold, category, rule };
  });
}

function emptyStatuses(): Record<HazardCategory, CategoryStatus> {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c, { category: c, severity: "nominal" as Severity, regions: {} }]),
  ) as Record<HazardCategory, CategoryStatus>;
}

function markRegion(status: CategoryStatus, region: BodyRegion, severity: Severity) {
  const prev = status.regions[region] ?? "nominal";
  status.regions[region] = maxSeverity(prev, severity);
}

export function evaluateCategories(
  readings: Readings,
  metrics: MetricStatus[],
  mhi: MhiResult,
): CategoryStatus[] {
  const statuses = emptyStatuses();

  for (const m of metrics) {
    if (m.severity === "nominal") continue;
    const s = statuses[m.category];
    s.severity = maxSeverity(s.severity, m.severity);
    if (m.category === "injury") {
      for (const r of m.rule.regions ?? []) markRegion(s, r, m.severity);
    }
    // Critical CO → brain and heart highlighted red (CNS + arrhythmia risk)
    if (m.metric === "co" && m.severity === "critical") {
      const inj = statuses.injury;
      inj.severity = maxSeverity(inj.severity, "critical");
      for (const r of m.rule.regions ?? []) markRegion(inj, r, "critical");
    }
  }

  // Active solar particle event forces radiation to at least caution
  if (readings.sepActive) {
    statuses.radiation.severity = maxSeverity(statuses.radiation.severity, "caution");
  }

  // Localized injuries
  for (const [region, sev] of Object.entries(readings.injuries) as [BodyRegion, Severity][]) {
    if (!sev || sev === "nominal") continue;
    statuses.injury.severity = maxSeverity(statuses.injury.severity, sev);
    markRegion(statuses.injury, region, sev);
  }

  // Mental health index
  statuses.mental.severity = maxSeverity(statuses.mental.severity, mhi.severity);
  if (mhi.severity !== "nominal") {
    for (const r of CATEGORY_META.mental.regions) markRegion(statuses.mental, r, mhi.severity);
  }

  return CATEGORIES.map((c) => statuses[c]);
}

const REGION_LABEL: Record<BodyRegion, string> = {
  head: "Head",
  chest: "Chest",
  back: "Back",
  leftArm: "Left arm",
  rightArm: "Right arm",
  leftHand: "Left hand",
  rightHand: "Right hand",
  leftLeg: "Left leg",
  rightLeg: "Right leg",
};

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(Math.abs(n) < 10 ? 1 : 0);
}

/** Alerts without escalation state; the store adds persistence-based escalation. */
export function buildAlerts(
  readings: Readings,
  metrics: MetricStatus[],
  mhi: MhiResult,
  now: number,
): Alert[] {
  const alerts: Alert[] = [];

  for (const m of metrics) {
    if (m.severity === "nominal") continue;
    const sev = m.severity as Exclude<Severity, "nominal">;
    const cmp = m.direction === "low" ? "≤" : "≥";
    alerts.push({
      key: `metric:${m.metric}`,
      category: m.category,
      title: m.rule.label,
      severity: m.severity,
      valueText: `${fmt(m.value)} ${m.rule.unit}`,
      thresholdText: `${sev} ${cmp} ${fmt(m.threshold ?? 0)} ${m.rule.unit}`,
      citation: CITATIONS[m.rule.citationId],
      action: m.rule.actions[sev],
      escalation: m.severity === "critical" ? "flightSurgeon" : "crew",
      escalated: m.severity === "critical",
      toAstronautOnly: false,
      createdAt: now,
    });
  }

  if (readings.sepActive) {
    alerts.push({
      key: "sep",
      category: "radiation",
      title: "Solar particle event in progress",
      severity: "caution",
      valueText: "Active (NASA DONKI event replay)",
      thresholdText: "Any active SEP event → caution",
      citation: CITATIONS.teamDoseRate,
      action: "Prepare to shelter; postpone EVA until the event ends.",
      escalation: "crew",
      escalated: false,
      toAstronautOnly: false,
      createdAt: now,
    });
  }

  for (const [region, sev] of Object.entries(readings.injuries) as [BodyRegion, Severity][]) {
    if (!sev || sev === "nominal") continue;
    alerts.push({
      key: `injury:${region}`,
      category: "injury",
      title: `${REGION_LABEL[region]} injury`,
      severity: sev,
      valueText: `Reported ${sev}`,
      thresholdText: "Crew report / medical assessment",
      citation: CITATIONS.teamInjury,
      action: INJURY_ACTIONS[sev as "caution" | "critical"],
      escalation: sev === "critical" ? "flightSurgeon" : "crew",
      escalated: sev === "critical",
      toAstronautOnly: false,
      createdAt: now,
    });
  }

  if (mhi.severity !== "nominal") {
    const sev = mhi.severity as "caution" | "critical";
    alerts.push({
      key: "mhi",
      category: "mental",
      title: "Mental Health Index low",
      severity: mhi.severity,
      valueText: `MHI ${Math.round(mhi.index)} / 100`,
      thresholdText: `${sev} < ${sev === "critical" ? MHI_CONFIG.critical : MHI_CONFIG.caution}`,
      citation: CITATIONS.teamMhi,
      action: MHI_CONFIG.actions[sev],
      escalation: sev === "critical" ? "flightSurgeon" : "crew",
      escalated: sev === "critical",
      toAstronautOnly: false,
      createdAt: now,
    });
  }

  if (mhi.discrepancy.active && mhi.discrepancy.pair) {
    const [a, b] = mhi.discrepancy.pair;
    alerts.push({
      key: "discrepancy",
      category: "mental",
      title: "Self-report vs. body signals disagree",
      severity: "caution",
      valueText: `${a} vs ${b}: gap ${Math.round(mhi.discrepancy.gap)} pts`,
      thresholdText: `gap > ${MHI_CONFIG.discrepancyGap} pts`,
      citation: CITATIONS.teamMhi,
      action: MHI_CONFIG.actions.discrepancy,
      escalation: "none",
      escalated: false,
      toAstronautOnly: true,
      createdAt: now,
    });
  }

  return alerts;
}
