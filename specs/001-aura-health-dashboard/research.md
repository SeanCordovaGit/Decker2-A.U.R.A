# Research: A.U.R.A. Astronaut Health Aura Dashboard

Threshold values below come from the team's research document and recalled NASA references; they
were not checked against the source documents. Every value marked **VERIFY** must be checked
against the cited document before the pitch, and the config's `verified` flag set to `true` once
checked. The DONKI API facts in R5 were confirmed against the live API on 2026-11-14.

## R1. Radiation thresholds

- **Decision**: career limit 600 mSv effective dose (NASA-STD-3001 Vol. 1). Cumulative caution at
  ≥300 mSv (50%), critical at ≥480 mSv (80%). Dose-rate caution ≥2 mSv/day, critical ≥10 mSv/day
  (team-defined demo thresholds). Nominal ISS-like baseline ~0.5–1 mSv/day; deep-space cruise
  ~1.8 mSv/day (MSL RAD).
- **Rationale**: the team draft's 150 mSv red trigger was 25% of the limit — too early. Separating
  rate (acute solar particle events) from cumulative (career) matches how risk is managed.
- **Alternatives**: single cumulative threshold (misses acute events) — rejected.
- **Status**: 600 mSv limit high confidence; dose-rate thresholds labeled team-defined.

## R2. Air quality (CO, CO2)

- **Decision**:
  - CO caution ≥15 ppm (long-duration SMAC), critical ≥55 ppm (7-day SMAC). **VERIFY** against
    NASA SMAC table (JSC 20584 / current SMAC update).
  - CO2 caution ≥3.0 mmHg (~3,950 ppm), critical ≥5.3 mmHg (~7,000 ppm). **VERIFY** against
    NASA-STD-3001 Vol. 2 and SMAC table.
- **Rationale**: SMACs are exposure-duration dependent; the team draft labeled 55 ppm as the
  1-hour limit, which appears to be the 7-day value. CO2 is the chronic ISS air problem and is
  linked to headaches and cognitive effects, so it also lowers the mental biometrics subscore.
- **Alternatives**: single fixed limit regardless of duration — rejected as inaccurate.

## R3. Cabin and core temperature

- **Decision**:
  - Cabin: nominal 18–27 °C (NASA-STD-3001 Vol. 2 habitable range, **VERIFY**). Caution outside
    that range; critical ≥30 °C or ≤15 °C (team-defined).
  - Core body: caution ≥38.0 or ≤35.0 °C; critical ≥40.0 or ≤33.0 °C (standard clinical bands).
    Stahn et al. (2017) report resting core temperature rising toward ~38 °C on long missions;
    UI shows deviation from personal baseline (default 37.0 °C).
- **Rationale**: fixes the team draft's 33 °C hypothermia trigger (already moderate hypothermia)
  and separates body temperature (health) from cabin temperature (environment).
- **Category mapping**: abnormal core temperature is shown in the red injury/cardiovascular
  category on the chest region, keeping orange/blue for the cabin.

## R4. Mental Health Index and discrepancy

- **Decision**: MHI = Σ wᵢ·sᵢ over available sources (biometrics 0.5, affect 0.2, journal 0.3);
  missing sources' weights redistributed proportionally. Caution <60, critical <40. Discrepancy
  when any pair of source scores differs by >30 points. All team-defined.
- **Biometric subscore**: mean of normalized HRV, resting HR, sleep hours, and CO2 penalty.
  Resting HR penalty is suppressed when activity level is high (exertion vs. stress).
- **Rationale**: weighted sum alone hides disagreement, so discrepancy is a separate output.
- **Alternatives**: ML model — rejected (no training data, deadline).

## R5. NASA DONKI integration

- **Decision**: route handler `GET /api/donki/sep` calls
  `https://api.nasa.gov/DONKI/SEP?startDate=…&endDate=…&api_key=…` for the last 60 days with a
  5 s timeout, key from `NASA_API_KEY` (fallback `DEMO_KEY`). On any failure or empty result,
  returns bundled `src/data/donki-sep-cache.json` with `source: "nasaCached"`.
- **Confirmed API constraints (2026-11-14)**:
  - A request range longer than 60 days is rejected with HTTP 400
    ("Date range cannot exceed 60 days").
  - `DEMO_KEY` is rate-limited (HTTP 429 after a handful of requests from a shared IP). A personal
    key from api.nasa.gov is required for the cache refresh and the live demo.
  - A range with no events can return an empty body rather than `[]`.
- **Cache content**: MUST contain real DONKI records. It is populated by
  `npm run fetch:donki`, which fetches 60-day chunks going back about 2 years, merges by `sepID`,
  and on HTTP 429 saves the events fetched so far. The cache MUST NOT be hand-written or
  fabricated; if it cannot be populated, the cache is an empty list and the UI states that no
  cached events are available.
- **Fields used** (confirmed in a live response): `sepID`, `eventTime`,
  `instruments[].displayName`, `link`. Other fields present: `linkedEvents`, `submissionTime`,
  `versionId`, `sentNotifications`. Parser tolerates missing fields.
- **Alternatives**: client-side fetch directly from api.nasa.gov — rejected (exposes key, no
  single fallback point).

## R6. Charts

- **Decision**: hand-written SVG sparklines instead of Recharts.
- **Rationale**: only short line trends are needed; avoids a dependency with known React 19
  peer-dependency friction; fewer moving parts (Principle VI).

## R7. Astronaut model and aura rendering

- **Decision**: astronaut built from primitive meshes (capsules/spheres/boxes) grouped by body
  region. Environmental auras = enlarged transparent shell around the whole body with additive
  blending; mental aura = yellow shell around the head and torso; injury = emissive red on the
  specific region mesh. Pulse = sinusoidal opacity in `useFrame`.
- **Rationale**: no model download or rigging; per-region highlighting is trivial; works offline.
- **Alternatives**: GLB astronaut model — better looks, but region separation and licensing take
  time. Can be swapped later if time allows.

## R8. Sentiment

- **Decision**: local lexicon scorer (positive/negative word lists, negation handling, intensifiers),
  output −1..1 mapped to 0–100.
- **Rationale**: offline, deterministic, testable. Mixed text trends toward neutral.

## R9. Simulation time

- **Decision**: 1 Hz tick; demo time compressed so caution persistence escalation happens after
  20 s of real time (config value) instead of hours.
- **Rationale**: escalation must be visible within the pitch. Label the compression in UI.
