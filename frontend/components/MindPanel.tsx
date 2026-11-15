"use client";

import { getIndicatorColor, MHI_CONFIG } from "@aura/core/config/aura";
import { formatMetricValue } from "@aura/core/lib/evaluate";
import { useAuraStore } from "@/store/useAuraStore";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "./hazard";

const SOURCE_LABEL = { biometrics: "Biometrics", affect: "Voice / affect", journal: "Journal" } as const;

export default function MindPanel() {
  const mhi = useAuraStore((s) => s.mhi);
  const metrics = useAuraStore((state) => state.metrics);
  const mentalSeverity = useAuraStore((state) => state.categories.find((category) => category.category === "mental")!.severity);
  const color = getIndicatorColor("mental", mhi.severity);

  return (
    <Card className="mind-panel h-full" aria-label="Mental Health Index">
      <CardHeader>
        <CardTitle>Mental health &amp; vigilance</CardTitle>
        <CardAction>
          <SeverityBadge severity={mentalSeverity} />
        </CardAction>
      </CardHeader>
      <CardContent>
      <div className="mhi-summary flex items-end gap-3 border-b border-line pb-2">
        <p className="font-mono text-[40px] font-medium leading-none tnum text-ink">{formatMetricValue("mhi", mhi.index)}</p>
        <p className="pb-1 font-mono text-[11px] leading-snug text-ink-3">of 100 · caution &lt;{MHI_CONFIG.caution} · critical &lt;{MHI_CONFIG.critical}</p>
      </div>
      <p className="mt-2 text-[11px] text-ink-3">{mhi.source === "provided" ? "Supplied MHI from sample.csv. A scored journal check-in switches to the local composite model." : "Locally computed demo MHI combines simulated biometric/affect inputs with available journal sentiment. Weights are project-defined and not clinically validated. PVT+ is assessed separately."}</p>
      {mhi.source === "computed" && <ul className="mhi-scores mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {mhi.components.map((c) => (
          <li key={c.source}>
            <div className="text-[12px]">
              <span className="block truncate text-ink-2">
                {SOURCE_LABEL[c.source]}
              </span>
              <span className="font-mono tnum text-ink-3">
                {c.score === null ? "no entry" : <span className="text-ink">{Math.round(c.score)}</span>} · w {c.weight.toFixed(2)}
              </span>
            </div>
            <div className="mhi-bar mt-1 h-1 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full rounded-full" style={{ width: `${c.score ?? 0}%`, background: color }} />
            </div>
          </li>
        ))}
      </ul>}
      <ul className="mental-readouts">
        {metrics.filter((metric) => metric.category === "mental").map((metric) => <li key={metric.metric}><span>{metric.rule.label}</span><strong style={{ color: metric.severity === "nominal" ? undefined : getIndicatorColor("mental", metric.severity) }}>{metric.value.toFixed(0)} <small>{metric.rule.unit}</small></strong><SeverityBadge severity={metric.severity} /></li>)}
      </ul>
      <p className="mt-2 text-[11px] text-ink-3">PVT+ lapses are counts per 300-second test. Absolute HRV bands are used; individual crew baselines were not supplied.</p>

      {mhi.discrepancy.active && mhi.discrepancy.pair && (
        <div className="mt-3 rounded-[5px] border border-line-strong bg-panel-2 p-2.5 text-[12px] text-ink" role="status">
          <p className="font-semibold">Your signals disagree</p>
          <p className="mt-0.5 text-ink-2">
            {SOURCE_LABEL[mhi.discrepancy.pair[0]]} and {SOURCE_LABEL[mhi.discrepancy.pair[1]].toLowerCase()} differ by {Math.round(mhi.discrepancy.gap)} points. {MHI_CONFIG.actions.discrepancy}
          </p>
        </div>
      )}


      </CardContent>
    </Card>
  );
}
