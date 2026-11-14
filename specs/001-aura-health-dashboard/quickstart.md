# Quickstart & Validation: A.U.R.A.

## Prerequisites

- Node.js 20+ and pnpm
- Optional: NASA API key from api.nasa.gov in `.env.local` as `NASA_API_KEY=...`

## Setup

```bash
pnpm install
pnpm fetch:donki   # refresh the bundled NASA cache (needs network + personal NASA_API_KEY)
pnpm test              # unit tests: thresholds, severity, MHI, discrepancy, sentiment
pnpm dev           # http://localhost:3000
```

## Validation scenarios

| # | Action | Expected |
|---|---|---|
| 1 | Load page | Model visible, no aura, "All nominal", "Simulated" labels on crew data |
| 2 | Space Weather panel | Events listed with dates; label "Live NASA data" (or "Cached NASA data" offline) |
| 3 | Click "Solar particle event" | Green aura, steady then pulsing; radiation alert with NASA-STD-3001 citation |
| 4 | Click "CO leak" | Gray aura; at critical, head + chest glow red; alert escalates to Flight surgeon |
| 5 | Click "CO2 buildup" | Gray aura (caution); MHI biometric score drops |
| 6 | Click "Cabin overheat" | Orange aura |
| 7 | Click "Fever" | Chest glows red; alert shows deviation from personal baseline |
| 8 | Click "Sleep deprivation" | Yellow aura; MHI below 60 |
| 9 | Click "EVA hand injury" | Right hand glows red only |
| 10 | Click "I'm fine discrepancy" | Strained biometrics + positive journal → discrepancy alert, astronaut-only |
| 11 | Type a negative journal entry | MHI updates ≤2 s; journal component lowered |
| 12 | Leave a caution alert active 20 s | Escalation changes to Flight surgeon |
| 13 | Click "Reset" | All auras gone, "All nominal" |
| 14 | Disable network, reload | Everything above still works; NASA label shows cached |

## Build check

```bash
pnpm build
```
