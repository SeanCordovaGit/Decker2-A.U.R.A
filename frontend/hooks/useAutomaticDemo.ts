"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuraStore } from "@/store/useAuraStore";

const SEEN_KEY = "aura.autoDemo.v1";
const SAMPLE_ENTRY = "I feel calm and rested today.";
export const DEMO_STEPS = [
  { id: "viewer", until: 4000, title: "Your astronaut, at the center", text: "The viewer rotates automatically. When the demo ends, drag to turn the astronaut and scroll or pinch to zoom." },
  { id: "crew", until: 8000, title: "Choose a crew profile", text: "Opening Crew status and loading AST-001. These are supplied demo readings, held as a snapshot until you start a scenario." },
  { id: "environment", until: 12000, title: "Check the cabin", text: "Environment expands here. Daily dose, air quality and cabin temperature stay beside the astronaut." },
  { id: "scenario", until: 18000, title: "Watch a condition develop", text: "Starting the Hand injury scenario. The right hand turns yellow at caution, then red at critical. These readings are simulated." },
  { id: "alerts", until: 22000, title: "Every alert explains itself", text: "Opening the real alert details: the reported condition, its basis, the suggested action and who should respond." },
  { id: "journal", until: 28000, title: "Try a private check-in", text: "Typing a sample entry, then opening Mental health. Sentiment is processed locally; the resulting MHI is a demo estimate." },
] as const;

export function useAutomaticDemo(ready: boolean) {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const clock = useRef(0);
  const saved = useRef<ReturnType<typeof useAuraStore.getState> | null>(null);
  const active = elapsed !== null;
  const stepIndex = active ? DEMO_STEPS.findIndex((step) => elapsed < step.until) : -1;
  const step = stepIndex >= 0 ? DEMO_STEPS[stepIndex] : null;

  const start = useCallback(() => {
    if (saved.current) return;
    saved.current = useAuraStore.getState();
    useAuraStore.getState().selectCrew(null);
    clock.current = 0;
    setPaused(false);
    setElapsed(0);
  }, []);

  const finish = useCallback(() => {
    if (saved.current) useAuraStore.setState(saved.current, true);
    saved.current = null;
    setElapsed(null);
    setPaused(false);
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* The demo remains usable when storage is unavailable. */ }
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".viewer-rotate")?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try { if (localStorage.getItem(SEEN_KEY)) return; } catch { /* Private browsing may block storage. */ }
      start();
    }, 0);
    return () => clearTimeout(timer);
  }, [ready, start]);

  useEffect(() => {
    if (!active || paused) return;
    const timer = setInterval(() => {
      clock.current += 1000;
      if (clock.current >= 28000) finish();
      else setElapsed(clock.current);
    }, 1000);
    return () => clearInterval(timer);
  }, [active, paused, finish]);

  useEffect(() => {
    const state = useAuraStore.getState();
    if (step?.id === "crew") state.selectCrew("AST-001");
    if (step?.id === "scenario") {
      state.selectCrew(null);
      useAuraStore.getState().triggerScenario("evaHandInjury");
    }
    if (step?.id === "journal") state.selectCrew(null);
  }, [step]);

  useEffect(() => {
    if (elapsed === 25000) useAuraStore.getState().submitJournal(SAMPLE_ENTRY);
  }, [elapsed]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      finish();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [active, finish]);

  useEffect(() => () => {
    if (saved.current) useAuraStore.setState(saved.current, true);
    saved.current = null;
  }, []);

  return { active, step, stepIndex, elapsed, paused, setPaused, start, finish, sampleText: active ? step?.id === "journal" && elapsed < 25000 ? SAMPLE_ENTRY : "" : undefined };
}
