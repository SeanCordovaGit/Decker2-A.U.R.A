# Research: Align A.U.R.A. with the Revised Research

Source: the team's revised research document (second draft, 2026-11-14). Values are taken as the team transcribed them from the cited documents; entries keep the `verify` tag until someone checks the primary source.

## R1. Carbon monoxide tiers

- **Decision**: one CO rule with `cautionHigh 10`, `escalateHigh 55`, `criticalHigh 425` (ppm, inclusive). 10–54 ppm = caution, crew; 55–424 ppm = caution escalated to the flight surgeon; ≥425 ppm = critical, head + chest highlighted. Readings below 15 ppm cite the team-defined early warning; others cite NASA JSC-20584 Rev D. Alert threshold text names the exposure basis (early warning, 7-day, acute 1-hour) and the 15 ppm long-duration limit as context.
- **Rationale**: the demo cannot measure exposure over days, so the live concentration is graded against the duration-based limits and the basis is stated (spec assumption). An escalation threshold keeps one hazard category and one aura while matching "7-day limit exceeded → flight surgeon".
- **Alternatives**: three separate CO rules (would emit three overlapping alerts); time-weighted averages (needs days of data the demo does not have).

## R2. Wording of CO alerts

- **Decision**: caution: "Increase ventilation, check for off-gassing or overheating equipment, track the trend." Critical: "Don masks and move to a module with clean air. Potential CNS effects and cardiac arrhythmia; this alert does not confirm a fire." 
- **Rationale**: the research explicitly says the alert must not be read as a fire confirmation (FR-005).

## R3. Mental-fatigue bands

- **Decision**: MHI keeps its existing severity path with `caution < 80`, `critical < 50`. New `MENTAL_BANDS` in config, each with explicit operators matching the research wording:
  - PVT+ mean reaction time: caution `>= 250`, critical `> 350` ms
  - PVT+ lapses per 300 s test: caution `>= 3`, critical `>= 5` (evaluated on the rounded count)
  - HRV (RMSSD): caution `<= 50`, critical `< 30` ms
  - HRV drop from personal baseline: caution `>= 15`, critical `> 25` % (team-defined band)
  Mental category severity = worst of MHI and the bands; one alert per triggered input, naming it.
- **Rationale**: the research uses mixed strict/inclusive wording ("< 250", "250–350", "> 350", "≥ 5"); explicit operators reproduce it exactly instead of approximating with a single inclusive rule.
- **Alternatives**: reuse `ThresholdRule` with inclusive bounds (would misgrade exactly 350 ms and 50 ms).

## R4. MHI composition

- **Decision**: keep the four-input MHI from spec 001 (biometrics, affect, journal, PVT). The research's three-input formula is treated as the conceptual description (spec assumption); PVT+ is additionally graded on its own bands.
- **Rationale**: avoids reweighting tested logic during the deadline; the on-screen bands match the research either way.

## R5. Absorbed dose and the abdomen

- **Decision**: new reading `absorbedDoseGy` (default 0) and rule `criticalHigh 1.0` Gy in the injury category, region `abdomen`, citing Poplaski et al. (2025). No caution tier (the research names only the 1.0 Gy damage threshold). Never derived from mSv.
- **Rationale**: Sv = Gy × radiation weighting factor; space radiation includes high-LET particles (factor up to 20), so the research's "1 mSv = 0.001 Gy" note only holds for photons.

## R6. Cumulative effective dose

- **Decision**: `cautionHigh 150`, `criticalHigh 480` mSv, citing George et al. (2024) and NASA-STD-3001 (600 mSv career limit).
- **Rationale**: clarification Q1.

## R7. Citations

| Id | Text |
|---|---|
| `jsc20584Co` | NASA JSC-20584 Rev D (SMAC): CO 425 ppm 1 h, 55 ppm 7 d, 15 ppm 30–180 d |
| `teamCoEarly` | A.U.R.A. early warning at 10 ppm (team-defined), below NASA JSC-20584 limits |
| `georgeRadiation` | George et al. 2024: deep-space background ≈1.0 mSv/day; NASA-STD-3001 career limit 600 mSv |
| `ochmoTemp` | OCHMO-TB-015 and NASA (1999): hyperthermia > 40 °C, hypothermia < 33 °C; baseline 37.0 °C (Stahn et al. 2017); caution bands clinical |
| `pvtPlus` | NASA PVT+ User Guide (NASA, 2026): reaction time and lapses per 300 s test |
| `teamMhi` | A.U.R.A. MHI bands (team research table) |
| `teamHrvDrop` | HRV drop from personal baseline bands (team-defined) |
| `poplaskiGi` | Poplaski et al. 2025 (NASA TRISH): acute GI damage at 1.0 Gy |

## R8. Scenarios

- **Decision**: CO leak target ramps 20 → 480 ppm over 10 s (drift reaches 425 within 15 s, SC-003). Sleep deprivation adds 6 lapses and PVT 430 ms; "I'm fine" mismatch adds 3 lapses. New scenario `acuteDose` ("Acute radiation dose"): absorbed dose ramps to 1.3 Gy, dose rate high.
- **Rationale**: every new tier must be reachable in the demo (Principle I).

## R9. RR-1

- **Decision**: deferred (clarification Q3). No loader, no placeholder.
