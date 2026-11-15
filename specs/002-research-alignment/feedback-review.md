# Feedback and notification hierarchy review

Reviewed against `Nasa Space Apps 26 (3).pdf` (10 pages), `Nasa Space Apps 26 (4).pdf` (2 pages), and the code merged in PRs #5 and #6. Document proposals are evaluated against the implemented research demonstration and the user's confirmed decisions.

## Application checklist

| Feedback | Finding and action |
| --- | --- |
| Exact crew profiles and consistent units | Already implemented. Preserve all five original CSV rows, including intentionally abnormal profiles. AST-001 cumulative dose is 145 mSv. Idle simulation no longer accumulates dose. Daily-dose labels and PVT lapse units are consistent. |
| Independent conditions and reliable Mental Distress | Already implemented and tested. Each condition resets to the selected crew baseline. The mismatch scenario has caution-level strain and a private discrepancy alert. |
| HR, core temperature and PVT controls | Already implemented. Fixed edited CSV snapshots failing to advance graph history. A later team clarification adds HR bands: 60-100 nominal, above 100 and below 140 caution, below 60 or at least 140 critical. These project assessment triggers highlight the chest. Core temperature and PVT use configured rules. Additional active alerts now remain accessible alongside condition-specific guidance. |
| Icons, labels and closing controls | Icons, labeled Reset/Panels controls, slider hints and X close controls were already implemented. Changed the selector label to Status, matching the feedback's suggested terminology. |
| Missing condition guidance | All nine supported workflows already exist. Retained their questions and tier-dependent guidance. Corrected CO at 55 ppm to retain a flight-surgeon referral while severity stays caution. |
| Readable next steps and Do now relationship | Bordered alert-action sections and the explanation were already implemented. Higher-priority additional alerts now open above the selected condition workflow. |
| Active hazard prominence | Already implemented through the enlarged status pill and active notification. The leading alert now follows the confirmed hierarchy. |
| EMU mesh if time permits | Existing detailed `astronaut_by_jungle_jim.glb` retained under the user's explicit asset choice. No replacement EMU asset or verified EMU provenance was supplied. |
| Recorded NASA replay | Fixed cumulative dose increasing during subsequent replay ticks. Historical SEP records add a precaution without supplying personal dosimetry. Injury remains active when a NASA replay is added. |
| Reviewed guidance | Replaced unsupported equipment-specific actions, including emergency CDRA backup-loop activation, with assessment and requests for applicable mission-approved procedures. Public/team references remain labeled and clinical review remains pending. |

## Notification order

The user confirmed that severity comes first. Within each severity, use this project policy from the hierarchy PDF. The active notification, Alerts, Next steps and leading viewer category share the backend comparator. Equal-rank ties preserve existing order. The event log stays chronological.

| Rank | Domain | Implemented trigger |
| --- | --- | --- |
| 1 | Toxic gas | CO/CO2 alerts, associated CO body-risk indicators and urgent air-quality reports |
| 2 | Acute absorbed dose / SEP precaution | Independent Gy input, acute-dose reports and recorded/simulated SEP precautions |
| 3 | Core thermoregulation | Core-temperature alerts and urgent fever reports |
| 4 | Physical injury / cardiovascular | Remaining injury alerts and hand reports |
| 5 | Cabin thermal conditions | Cabin heat/cold alerts and associated reports |
| 6 | Cognitive / mental fatigue | PVT, lapses, HRV, MHI and discrepancy alerts |
| 7 | Cumulative career-dose review | Cumulative effective-dose alerts |

A critical core-temperature alert precedes a caution CO warning. A red career-dose review remains explicitly labeled as such. The hierarchy PDF's timing descriptions and 1 Gy clinical claims are not treated as validated universal medical thresholds.

## Paper-ready corrections

Use consistent left-to-right columns in the research manuscript. The supplied feedback PDF is a review checklist, so the original file remains the input document.

| Metric | Nominal | Caution / project warning | Critical / project review | Unit and scope |
| --- | --- | --- | --- | --- |
| Cumulative effective dose | Up to 150 | Above 150 to below 600 | At or above 600, career-dose review | mSv; 150 is a project warning, 600 is a career reference |
| Independent absorbed dose | Below experimental marker | No separate caution band supplied | At or above 1.0, experimental abdomen marker | Gy; separate from effective dose |
| CO | Below 10 | At least 10; 15 long-duration context; referral from 55 | At least 425 | ppm; duration-specific source references do not establish actual exposure duration |
| Cabin temperature | 18.3-26.7 inclusive | Other values outside nominal and inside critical limits | Below 16 or above 29 | degrees C |
| Core temperature | 36.5-37.5 inclusive | Other values outside nominal and inside critical limits | Below 35 or at least 39 | degrees C; confirmed source-table gaps remain caution |
| MHI | At least 80 | At least 50, below 80 | Below 50 | Project composite / supplied score |
| PVT mean reaction | Below 250 | 250-350 inclusive | Above 350 | ms |
| PVT lapses | 0-2 | 3-4 | At least 5 | Count per 300-second test |
| HRV RMSSD | Above 50 | 30-50 inclusive | Below 30 | ms; individual baselines were not supplied |
| Heart rate | 60-100 inclusive | Above 100 and below 140 | Below 60 or at least 140 | bpm; later team-defined clarification |

### Consolidated indicator summary

| Indicator | Meaning | Anatomical scope |
| --- | --- | --- |
| Red | Critical tier or labeled career-dose review | Triggering category/region; localized hand, core/chest, CO head/chest and experimental abdomen markers where configured |
| Yellow | General caution | Heat, fever, fatigue and physical-injury warning regions |
| Blue | Lowered-temperature caution | Cabin cold or low core-temperature context |
| Green | Radiation caution / SEP precaution | Radiation suit outline and smoke |
| Gray | Air-quality caution | Air-quality outline; CO risk can additionally mark head/chest |
| No aura | Nominal category | No hazard highlight |

Retain the user's confirmed category colors for caution and red for every critical tier. The feedback's generic yellow captions do not replace that decision.

### Solar-event and architecture wording

A2U.R.A. demonstrates **Solar Energetic Particle (SEP)** events from DONKI. CME and solar-flare catalog entries are distinct event types. Exposure during IVA and EVA depends on particle energy/flux, shielding, location and time. Personal/area dosimetry is needed to assess actual crew dose. The application does not infer acute dose from a catalog event or convert the RR-1 mGy reference figure to mSv.

The implemented architecture is a Next.js viewer, in-memory local state, deterministic rules, local journal scoring, a bundled DONKI catalog and optional server-side Gemini incident explanations. A future sensor adapter could accept time-stamped wearable and cabin measurements locally, validate units and feed the same evaluator. A local database, wearable ingestion and offline telemetry transport are proposed work. They are not current integrations. Multiple measured hazards generate independent alerts; each category takes the worst configured severity, and notifications use the hierarchy above. HR uses the later team-defined demonstration bands with activity and baseline context required.

Scientific wording still required in the manuscript:

- Replace the general 1 Gy = 1,000 mSv equivalence with separate absorbed and effective-dose quantities.
- Describe 600 mSv as NASA's career effective-dose reference, not a mission or acute emergency limit.
- Identify the 150 mSv warning, 10 ppm early CO warning, composite MHI weights and UI notification hierarchy as project policies.
- Attribute Stahn et al. to spaceflight temperature context rather than claiming it validates the supplied clinical cutoffs.
- Keep the organoid GI marker explicitly experimental. Avoid diagnosing human ARS or GI damage from the display marker.
- List medical protocol review as pending. Require the mission's reviewed procedures for equipment actions and treatment.

Primary references: [NASA career-dose requirements](https://www.nasa.gov/reference/4-0-human-performance/), [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/), [NASA space-weather exposure context](https://sdo.gsfc.nasa.gov/mission/spaceweather/sources.php), [NASA CO2 removal-system context](https://www.nasa.gov/ochmo-tb-004-carbon-dioxide-2/).

## Verification

- `pnpm test`: 174 passing tests in 14 files, including reproduced regressions for replay dose accumulation, edited-snapshot history and CO caution referral.
- `pnpm lint`: passed without warnings.
- `pnpm build`: passed, including TypeScript and both API routes.
- Browser checks passed on desktop and mobile. AST-004 critical core temperature leads cabin thermal, mental and career-dose alerts. Lowering core temperature moves the cabin alert to the top. Manually raising core temperature during a hand scenario opens its higher-priority additional guidance. The Reference table contains all seven domains.
- Visual screenshots: `output/playwright/hierarchy-feedback-desktop.png`, `manual-multihazard-feedback.png`, and `hierarchy-feedback-mobile.png`.
- Live workflow route returned HTTP 200 with CO at 55 ppm, caution severity and flight-surgeon referral. Gemini preserved deterministic severity authority.
- Reference tabs use 180 ms selection-pill and content transitions. Browser checks passed for all four tabs, rapid switching, mobile wrapping, keyboard navigation and reduced-motion preferences.
- Latest production build is running locally at http://localhost:3000.

The supplied PDFs were reviewed as feedback sources. Their original files were not rewritten. The paper-ready corrections above are the revision material for the manuscript. Clinical review, real sensor ingestion, a local telemetry database and a verified EMU replacement asset remain pending.

The Solar Radiation condition was subsequently renamed Gamma Radiation (simulated) at the user's request, with a distinct simulation flag and source citation. Recorded NASA DONKI events retain their SEP provenance in Space weather. Acute Dose remains a separate independent Gy input. The automatic tour now includes heart-rate adjustment and Gamma Radiation steps and lasts 38 seconds.
