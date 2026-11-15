"use client";

import { useState } from "react";
import ReferenceTabsList from "./ReferenceTabsList";
import { INDICATOR_LEGEND, CHALLENGE_OBJECTIVES, MEASUREMENTS } from "@aura/core/config/aura";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import ResearchReference from "./ResearchReference";

export default function ReferencePanel() {
  const [value, setValue] = useState("measurements");
  const [animateTabs, setAnimateTabs] = useState(true);
  return (
    <Tabs value={value} onValueChange={setValue} className="reference-tabs gap-0" data-animate-tabs={animateTabs} onPointerDownCapture={() => setAnimateTabs(true)} onKeyDownCapture={() => setAnimateTabs(false)}>
      <Card aria-label="Reference">
        <CardHeader>
          <CardTitle>Reference</CardTitle>
          <CardAction>
            <ReferenceTabsList value={value} animate={animateTabs}>
              <TabsTrigger value="measurements" className="px-2 text-[12px]">What we measure</TabsTrigger>
              <TabsTrigger value="objectives" className="px-2 text-[12px]">Challenge objectives</TabsTrigger>
              <TabsTrigger value="legend" className="px-2 text-[12px]">Reading the aura</TabsTrigger>
              <TabsTrigger value="research" className="px-2 text-[12px]">Research data</TabsTrigger>
            </ReferenceTabsList>
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
                {INDICATOR_LEGEND.map((indicator) => (
                  <li key={indicator.label} className="flex items-start gap-2 text-[13px] text-ink">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: indicator.color }} />
                    <span><strong>{indicator.label}</strong><span className="block text-ink-2">{indicator.meaning}</span></span>
                  </li>
                ))}
              </ul>
              <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-ink-3">No aura</dt>
                <dd className="text-ink-2">Every reading within limits.</dd>
                <dt className="text-ink-3">Steady glow</dt>
                <dd className="text-ink-2">Caution: the crew self-manages.</dd>
                <dt className="text-ink-3">Pulsing glow</dt>
                <dd className="text-ink-2">Red for critical tiers; the alert distinguishes urgent symptoms, project warnings and career-dose review.</dd>
                <dt className="text-ink-3">Body glow</dt>
                <dd className="text-ink-2">Injury or fever, only on the affected body part.</dd>
              </dl>
            </div>
          </TabsContent>
          <TabsContent value="research"><ResearchReference /></TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
