import type { SpaceWeatherEvent } from "./types";

/** Parse raw DONKI SEP items, tolerating missing fields (research R5). */
export function parseSepEvents(raw: unknown): SpaceWeatherEvent[] {
  if (!Array.isArray(raw)) return [];
  const events: SpaceWeatherEvent[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.sepID === "string" ? o.sepID : null;
    const eventTime = typeof o.eventTime === "string" ? o.eventTime : null;
    if (!id || !eventTime) continue;
    const instruments = Array.isArray(o.instruments)
      ? o.instruments
          .map((i) =>
            i && typeof i === "object" && typeof (i as Record<string, unknown>).displayName === "string"
              ? ((i as Record<string, unknown>).displayName as string)
              : null,
          )
          .filter((x): x is string => x !== null)
      : [];
    events.push({
      id,
      eventTime,
      instruments,
      link: typeof o.link === "string" ? o.link : undefined,
    });
  }
  return events.sort((a, b) => b.eventTime.localeCompare(a.eventTime));
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
