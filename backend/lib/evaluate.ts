import {
  CATEGORY_META,
  CITATIONS,
  INJURY_ACTIONS,
  MHI_CONFIG,
  NOTIFICATION_PRIORITIES,
  SEVERITY_META,
  THRESHOLD_RULES,
} from "../config/aura";
import { URGENT_REPORT_ACTION, WORKFLOWS, type WorkflowKind } from "../config/workflows";
import type {
  Alert,
  BodyRegion,
  CategoryStatus,
  HazardCategory,
  MetricStatus,
  MhiResult,
  NumericMetric,
  Readings,
  Severity,
  ThresholdRule,
} from "./types";

export function getAlertPriority(alert: Alert): number {
  return NOTIFICATION_PRIORITIES.find((priority) =>
    priority.metrics?.includes(alert.metric ?? "") ||
    priority.keys?.includes(alert.key) ||
    priority.keyPrefixes?.some((prefix) => alert.key.startsWith(prefix)) ||
    priority.categories?.includes(alert.category)
  )?.rank ?? NOTIFICATION_PRIORITIES[NOTIFICATION_PRIORITIES.length - 1].rank;
}

export function compareAlerts(a: Alert, b: Alert): number {
  return SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank || getAlertPriority(a) - getAlertPriority(b);
}

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

/** Each bound follows the inclusive or strict comparison declared in configuration. */
export function severityFor(
  rule: ThresholdRule,
  value: number,
): { severity: Severity; direction: "high" | "low" | null; threshold: number | null } {
  if (rule.criticalHigh !== undefined && (rule.criticalHighExclusive ? value > rule.criticalHigh : value >= rule.criticalHigh))
    return { severity: "critical", direction: "high", threshold: rule.criticalHigh };
  if (rule.criticalLow !== undefined && (rule.criticalLowExclusive ? value < rule.criticalLow : value <= rule.criticalLow))
    return { severity: "critical", direction: "low", threshold: rule.criticalLow };
  if (rule.cautionHigh !== undefined && (rule.cautionHighExclusive ? value > rule.cautionHigh : value >= rule.cautionHigh))
    return { severity: "caution", direction: "high", threshold: rule.cautionHigh };
  if (rule.cautionLow !== undefined && (rule.cautionLowExclusive ? value < rule.cautionLow : value <= rule.cautionLow))
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
    // Compare concentration with the duration-based reference; no exposure duration is inferred.
    if (m.metric === "co" && m.value >= (m.rule.earlyWarningBelow ?? Infinity)) {
      const inj = statuses.injury;
      inj.severity = maxSeverity(inj.severity, m.severity);
      for (const r of m.rule.regions ?? []) markRegion(inj, r, m.severity);
    }
  }

  // Active solar particle event forces radiation to at least caution
  if (readings.sepActive || readings.gammaActive) {
    statuses.radiation.severity = maxSeverity(statuses.radiation.severity, "caution");
  }

  // Localized injuries
  for (const [region, sev] of Object.entries(readings.injuries) as [BodyRegion, Severity][]) {
    if (!sev || sev === "nominal") continue;
    statuses.injury.severity = maxSeverity(statuses.injury.severity, sev);
    markRegion(statuses.injury, region, sev);
  }

  // Mental health index
  for (const kind of Object.keys(WORKFLOWS) as WorkflowKind[]) {
    if (!readings.reportedConcerns?.[kind]) continue;
    const status = statuses[WORKFLOWS[kind].category];
    status.severity = "critical";
    for (const region of WORKFLOWS[kind].regions ?? []) markRegion(status, region, "critical");
  }

  statuses.mental.severity = maxSeverity(statuses.mental.severity, mhi.severity);
  if (statuses.mental.severity !== "nominal") {
    const regions = statuses.mental.severity === "critical" ? ["head" as const] : CATEGORY_META.mental.regions;
    for (const r of regions) markRegion(statuses.mental, r, statuses.mental.severity);
  }

  return CATEGORIES.map((c) => statuses[c]);
}

const REGION_LABEL: Record<BodyRegion, string> = {
  abdomen: "Lower abdomen",
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

export function bodyRegionLabel(region: BodyRegion, readings: Readings, metrics: MetricStatus[]): string {
  const labels: string[] = [];
  if (region === "rightHand" && readings.reportedConcerns?.hand) labels.push("Crew-reported urgent hand symptoms");
  if (readings.injuries[region] && readings.injuries[region] !== "nominal") labels.push(`${REGION_LABEL[region]} injury`);
  for (const metric of metrics) {
    if (metric.severity === "nominal" || !metric.rule.regions?.includes(region)) continue;
    if (metric.metric === "co") {
      if (metric.value >= (metric.rule.earlyWarningBelow ?? Infinity)) labels.push("CO exposure risk");
    } else if (metric.category === "injury") labels.push(metric.metric === "coreTemp" ? "Core temperature" : metric.rule.label);
  }
  return labels.length ? labels.join(" + ") : REGION_LABEL[region];
}

/** Add precision when rounding would imply a different configured severity or direction. */
export function formatMetricValue(metric: NumericMetric | "mhi", value: number, digits = 0): string {
  const rule = THRESHOLD_RULES.find((rule) => rule.metric === metric);
  const actual = rule && severityFor(rule, value);
  for (let precision = digits; precision <= 6; precision++) {
    const text = value.toFixed(precision);
    const rounded = Number(text);
    const displayed = rule && severityFor(rule, rounded);
    const sameReferences = !rule || [rule.escalateHigh, rule.earlyWarningBelow].every((bound) => bound === undefined || (value >= bound) === (rounded >= bound));
    const sameMhi = metric !== "mhi" || [MHI_CONFIG.critical, MHI_CONFIG.caution].every((bound) => (value < bound) === (rounded < bound));
    if (sameReferences && sameMhi && (!actual || (displayed?.severity === actual.severity && displayed.direction === actual.direction))) return text;
  }
  return String(value);
}

/** Alerts without escalation state; the store adds persistence-based escalation. */
export function buildAlerts(
  readings: Readings,
  metrics: MetricStatus[],
  mhi: MhiResult,
  now: number,
): Alert[] {
  const alerts: Alert[] = [];
  for (const kind of Object.keys(WORKFLOWS) as WorkflowKind[]) {
    if (!readings.reportedConcerns?.[kind]) continue;
    const config = WORKFLOWS[kind];
    alerts.push({ key: `report:${kind}`, category: config.category, title: `Crew-reported urgent symptoms: ${config.title}`, severity: "critical", valueText: "Explicit urgent-symptom answer", thresholdText: "Project-defined report-based escalation; no sensor value was changed", citation: CITATIONS[config.sourceId], action: URGENT_REPORT_ACTION, escalation: "flightSurgeon", escalated: true, toAstronautOnly: false, createdAt: now });
  }

  for (const m of metrics) {
    if (m.severity === "nominal") continue;
    const sev = m.severity as Exclude<Severity, "nominal">;
    const exclusive = m.direction === "low" ? (sev === "critical" ? m.rule.criticalLowExclusive : m.rule.cautionLowExclusive) : (sev === "critical" ? m.rule.criticalHighExclusive : m.rule.cautionHighExclusive);
    const cmp = m.direction === "low" ? (exclusive ? "<" : "≤") : (exclusive ? ">" : "≥");
    const escalated = sev === "critical" || (m.rule.escalateHigh !== undefined && m.value >= m.rule.escalateHigh);
    const longDuration = m.rule.earlyWarningBelow !== undefined && m.value >= m.rule.earlyWarningBelow;
    const basis = m.rule.escalateHigh !== undefined ? (sev === "critical" ? "1-hour concentration reference" : escalated ? "7-day concentration reference" : longDuration ? "30-180-day concentration reference" : "project early warning") : "";
    const alertThreshold = sev === "critical" ? m.threshold : escalated ? m.rule.escalateHigh : longDuration ? m.rule.earlyWarningBelow : m.threshold;
    const citationId = m.rule.earlyCitationId && m.value < (m.rule.earlyWarningBelow ?? 0) ? m.rule.earlyCitationId : m.rule.citationId;
    alerts.push({
      key: `metric:${m.metric}`,
      metric: m.metric,
      direction: m.direction,
      category: m.category,
      title: m.metric === "cumulativeDose" && sev === "critical" ? "Career-dose limit review" : m.rule.label,
      severity: m.severity,
      valueText: `${formatMetricValue(m.metric, m.value, m.rule.unit === "°C" ? 1 : 0)} ${m.rule.unit}`,
      thresholdText: `${sev} ${cmp} ${alertThreshold ?? 0} ${m.rule.unit}${basis ? ` (${basis})` : ""}${m.rule.context ? `. ${m.rule.context}` : ""}`,
      citation: CITATIONS[citationId],
      action: m.rule.actions[sev],
      escalation: escalated ? "flightSurgeon" : "crew",
      escalated,
      toAstronautOnly: false,
      createdAt: now,
    });
    if (m.metric === "co" && m.value >= (m.rule.earlyWarningBelow ?? Infinity)) {
      alerts.push({
        key: "injury:co-exposure",
        category: "injury",
        title: "CO exposure: brain and heart at risk",
        severity: m.severity,
        valueText: `${formatMetricValue(m.metric, m.value)} ${m.rule.unit} CO`,
        thresholdText: `${sev} concentration reference; actual exposure duration is not measured`,
        citation: CITATIONS[m.rule.citationId],
        action: m.rule.actions[sev],
        escalation: escalated ? "flightSurgeon" : "crew",
        escalated,
        toAstronautOnly: false,
        createdAt: now,
      });
    }
  }

  if (readings.sepActive || readings.gammaActive) {
    const event = readings.sepEvent;
    const gamma = !!readings.gammaActive && !event;
    alerts.push({
      key: event ? `sep:${event.id}` : gamma ? "gamma" : "sep",
      category: "radiation",
      title: event ? "NASA SEP precaution (recorded replay)" : gamma ? "Gamma Radiation (simulated)" : "Simulated solar particle event",
      severity: "caution",
      valueText: event ? `${event.id} · ${event.eventTime}` : gamma ? "Simulated gamma-dose condition" : "Simulated SEP condition; not a NASA observation",
      thresholdText: event ? "Recorded SEP replay → project precaution; not a crew-dose measurement or a current-event claim" : gamma ? "Project-defined simulated gamma precaution" : "Project-defined simulated SEP precaution",
      citation: event ? { ...CITATIONS.donkiSep, url: event.link ?? CITATIONS.donkiSep.url } : gamma ? CITATIONS.teamGammaDemo : CITATIONS.teamDoseRate,
      action: event ? "Review the recorded event with mission control. Current radiation assessment requires personal/area dosimetry, exposure timing and shielding/location information." : "Review the simulated dose trend. A mission assessment requires personal/area dosimetry, exposure timing and shielding/location information.",
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
      valueText: `MHI ${formatMetricValue("mhi", mhi.index)} / 100`,
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
