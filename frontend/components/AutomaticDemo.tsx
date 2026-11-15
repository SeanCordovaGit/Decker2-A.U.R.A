"use client";

import { useEffect, useRef } from "react";
import { DEMO_STEPS } from "@/hooks/useAutomaticDemo";

export default function AutomaticDemo({ stepIndex, paused, onPause, onFinish }: { stepIndex: number; paused: boolean; onPause: () => void; onFinish: () => void }) {
  const container = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!container.current?.contains(document.activeElement)) container.current?.focus();
  }, [stepIndex]);
  const step = DEMO_STEPS[stepIndex];
  return <>
    <div className="demo-shield" aria-hidden />
    <aside ref={container} className="hud-glass demo-caption" role="dialog" aria-modal="true" aria-label="Automatic dashboard demo" tabIndex={-1} onKeyDown={(event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        buttons[(current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }}>
      <div className="demo-meta"><span>Automatic demo · Sample data only</span><span>{stepIndex + 1} / {DEMO_STEPS.length}</span></div>
      <div key={step.id} className="demo-caption-content" aria-live="polite" aria-atomic="true"><h2>{step.title}</h2><p>{step.text}</p></div>
      <div className="demo-footer"><div className="demo-steps" aria-hidden>{DEMO_STEPS.map((item, index) => <span key={item.id} data-current={index === stepIndex} data-complete={index < stepIndex} />)}</div><button onClick={onPause}>{paused ? "Resume demo" : "Pause demo"}</button><button onClick={onFinish}>Skip demo</button></div>
    </aside>
  </>;
}
