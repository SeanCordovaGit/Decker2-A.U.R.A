---
description: "Task list for A.U.R.A. Astronaut Health Aura Dashboard"
---

# Tasks: A.U.R.A. Astronaut Health Aura Dashboard

**Input**: Design documents from `specs/001-aura-health-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are required by the constitution (Principle VIII) for threshold evaluation,
severity, MHI, discrepancy and sentiment only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US6)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Next.js 16 + TypeScript + Tailwind 4 app initialized at repo root on `main` (pnpm, `app/`, `@/*` → `./*`); restyle `app/layout.tsx` and `app/globals.css` with a dark space theme
- [X] T001a Split into a pnpm workspace: Next.js app moved to `frontend/`, pure logic package `@aura/core` in `backend/` (bundled cache now at `backend/data/donki-sep-cache.json`); frontend imports `@aura/core/config/*`, `@aura/core/lib/*`, `@aura/core/data/*`
- [ ] T002 `pnpm --filter frontend add three @react-three/fiber @react-three/drei zustand`, `pnpm --filter frontend add -D @types/three`, `pnpm --filter @aura/core add -D vitest`; add scripts `test` (`vitest run`) and `fetch:donki` (`node --env-file-if-exists=../.env.local scripts/fetch-donki.mjs`, so it reads the root `.env.local`) to `backend/package.json`, and `test` / `fetch:donki` (`pnpm --filter @aura/core <script>`) to the root `package.json`
- [ ] T003 [P] Create `backend/vitest.config.ts` including `tests/unit/**/*.test.ts` and `backend/tsconfig.json` (strict, `moduleResolution: bundler`, `resolveJsonModule`, `noEmit`); backend files use relative imports, no `@` alias
- [X] T004 [P] Document `NASA_API_KEY` in README (main's `.gitignore` already ignores `.env*`); use `.env.local` locally and the Vercel env setting in production

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T005 Define domain types in `backend/lib/types.ts`: `Severity` (`nominal | caution | critical`), `HazardCategory` (`radiation | air | cabinHot | cabinCold | mental | injury`), `BodyRegion` (`head | chest | back | leftArm | rightArm | leftHand | rightHand | leftLeg | rightLeg`), `EscalationTarget` (`none | crew | flightSurgeon`), `DataSource` (`simulated | nasaLive | nasaCached`), `Readings`, `ThresholdRule`, `Citation`, `MetricStatus`, `CategoryStatus`, `Alert`, `MhiResult`, `JournalEntry`, `SpaceWeatherEvent`, `Scenario`, `AstronautProfile` per data-model.md
- [ ] T006 Create single source of truth `backend/config/aura.ts` exporting `CITATIONS`, `CATEGORY_META` (colors radiation `#22c55e`, air `#9ca3af`, cabinHot `#f97316`, cabinCold `#3b82f6`, mental `#facc15`, injury `#ef4444`), `SEVERITY_META`, `THRESHOLD_RULES` (doseRate, cumulativeDose, co, co2, cabinTemp, coreTemp with values from research.md R1–R3, inclusive bounds, actions per severity, `verified`/`teamDefined` flags), `MHI_CONFIG` (weights 0.5/0.2/0.3, caution 60, critical 40, discrepancyGap 30), `ESCALATION` (`cautionPersistSeconds: 20`), `MEASUREMENTS`, `PROFILE`
- [ ] T007 Implement `backend/lib/evaluate.ts`: `severityFor(rule, value)` (inclusive thresholds), `evaluateReadings(readings, mhi)` → `MetricStatus[]` and `CategoryStatus[]` (category severity = max; cabinTemp high → cabinHot, low → cabinCold; coreTemp → injury/chest; CO critical adds head+chest to injury; injuries map → injury regions; `sepActive` forces radiation ≥ caution), `buildAlerts(...)`
- [ ] T008 [P] Implement `backend/lib/simulation.ts`: `NOMINAL_READINGS` per data-model.md defaults, `clampReadings`, `tickReadings(prev, scenario, elapsed)` adding small noise and drifting toward scenario targets
- [ ] T009 [P] Unit tests for evaluate in `backend/tests/unit/evaluate.test.ts` (boundary inclusivity, high/low directions, category aggregation, CO critical → head+chest, config invariants from contracts/aura-config.md)
- [ ] T010 Create Zustand store `frontend/store/useAuraStore.ts`: readings, history (last 60 ticks), active scenario + elapsed, journal entries, MHI, statuses, active alerts, alert log (max 100), escalation timers (caution → flightSurgeon after `ESCALATION.cautionPersistSeconds`), `tick()`, `triggerScenario(id)`, `reset()`, `submitJournal(text)`, `replaySep(event)`
- [ ] T011 Create dashboard shell `frontend/app/page.tsx` with grid layout (left: status + alerts, center: 3D scene, right: scenarios, journal, space weather; bottom: charts, measurements) and a 1 Hz tick hook in `frontend/components/TickDriver.tsx`

**Checkpoint**: Foundation ready

---

## Phase 3: User Story 1 - See status at a glance (P1) 🎯 MVP

**Goal**: 3D astronaut with category-colored auras, localized injury highlights, status badges.

**Independent Test**: set readings to caution/critical per category; aura color/location/pulse match rules; nominal shows no aura.

- [ ] T012 [US1] Build `frontend/components/AstronautScene.tsx`: R3F `Canvas`, `OrbitControls`, lights, starfield, astronaut from primitive meshes keyed by `BodyRegion` (helmet with visor, torso, backpack, arms, gloves, legs, boots); injury regions use emissive `#ef4444` with pulse on critical
- [ ] T013 [US1] Add aura shells in `frontend/components/AstronautScene.tsx`: one additive-blended transparent shell per active environmental category (radiation, air, cabinHot, cabinCold) at increasing radii; mental shell around head/torso; opacity from `SEVERITY_META`, sinusoidal pulse for critical; none when nominal
- [ ] T014 [P] [US1] Build `frontend/components/StatusPanel.tsx`: overall status ("All nominal" / count of active hazards), one badge per category with green/amber/red severity and category color swatch, "Simulated crew data" label

---

## Phase 4: User Story 2 - Understand and act on alerts (P1)

**Goal**: alert cards with reading, threshold, citation, severity, action, escalation; alert log.

**Independent Test**: trigger one alert per category; all six fields visible; escalation follows rule.

- [ ] T015 [US2] Build `frontend/components/AlertList.tsx`: active alerts sorted by severity showing value+unit, threshold crossed, citation text (with "verify"/"team-defined" tag), recommended action, escalation target ("Crew – self-manage" / "Flight surgeon"), escalated badge; astronaut-only tag for discrepancy
- [ ] T016 [US2] Add alert log tab in `frontend/components/AlertList.tsx` (time, category, severity, escalation), bounded to last 100

---

## Phase 5: User Story 3 - Demo scenarios (P1)

**Goal**: buttons that trigger realistic events and reset.

**Independent Test**: each button changes aura + alert ≤3 s; Reset returns to nominal.

- [ ] T017 [US3] Define scenarios in `backend/lib/scenarios.ts`: `sep` (doseRate ramps to 12, sepActive), `coLeak` (co ramps to 70), `co2Buildup` (co2 to 4.2), `cabinOverheat` (cabinTemp to 29), `fever` (coreTemp to 38.9), `sleepDeprivation` (sleepHours 3.5, hrv 25, restingHR 80, affect 45), `evaHandInjury` (injuries.rightHand critical), `imFine` (strained biometrics + journal "I'm fine, everything is good, feeling great")
- [ ] T018 [US3] Build `frontend/components/ScenarioControls.tsx`: button per scenario with short description, active highlight, Reset button

---

## Phase 6: User Story 4 - NASA space weather (P2)

**Goal**: real DONKI SEP events with live/cached label and replay.

**Independent Test**: online shows "Live NASA data"; offline shows "Cached NASA data"; replay raises radiation.

- [ ] T019 [US4] Create `backend/scripts/fetch-donki.mjs` that fetches DONKI SEP in 60-day chunks for about 2 years (`NASA_API_KEY` or `DEMO_KEY`; DONKI rejects ranges over 60 days), merges by `sepID`, saves partial results on HTTP 429, and writes `{ fetchedAt, raw }` to `backend/data/donki-sep-cache.json` (already committed with 17 real SEP events); never fabricates data
- [ ] T020 [US4] Implement route `frontend/app/api/donki/sep/route.ts` per contracts/donki-sep-route.md (5 s timeout, `days` default 60 and clamp 1–60, fallback to cache on any failure or empty list, newest first, max 20, never error status) with parser `backend/lib/donki.ts` tolerant of missing fields
- [ ] T021 [US4] Build `frontend/components/SpaceWeatherPanel.tsx`: fetch on mount, list events (date, instruments, link), source label "Live NASA data" / "Cached NASA data", empty-state text, "Replay" button calling `replaySep`

---

## Phase 7: User Story 5 - Mental Health Index & discrepancy (P2)

**Goal**: journal sentiment → MHI with breakdown and discrepancy alert.

**Independent Test**: positive journal + strained biometrics → discrepancy; negative journal lowers MHI.

- [ ] T022 [P] [US5] Implement `backend/lib/sentiment.ts`: lexicon scorer with negation ("not", "never", "n't") and intensifiers, returns −1..1 and 0–100; entries with < 3 words return null
- [ ] T023 [P] [US5] Implement `backend/lib/mhi.ts`: `biometricScore(readings, profile)` (HRV, resting HR suppressed when `activityLevel ≥ 0.6`, sleep, CO2 penalty), `computeMhi({biometrics, affect, journal})` with proportional weight redistribution for null sources, severity by `MHI_CONFIG`, discrepancy when any pair gap > `discrepancyGap`
- [ ] T024 [P] [US5] Unit tests `backend/tests/unit/mhi.test.ts` (weights, redistribution, exertion suppression, discrepancy) and `backend/tests/unit/sentiment.test.ts` (positive, negative, negation, short text)
- [ ] T025 [US5] Build `frontend/components/JournalPanel.tsx`: textarea + submit, latest sentiment, MHI gauge, per-source breakdown with weights (missing shown), discrepancy notice addressed to astronaut

---

## Phase 8: User Story 6 - Vitals, log, measurements (P3)

**Goal**: sparklines and measurements reference.

**Independent Test**: scenario change visible on chart; measurements panel lists every metric with device and reason.

- [ ] T026 [P] [US6] Build `frontend/components/VitalsCharts.tsx`: SVG sparklines for heart rate, HRV, core temp, dose rate, CO, CO2, cabin temp from store history with current value and caution line
- [ ] T027 [P] [US6] Build `frontend/components/MeasurementsPanel.tsx` rendering `MEASUREMENTS` (metric, onboard device type, why it matters in space) and the four challenge objectives mapping

---

## Phase 9: Polish & Cross-Cutting

- [ ] T028 Write project `README.md`: concept, color legend, data honesty note, setup commands, demo script from quickstart.md
- [ ] T029 Run `pnpm test` and `pnpm build`; fix failures
- [ ] T030 Run the app and walk quickstart.md validation scenarios 1–13 (headless browser screenshot check)

---

## Dependencies & Execution Order

- Setup (T001–T004) → Foundational (T005–T011) → user stories.
- US1, US2, US3 depend only on Foundational; US3 scenarios are needed to demo US1/US2 visually.
- US4 depends on T010 (`replaySep`). US5 depends on T010 (`submitJournal`); T022–T024 are pure and can start right after T005–T006.
- US6 depends on store history (T010).
- Polish after all stories.

## Parallel Examples

- After T006: T007, T008, T022, T023 in parallel (separate pure modules).
- US1: T014 parallel with T012–T013.
- US6: T026 and T027 in parallel.

## Implementation Strategy

1. MVP = Phases 1–5 (US1–US3): 3D auras + alerts + scenario buttons — enough to pitch.
2. Add US4 (NASA data — required by the challenge), then US5 (journal demo).
3. US6 and polish if time remains.
