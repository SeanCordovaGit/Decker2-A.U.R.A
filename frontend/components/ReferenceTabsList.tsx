"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { TabsList } from "./ui/tabs";

export default function ReferenceTabsList({ value, animate, children }: { value: string; animate: boolean; children: ReactNode }) {
  const list = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const motion = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const element = list.current;
    const pill = indicator.current;
    if (!element || !pill) return;

    const update = () => {
      const active = element.querySelector<HTMLElement>('[data-state="active"]');
      if (!active) return;
      const previous = pill.getBoundingClientRect();
      const origin = element.getBoundingClientRect();
      const x = active.offsetLeft;
      const y = active.offsetTop;
      const width = active.offsetWidth;
      const height = active.offsetHeight;
      motion.current?.cancel();
      pill.style.width = `${width}px`;
      pill.style.height = `${height}px`;
      pill.style.transform = `translate(${x}px, ${y}px)`;
      if (!animate || !previous.width || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      motion.current = pill.animate([
        { transform: `translate(${previous.left - origin.left}px, ${previous.top - origin.top}px) scale(${previous.width / width}, ${previous.height / height})` },
        { transform: `translate(${x}px, ${y}px) scale(1)` },
      ], { duration: 180, easing: getComputedStyle(element).getPropertyValue("--surface-ease").trim() });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [value, animate]);

  useLayoutEffect(() => () => { motion.current?.cancel(); }, []);

  return <TabsList ref={list} aria-label="Reference" className="reference-tabs-list h-auto flex-wrap">
    <span ref={indicator} className="reference-tab-indicator" aria-hidden />
    {children}
  </TabsList>;
}
