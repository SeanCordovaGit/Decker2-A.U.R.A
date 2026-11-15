"use client";

import { CATEGORY_META, PROFILE, getIndicatorColor } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
import { crewProfile } from "@aura/core/lib/research-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, Swatch } from "./hazard";

export default function StatusPanel() {
  const categories = useAuraStore((s) => s.categories);
  const readings = useAuraStore((s) => s.readings);
  const snapshot = useAuraStore((s) => !s.scenarioId && crewProfile(s.selectedCrewId));
  const metrics = useAuraStore((s) => s.metrics);
  const alertCount = useAuraStore((s) => s.alerts.length);
  const surgeon = useAuraStore((s) => s.alerts.some((a) => a.escalation === "flightSurgeon"));
  const active = categories.filter((c) => c.severity !== "nominal");
  const critical = active.filter((c) => c.severity === "critical").length;
  const dosePct = Math.round((readings.cumulativeDose / PROFILE.careerDoseLimit) * 100);

  return (
    <Card className="status-panel shrink-0" aria-label="Crew status">
      <CardHeader>
        <CardTitle>Crew status</CardTitle>
        <CardAction>
          <Badge variant="tag">Simulated</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
      <div
        className={`status-summary rounded-lg border px-3 py-2.5 ${
          active.length === 0 ? "border-line bg-panel-2" : critical ? "border-ink/30 bg-panel-3" : "border-caution/30 bg-caution-soft"
        }`}
        role="status"
        aria-live="polite"
      >
        <p className="text-[21px] font-medium text-ink">
          {active.length === 0 ? "All nominal" : `${active.length} hazard${active.length > 1 ? "s" : ""} active`}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-2">
          {active.length === 0
            ? alertCount
              ? `No aura. ${alertCount} private note in Alerts.`
              : snapshot ? "Supplied readings within demo bands; missing fields are not assessed" : "All readings within limits"
            : `${alertCount} alert${alertCount === 1 ? "" : "s"} · ${surgeon ? `${critical ? `${critical} critical, ` : ""}flight surgeon escalation (demo)` : "crew can self-manage"}`}
        </p>
      </div>

      <ul className="status-categories mt-2 divide-y divide-line">
        {categories.map((c) => {
          const on = c.severity !== "nominal";
          return (
            <li key={c.category} className="flex min-h-8 items-center gap-2 py-1">
              <Swatch category={c.category} severity={c.severity} context={c.category === "injury" && Object.values(readings.injuries).every((severity) => severity === "nominal") ? metrics.find((metric) => metric.metric === "coreTemp") : undefined} active={on} />
              <span className={`flex-1 text-[13px] ${on ? "font-medium text-ink" : "text-ink-2"}`}>{CATEGORY_META[c.category].label}</span>
              <SeverityBadge severity={c.severity} />
            </li>
          );
        })}
      </ul>

      <div className="status-dose mt-2 border-t border-line pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[12px]">
          <span className="text-ink-2">Cumulative dose vs career reference</span>
          <span className="font-mono tnum whitespace-nowrap text-ink">
            {readings.cumulativeDose.toFixed(0)} <span className="text-ink-3">/ {PROFILE.careerDoseLimit} mSv</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-3" role="meter" aria-valuemin={0} aria-valuemax={PROFILE.careerDoseLimit} aria-valuenow={Math.min(PROFILE.careerDoseLimit, Math.round(readings.cumulativeDose))} aria-valuetext={`${readings.cumulativeDose.toFixed(0)} of ${PROFILE.careerDoseLimit} mSv`} aria-label="Career radiation dose">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, dosePct)}%`, background: getIndicatorColor("radiation", categories.find((category) => category.category === "radiation")!.severity) }} />
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink-3">{dosePct}% of NASA career-dose reference; not an acute emergency threshold. Lifetime history is not integrated.</p>
      </div>
      <p className="mt-3 text-[12px] text-ink-2">Acute absorbed dose: <span className="font-mono text-ink">{snapshot ? "Not supplied" : `${readings.absorbedDoseGy.toFixed(2)} Gy`}</span></p>
      <p className="mt-1 text-[11px] text-ink-3">Gy and mSv are independent measurements.</p>
      </CardContent>
    </Card>
  );
}
