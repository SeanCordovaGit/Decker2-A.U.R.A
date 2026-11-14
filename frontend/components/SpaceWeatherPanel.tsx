"use client";

import { ExternalLink, Play } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";
import { useSpaceWeather } from "@/lib/useSpaceWeather";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export default function SpaceWeatherPanel() {
  const { data, failed } = useSpaceWeather();
  const replay = useAuraStore((s) => s.replaySep);
  const replayId = useAuraStore((s) => (s.scenarioId === "sep" ? s.replayEvent?.id : null));

  return (
    <Card className="shrink-0" aria-label="NASA space weather">
      <CardHeader>
        <CardTitle>NASA space weather</CardTitle>
        {data && (
          <CardAction>
            <Badge variant={data.source === "nasaLive" ? "tag-signal" : "tag-caution"}>{data.source === "nasaLive" ? "Live" : "Cached"}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
      <p className="text-[12px] text-ink-2">Solar energetic particle events from NASA DONKI. Replay one to drive the radiation aura.</p>

      {!data && !failed && (
        <ul className="mt-3 space-y-1.5" aria-busy>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-11 animate-pulse rounded-[5px] bg-panel-2" />
          ))}
        </ul>
      )}
      {failed && <p className="mt-3 text-[12px] text-caution">Space weather could not load. Reload the page; the app also works without it.</p>}
      {data && data.events.length === 0 && <p className="mt-3 text-[12px] text-ink-3">No solar particle events in the live window or the bundled cache.</p>}

      {data && data.events.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {data.events.slice(0, 6).map((e) => {
            const on = replayId === e.id;
            return (
              <li key={e.id} className={`flex items-center gap-2 rounded-[5px] border px-2.5 py-2 ${on ? "border-signal-text/60 bg-signal-soft" : "border-line bg-panel-2"}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[12px] tnum text-ink">{fmt(e.eventTime)}</p>
                  <p className="truncate text-[11px] text-ink-3" title={e.instruments.join(", ")}>
                    {e.instruments[0] ?? "Instrument not listed"}
                  </p>
                </div>
                {e.link && (
                  <Button asChild variant="ghost" size="icon-sm" className="text-ink-3">
                    <a href={e.link} target="_blank" rel="noreferrer" aria-label="Open event in NASA DONKI">
                      <ExternalLink aria-hidden />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="xs" onClick={() => replay(e)} aria-pressed={on}>
                  <Play aria-hidden /> {on ? "Replaying" : "Replay"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {data?.fetchedAt && (
        <p className="mt-2 font-mono text-[11px] text-ink-3">
          {data.source === "nasaCached" ? "Cache from" : "Fetched"} {fmt(data.fetchedAt)}
        </p>
      )}
      </CardContent>
    </Card>
  );
}
