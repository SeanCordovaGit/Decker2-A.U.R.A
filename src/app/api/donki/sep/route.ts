import { NextResponse } from "next/server";
import cache from "@/data/donki-sep-cache.json";
import { isoDate, parseSepEvents } from "@/lib/donki";
import type { SpaceWeatherResponse } from "@/lib/types";

const MAX_EVENTS = 20;
const TIMEOUT_MS = 5000;

function cachedResponse(): SpaceWeatherResponse {
  const c = cache as { fetchedAt: string | null; raw: unknown };
  return {
    source: "nasaCached",
    fetchedAt: c.fetchedAt,
    events: parseSepEvents(c.raw).slice(0, MAX_EVENTS),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  // DONKI rejects ranges longer than 60 days
  const daysParam = Number(url.searchParams.get("days") ?? "60");
  const days = Math.min(60, Math.max(1, Number.isFinite(daysParam) ? Math.round(daysParam) : 60));

  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const upstream = `https://api.nasa.gov/DONKI/SEP?startDate=${isoDate(start)}&endDate=${isoDate(end)}&api_key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(upstream, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`DONKI ${res.status}`);
    const events = parseSepEvents(await res.json());
    if (events.length === 0) throw new Error("DONKI returned no events");
    const body: SpaceWeatherResponse = {
      source: "nasaLive",
      fetchedAt: new Date().toISOString(),
      events: events.slice(0, MAX_EVENTS),
    };
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(cachedResponse());
  }
}
