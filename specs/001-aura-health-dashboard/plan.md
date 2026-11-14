# Implementation Plan: A.U.R.A. Astronaut Health Aura Dashboard

**Branch**: `claude/pensive-euler-l3hy0f` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-aura-health-dashboard/spec.md`

## Summary

A single Next.js web app showing a rotatable 3D astronaut built from body-region meshes. A 1 Hz
simulation engine produces readings (simulated crew data + real NASA DONKI solar particle events)
that are evaluated against one typed threshold configuration. Each evaluated hazard drives an aura
(color = category, steady/pulsing = caution/critical), a status badge, an alert with citation,
recommended action and escalation target, and an alert log entry. A local lexicon sentiment scorer
feeds the Mental Health Index and discrepancy detection. Scenario buttons script the demo. NASA
data is fetched through a route handler with a bundled cache fallback so the app runs offline.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Package manager**: pnpm (as set up on `main`)

**Primary Dependencies**: Next.js 16 (App Router, Turbopack), React 19, @react-three/fiber 9,
@react-three/drei 10, three, Zustand 5, Tailwind CSS 4. Charts: hand-written SVG sparklines
(Recharts dropped — see research R6).

**Storage**: N/A (in-memory store; bundled JSON cache for NASA data)

**Testing**: Vitest (pure logic modules only)

**Target Platform**: Desktop browser (Chrome/Edge) on laptop and projector; deploy on Vercel

**Project Type**: Web application (single Next.js app, frontend + one route handler)

**Performance Goals**: 60 fps 3D on a typical laptop; aura reacts ≤3 s after a scenario trigger;
journal → MHI update ≤2 s

**Constraints**: Must run fully offline after `pnpm install`; deadline 2026-11-15 23:59; no external
AI services

**Scale/Scope**: 1 astronaut, 1 page, ~8 scenarios, 6 hazard categories, ~10 metrics

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Demo-First | Every component maps to a demo-visible user story; no hidden features | ✅ Pass |
| II. Scientific Honesty | Every threshold carries a citation; team-defined thresholds are labeled as such; "Simulated" labels | ✅ Pass (R1–R4) |
| III. NASA Data + Fallback | DONKI route handler + bundled cache + live/cached label | ✅ Pass (R5) |
| IV. Single Source of Truth | `config/aura.ts` holds thresholds, colors, actions, escalation, citations | ✅ Pass |
| V. Visual Clarity | Color = category, pulse = severity, nominal = no aura | ✅ Pass |
| VI. Simplicity | One Next.js app, no DB, no separate backend; deps limited to 3D, state, styling | ✅ Pass |
| VII. Crew Autonomy | Discrepancy alerts go to astronaut only; escalation rules explicit in config | ✅ Pass |
| VIII. Lightweight Verification | Vitest for evaluate/severity/MHI/discrepancy/sentiment; manual demo script | ✅ Pass |

**Post-design re-check**: ✅ No violations introduced by data model or contracts.

## Project Structure

### Documentation (this feature)

```text
specs/001-aura-health-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── donki-sep-route.md
│   └── aura-config.md
└── tasks.md
```

### Source Code (repository root)

The team's Next.js 16 app on `main` (create-next-app, pnpm, `app/` at the repository root,
`@/*` → `./*`) is the base. New folders are added next to `app/`:

```text
app/
├── layout.tsx
├── page.tsx                      # Dashboard layout
├── globals.css
└── api/donki/sep/route.ts        # NASA DONKI proxy + cache fallback
config/
└── aura.ts                       # Thresholds, colors, actions, escalation, citations, measurements
data/
└── donki-sep-cache.json          # Bundled NASA DONKI SEP snapshot (real data, already committed)
lib/
├── types.ts                      # Shared domain types
├── evaluate.ts                   # Threshold → severity, hazard aggregation, alerts
├── mhi.ts                        # Mental Health Index + discrepancy
├── sentiment.ts                  # Lexicon sentiment scorer
├── donki.ts                      # DONKI SEP parser
├── scenarios.ts                  # Scenario definitions
└── simulation.ts                 # Baseline readings + per-tick update
store/
└── useAuraStore.ts               # Zustand store, tick loop, alert log, escalation timers
components/
├── AstronautScene.tsx            # R3F canvas, body regions, auras
├── StatusPanel.tsx               # Category badges + overall status
├── AlertList.tsx                 # Active alerts with detail + alert log
├── ScenarioControls.tsx          # Demo buttons + reset
├── VitalsCharts.tsx              # SVG sparklines
├── JournalPanel.tsx              # Journal input, MHI breakdown, discrepancy
├── SpaceWeatherPanel.tsx         # DONKI events, live/cached label, replay
└── MeasurementsPanel.tsx         # What is measured, device, why
scripts/
└── fetch-donki.mjs               # Refreshes data/donki-sep-cache.json from DONKI
tests/
└── unit/
    ├── evaluate.test.ts
    ├── mhi.test.ts
    └── sentiment.test.ts
```

**Structure Decision**: single Next.js project at repository root. Pure logic in `lib` (unit
tested, no React), configuration in `config`, UI in `components`, one server route in
`app/api`.

## Complexity Tracking

No constitution violations to justify.
