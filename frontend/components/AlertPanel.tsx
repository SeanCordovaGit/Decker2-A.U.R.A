"use client";

import { ShieldCheck, Siren } from "lucide-react";
import { CATEGORY_META, ESCALATION, SEVERITY_META } from "@aura/core/config/aura";
import type { Alert } from "@aura/core/lib/types";
import { useAuraStore } from "@/store/useAuraStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_ICON, SeverityBadge, Swatch } from "./hazard";

const RESPONDER = { none: "You only", crew: "Crew · self-manage", flightSurgeon: "Flight surgeon" } as const;

export default function AlertPanel() {
  const alerts = useAuraStore((s) => s.alerts);
  const log = useAuraStore((s) => s.log);
  const sorted = [...alerts].sort((a, b) => SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank);

  return (
    <Tabs defaultValue="active" className="h-full min-h-0 gap-0">
    <Card className="flex-1" aria-label="Alerts">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardAction>
          <TabsList aria-label="Alert view" className="h-7">
            <TabsTrigger value="active" className="px-2 text-[12px]">Active · {alerts.length}</TabsTrigger>
            <TabsTrigger value="log" className="px-2 text-[12px]">Log</TabsTrigger>
          </TabsList>
        </CardAction>
      </CardHeader>
      <CardContent>
      <TabsContent value="active">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-ink-3" aria-hidden />
            <p className="text-[14px] text-ink">No active alerts</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {sorted.map((a) => (
              <AlertCard key={a.key} alert={a} />
            ))}
          </ul>
        )}
      </TabsContent>
      <TabsContent value="log">
        <ol className="space-y-1.5 font-mono text-[11px]">
          {log.length === 0 && <li className="text-ink-3">No events yet.</li>}
          {log.map((e) => (
            <li key={e.id} className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 text-ink-2">
              <span className="tnum text-ink-3">{new Date(e.time).toLocaleTimeString([], { hour12: false })}</span>
              <Swatch category={e.category} />
              <span>
                <span className="text-ink">{e.title}</span> {e.event}
                {e.event === "escalated" && <span className="text-ink"> → flight surgeon</span>}
                {(e.event === "opened" || e.event === "changed") && <span className={e.severity === "critical" ? "font-semibold text-ink" : "text-caution"}> · {e.severity}</span>}
              </span>
            </li>
          ))}
        </ol>
      </TabsContent>
      {alerts.length > 0 && <p className="mt-3 text-[11px] text-ink-3">{ESCALATION.demoTimeNote}</p>}
      </CardContent>
    </Card>
    </Tabs>
  );
}

function AlertCard({ alert: a }: { alert: Alert }) {
  const Icon = CATEGORY_ICON[a.category];
  return (
    <li className={`rounded-[5px] border bg-panel-2 p-3 ${a.severity === "critical" ? "border-ink/45" : "border-line"}`}>
      <div className="flex items-start gap-2">
        <Swatch category={a.category} active />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-semibold leading-snug text-ink">{a.title}</h3>
            <SeverityBadge severity={a.severity} />
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-3">
            <Icon size={11} aria-hidden /> {CATEGORY_META[a.category].label}
          </p>
        </div>
      </div>
      <dl className="mt-2.5 grid grid-cols-[76px_1fr] gap-x-2 gap-y-1.5 text-[12px]">
        <dt className="text-ink-3">Reading</dt>
        <dd className="font-mono tnum text-ink">{a.valueText}</dd>
        <dt className="text-ink-3">Threshold</dt>
        <dd className="font-mono text-ink-2">{a.thresholdText}</dd>
        <dt className="text-ink-3">Do now</dt>
        <dd className="text-ink">{a.action}</dd>
        <dt className="text-ink-3">Responds</dt>
        <dd className={a.escalation === "flightSurgeon" ? "flex items-center gap-1 font-semibold text-ink" : "text-ink-2"}>
          {a.escalation === "flightSurgeon" && <Siren size={12} aria-hidden />}
          {RESPONDER[a.escalation]}
          {a.escalated && a.severity === "caution" && " (persisting caution)"}
        </dd>
        <dt className="text-ink-3">Source</dt>
        <dd className="text-[11px] leading-relaxed text-ink-2">
          {a.citation.text}{" "}
          <span className="inline-flex gap-1 align-middle">
            {a.citation.teamDefined && <Badge variant="tag">Team-defined</Badge>}
            {!a.citation.verified && <Badge variant="tag-caution">Verify</Badge>}
          </span>
        </dd>
      </dl>
      {a.toAstronautOnly && <p className="mt-2 border-t border-line pt-2 text-[11px] text-ink-2">Visible to you only. You decide whether to share it with the ground.</p>}
    </li>
  );
}
