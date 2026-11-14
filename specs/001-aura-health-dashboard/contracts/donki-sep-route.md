# Contract: `GET /api/donki/sep`

Server route that proxies NASA DONKI Solar Energetic Particle (SEP) events with a cache fallback.

## Request

| Query param | Required | Default | Notes |
|---|---|---|---|
| `days` | no | `365` | Look-back window, clamped to 1–1095 |

Server env: `NASA_API_KEY` (optional; falls back to `DEMO_KEY`).

Upstream: `https://api.nasa.gov/DONKI/SEP?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&api_key=KEY`,
timeout 5 s.

## Response `200 application/json`

```json
{
  "source": "nasaLive",
  "fetchedAt": "2026-11-14T10:00:00.000Z",
  "events": [
    {
      "id": "string (DONKI sepID)",
      "eventTime": "ISO 8601 string",
      "instruments": ["string"],
      "link": "https://... (optional)"
    }
  ]
}
```

- `source` is `nasaCached` when upstream fails, times out, returns non-2xx, returns invalid JSON,
  or returns an empty list; then `events` comes from `src/data/donki-sep-cache.json` and
  `fetchedAt` is the cache file's recorded fetch time (or `null` if the cache is empty).
- Events sorted newest first; at most 20 returned.
- The route never responds with an error status; the UI always receives a valid body.

## Cache file `src/data/donki-sep-cache.json`

```json
{ "fetchedAt": "ISO string | null", "raw": [ /* untouched DONKI SEP response items */ ] }
```

Written only by `npm run fetch:donki`. Never hand-edited.
