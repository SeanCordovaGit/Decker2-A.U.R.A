"use client";

import { useEffect } from "react";
import { useAuraStore } from "@/store/useAuraStore";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlertPanel from "./AlertPanel";
import MindPanel from "./MindPanel";
import ReferencePanel from "./ReferencePanel";
import ScenarioPanel from "./ScenarioPanel";
import SpaceWeatherPanel from "./SpaceWeatherPanel";
import StatusPanel from "./StatusPanel";
import TelemetryStrip from "./TelemetryStrip";
import TopBar from "./TopBar";
import Viewport from "./Viewport";

export default function Dashboard() {
  const tick = useAuraStore((s) => s.tick);
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="min-h-dvh">
      <div className="flex flex-col lg:h-dvh lg:min-h-[760px]">
      <TopBar />
      <main className="grid gap-3 p-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[300px_minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-3 lg:order-1">
          <StatusPanel />
          <AlertPanel />
        </div>
        <div className="order-first flex min-h-0 flex-col gap-3 lg:order-2">
          <Viewport />
          <TelemetryStrip />
        </div>
        <div className="flex min-h-0 flex-col gap-3 overflow-auto lg:order-3">
          <ScenarioPanel />
          <MindPanel />
          <SpaceWeatherPanel />
        </div>
      </main>
      </div>
      <div className="px-3 pb-3">
        <ReferencePanel />
        <p className="mt-3 px-1 text-[11px] text-ink-3">
          Prototype for NASA Space Apps 2026. Crew biometrics are simulated; space weather is real NASA DONKI data. Designed to integrate with onboard sensors.
        </p>
      </div>
    </div>
    </TooltipProvider>
  );
}
