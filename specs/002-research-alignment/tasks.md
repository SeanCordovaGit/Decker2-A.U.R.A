---
description: "Task list for aligning A.U.R.A. with the revised research"
---

# Tasks: Align A.U.R.A. with the Revised Research

> The 2026-11-15 supplied PDFs supersede earlier numeric assumptions in this checklist (notably 480 mSv, old temperature bands, and four-source MHI). Current delivery and verification are tracked in [updated-data.md](updated-data.md).

**Input**: Design documents from `specs/002-research-alignment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required by the constitution (Principle VIII) for threshold and severity logic: boundary tests for every new tier and band.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US5)

## Phase 1: Setup

No setup: the workspace, dependencies and test runner from spec 001 are reused.

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T001 Extend `backend/lib/types.ts`: add `"abdomen"` to `BodyRegion`; add `pvtLapses: number` ("count per 300 s PVT+ test") and `absorbedDoseGy: number` ("Gy (acute absorbed dose)") to `Readings`; add optional `escalateHigh`, `earlyWarningBelow`, `earlyCitationId`, `context` to `ThresholdRule`; add `BandOp = ">=" | ">" | "<=" | "<"`, `MentalBand` (`id`, `label`, `unit`, `caution: [BandOp, number]`, `critical: [BandOp, number]`, `citationId`, `actions`) and `MentalStatus`
- [ ] T002 Extend `backend/lib/simulation.ts`: `NOMINAL_READINGS.pvtLapses = 1`, `absorbedDoseGy = 0`; limits `pvtLapses [0, 30]`, `absorbedDoseGy [0, 20]`; small noise on `pvtLapses`. **Also lower `NOMINAL_READINGS.pvtReactionMs` from 255 to 230**: 255 ms is inside the new 250–350 ms warning band, so a healthy astronaut would start in caution
- [ ] T003 Add `"abdomen"` to `REGION_LABEL` in `backend/lib/evaluate.ts` ("Lower abdomen")

**Checkpoint**: types compile; existing 32 tests still pass

---

## Phase 3: User Story 1 - CO alerts follow NASA's exposure limits (P1) 🎯 MVP

**Goal**: CO graded at 10 / 55 / 425 ppm with the right responder, regions and wording.

**Independent Test**: CO at 9, 10, 55, 425 ppm → nominal, caution (crew, team early warning), caution (flight surgeon, 7-day), critical (head + chest).

- [ ] T004 [P] [US1] Write CO boundary tests in `backend/tests/unit/evaluate.test.ts`: 9 nominal; 10 caution, crew, `teamCoEarly` citation; 15 caution cites `jsc20584Co`; 55 caution escalated to flightSurgeon; 424 caution; 425 critical with head + chest injury regions; no action text contains "fire" without "does not confirm"; CO rule invariant `cautionHigh < escalateHigh < criticalHigh`. Existing tests that use `co: 60` as critical must move to `co: 430` (60 ppm becomes an escalated caution)
- [ ] T005 [US1] Update the `co` rule in `backend/config/aura.ts`: `cautionHigh 10`, `escalateHigh 55`, `criticalHigh 425`, `earlyWarningBelow 15`, `earlyCitationId "teamCoEarly"`, `citationId "jsc20584Co"`, `context "long-duration limit 15 ppm (30–180 days)"`, caution/critical actions per research R2 (critical must say it does not confirm a fire); add citations `jsc20584Co`, `teamCoEarly`; remove `smacCo`
- [ ] T006 [US1] In `buildAlerts` (`backend/lib/evaluate.ts`): when a caution metric has `escalateHigh` and value ≥ it, set escalation `flightSurgeon` + `escalated true` and threshold text naming the 7-day limit; use `earlyCitationId` when value < `earlyWarningBelow`; append `context` to the threshold text; update the CO-exposure injury alert wording to "potential CNS effects and cardiac arrhythmia"
- [ ] T007 [US1] Update the `coLeak` scenario in `backend/lib/scenarios.ts` to ramp 20 → 480 ppm over 10 s and describe "potential CO exposure" (no fire claim)

**Checkpoint**: CO tests pass; CO leak reaches 425 ppm within 15 s

---

## Phase 4: User Story 2 - Mental fatigue graded by MHI, PVT+ and HRV (P1)

**Goal**: four mental inputs graded with the research's exact comparisons; worst input sets mental severity; one alert per triggered input.

**Independent Test**: boundary values for MHI, PVT+ time, lapses, HRV and HRV drop produce the expected band and responder.

- [ ] T008 [P] [US2] Write band tests in `backend/tests/unit/mental.test.ts`: PVT 249 nominal / 250 caution / 350 caution / 351 critical; lapses 2 / 3 / 4 / 5; HRV 51 nominal / 50 caution / 30 caution / 29 critical; HRV drop 14% / 15% / 25% / 26% (baseline 55 ms); MHI 80 nominal / 79 caution / 50 caution / 49 critical; worst-input rule; every band's citation exists. Update the existing `computeMhi` severity test in `backend/tests/unit/mhi.test.ts` (it expects 70 = nominal under the old 60/40 bands)
- [ ] T009 [US2] Add `MENTAL_BANDS` to `backend/config/aura.ts` (pvtReaction `[">=",250]`/`[">",350]` ms; pvtLapses `[">=",3]`/`[">=",5]`; hrv `["<=",50]`/`["<",30]` ms; hrvDrop `[">=",15]`/`[">",25]` %), citations `pvtPlus`, `teamHrvDrop`; set `MHI_CONFIG.caution 80`, `critical 50`; critical actions mention adjusting the work-rest schedule and delaying high-risk tasks; remove old `pvt` citation
- [ ] T010 [US2] Create `backend/lib/mental.ts`: `bandValue(id, readings, profile)` (lapses rounded; hrvDrop = `(baseline − hrv) / baseline × 100`, floored at 0), `evaluateBand(band, value)` critical-first with the explicit operators, `evaluateMental(readings, profile)` → `MentalStatus[]`
- [ ] T011 [US2] Wire mental bands into `backend/lib/evaluate.ts`: mental category severity = max(MHI, bands); `buildAlerts` emits one alert per non-nominal band (key `mental:<id>`, title naming the input, value + unit, threshold text, citation, action, escalation by severity)
- [ ] T012 [US2] Update scenarios in `backend/lib/scenarios.ts`: `sleepDeprivation` adds `pvtLapses: 6`; `imFine` adds `pvtLapses: 3`
- [ ] T013 [US2] Show PVT+ reaction time, lapses and HRV with their band badges in `frontend/components/MindPanel.tsx` (values via `evaluateMental` from the store readings)

**Checkpoint**: mental tests pass; sleep deprivation shows critical with named inputs

---

## Phase 5: User Story 3 - Acute absorbed dose lights the abdomen (P2)

**Goal**: absorbed dose in Gy, critical at 1.0 Gy on a new lower-abdomen region.

**Independent Test**: 0.99 Gy → no abdomen glow; 1.0 Gy → critical abdomen glow citing Poplaski et al. 2025.

- [ ] T014 [P] [US3] Write tests in `backend/tests/unit/evaluate.test.ts`: absorbedDoseGy 0.99 → injury nominal; 1.0 → injury critical with `abdomen` region and `poplaskiGi` citation; raising `cumulativeDose`/`doseRate` alone never changes absorbed dose
- [ ] T015 [US3] Add the `absorbedDoseGy` rule to `backend/config/aura.ts` (category injury, `criticalHigh 1.0`, unit "Gy", regions `["abdomen"]`, citation `poplaskiGi`, actions) and the `poplaskiGi` citation
- [ ] T016 [US3] Add scenario `acuteDose` ("Acute radiation dose") in `backend/lib/scenarios.ts`: absorbedDoseGy ramps to 1.3 over 8 s, doseRate 12
- [ ] T017 [US3] Add the `abdomen` anchor `[0, 0.5, 0.45]` and label to `frontend/components/AstronautScene.tsx`; add the `acuteDose` icon in `frontend/components/ScenarioPanel.tsx`; show "Acute absorbed dose" (Gy) in `frontend/components/StatusPanel.tsx`

**Checkpoint**: acute-dose scenario lights the abdomen at 1.0 Gy

---

## Phase 6: User Story 4 - Sources match the revised research (P2)

**Goal**: every alert cites the revised research's sources.

**Independent Test**: each alert type shows the citation from research R7.

- [ ] T018 [P] [US4] Update citations in `backend/config/aura.ts`: `georgeRadiation` (cumulative rule); the dose-rate rule keeps the team-defined `teamDoseRate` citation (its 2 / 10 mSv/day levels are team-defined) with text naming George et al. 2024's ≈1.0 mSv/day background, `ochmoTemp` (coreTemp rule), `teamMhi` text; remove `std3001Radiation`, `clinicalTemp`; cumulativeDose `cautionHigh 150` (clarification Q1)
- [ ] T019 [P] [US4] Add PVT+ lapses and acute absorbed dose to `MEASUREMENTS` in `backend/config/aura.ts`; update the PVT entry to name the NASA PVT+ test
- [ ] T020 [US4] Update the citation invariant tests in `backend/tests/unit/evaluate.test.ts` (every rule and band references an existing citation; cumulative 150 caution / 480 critical)

---

## Phase 7: User Story 5 - RR-1 radiation series (P3, deferred)

Blocked on the dataset (spec FR-022). No tasks until the team supplies the RR-1 file or NASA repository ID.

---

## Phase 8: Polish & Cross-Cutting

- [ ] T021 Add `backend/tests/unit/scenarios.test.ts` that runs scenarios through `tickReadings` without noise: CO leak reaches 425 ppm within 15 s (SC-003), acute dose reaches 1.0 Gy, sleep deprivation reaches ≥ 5 lapses; then run `pnpm test`, `pnpm lint`, `pnpm build` and fix failures
- [ ] T022 Walk `specs/002-research-alignment/quickstart.md` scenarios 1–7 in a headless browser and check screenshots
- [ ] T023 Update `README.md` aura/threshold notes if they contradict the new tiers

## Dependencies & Execution Order

- Foundational (T001–T003) → all stories.
- US1 (T004–T007) and US2 (T008–T013) are independent; both touch `backend/config/aura.ts` and `backend/lib/evaluate.ts`, so run their config/evaluate tasks sequentially.
- US3 depends only on Foundational. US4 citation edits touch `aura.ts`; run after US1–US3 config tasks.
- Polish last.

## Parallel Examples

- T004 (CO tests), T008 (mental tests) and T014 (dose tests) can be written in parallel before their implementations.
- T018 and T019 are independent edits within US4.

## Implementation Strategy

1. MVP = Foundational + US1 (CO) + US2 (mental): the two P1 research mismatches.
2. Then US3 (abdomen) and US4 (citations).
3. US5 when the RR-1 data arrives.
