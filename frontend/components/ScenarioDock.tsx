"use client";

import { CloudFog, Hand, Moon, PanelsTopLeft, Radiation, RotateCcw, Smile, Snowflake, Sun, Thermometer, ThermometerSun, Wind, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SCENARIOS } from "@aura/core/lib/scenarios";
import { useAuraStore } from "@/store/useAuraStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CONDITION: Record<string, { label: string; Icon: LucideIcon }> = {
  sep: { label: "Solar event", Icon: Sun },
  acuteDose: { label: "Acute dose", Icon: Radiation },
  coLeak: { label: "CO leak", Icon: Wind },
  co2Buildup: { label: "CO₂ buildup", Icon: CloudFog },
  cabinOverheat: { label: "Overheat", Icon: ThermometerSun },
  cabinCold: { label: "Cabin cold", Icon: Snowflake },
  fever: { label: "Fever", Icon: Thermometer },
  sleepDeprivation: { label: "Sleep loss", Icon: Moon },
  evaHandInjury: { label: "Hand injury", Icon: Hand },
  imFine: { label: "How I feel", Icon: Smile },
};

export default function ScenarioDock({ onOpenPanels, onScenarioSelect, panelMenu }: { onOpenPanels: () => void; onScenarioSelect: (id: string) => void; panelMenu: ReactNode }) {
  const scenarioId = useAuraStore((s) => s.scenarioId);
  const trigger = useAuraStore((s) => s.triggerScenario);
  const reset = useAuraStore((s) => s.reset);

  return (
    <nav className="hud-glass hud-dock" aria-label="Conditions and dashboard panels">
      <span className="hud-dock-label" id="conditions-label">Conditions</span>
      <div className="hud-dock-scenarios" role="group" aria-labelledby="conditions-label">
        {SCENARIOS.map((scenario) => {
          const { label, Icon } = CONDITION[scenario.id];
          return (
            <Tooltip key={scenario.id}>
              <TooltipTrigger asChild>
                <button className="hud-dock-button" aria-pressed={scenarioId === scenario.id} onClick={() => { trigger(scenario.id); onScenarioSelect(scenario.id); }}>
                  <Icon size={15} strokeWidth={1.5} aria-hidden />
                  {label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{scenario.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="hud-dock-actions">
        <button className="hud-dock-icon hud-dock-labeled" onClick={reset} aria-label="Reset condition" title="Reset to the crew baseline"><RotateCcw size={16} strokeWidth={1.5} aria-hidden /><span>Reset</span></button>
        <div className="hud-panels-anchor">
          <button className="hud-dock-icon hud-dock-labeled" onClick={onOpenPanels} aria-label="Open dashboard panels" title="Alerts, telemetry, mental health, space weather, next steps" aria-haspopup="menu" aria-expanded={!!panelMenu} aria-controls="dashboard-panel-menu"><PanelsTopLeft size={16} strokeWidth={1.5} aria-hidden /><span>Panels</span></button>
          {panelMenu}
        </div>
      </div>
    </nav>
  );
}
