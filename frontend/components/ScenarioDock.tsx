"use client";

import { PanelsTopLeft, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { SCENARIOS } from "@aura/core/lib/scenarios";
import { useAuraStore } from "@/store/useAuraStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const SHORT_LABEL: Record<string, string> = {
  sep: "Solar event",
  acuteDose: "Acute dose",
  coLeak: "CO leak",
  co2Buildup: "CO₂ buildup",
  cabinOverheat: "Overheat",
  cabinCold: "Cabin cold",
  fever: "Fever",
  sleepDeprivation: "Sleep loss",
  evaHandInjury: "Hand injury",
  imFine: "I'm fine",
};

export default function ScenarioDock({ onOpenPanels, onScenarioSelect, panelMenu }: { onOpenPanels: () => void; onScenarioSelect: (id: string) => void; panelMenu: ReactNode }) {
  const scenarioId = useAuraStore((s) => s.scenarioId);
  const trigger = useAuraStore((s) => s.triggerScenario);
  const reset = useAuraStore((s) => s.reset);

  return (
    <nav className="hud-glass hud-dock" aria-label="Demo scenarios and dashboard panels">
      <div className="hud-dock-scenarios" role="group" aria-label="Demo scenarios">
        {SCENARIOS.map((scenario) => {
          return (
            <Tooltip key={scenario.id}>
              <TooltipTrigger asChild>
                <button className="hud-dock-button" aria-pressed={scenarioId === scenario.id} onClick={() => { trigger(scenario.id); onScenarioSelect(scenario.id); }}>
                  {SHORT_LABEL[scenario.id]}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{scenario.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="hud-dock-actions">
        <button className="hud-dock-icon" onClick={reset} aria-label="Reset scenario" title="Reset scenario"><RotateCcw size={17} strokeWidth={1.5} /></button>
        <div className="hud-panels-anchor">
          <button className="hud-dock-icon" onClick={onOpenPanels} aria-label="Open dashboard panels" title="Dashboard panels" aria-haspopup="menu" aria-expanded={!!panelMenu} aria-controls="dashboard-panel-menu"><PanelsTopLeft size={17} strokeWidth={1.5} /></button>
          {panelMenu}
        </div>
      </div>
    </nav>
  );
}
