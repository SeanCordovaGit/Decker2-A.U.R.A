"use client";

import { CATEGORY_META, PROFILE } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_ICON, SeverityBadge, Swatch } from "./hazard";

export default function StatusPanel() {
  const categories = useAuraStore((s) => s.categories);
  const readings = useAuraStore((s) => s.readings);
  const alertCount = useAuraStore((s) => s.alerts.length);
  const surgeon = useAuraStore((s) => s.alerts.some((a) => a.escalation === "flightSurgeon"));
  const active = categories.filter((c) => c.severity !== "nominal");
  const critical = active.filter((c) => c.severity === "critical").length;
  const dosePct = Math.round((readings.cumulativeDose / PROFILE.careerDoseLimit) * 100);

  return (
    <Card className="shrink-0" aria-label="Crew status">
      <CardHeader>
        <CardTitle>Crew status</CardTitle>
        <CardAction>
          <Badge variant="tag">Simulated</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
      <div
        className={`rounded-[5px] border px-3 py-2.5 ${
          active.length === 0 ? "border-line bg-panel-2" : critical ? "border-ink/60 bg-panel-3" : "border-caution/50 bg-caution-soft"
        }`}
        role="status"
        aria-live="polite"
      >
        <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
          {active.length === 0 ? "All nominal" : `${active.length} hazard${active.length > 1 ? "s" : ""} active`}
        </p>
        <p className="text-[12px] text-ink-2">
          {active.length === 0
            ? alertCount
              ? `No aura. ${alertCount} private note in Alerts.`
              : "No aura. Every reading is within limits."
            : `${alertCount} alert${alertCount === 1 ? "" : "s"} · ${surgeon ? `${critical ? `${critical} critical, ` : ""}flight surgeon notified` : "crew can self-manage"}`}
        </p>
      </div>

      <ul className="mt-2 divide-y divide-line">
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c.category];
          const on = c.severity !== "nominal";
          return (
            <li key={c.category} className="flex items-center gap-2.5 py-1.5">
              <Swatch category={c.category} active={on} />
              <Icon size={15} className={on ? "text-ink" : "text-ink-3"} aria-hidden />
              <span className={`flex-1 text-[13px] ${on ? "font-medium text-ink" : "text-ink-2"}`}>{CATEGORY_META[c.category].label}</span>
              <SeverityBadge severity={c.severity} />
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-line pt-3">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-ink-2">Career radiation dose</span>
          <span className="font-mono tnum text-ink">
            {readings.cumulativeDose.toFixed(0)} <span className="text-ink-3">/ {PROFILE.careerDoseLimit} mSv</span>
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-3" role="meter" aria-valuemin={0} aria-valuemax={PROFILE.careerDoseLimit} aria-valuenow={Math.round(readings.cumulativeDose)} aria-label="Career radiation dose">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, dosePct)}%`, background: CATEGORY_META.radiation.color }} />
        </div>
        <p className="mt-1 font-mono text-[11px] text-ink-3">{dosePct}% of NASA-STD-3001 career limit</p>
      </div>
      </CardContent>
    </Card>
  );
}
