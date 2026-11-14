# Contract delta: `backend/config/aura.ts`

Extends `specs/001-aura-health-dashboard/contracts/aura-config.md`.

## Changed exports

| Export | Change |
|---|---|
| `THRESHOLD_RULES` | `co`: caution 10, escalate 55, critical 425, early-warning citation below 15, CO wording without fire claim. `cumulativeDose`: caution 150. New `absorbedDoseGy` rule (critical 1.0 Gy, injury, region `abdomen`). `coreTemp` cites `ochmoTemp`. |
| `MHI_CONFIG` | `caution: 80`, `critical: 50`; critical action adds "delay high-risk tasks". |
| `CITATIONS` | Adds `jsc20584Co`, `teamCoEarly`, `georgeRadiation`, `ochmoTemp`, `pvtPlus`, `teamHrvDrop`, `poplaskiGi`; replaces `smacCo`, `std3001Radiation`, `clinicalTemp`, `pvt`. |
| `MEASUREMENTS` | Adds PVT+ lapses and acute absorbed dose. |

## New exports

| Export | Type | Purpose |
|---|---|---|
| `MENTAL_BANDS` | `MentalBand[]` | PVT+ reaction time, PVT+ lapses, HRV, HRV % drop with explicit comparison operators |

## Invariants (unit-tested)

- Every rule and band references an existing citation.
- CO: `cautionHigh < escalateHigh < criticalHigh`.
- Each band's caution tier is reached before its critical tier as values worsen.
- No rule derives `absorbedDoseGy` from an mSv reading.
