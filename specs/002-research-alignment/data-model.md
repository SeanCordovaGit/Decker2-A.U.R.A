# Data Model: Align A.U.R.A. with the Revised Research

Changes relative to `specs/001-aura-health-dashboard/data-model.md`.

## Enumerations

- **BodyRegion**: adds `abdomen` (lower abdomen, gastrointestinal tract).

## Readings (additions)

| Field | Unit | Nominal default | Limits |
|---|---|---|---|
| pvtLapses | count per 300 s PVT+ test | 1 | 0–30 |
| absorbedDoseGy | Gy (acute absorbed dose) | 0 | 0–20 |

`absorbedDoseGy` is independent of `doseRate` / `cumulativeDose` (mSv); no conversion between them.

## ThresholdRule (addition)

- `escalateHigh?`: value at or above which a caution alert escalates to the flight surgeon (CO: 55 ppm).
- `earlyWarningBelow?` + `earlyCitationId?`: caution readings below this value cite the early-warning source instead (CO: below 15 ppm → `teamCoEarly`).
- `context?`: reference text appended to the alert's threshold line (CO: long-duration limit 15 ppm).

## MentalBand (new, config `MENTAL_BANDS`)

- `id`: `pvtReaction | pvtLapses | hrv | hrvDrop`
- `label`, `unit`
- `caution`: `[op, value]`, `critical`: `[op, value]`, op ∈ `>= > <= <`
- `value(readings, profile)`: reaction time, rounded lapses, HRV, or % drop `(baseline − hrv) / baseline × 100`
- `citationId`, `actions: { caution, critical }`

Validation: bands are evaluated critical-first; severity = first matching tier.

## Derived

- **MentalStatus**: `{ id, label, value, unit, severity, threshold text }` per band.
- Mental category severity = max(MHI severity, all band severities).
- One alert per non-nominal band, key `mental:<id>`, escalation crew (caution) / flight surgeon (critical).
