"use client";

import dynamic from "next/dynamic";
import { Pause, Play } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { CATEGORY_META } from "@aura/core/config/aura";
import type { HazardCategory } from "@aura/core/lib/types";
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

  return (
    <section className="observation panel relative min-h-[420px] flex-1 overflow-hidden !bg-[#05070c]" aria-label="3D astronaut with aura">
      <div className="absolute inset-0">
        <AstronautScene autoRotate={rotate} />
      </div>
      <div className="brackets" aria-hidden />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <div className="flex flex-wrap gap-1.5" aria-live="polite">
          {active.length === 0 ? (
            <span className="rounded-[4px] border border-white/10 bg-[rgb(8_11_17/0.7)] px-2 py-1 font-mono text-[11px] text-[#a9b4c7]">No aura · all nominal</span>
          ) : (
            active.map((c) => (
              <span
                key={c.category}
                className="flex items-center gap-1.5 rounded-[4px] border bg-[rgb(8_11_17/0.8)] px-2 py-1 font-mono text-[11px] text-[#e6edf7]"
                style={{ borderColor: `${CATEGORY_META[c.category].color}80` }}
              >
                <Swatch category={c.category} active />
                {CATEGORY_META[c.category].label}
                <span className={c.severity === "critical" ? "pulse font-semibold text-white" : "text-[#ffc861]"}>{c.severity}</span>
              </span>
            ))
          )}
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setRotate(!rotate)}
          aria-pressed={!rotate}
          className="pointer-events-auto shrink-0 border-white/15 bg-[rgb(8_11_17/0.7)] font-mono text-[11px] text-[#a9b4c7] hover:bg-[rgb(8_11_17/0.9)] hover:text-[#e6edf7] dark:bg-[rgb(8_11_17/0.7)]"
        >
          {rotate ? <Pause aria-hidden /> : <Play aria-hidden />}
          {rotate ? "Pause rotation" : "Rotate"}
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-[#05070c] via-[#05070c]/80 to-transparent p-4 pt-8 font-mono text-[11px] text-[#8591a6]">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {(Object.keys(CATEGORY_META) as HazardCategory[]).map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <Swatch category={c} /> {CATEGORY_META[c].short}
            </li>
          ))}
        </ul>
        <p>Drag to rotate · model: NASA 3D Resources</p>
      </div>
    </section>
  );
}
