"use client";

import { useEffect, useRef } from "react";
import { useAuraStore } from "@/store/useAuraStore";

export default function LiveTrace() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    let sampledAt = performance.now();
    const unsubscribe = useAuraStore.subscribe((state, previous) => {
      if (state.t !== previous.t) sampledAt = performance.now();
    });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const draw = (now: number) => {
      const values = useAuraStore.getState().history.map((point) => point.heartRate);
      const low = Math.min(...values) - 4;
      const range = Math.max(...values) + 4 - low;
      const offset = reduced.matches ? 0 : Math.min((now - sampledAt) / 1000, 1);
      context.clearRect(0, 0, 900, 120);
      context.strokeStyle = "rgba(255,255,255,0.1)";
      context.lineWidth = 1;
      for (const y of [30, 60, 90]) { context.beginPath(); context.moveTo(0, y); context.lineTo(900, y); context.stroke(); }
      context.beginPath();
      values.forEach((value, index) => {
        const x = 884 - (values.length - 1 - index + offset) * 14.7;
        const y = 108 - ((value - low) / range) * 96;
        if (index) context.lineTo(x, y); else context.moveTo(x, y);
      });
      context.strokeStyle = "#efa9a9";
      context.lineWidth = 2.5;
      context.lineJoin = "round";
      context.stroke();
      const latest = values.at(-1)!;
      context.beginPath();
      context.arc(884 - offset * 14.7, 108 - ((latest - low) / range) * 96, 4, 0, Math.PI * 2);
      context.fillStyle = "#efa9a9";
      context.fill();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); unsubscribe(); };
  }, []);
  return <div className="live-trace"><div><span>Heart rate trend</span><span>60 s · Simulated</span></div><canvas ref={canvas} width={900} height={120} role="img" aria-label="Live heart rate graph from simulated telemetry, sampled once per second" /></div>;
}
