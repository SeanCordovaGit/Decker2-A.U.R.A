# Data Model: A.U.R.A.

All entities are in-memory TypeScript types defined in `lib/types.ts`.

## Enumerations

- **Severity**: `nominal | caution | critical` (ordered).
- **HazardCategory**: `radiation | air | cabinHot | cabinCold | mental | injury`.
- **BodyRegion**: `head | chest | back | leftArm | rightArm | leftHand | rightHand | leftLeg | rightLeg`.
- **EscalationTarget**: `none | crew | flightSurgeon`.
- **DataSource**: `simulated | nasaLive | nasaCached`.

## Readings

`Readings` — one snapshot per tick:

| Field | Unit | Nominal default |
|---|---|---|
| doseRate | mSv/day | 0.6 |
| cumulativeDose | mSv | 120 |
| co | ppm | 2 |
| co2 | mmHg | 2.2 |
| cabinTemp | °C | 22 |
| coreTemp | °C | 37.0 |
| heartRate | bpm | 68 |
| restingHeartRate | bpm | 62 |
| hrv | ms (RMSSD) | 55 |
| sleepHours | h | 7.5 |
| activityLevel | 0–1 | 0.1 |
| affectScore | 0–100 | 75 |
| injuries | map BodyRegion → Severity | {} |
| sepActive | boolean | false |

Validation: numeric fields clamped to physically plausible ranges in `simulation.ts`.

## ThresholdRule (config)

- `metric`: key of Readings
- `category`: HazardCategory (or a function of direction, e.g., cabinTemp high → cabinHot, low →
  cabinCold)
- `label`, `unit`
- `cautionHigh?`, `criticalHigh?`, `cautionLow?`, `criticalLow?` (inclusive)
- `citation`: `{ text, url?, verified: boolean, teamDefined: boolean }`
- `actions`: `{ caution: string, critical: string }`
- `regions?`: BodyRegion[] to highlight (e.g., coreTemp → chest)

## Evaluation (derived)

- **MetricStatus**: metric, value, severity, direction (`high | low | null`), rule.
- **CategoryStatus**: category, severity = max of its metrics, regions.
- **Alert**: id, category, metric, severity, value, threshold, citation, action,
  escalation (`crew` on caution, `flightSurgeon` on critical or after persistence window),
  createdAt, escalatedAt?, toAstronautOnly (true for discrepancy).

State transitions for an alert key (category+metric):
`none → caution → (persist ≥ window) escalated → nominal (closed)`;
`any → critical (escalated immediately)`; reset clears all.

## Mental Health Index

- **Inputs**: biometric score (0–100), affect score (0–100), journal score (0–100 | null).
- **Output**: `{ index, severity, components: [{source, score|null, weight}], discrepancy:
  { active, pair, gap } }`.
- Weights from config, renormalized over non-null sources.

## JournalEntry

- `text`, `createdAt`, `sentiment` (−1..1), `score` (0–100). Entries with < 3 words are not scored.

## SpaceWeatherEvent

- `id` (sepID), `eventTime` (ISO), `instruments` (string[]), `link?`.
- Response wrapper: `{ source: 'nasaLive' | 'nasaCached', fetchedAt, events: SpaceWeatherEvent[] }`.

## Scenario

- `id`, `label`, `description`, `apply(readings, elapsedSeconds) → Partial<Readings>` (ramps over
  time), optional `journalText` for the discrepancy scenario.

## AstronautProfile

- `callsign`, `baselineCoreTemp` (37.0), `baselineRestingHR` (62), `baselineHrv` (55),
  `careerDoseLimit` (600).
