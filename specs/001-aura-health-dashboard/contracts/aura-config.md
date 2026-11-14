# Contract: `config/aura.ts`

The single source of truth (Constitution IV). UI and logic import only from here for thresholds,
colors, actions, escalation and citations.

## Exports

| Export | Type | Purpose |
|---|---|---|
| `CATEGORY_META` | `Record<HazardCategory, { label, color, regions }>` | Aura color (hex) and default body regions per category |
| `SEVERITY_META` | `Record<Severity, { label, badgeColor, pulse, opacity }>` | Badge colors and aura intensity |
| `THRESHOLD_RULES` | `ThresholdRule[]` | One rule per monitored metric (see data-model.md) |
| `MHI_CONFIG` | `{ weights: { biometrics, affect, journal }, caution, critical, discrepancyGap }` | Mental Health Index parameters |
| `ESCALATION` | `{ cautionPersistSeconds, demoTimeNote }` | Escalation rule |
| `MEASUREMENTS` | `{ metric, label, device, why }[]` | Measurements panel content |
| `CITATIONS` | `Record<string, { text, url?, verified, teamDefined }>` | Source list referenced by rules |

## Invariants (unit-tested)

- `MHI_CONFIG.weights` sum to 1.
- For each rule: `cautionHigh ≤ criticalHigh` and `cautionLow ≥ criticalLow` where defined.
- Every rule references an existing citation.
- Category colors: radiation `#22c55e`, air `#9ca3af`, cabinHot `#f97316`, cabinCold `#3b82f6`,
  mental `#facc15`, injury `#ef4444`.
