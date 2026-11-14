"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlertPanel from "./AlertPanel";
import { AlertHud, CrewHud, EnvironmentHud, TelemetryDetails, VitalsHud } from "./MissionHud";
import MindPanel from "./MindPanel";
import ReferencePanel from "./ReferencePanel";
import ScenarioDock from "./ScenarioDock";
import SpaceWeatherPanel from "./SpaceWeatherPanel";
import TopBar from "./TopBar";
import Viewport from "./Viewport";

type Panel = "alerts" | "telemetry" | "mind" | "weather";
const PANEL_LABEL: Record<Panel, string> = {
  alerts: "Alerts",
  telemetry: "Telemetry",
  mind: "Mental health",
  weather: "Space weather",
};

function PanelContent({ panel }: { panel: Panel }) {
  switch (panel) {
    case "alerts": return <AlertPanel />;
    case "telemetry": return <TelemetryDetails />;
    case "mind": return <MindPanel />;
    case "weather": return <SpaceWeatherPanel />;
  }
}

export default function Dashboard() {
  const tick = useAuraStore((s) => s.tick);
  const referenceDialog = useRef<HTMLDialogElement>(null);
  const detailsDialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [crewExpanded, setCrewExpanded] = useState(false);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest(".hud-panels-anchor")) setMenuOpen(false);
    };
    window.addEventListener("pointerdown", closeOutside);
    return () => window.removeEventListener("pointerdown", closeOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (panel) detailsDialog.current?.showModal();
  }, [panel]);

  const openPanel = (next: Panel) => {
    setPanel(next);
    setMenuOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <main className="mission-shell" data-panel={panel ?? ""}>
        <Viewport />
        <div className="mission-edge-shade" aria-hidden />
        <TopBar onOpenReference={() => referenceDialog.current?.showModal()} />
        <CrewHud expanded={crewExpanded} onToggle={() => setCrewExpanded(!crewExpanded)} />
        <VitalsHud onOpen={() => openPanel("telemetry")} />
        <EnvironmentHud />
        <AlertHud onOpen={() => openPanel("alerts")} />
        <ScenarioDock
          onOpenPanels={() => { setMenuOpen(!menuOpen); setPanel(null); }}
          panelMenu={menuOpen ? (
            <div className="hud-glass hud-menu" id="dashboard-panel-menu" role="menu" aria-label="Dashboard panels">
              <button role="menuitem" onClick={() => { setCrewExpanded(!crewExpanded); setMenuOpen(false); }}>Crew status</button>
              {(Object.keys(PANEL_LABEL) as Panel[]).map((item) => (
                <button key={item} role="menuitem" onClick={() => openPanel(item)}>{PANEL_LABEL[item]}</button>
              ))}
              <button role="menuitem" onClick={() => { setMenuOpen(false); referenceDialog.current?.showModal(); }}>Reference</button>
            </div>
          ) : null}
        />

        {panel && (
          <dialog ref={detailsDialog} className={`hud-glass hud-popup ${panel === "alerts" ? "hud-popup-alerts" : ""}`} aria-label={`${PANEL_LABEL[panel]} details`} onCancel={() => setPanel(null)}>
            <button className="hud-popup-close" onClick={() => setPanel(null)} aria-label="Close details"><X size={18} strokeWidth={1.5} /></button>
            <PanelContent panel={panel} />
          </dialog>
        )}

        <dialog ref={referenceDialog} className="reference-dialog" aria-label="Reference">
          <div className="flex max-h-[calc(100dvh-48px)] flex-col gap-3 overflow-auto p-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => referenceDialog.current?.close()}>Close reference</Button>
            </div>
            <ReferencePanel />
            <p className="px-1 text-[11px] text-ink-3">
              Prototype for NASA Space Apps 2026. Crew biometrics are simulated; space weather is real NASA DONKI data. Designed to integrate with onboard sensors.
            </p>
          </div>
        </dialog>
      </main>
    </TooltipProvider>
  );
}
