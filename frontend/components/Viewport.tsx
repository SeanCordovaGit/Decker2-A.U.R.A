"use client";

import dynamic from "next/dynamic";
import { compareAlerts } from "@aura/core/lib/evaluate";
import { Pause, Play } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { CATEGORY_META } from "@aura/core/config/aura";
import { isSnapshot, useAuraStore } from "@/store/useAuraStore";
import { Button } from "@/components/ui/button";
import { Swatch } from "./hazard";

const AstronautScene = dynamic(() => import("./AstronautScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-mono text-[12px] text-[#a9b4c7]">Starting 3D view…</div>,
});

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeMotion(onChange: () => void) {
  const mq = matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export default function Viewport({ onReady, demoRotate }: { onReady?: () => void; demoRotate?: boolean }) {
  const categories = useAuraStore((s) => s.categories);
  const metrics = useAuraStore((s) => s.metrics);
  const injuries = useAuraStore((s) => s.readings.injuries);
  const alerts = useAuraStore((s) => s.alerts);
  const snapshot = useAuraStore(isSnapshot);
  const leadAlert = [...alerts].sort(compareAlerts)[0];
  const active = categories.filter((category) => category.severity !== "nominal").sort((a, b) => Number(b.category === leadAlert?.category) - Number(a.category === leadAlert?.category));
  const context = active[0]?.category === "injury" && Object.values(injuries).every((severity) => severity === "nominal") ? metrics.find((metric) => metric.metric === "coreTemp") : undefined;
  const bodyAlerts = alerts.filter((alert) => alert.category === "injury");
  const activeLabel = active[0]?.category === "injury" && bodyAlerts.length === 1 ? bodyAlerts[0].title : active[0] && CATEGORY_META[active[0].category].label;
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => matchMedia(MOTION_QUERY).matches, () => false);
  const [userRotate, setRotate] = useState<boolean | null>(null);
  const rotate = demoRotate === undefined ? userRotate ?? !reducedMotion : demoRotate && !reducedMotion;
  const onInteract = useCallback(() => setRotate(false), []);

  return (
    <section className="observation immersive-viewer" aria-label="3D astronaut with aura">
      <div className="absolute inset-0">
        <AstronautScene autoRotate={rotate} onInteract={onInteract} onReady={onReady} />
      </div>
      <div className="hud-glass viewer-state" aria-live="polite" data-severity={active[0]?.severity ?? "nominal"}>
        {active.length === 0 ? <><span className="hud-dot hud-dot-ok" /> {snapshot ? "Supplied readings within bands" : "All nominal"}</> : <><Swatch category={active[0].category} severity={active[0].severity} context={context} active /> {active.length === 1 ? activeLabel : `${active.length} active hazards`} · {active[0].severity}</>}
      </div>
      <Button variant="outline" size="sm" onClick={() => setRotate(!rotate)} aria-pressed={!rotate} className="hud-glass viewer-rotate">
        {rotate ? <Pause aria-hidden /> : <Play aria-hidden />}
        {rotate ? "Pause rotation" : "Rotate astronaut"}
      </Button>
    </section>
  );
}
