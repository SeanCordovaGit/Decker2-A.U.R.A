"use client";

import { useState } from "react";
import LiveTrace from "./LiveTrace";
import StatusPanel from "./StatusPanel";
import { Activity, AlertTriangle, ChevronRight, HeartPulse, Radio, Thermometer, Timer, UserRound, Wind } from "lucide-react";
import { PROFILE, SEVERITY_META, getIndicatorColor } from "@aura/core/config/aura";
import type { MetricStatus, NumericMetric } from "@aura/core/lib/types";
import { useAuraStore } from "@/store/useAuraStore";
import { CREW_PROFILES, crewProfile } from "@aura/core/lib/research-data";
import { formatMetricValue } from "@aura/core/lib/evaluate";
import { Swatch } from "./hazard";

function metricColor(metrics: MetricStatus[], key: NumericMetric) {
  const metric = metrics.find((status) => status.metric === key);
  return metric && metric.severity !== "nominal" ? getIndicatorColor(metric.category, metric.severity, metric) : undefined;
}

export function CrewHud({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const selectedCrewId = useAuraStore((state) => state.selectedCrewId);
  const selectCrew = useAuraStore((state) => state.selectCrew);
  const scenarioId = useAuraStore((state) => state.scenarioId);
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
      <span className="hud-status"><span className={active.length ? "hud-dot hud-dot-alert" : "hud-dot hud-dot-ok"} style={active.length ? { background: SEVERITY_META[active.some((category) => category.severity === "critical") ? "critical" : "caution"].badgeColor } : undefined} />{active.length ? `${active.length} active hazard${active.length === 1 ? "" : "s"}` : selectedCrewId && !scenarioId ? "Supplied readings within bands" : "All readings nominal"}</span>
      <span className="hud-meta">{selectedCrewId && !scenarioId ? "CSV snapshot · sample.csv · no observation timestamp" : "Simulated crew data"}</span>
      <StatusPanel />
      </div></div>
    </section>
  );
}

export function VitalsHud({ onOpen }: { onOpen: () => void }) {
  const readings = useAuraStore((s) => s.readings);
  const metrics = useAuraStore((s) => s.metrics);
  const snapshot = useAuraStore((s) => !s.scenarioId && crewProfile(s.selectedCrewId));
  const vitals = [
    { metric: "heartRate", label: "Heart rate", value: snapshot ? "—" : formatMetricValue("heartRate", readings.heartRate), unit: snapshot ? "not supplied" : "bpm", Icon: HeartPulse },
    { metric: "coreTemp", label: "Core temp", value: formatMetricValue("coreTemp", readings.coreTemp, 1), unit: "°C", Icon: Thermometer },
    { metric: "pvtReactionMs", label: "PVT reaction", value: formatMetricValue("pvtReactionMs", readings.pvtReactionMs), unit: "ms", Icon: Timer },
  ] as const;

  return (
    <div className="hud-vitals" aria-label="Simulated crew vitals">
      {vitals.map(({ metric, label, value, unit, Icon }) => (
        <button key={label} className="hud-glass hud-vital hud-open" onClick={onOpen} aria-label={`Open telemetry: ${label} ${value} ${unit}`}>
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          <span><span className="hud-meta">{label}</span><strong className="tnum" style={{ color: metricColor(metrics, metric) }}>{value} <small>{unit}</small></strong></span>
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
  const snapshot = useAuraStore((s) => !s.scenarioId && crewProfile(s.selectedCrewId));
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
  const snapshot = useAuraStore((s) => !s.scenarioId && crewProfile(s.selectedCrewId));
  return (
    <div className="hud-detail-content">
      <h2>Telemetry</h2>
      <p>{snapshot ? "Supplied CSV snapshot. Missing fields are not measurements; exposure duration was not supplied." : "Simulated crew and cabin readings"}</p>
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
