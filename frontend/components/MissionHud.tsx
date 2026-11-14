"use client";

import { useState } from "react";
import LiveTrace from "./LiveTrace";
import StatusPanel from "./StatusPanel";
import { Activity, AlertTriangle, ChevronRight, HeartPulse, Radio, Thermometer, Timer, UserRound, Wind } from "lucide-react";
import { PROFILE, SEVERITY_META } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
import { Swatch } from "./hazard";

export function CrewHud({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const categories = useAuraStore((s) => s.categories);
  const active = categories.filter((category) => category.severity !== "nominal");

  return (
    <section className="hud-glass hud-crew" data-expanded={expanded}>
      <button className="hud-heading" onClick={onToggle} aria-expanded={expanded} aria-controls="crew-readings"><UserRound size={18} strokeWidth={1.5} /> Crew status <ChevronRight className="dropdown-chevron" size={16} strokeWidth={1.5} /></button>
      <div className="environment-dropdown" data-expanded={expanded} id="crew-readings" inert={!expanded}><div className="crew-dropdown-content">
      <span className="hud-meta">Crew member</span>
      <span className="hud-crew-name">{PROFILE.callsign}</span>
      <span className="hud-status"><span className={active.length ? "hud-dot hud-dot-alert" : "hud-dot hud-dot-ok"} />{active.length ? `${active.length} active hazard${active.length === 1 ? "" : "s"}` : "All readings nominal"}</span>
      <span className="hud-meta">Simulated crew data</span>
      <StatusPanel />
      </div></div>
    </section>
  );
}

export function VitalsHud({ onOpen }: { onOpen: () => void }) {
  const readings = useAuraStore((s) => s.readings);
  const vitals = [
    { label: "Heart rate", value: readings.heartRate.toFixed(0), unit: "bpm", Icon: HeartPulse },
    { label: "Core temp", value: readings.coreTemp.toFixed(1), unit: "°C", Icon: Thermometer },
    { label: "PVT reaction", value: readings.pvtReactionMs.toFixed(0), unit: "ms", Icon: Timer },
  ];

  return (
    <div className="hud-vitals" aria-label="Simulated crew vitals">
      {vitals.map(({ label, value, unit, Icon }) => (
        <button key={label} className="hud-glass hud-vital hud-open" onClick={onOpen} aria-label={`Open telemetry: ${label} ${value} ${unit}`}>
          <Icon size={18} strokeWidth={1.5} aria-hidden />
          <span><span className="hud-meta">{label}</span><strong className="tnum">{value} <small>{unit}</small></strong></span>
        </button>
      ))}
      <LiveTrace />
    </div>
  );
}

export function EnvironmentHud() {
  const [expanded, setExpanded] = useState(false);
  const readings = useAuraStore((s) => s.readings);
  const rows = [
    { label: "Dose rate", value: readings.doseRate.toFixed(1), unit: "mSv/day", Icon: Radio },
    { label: "CO", value: readings.co.toFixed(0), unit: "ppm", Icon: Wind },
    { label: "CO₂", value: readings.co2.toFixed(1), unit: "mmHg", Icon: Wind },
    { label: "Cabin temp", value: readings.cabinTemp.toFixed(1), unit: "°C", Icon: Thermometer },
  ];

  return (
    <section className="hud-glass hud-environment">
      <button className="hud-heading" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="environment-readings">
        <Activity size={18} strokeWidth={1.5} /> Environment <ChevronRight className="dropdown-chevron" size={16} strokeWidth={1.5} />
      </button>
      <div className="environment-dropdown" data-expanded={expanded} id="environment-readings" inert={!expanded}>
        <div>
          {rows.map(({ label, value, unit, Icon }) => (
            <div key={label} className="hud-environment-row">
              <Icon size={15} strokeWidth={1.5} aria-hidden /><span>{label}</span>
              <strong className="tnum">{value} <small>{unit}</small></strong>
            </div>
          ))}
          <span className="hud-meta">Simulated cabin readings</span>
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
      <AlertTriangle size={16} strokeWidth={1.5} aria-hidden />
      <span><strong>ACTIVE ALERT:</strong> {alert.title} <span className="hud-alert-value">&middot; {alert.valueText}</span></span>
      <Swatch category={alert.category} active />
      <span className="hud-alert-severity">{alert.severity}</span>
    </button>
  );
}

const TELEMETRY_ROWS = [
  { key: "doseRate", label: "Dose rate", unit: "mSv/day", digits: 1 },
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
  return (
    <div className="hud-detail-content">
      <h2>Telemetry</h2>
      <p>Simulated crew and cabin readings</p>
      <dl className="hud-detail-list">
        {TELEMETRY_ROWS.map((row) => {
          const severity = metrics.find((metric) => metric.metric === row.key)?.severity ?? "nominal";
          return (
            <div key={row.key}>
              <dt>{row.label}</dt>
              <dd className="tnum">{readings[row.key].toFixed(row.digits)} <small>{row.unit}</small>{severity !== "nominal" && <span className="hud-reading-severity">{severity}</span>}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
