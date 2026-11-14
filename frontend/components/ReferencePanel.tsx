"use client";

import { CATEGORY_META, CHALLENGE_OBJECTIVES, MEASUREMENTS } from "@aura/core/config/aura";
import type { HazardCategory } from "@aura/core/lib/types";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_ICON, Swatch } from "./hazard";

export default function ReferencePanel() {
  return (
    <Tabs defaultValue="measurements" className="gap-0">
      <Card aria-label="Reference">
        <CardHeader>
          <CardTitle>Reference</CardTitle>
          <CardAction>
            <TabsList aria-label="Reference" className="h-7">
              <TabsTrigger value="measurements" className="px-2 text-[12px]">What we measure</TabsTrigger>
              <TabsTrigger value="objectives" className="px-2 text-[12px]">Challenge objectives</TabsTrigger>
              <TabsTrigger value="legend" className="px-2 text-[12px]">Reading the aura</TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TabsContent value="measurements">
            <ul className="divide-y divide-line sm:hidden">
              {MEASUREMENTS.map((m) => (
                <li key={m.metric} className="py-2.5 text-[13px]">
                  <p className="font-medium text-ink">{m.metric}</p>
                  <p className="mt-0.5 text-[12px] text-ink-3">{m.device}</p>
                  <p className="mt-1 text-ink-2">{m.why}</p>
                </li>
              ))}
            </ul>
            <Table className="hidden text-[13px] sm:table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 text-[11px] text-ink-3">Measurement</TableHead>
                  <TableHead className="h-8 text-[11px] text-ink-3">Onboard device</TableHead>
                  <TableHead className="h-8 text-[11px] text-ink-3">Why it matters in space</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MEASUREMENTS.map((m) => (
                  <TableRow key={m.metric}>
                    <TableCell className="align-top font-medium whitespace-normal text-ink">{m.metric}</TableCell>
                    <TableCell className="align-top whitespace-normal text-ink-2">{m.device}</TableCell>
                    <TableCell className="max-w-[60ch] align-top whitespace-normal text-ink-2">{m.why}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="objectives">
            <ol className="grid gap-2 sm:grid-cols-2">
              {CHALLENGE_OBJECTIVES.map((o, i) => (
                <li key={o.question} className="rounded-md border border-line bg-panel-2 p-3">
                  <p className="text-[13px] font-medium text-ink">
                    <span className="font-mono text-ink-3">{i + 1}.</span> {o.question}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-2">{o.where}</p>
                </li>
              ))}
            </ol>
          </TabsContent>

          <TabsContent value="legend">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {(Object.keys(CATEGORY_META) as HazardCategory[]).map((c) => {
                  const Icon = CATEGORY_ICON[c];
                  return (
                    <li key={c} className="flex items-center gap-2 text-[13px] text-ink">
                      <Swatch category={c} active />
                      <Icon size={14} className="text-ink-3" aria-hidden />
                      {CATEGORY_META[c].label}
                    </li>
                  );
                })}
              </ul>
              <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-ink-3">No aura</dt>
                <dd className="text-ink-2">Every reading within limits.</dd>
                <dt className="text-ink-3">Steady glow</dt>
                <dd className="text-ink-2">Caution: the crew self-manages.</dd>
                <dt className="text-ink-3">Pulsing glow</dt>
                <dd className="text-ink-2">Critical: the flight surgeon is notified.</dd>
                <dt className="text-ink-3">Body glow</dt>
                <dd className="text-ink-2">Injury or fever, only on the affected body part.</dd>
              </dl>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
