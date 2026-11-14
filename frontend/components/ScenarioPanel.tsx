"use client";

import { CloudFog, Flame, Hand, MessageCircleWarning, MoonStar, RotateCcw, Snowflake, Thermometer, ThermometerSun, Zap, type LucideIcon } from "lucide-react";
import { SCENARIOS } from "@aura/core/lib/scenarios";
import { useAuraStore } from "@/store/useAuraStore";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ICON: Record<string, LucideIcon> = {
  sep: Zap,
  coLeak: Flame,
  co2Buildup: CloudFog,
  cabinOverheat: ThermometerSun,
  cabinCold: Snowflake,
  fever: Thermometer,
  sleepDeprivation: MoonStar,
  evaHandInjury: Hand,
  imFine: MessageCircleWarning,
};

export default function ScenarioPanel() {
  const scenarioId = useAuraStore((s) => s.scenarioId);
  const trigger = useAuraStore((s) => s.triggerScenario);
  const reset = useAuraStore((s) => s.reset);

  return (
    <Card className="shrink-0" aria-label="Demo scenarios">
      <CardHeader>
        <CardTitle>Demo scenarios</CardTitle>
        <CardAction>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw aria-hidden /> Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>Return every reading to nominal</TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent>
      <div className="grid grid-cols-2 gap-1.5">
        {SCENARIOS.map((s) => {
          const Icon = ICON[s.id];
          const on = scenarioId === s.id;
          return (
            <Tooltip key={s.id}>
              <TooltipTrigger asChild>
                <Button variant="outline" aria-pressed={on} onClick={() => trigger(s.id)} className="h-auto min-h-8 justify-start gap-1.5 px-2 py-1.5 text-left text-[12px] leading-tight whitespace-normal">
                  {Icon && <Icon className={on ? "text-signal-text" : "text-ink-3"} aria-hidden />}
                  <span>{s.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{s.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] text-ink-3">
        {scenarioId ? SCENARIOS.find((s) => s.id === scenarioId)?.description : "Each scenario drives the simulated readings; the aura reacts within seconds."}
      </p>
      </CardContent>
    </Card>
  );
}
