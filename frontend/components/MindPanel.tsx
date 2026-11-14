"use client";

import { useState } from "react";
import { CATEGORY_META, MHI_CONFIG } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "./hazard";

const SOURCE_LABEL = { biometrics: "Biometrics", affect: "Voice / affect", journal: "Journal", pvt: "PVT reaction" } as const;

export default function MindPanel() {
  const [text, setText] = useState("");
  const submit = useAuraStore((s) => s.submitJournal);
  const mhi = useAuraStore((s) => s.mhi);
  const latest = useAuraStore((s) => s.journal[s.journal.length - 1]);
  const color = CATEGORY_META.mental.color;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    submit(text.trim());
    setText("");
  };

  return (
    <Card className="shrink-0" aria-label="Mental Health Index">
      <CardHeader>
        <CardTitle>Mental Health Index</CardTitle>
        <CardAction>
          <SeverityBadge severity={mhi.severity} />
        </CardAction>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-[92px_1fr] gap-3">
        <div>
          <p className="font-mono text-[40px] font-semibold leading-none tracking-[-0.03em] tnum text-ink">{Math.round(mhi.index)}</p>
          <p className="mt-1.5 whitespace-nowrap font-mono text-[11px] leading-snug text-ink-3">
            of 100
            <br />
            caution &lt;{MHI_CONFIG.caution}
            <br />
            critical &lt;{MHI_CONFIG.critical}
          </p>
        </div>
      <ul className="space-y-1.5">
        {mhi.components.map((c) => (
          <li key={c.source}>
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-ink-2">
                {SOURCE_LABEL[c.source]}
              </span>
              <span className="font-mono tnum text-ink-3">
                {c.score === null ? "no entry" : <span className="text-ink">{Math.round(c.score)}</span>} · w {c.weight.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${c.score ?? 0}%`, background: color }} />
            </div>
          </li>
        ))}
      </ul>
      </div>

      {mhi.discrepancy.active && mhi.discrepancy.pair && (
        <div className="mt-3 rounded-[5px] border border-line-strong bg-panel-2 p-2.5 text-[12px] text-ink" role="status">
          <p className="font-semibold">Your signals disagree</p>
          <p className="mt-0.5 text-ink-2">
            {SOURCE_LABEL[mhi.discrepancy.pair[0]]} and {SOURCE_LABEL[mhi.discrepancy.pair[1]].toLowerCase()} differ by {Math.round(mhi.discrepancy.gap)} points. {MHI_CONFIG.actions.discrepancy}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-3">
        <label htmlFor="journal" className="sr-only">
          Private journal entry
        </label>
        <div className="flex gap-2">
          <Input
            id="journal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today?"
            autoComplete="off"
            className="flex-1 bg-secondary text-[13px] md:text-[13px]"
          />
          <Button type="submit" className="shrink-0">
            Log
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-3">
          {latest ? (latest.score === null ? "Too short to score: write at least 3 words." : `Last entry sentiment ${latest.score}/100.`) : "Private journal, scored on-device. Nothing leaves the station."}
        </p>
      </form>
      </CardContent>
    </Card>
  );
}
