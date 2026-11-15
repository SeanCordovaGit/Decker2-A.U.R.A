# Quickstart & Validation: Align A.U.R.A. with the Revised Research

## Run

```bash
pnpm install
pnpm test     # includes the new CO, mental-band and absorbed-dose boundary tests
pnpm dev      # http://localhost:3000
```

## Validation scenarios

| # | Action | Expected |
|---|---|---|
| 1 | Load page | All nominal; MHI panel shows PVT+ time, lapses and HRV as optimal |
| 2 | Click "CO leak", watch 15 s | Air quality caution at 10 ppm (crew, early warning, team-defined) → escalates to flight surgeon at 55 ppm (7-day limit) → critical at 425 ppm (acute 1-hour), head and chest glow; no alert mentions a confirmed fire |
| 3 | Click "Sleep deprivation" | PVT+ lapses ≥ 5 and reaction time > 350 ms → mental critical, flight surgeon, action mentions work-rest schedule and delaying high-risk tasks; alerts name each input |
| 4 | Click "How I feel" (the "I'm fine" mismatch), including right after another condition | Mental caution from lapses/HRV plus the astronaut-only discrepancy alert |
| 5 | Click "Acute radiation dose" | Absorbed dose climbs; at 1.0 Gy the lower abdomen glows red and the alert cites Poplaski et al. 2025 |
| 6 | Open any CO / PVT / temperature / radiation alert | Citations match research R7 |
| 7 | Reset | All nominal |
