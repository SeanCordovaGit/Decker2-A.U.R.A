"use client";

import { ruleFor } from "@aura/core/config/aura";
import type { Severity } from "@aura/core/lib/types";
import { useAuraStore, type HistoryKey } from "@/store/useAuraStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";

const READOUTS: { key: HistoryKey; label: string; unit: string; digits: number }[] = [
  { key: "doseRate", label: "Dose rate", unit: "mSv/day", digits: 1 },
  { key: "co", label: "CO", unit: "ppm", digits: 0 },
  { key: "co2", label: "CO₂", unit: "mmHg", digits: 1 },
  { key: "cabinTemp", label: "Cabin temp", unit: "°C", digits: 1 },
  { key: "coreTemp", label: "Core temp", unit: "°C", digits: 1 },
  { key: "heartRate", label: "Heart rate", unit: "bpm", digits: 0 },
  { key: "pvtReactionMs", label: "PVT reaction", unit: "ms", digits: 0 },
];

const W = 120;
const H = 32;
const TONE: Record<Severity, string> = { nominal: "var(--text)", caution: "var(--caution)", critical: "var(--text)" };

function Trace({ values, caution, severity }: { values: number[]; caution?: number; severity: Severity }) {
  const all = caution !== undefined ? [...values, caution] : values;
  let min = Math.min(...all);
  let max = Math.max(...all);
  if (max - min < 1e-6) {
    max += 1;
    min -= 1;
  }
  const pad = (max - min) * 0.12;
  const y = (v: number) => H - ((v - (min - pad)) / (max - min + 2 * pad)) * H;
  const x = (i: number) => (values.length <= 1 ? W : (i / (values.length - 1)) * W);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const stroke = severity === "nominal" ? "var(--text-2)" : TONE[severity];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1.5 h-8 w-full" aria-hidden>
      {caution !== undefined && <line x1={0} x2={W} y1={y(caution)} y2={y(caution)} stroke="var(--caution)" strokeDasharray="3 3" strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export default function TelemetryStrip() {
  const history = useAuraStore((s) => s.history);
  const metrics = useAuraStore((s) => s.metrics);

  return (
    <Card className="shrink-0" aria-label="Telemetry">
      <CardHeader className="min-h-10 py-1.5">
        <CardTitle>Telemetry · last 60 s</CardTitle>
        <CardAction>
          <span className="hidden items-center gap-1.5 text-[11px] text-ink-3 sm:flex">
            <span className="h-px w-4 border-t border-dashed border-caution" aria-hidden /> caution threshold
          </span>
          <Badge variant="tag">Simulated</Badge>
        </CardAction>
      </CardHeader>
      <ul className="grid grid-cols-2 divide-line sm:grid-cols-4 xl:grid-cols-7 xl:divide-x">
        {READOUTS.map((r) => {
          const values = history.map((h) => h[r.key]);
          const current = values[values.length - 1];
          const severity: Severity = metrics.find((m) => m.metric === r.key)?.severity ?? "nominal";
          return (
            <li key={r.key} className="min-w-0 px-3 py-2.5">
              <p className="truncate text-[11px] text-ink-3">{r.label}</p>
              <p className={`mt-0.5 font-mono text-[18px] leading-none tnum ${severity === "critical" ? "font-bold" : "font-medium"}`} style={{ color: TONE[severity] }}>
                {current.toFixed(r.digits)} <span className="text-[11px] font-normal text-ink-3">{r.unit}</span>
              </p>
              <Trace values={values} caution={ruleFor(r.key)?.cautionHigh} severity={severity} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
