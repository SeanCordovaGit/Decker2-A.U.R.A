# Implementation Plan: Align A.U.R.A. with the Revised Research

**Branch**: `feat/research-alignment` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-research-alignment/spec.md`

## Summary

Bring the thresholds, readings and citations in line with the team's revised research. All logic changes live in `@aura/core` (`backend/`): CO tiers with a flight-surgeon escalation tier, mental-fatigue bands with the research's exact comparisons (MHI, PVT+ reaction time, PVT+ lapses, HRV absolute and % of baseline), absorbed dose in gray that lights a new lower-abdomen region at 1.0 Gy, a 150 mSv cumulative caution, updated citations and CO wording, and scenarios that reach the new tiers. The frontend only gains the abdomen anchor, the new readings in existing panels and one scenario button. RR-1 playback is deferred (spec FR-022).

## Technical Context

**Language/Version**: TypeScript 5, Node.js 20+

**Primary Dependencies**: unchanged (Next.js 16, React 19, three.js / R3F, Zustand, shadcn/ui, Vitest). No new dependencies.

**Storage**: N/A

**Testing**: Vitest in `backend/tests/unit` (boundary tests for every new band and tier)

**Target Platform**: unchanged (desktop browser, Docker, Vercel)

**Project Type**: pnpm workspace: `frontend` (Next.js app) + `backend` (`@aura/core` pure logic)

**Performance Goals**: unchanged; CO leak scenario reaches 425 ppm within 15 s (SC-003)

**Constraints**: offline-capable; thresholds and colours only in `backend/config/aura.ts`; no fabricated data

**Scale/Scope**: 3 new readings/derived values, 1 new body region, 1 new scenario, ~8 citation updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Demo-First | Every change is triggerable: CO leak, sleep deprivation, new acute-dose scenario | ✅ Pass |
| II. Scientific Honesty | Each band cites its source; team-defined bands (10 ppm, HRV % drop) labelled; no mSv→Gy conversion | ✅ Pass |
| III. Real NASA Data | DONKI unchanged; RR-1 deferred, no placeholder data | ✅ Pass |
| IV. Single Source of Truth | All new thresholds in `backend/config/aura.ts` | ✅ Pass |
| V. Visual Clarity | Colour rules unchanged (clarification Q2); abdomen uses injury red | ✅ Pass |
| VI. Simplicity | No new dependencies, no new hazard category | ✅ Pass |
| VII. Crew Autonomy | Caution → crew, critical/escalated → flight surgeon; discrepancy stays astronaut-only | ✅ Pass |
| VIII. Lightweight Verification | Unit tests for every boundary; UI via quickstart | ✅ Pass |

**Post-design re-check**: ✅ No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-research-alignment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── aura-config-delta.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── config/aura.ts            # CO tiers, MENTAL_BANDS, absorbed dose rule, cumulative 150, citations, measurements
├── lib/
│   ├── types.ts              # abdomen region, pvtLapses, absorbedDoseGy, band/escalation types
│   ├── mental.ts             # NEW: band evaluation for PVT+, lapses, HRV (+ % drop)
│   ├── evaluate.ts           # CO escalation tier, early-warning citation, mental alerts per input, abdomen label
│   ├── simulation.ts         # new readings, limits, noise
│   └── scenarios.ts          # CO leak to acute tier, sleep/imFine lapses, new acute-dose scenario
└── tests/unit/
    ├── evaluate.test.ts      # CO tiers, cumulative 150, abdomen 1.0 Gy
    └── mental.test.ts        # NEW: every band boundary
frontend/components/
├── AstronautScene.tsx        # abdomen anchor + label
├── MindPanel.tsx             # PVT+ time, lapses, HRV with band badges
├── StatusPanel.tsx           # acute absorbed dose line
└── ScenarioPanel.tsx         # icon for the acute-dose scenario
```

**Structure Decision**: same workspace as spec 001; one new pure module (`backend/lib/mental.ts`) keeps band logic testable without React.

## Complexity Tracking

No constitution violations to justify.
