import cache from "@aura/core/data/donki-sep-cache.json";
import { isoDate, parseSepEvents } from "@aura/core/lib/donki";
import type { SpaceWeatherResponse } from "@aura/core/lib/types";

const MAX_EVENTS = 20;
const TIMEOUT_MS = 5000;
const MEMO_MS = 60 * 60 * 1000;

// One upstream call per hour per server: DEMO_KEY is rate-limited and every page load hits this route.
let memo: { at: number; days: number; body: SpaceWeatherResponse } | null = null;

function cachedResponse(): SpaceWeatherResponse {
  const c = cache as { fetchedAt: string | null; raw: unknown };
  return { source: "nasaCached", fetchedAt: c.fetchedAt, events: parseSepEvents(c.raw).slice(0, MAX_EVENTS) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  // DONKI rejects ranges longer than 60 days
  const daysParam = Number(url.searchParams.get("days") ?? "60");
  const days = Math.min(60, Math.max(1, Number.isFinite(daysParam) ? Math.round(daysParam) : 60));
  const now = Date.now();
  if (memo && memo.days === days && now - memo.at < MEMO_MS) return Response.json(memo.body);

  const start = new Date(now - days * 86_400_000);
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const upstream = `https://api.nasa.gov/DONKI/SEP?startDate=${isoDate(start)}&endDate=${isoDate(new Date(now))}&api_key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(upstream, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) throw new Error(`DONKI ${res.status}`);
    const text = await res.text();
    const events = parseSepEvents(text.trim() ? JSON.parse(text) : []);
    if (events.length === 0) throw new Error("DONKI returned no events");
    const body: SpaceWeatherResponse = {
      source: "nasaLive",
      fetchedAt: new Date(now).toISOString(),
      events: events.slice(0, MAX_EVENTS),
    };
    memo = { at: now, days, body };
    return Response.json(body);
  } catch {
    return Response.json(cachedResponse());
  }
}
