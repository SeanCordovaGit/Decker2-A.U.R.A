"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { INDICATOR_COLORS } from "@aura/core/config/aura";
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
import JournalComposer from "./JournalComposer";
import AutomaticDemo from "./AutomaticDemo";
import { useAutomaticDemo } from "@/hooks/useAutomaticDemo";
import WorkflowPanel from "./WorkflowPanel";
import WorkflowDock from "./WorkflowDock";

type Panel = "alerts" | "telemetry" | "mind" | "weather" | "assistance";
const PANEL_LABEL: Record<Panel, string> = {
  alerts: "Alerts",
  telemetry: "Telemetry",
  mind: "Mental health",
  weather: "Space weather",
  assistance: "Next steps",
};

function PanelContent({ panel }: { panel: Panel }) {
  switch (panel) {
    case "alerts": return <AlertPanel />;
    case "telemetry": return <TelemetryDetails />;
    case "mind": return <MindPanel />;
    case "weather": return <SpaceWeatherPanel />;
    case "assistance": return <WorkflowPanel />;
  }
}

export default function Dashboard() {
  const tick = useAuraStore((s) => s.tick);
  const referenceDialog = useRef<HTMLDialogElement>(null);
  const detailsDialog = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [crewExpanded, setCrewExpanded] = useState(false);
  const [assistanceExpanded, setAssistanceExpanded] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const onViewerReady = useCallback(() => setViewerReady(true), []);
  const demo = useAutomaticDemo(viewerReady);
  const visiblePanel = demo.active ? demo.step?.id === "alerts" ? "alerts" : demo.step?.id === "journal" && demo.elapsed! >= 25000 ? "mind" : null : panel;

  useEffect(() => {
    const id = setInterval(() => { if (!demo.paused) tick(); }, 1000);
    return () => clearInterval(id);
  }, [tick, demo.paused]);

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
    if (demo.active) referenceDialog.current?.close();
  }, [demo.active]);

  useEffect(() => {
    if (visiblePanel && visiblePanel !== "assistance" && visiblePanel !== "weather") {
      if (demo.active) detailsDialog.current?.show();
      else detailsDialog.current?.showModal();
    }
  }, [visiblePanel, demo.active]);

  const openPanel = (next: Panel) => {
    setPanel(next);
    setMenuOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <main className="mission-shell" data-panel={visiblePanel ?? ""} data-assistance-expanded={assistanceExpanded} data-demo-step={demo.step?.id ?? ""} style={{ "--caution": INDICATOR_COLORS.yellow, "--critical": INDICATOR_COLORS.red, "--caution-soft": "color-mix(in srgb, var(--caution) 14%, transparent)", "--critical-soft": "color-mix(in srgb, var(--critical) 14%, transparent)" } as CSSProperties}>
        <div className="mission-content" inert={demo.active}>
        <Viewport onReady={onViewerReady} demoRotate={demo.active ? demo.step?.id === "viewer" && !demo.paused : undefined} />
        <div className="mission-edge-shade" aria-hidden />
        <TopBar onOpenReference={() => referenceDialog.current?.showModal()} />
        <CrewHud expanded={demo.active ? demo.step?.id === "crew" : crewExpanded} onToggle={() => setCrewExpanded(!crewExpanded)} />
        <VitalsHud onOpen={() => openPanel("telemetry")} />
        <EnvironmentHud demoExpanded={demo.active ? demo.step?.id === "environment" : undefined} />
        <AlertHud onOpen={() => openPanel("alerts")} />
        <JournalComposer demoText={demo.sampleText} />
        <ScenarioDock
          onScenarioSelect={(id) => { if (id === "evaHandInjury" || id === "cabinCold") openPanel("assistance"); }}
          onOpenPanels={() => { setMenuOpen(!menuOpen); setPanel(null); }}
          panelMenu={menuOpen && !demo.active ? (
            <div className="hud-glass hud-menu" id="dashboard-panel-menu" role="menu" aria-label="Dashboard panels">
              <button role="menuitem" onClick={() => { setCrewExpanded(!crewExpanded); setMenuOpen(false); }}>Crew status</button>
              {(Object.keys(PANEL_LABEL) as Panel[]).map((item) => (
                <button key={item} role="menuitem" onClick={() => openPanel(item)}>{PANEL_LABEL[item]}</button>
              ))}
              <button role="menuitem" onClick={() => { setMenuOpen(false); referenceDialog.current?.showModal(); }}>Reference</button>
            </div>
          ) : null}
        />

        {(visiblePanel === "assistance" || visiblePanel === "weather") && <WorkflowDock title={PANEL_LABEL[visiblePanel]} expanded={assistanceExpanded} onToggle={() => setAssistanceExpanded(!assistanceExpanded)} onClose={() => setPanel(null)}><PanelContent panel={visiblePanel} /></WorkflowDock>}
        {visiblePanel && visiblePanel !== "assistance" && visiblePanel !== "weather" && (
          <dialog ref={detailsDialog} className={`hud-glass hud-popup ${visiblePanel === "alerts" ? "hud-popup-alerts" : ""}`} aria-label={`${PANEL_LABEL[visiblePanel]} details`} onCancel={() => setPanel(null)}>
            <button className="hud-popup-close" onClick={() => setPanel(null)} aria-label="Close details"><X size={18} strokeWidth={1.5} /></button>
            <PanelContent panel={visiblePanel} />
          </dialog>
        )}

        <dialog ref={referenceDialog} className="reference-dialog" aria-label="Reference">
          <div className="flex max-h-[calc(100dvh-48px)] flex-col gap-3 overflow-auto p-4">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { referenceDialog.current?.close(); setPanel(null); setMenuOpen(false); demo.start(); }}>Replay demo</Button>
              <Button variant="outline" onClick={() => referenceDialog.current?.close()}>Close reference</Button>
            </div>
            <ReferencePanel />
            <p className="px-1 text-[11px] text-ink-3">
              Prototype for NASA Space Apps 2026. Crew biometrics are simulated; space weather is real NASA DONKI data. Designed to integrate with onboard sensors.
            </p>
          </div>
        </dialog>
        </div>
        {demo.step && <AutomaticDemo stepIndex={demo.stepIndex} paused={demo.paused} onPause={() => demo.setPaused(!demo.paused)} onFinish={demo.finish} />}
      </main>
    </TooltipProvider>
  );
}
