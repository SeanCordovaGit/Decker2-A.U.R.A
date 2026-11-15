"use client";

import { useState } from "react";
import LiveTrace from "./LiveTrace";
import StatusPanel from "./StatusPanel";
import { Activity, AlertTriangle, ChevronRight, HeartPulse, Radio, SlidersHorizontal, Thermometer, Timer, UserRound, Wind } from "lucide-react";
import { PROFILE, SEVERITY_META, getIndicatorColor } from "@aura/core/config/aura";
import type { MetricStatus, NumericMetric } from "@aura/core/lib/types";
import { isSnapshot, useAuraStore, type ManualVital } from "@/store/useAuraStore";
import { CREW_PROFILES, crewProfile } from "@aura/core/lib/research-data";
import { formatMetricValue } from "@aura/core/lib/evaluate";
import { SeverityBadge, Swatch } from "./hazard";

function metricColor(metrics: MetricStatus[], key: NumericMetric) {
  const metric = metrics.find((status) => status.metric === key);
  return metric && metric.severity !== "nominal" ? getIndicatorColor(metric.category, metric.severity, metric) : undefined;
}

export function CrewHud({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const selectedCrewId = useAuraStore((state) => state.selectedCrewId);
  const selectCrew = useAuraStore((state) => state.selectCrew);
  const snapshot = useAuraStore(isSnapshot);
  const categories = useAuraStore((s) => s.categories);
  const active = categories.filter((category) => category.severity !== "nominal");

  return (
    <section className="hud-glass hud-crew" data-expanded={expanded}>
      <button className="hud-heading" onClick={onToggle} aria-expanded={expanded} aria-controls="crew-readings"><UserRound size={18} strokeWidth={1.5} /> Crew status <ChevronRight className="dropdown-chevron" size={16} strokeWidth={1.5} /></button>
      <div className="environment-dropdown" data-expanded={expanded} id="crew-readings" inert={!expanded}><div className="crew-dropdown-content">
      <span className="hud-meta">Crew member</span>
      <select className="hud-crew-select" aria-label="Crew member" value={selectedCrewId ?? "live"} onChange={(event) => selectCrew(event.target.value === "live" ? null : event.target.value)}>
        <option value="live">{PROFILE.callsign} &middot; live demo</option>
        {CREW_PROFILES.map((crew) => <option key={crew.id} value={crew.id}>{crew.id} &middot; CSV demo</option>)}
      </select>
      <span className="hud-status"><span className={active.length ? "hud-dot hud-dot-alert" : "hud-dot hud-dot-ok"} style={active.length ? { background: SEVERITY_META[active.some((category) => category.severity === "critical") ? "critical" : "caution"].badgeColor } : undefined} />{active.length ? `${active.length} active hazard${active.length === 1 ? "" : "s"}` : snapshot ? "Supplied readings within bands" : "All readings nominal"}</span>
      <span className="hud-meta">{snapshot ? "CSV snapshot · sample.csv · no observation timestamp" : "Simulated crew data"}</span>
      <StatusPanel />
      </div></div>
    </section>
  );
}

export function VitalsHud({ onOpen }: { onOpen: () => void }) {
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const snapshot = useAuraStore((s) => isSnapshot(s) ? crewProfile(s.selectedCrewId) : undefined);
  const vitals = [
    { metric: "heartRate", label: "Heart rate", value: snapshot ? "—" : formatMetricValue("heartRate", readings.heartRate), unit: snapshot ? "not supplied" : "bpm", Icon: HeartPulse },
    { metric: "coreTemp", label: "Core temp", value: formatMetricValue("coreTemp", readings.coreTemp, 1), unit: "°C", Icon: Thermometer },
    { metric: "pvtReactionMs", label: "PVT reaction", value: formatMetricValue("pvtReactionMs", readings.pvtReactionMs), unit: "ms", Icon: Timer },
  ] as const;

  return (
    <div className="hud-vitals" aria-label="Simulated crew vitals">
      {vitals.map(({ metric, label, value, unit, Icon }) => (
        <button key={label} className="hud-glass hud-vital hud-open" onClick={onOpen} aria-label={`Open telemetry and adjust vitals: ${label} ${value} ${unit}`} title="Open telemetry and adjust vitals">
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          <span><span className="hud-meta">{label}</span><strong className="tnum" style={{ color: metricColor(metrics, metric) }}>{value} <small>{unit}</small></strong></span>
          <SlidersHorizontal className="hud-vital-hint" size={14} strokeWidth={1.5} aria-hidden />
        </button>
      ))}
      <LiveTrace />
    </div>
  );
}

export function EnvironmentHud({ demoExpanded }: { demoExpanded?: boolean }) {
  const [userExpanded, setExpanded] = useState(false);
  const expanded = demoExpanded ?? userExpanded;
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const snapshot = useAuraStore((s) => isSnapshot(s) ? crewProfile(s.selectedCrewId) : undefined);
  const rows = [
    { metric: "doseRate", label: "Daily dose", value: formatMetricValue("doseRate", readings.doseRate, 1), unit: "mSv/day", Icon: Radio },
    { metric: "co", label: "CO", value: formatMetricValue("co", readings.co), unit: "ppm", Icon: Wind },
    { metric: "co2", label: "CO₂", value: snapshot ? "—" : formatMetricValue("co2", readings.co2, 1), unit: snapshot ? "not supplied" : "mmHg", Icon: Wind },
    { metric: "cabinTemp", label: "Cabin temp", value: formatMetricValue("cabinTemp", readings.cabinTemp, 1), unit: "°C", Icon: Thermometer },
  ] as const;

  return (
    <section className="hud-glass hud-environment">
      <button className="hud-heading" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="environment-readings">
        <Activity size={18} strokeWidth={1.5} /> Environment <ChevronRight className="dropdown-chevron" size={16} strokeWidth={1.5} />
      </button>
      <div className="environment-dropdown" data-expanded={expanded} id="environment-readings" inert={!expanded}>
        <div>
          {rows.map(({ metric, label, value, unit, Icon }) => (
            <div key={label} className="hud-environment-row">
              <Icon size={15} strokeWidth={1.5} aria-hidden /><span>{label}</span>
              <strong className="tnum" style={{ color: metricColor(metrics, metric) }}>{value} <small>{unit}</small></strong>
            </div>
          ))}
          <span className="hud-meta">{snapshot ? "CSV snapshot · exposure duration not supplied" : "Simulated cabin readings"}</span>
        </div>
      </div>
    </section>
  );
}

export function AlertHud({ onOpen }: { onOpen: () => void }) {
  const alerts = useAuraStore((s) => s.alerts);
  const alert = [...alerts].sort((a, b) => SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank)[0];
  if (!alert) return null;

  return (
    <button className="hud-alert hud-open" onClick={onOpen} aria-label={`Open alert details: ${alert.title}`}>
      <span className="sr-only" role="status">{alert.title}: {alert.severity}</span>
      <AlertTriangle size={16} strokeWidth={1.5} aria-hidden />
      <span><strong>ACTIVE ALERT:</strong> {alert.title} <span className="hud-alert-value">&middot; {alert.key.startsWith("sep:") ? "Recorded NASA event" : alert.valueText}</span></span>
      <Swatch category={alert.category} severity={alert.severity} context={alert} active />
      <span className="hud-alert-severity">{alert.severity}</span>
    </button>
  );
}

// Slider travel only; caution/critical bands come from THRESHOLD_RULES via the store's evaluation.
const MANUAL_VITALS: { key: ManualVital; label: string; unit: string; min: number; max: number; step: number; digits: number; note?: string }[] = [
  { key: "heartRate", label: "Heart rate", unit: "bpm", min: 40, max: 180, step: 1, digits: 0, note: "No research threshold configured; display only." },
  { key: "coreTemp", label: "Core temp", unit: "°C", min: 33, max: 41, step: 0.1, digits: 1 },
  { key: "pvtReactionMs", label: "PVT reaction", unit: "ms", min: 150, max: 600, step: 5, digits: 0 },
];

function ManualVitals() {
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const manual = useAuraStore((s) => s.manual);
  const setManualVital = useAuraStore((s) => s.setManualVital);
  return (
    <fieldset className="manual-vitals">
      <legend>Adjust vitals</legend>
      {MANUAL_VITALS.map((vital) => {
        const severity = metrics.find((metric) => metric.metric === vital.key)?.severity ?? "nominal";
        return (
          <label key={vital.key} className="manual-vital">
            <span className="manual-vital-head">
              <span>{vital.label}</span>
              <strong className="tnum" style={{ color: metricColor(metrics, vital.key) }}>{formatMetricValue(vital.key, readings[vital.key], vital.digits)} <small>{vital.unit}</small></strong>
              {vital.note ? <small className="manual-vital-note">no threshold</small> : <SeverityBadge severity={severity} />}
            </span>
            <input type="range" min={vital.min} max={vital.max} step={vital.step} value={manual[vital.key] ?? readings[vital.key]} onChange={(event) => setManualVital(vital.key, Number(event.target.value))} aria-describedby={vital.note ? `${vital.key}-note` : undefined} />
            {vital.note && <small id={`${vital.key}-note`} className="manual-vital-note">{vital.note}</small>}
          </label>
        );
      })}
      <p>Manual values override the simulation until you reset or pick a condition. The aura, alerts and Next steps update immediately.</p>
    </fieldset>
  );
}

const TELEMETRY_ROWS = [
  { key: "absorbedDoseGy", label: "Acute absorbed dose", unit: "Gy", digits: 2 },
  { key: "cumulativeDose", label: "Cumulative effective dose", unit: "mSv", digits: 1 },
  { key: "pvtLapses", label: "PVT+ lapses", unit: "per 300 s", digits: 0 },
  { key: "hrv", label: "HRV (RMSSD)", unit: "ms", digits: 0 },
  { key: "doseRate", label: "Daily dose", unit: "mSv/day", digits: 1 },
  { key: "co", label: "CO", unit: "ppm", digits: 0 },
  { key: "co2", label: "CO₂", unit: "mmHg", digits: 1 },
  { key: "cabinTemp", label: "Cabin temp", unit: "°C", digits: 1 },
  { key: "coreTemp", label: "Core temp", unit: "°C", digits: 1 },
  { key: "heartRate", label: "Heart rate", unit: "bpm", digits: 0 },
  { key: "pvtReactionMs", label: "PVT reaction", unit: "ms", digits: 0 },
] as const;

export function TelemetryDetails() {
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const snapshot = useAuraStore((s) => isSnapshot(s) ? crewProfile(s.selectedCrewId) : undefined);
  return (
    <div className="hud-detail-content">
      <h2>Telemetry</h2>
      <p>{snapshot ? "Supplied CSV snapshot. Missing fields are not measurements; exposure duration was not supplied." : "Simulated crew and cabin readings"}</p>
      <ManualVitals />
      <dl className="hud-detail-list">
        {TELEMETRY_ROWS.map((row) => {
          const severity = metrics.find((metric) => metric.metric === row.key)?.severity ?? "nominal";
          const missing = snapshot && !(row.key in snapshot.readings);
          return (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd className="tnum" style={{ color: missing ? undefined : metricColor(metrics, row.key) }}>{missing ? "Not supplied" : <>{formatMetricValue(row.key, readings[row.key], row.digits)} <small>{row.unit}</small>{severity !== "nominal" && <span className="hud-reading-severity" style={{ color: SEVERITY_META[severity].badgeColor }}>{severity}</span>}</>}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
