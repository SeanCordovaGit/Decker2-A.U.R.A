"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { PROFILE } from "@aura/core/config/aura";
import { useAuraStore } from "@/store/useAuraStore";
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

export default function TopBar({ onOpenReference }: { onOpenReference: () => void }) {
  const clock = useMissionClock();
  const selectedCrewId = useAuraStore((state) => state.selectedCrewId);

  return (
    <header className="hud-glass mission-header">
      <div className="mission-brand">
        <AuraMark />
        <div>
          <h1>Decker2 A.U.R.A.</h1>
          <p>Astronaut health monitor</p>
        </div>
      </div>
      <dl className="mission-header-data">
        <div>
          <dt>Crew</dt>
          <dd>{selectedCrewId ?? PROFILE.callsign}</dd>
        </div>
        <div>
          <dt>Mission clock</dt>
          <dd className="tnum">{clock}</dd>
        </div>
      </dl>
      <Button variant="ghost" size="sm" onClick={onOpenReference} className="mission-reference">
        <BookOpen aria-hidden /> Reference
      </Button>
    </header>
  );
}
