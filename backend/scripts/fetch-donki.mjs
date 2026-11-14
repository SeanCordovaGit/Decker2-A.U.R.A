// Refreshes src/data/donki-sep-cache.json with REAL NASA DONKI SEP data.
// Usage: npm run fetch:donki   (uses NASA_API_KEY from env, falls back to DEMO_KEY)
// Behind an HTTPS proxy on Node >= 22.21, run with NODE_USE_ENV_PROXY=1.
// The cache must never be hand-written: it is the offline fallback for the demo.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "..", "data", "donki-sep-cache.json");

// DONKI rejects ranges longer than 60 days, so fetch in 60-day chunks (2 years total).
const CHUNK_DAYS = 60;
const CHUNKS = 12;
const iso = (d) => d.toISOString().slice(0, 10);
const key = process.env.NASA_API_KEY || "DEMO_KEY";

const byId = new Map();
let end = new Date();
for (let i = 0; i < CHUNKS; i++) {
  const start = new Date(end.getTime() - CHUNK_DAYS * 86_400_000);
  const url = `https://api.nasa.gov/DONKI/SEP?startDate=${iso(start)}&endDate=${iso(end)}&api_key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) {
    console.error(`DONKI request failed for ${iso(start)}..${iso(end)}: HTTP ${res.status}.`);
    if (res.status === 429) console.error("Rate limited: use your own NASA_API_KEY (api.nasa.gov) instead of DEMO_KEY.");
    if (byId.size === 0) {
      console.error("No events fetched. Cache left unchanged.");
      process.exit(1);
    }
    console.error("Saving the events fetched so far.");
    break;
  }
  const text = await res.text();
  const raw = text.trim() ? JSON.parse(text) : [];
  if (!Array.isArray(raw)) {
    console.error("Unexpected DONKI response (not an array). Cache left unchanged.");
    process.exit(1);
  }
  for (const item of raw) if (item && item.sepID) byId.set(item.sepID, item);
  end = new Date(start.getTime() - 86_400_000);
}

const raw = [...byId.values()].sort((a, b) => String(b.eventTime).localeCompare(String(a.eventTime)));
await writeFile(out, JSON.stringify({ fetchedAt: new Date().toISOString(), raw }, null, 2) + "\n");
console.log(`Saved ${raw.length} SEP events to ${path.relative(process.cwd(), out)}`);
