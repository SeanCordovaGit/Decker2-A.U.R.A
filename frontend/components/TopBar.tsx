"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { PROFILE } from "@aura/core/config/aura";
import { useSpaceWeather } from "@/lib/useSpaceWeather";
import { Button } from "@/components/ui/button";

function useMissionClock() {
  const [elapsed, setElapsed] = useState<number | null>(null);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  if (elapsed === null) return "T+ --:--:--";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `T+ ${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor((elapsed % 3600) / 60))}:${pad(elapsed % 60)}`;
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => "dark",
  );
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        const root = document.documentElement;
        root.dataset.themeSwitching = "";
        root.dataset.theme = next;
        requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
        try {
          localStorage.setItem("aura-theme", next);
        } catch {}
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`${className} text-ink-2`}
    >
      {theme === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}

function AuraMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <circle cx="13" cy="13" r="11.5" fill="none" stroke="var(--signal)" strokeOpacity="0.35" />
      <circle cx="13" cy="13" r="8" fill="none" stroke="var(--signal)" strokeOpacity="0.7" />
      <circle cx="13" cy="10.5" r="2.4" fill="var(--text)" />
      <path d="M8.8 18.4c.6-2.6 2.2-4 4.2-4s3.6 1.4 4.2 4" fill="none" stroke="var(--text)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function TopBar() {
  const clock = useMissionClock();
  const { data, failed } = useSpaceWeather();
  const uplink = failed ? "NASA data unavailable" : !data ? "Connecting to NASA DONKI" : data.source === "nasaLive" ? "NASA DONKI live" : "NASA DONKI cached";
  const dot = failed ? "bg-critical" : !data ? "bg-ink-3" : data.source === "nasaLive" ? "bg-ok" : "bg-caution";

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-panel px-4 py-2.5 sm:px-5">
      <div className="flex flex-1 items-center gap-3 sm:flex-none">
        <AuraMark />
        <div className="leading-tight">
          <h1 className="text-[17px] font-bold tracking-[-0.02em] text-ink">
            Decker2 <span className="text-signal-text">A.U.R.A.</span>
          </h1>
          <p className="text-[12px] text-ink-3">Astro-Unified Response Algorithm</p>
        </div>
        <ThemeToggle className="ml-auto grid sm:hidden" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[12px]">
        <div className="flex items-center gap-2">
          <dt className="text-ink-3">Crew</dt>
          <dd className="text-ink">{PROFILE.callsign}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-3">Mission clock</dt>
          <dd className="tnum text-ink">{clock}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Uplink</dt>
          <dd className="flex items-center gap-2 text-ink-2">
            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
            {uplink}
          </dd>
        </div>
      </dl>
      <ThemeToggle className="hidden sm:grid" />
      </div>
    </header>
  );
}
