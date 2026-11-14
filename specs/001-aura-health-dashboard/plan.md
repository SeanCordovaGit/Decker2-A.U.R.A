# Implementation Plan: A.U.R.A. Astronaut Health Aura Dashboard

**Branch**: `main` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

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

**Language/Version**: TypeScript 5.x, Node.js 22.13+ (required by pnpm 11)

**Package manager**: pnpm 11 workspace

**Primary Dependencies**: Next.js 16 (App Router, Turbopack), React 19, @react-three/fiber 9,
@react-three/drei 10, three, Zustand 5, Tailwind CSS 4. Charts: hand-written SVG sparklines
(Recharts dropped — see research R6).

**Storage**: N/A (in-memory store; bundled JSON cache for NASA data)

**Testing**: Vitest (pure logic modules only)

**Target Platform**: Desktop browser (Chrome/Edge) on laptop and projector; deploy on Vercel;
`docker compose up --build` as an alternative way to run it

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
| IV. Single Source of Truth | `backend/config/aura.ts` holds thresholds, colors, actions, escalation, citations | ✅ Pass |
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

### Source Code (pnpm workspace)

pnpm workspace with two packages. `frontend/` is the team's Next.js 16 app (create-next-app,
`@/*` → `frontend/`). `backend/` is `@aura/core`, pure TypeScript consumed by the frontend through
its `exports` map (`@aura/core/config/*`, `@aura/core/lib/*`, `@aura/core/data/*`); Turbopack
compiles it, so it has no build step.

**Current state (2026-11-14):** only the workspace, the create-next-app scaffold, the installed
dependencies, the Docker files, the smoke test and the NASA cache exist. Everything marked
`(planned)` is still to be written; `tasks.md` gives the order.

```text
package.json                      # Root scripts delegate via pnpm --filter
pnpm-workspace.yaml               # packages: frontend, backend
Dockerfile                        # Production image (pnpm build + pnpm start)
.env.example                      # NASA_API_KEY template; copy to .env.local (root, shared)
docker-compose.yml                # Runs the image on port 3000, reads .env.local
.dockerignore
frontend/
├── package.json                  # Deps installed: three, R3F, drei, zustand, @types/three
├── app/
│   ├── layout.tsx                # create-next-app scaffold, to be restyled (T001)
│   ├── page.tsx                  # create-next-app scaffold, becomes the dashboard (T011)
│   ├── globals.css               # create-next-app scaffold, to be restyled (T001)
│   └── api/donki/sep/route.ts    # (planned) NASA DONKI proxy + cache fallback
├── store/
│   └── useAuraStore.ts           # (planned) Zustand store, tick loop, alert log, escalation timers
└── components/                   # (planned)
    ├── AstronautScene.tsx        # R3F canvas, body regions, auras
    ├── StatusPanel.tsx           # Category badges + overall status
    ├── AlertList.tsx             # Active alerts with detail + alert log
    ├── ScenarioControls.tsx      # Demo buttons + reset
    ├── VitalsCharts.tsx          # SVG sparklines
    ├── JournalPanel.tsx          # Journal input, MHI breakdown, discrepancy
    ├── SpaceWeatherPanel.tsx     # DONKI events, live/cached label, replay
    └── MeasurementsPanel.tsx     # What is measured, device, why
backend/                          # @aura/core
├── package.json                  # exports map; vitest installed; `test` script
├── smoke-test.sh                 # Checks the running app against contracts/donki-sep-route.md
├── config/
│   └── aura.ts                   # (planned) Thresholds, colors, actions, escalation, citations, measurements
├── data/
│   └── donki-sep-cache.json      # Bundled NASA DONKI SEP snapshot (real data, 17 events)
├── lib/                          # (planned)
│   ├── types.ts                  # Shared domain types
│   ├── evaluate.ts               # Threshold → severity, hazard aggregation, alerts
│   ├── mhi.ts                    # Mental Health Index + discrepancy
│   ├── sentiment.ts              # Lexicon sentiment scorer
│   ├── donki.ts                  # DONKI SEP parser
│   ├── scenarios.ts              # Scenario definitions
│   └── simulation.ts             # Baseline readings + per-tick update
├── scripts/
│   └── fetch-donki.mjs           # (planned) Refreshes data/donki-sep-cache.json from DONKI
└── tests/unit/                   # (planned)
    ├── evaluate.test.ts
    ├── mhi.test.ts
    └── sentiment.test.ts
```

**Structure Decision**: one deployable Next.js app (Vercel Root Directory `frontend`) plus a
logic-only workspace package. Pure logic, configuration and unit tests in `backend` (no React,
no server); UI, store and the one server route in `frontend`. Constitution Principle VI still
holds: `backend` is a library, not a separate service.

## Complexity Tracking

No constitution violations to justify.
