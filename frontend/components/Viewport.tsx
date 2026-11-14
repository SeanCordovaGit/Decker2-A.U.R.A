"use client";

import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { CATEGORY_META } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
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

export default function Viewport() {
  const categories = useAuraStore((s) => s.categories);
  const active = categories.filter((c) => c.severity !== "nominal");
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => matchMedia(MOTION_QUERY).matches, () => false);
  const [userRotate, setRotate] = useState<boolean | null>(null);
  const rotate = userRotate ?? !reducedMotion;
  const onInteract = useCallback(() => setRotate(false), []);

  return (
    <section className="observation immersive-viewer" aria-label="3D astronaut with aura">
      <div className="absolute inset-0">
        <AstronautScene autoRotate={rotate} onInteract={onInteract} />
      </div>
      <div className="viewer-state" aria-live="polite">
        {active.length === 0 ? <><span className="hud-dot hud-dot-ok" /> All nominal</> : <><Swatch category={active[0].category} active /> {active.length === 1 ? CATEGORY_META[active[0].category].label : `${active.length} active hazards`} · {active[0].severity}</>}
      </div>
      <Button variant="outline" size="sm" onClick={() => setRotate(!rotate)} aria-pressed={!rotate} className="hud-glass viewer-rotate">
        {rotate ? <Pause aria-hidden /> : <Play aria-hidden />}
        {rotate ? "Pause rotation" : "Rotate astronaut"}
      </Button>
    </section>
  );
}
