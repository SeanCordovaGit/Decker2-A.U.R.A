# Supplied research update — 2026-11-15

Sources: `Nasa Space Apps 26.pdf` (3 pages) and `Nasa Space Apps 26 (1).pdf` (15 pages), supplied by the team. The longer document's detailed numeric tables supersede earlier drafts. Existing confirmed color priority remains: every critical condition is red; nominal has no aura.

## Decisions

- Cabin: nominal 18.3–26.7 °C; caution outside that interval; critical strictly below 16 or above 29 °C. Values between the printed one-decimal bands are classified continuously against the nominal interval.
- Core: nominal 36.5–37.5 °C; caution outside; critical strictly below 35 or at/above 39 °C. The user explicitly confirmed that the document's gaps at 35.0–35.4 and 38.5–38.9 remain caution.
- CO: early warning at 10 ppm (team-defined); 15 ppm long-duration context; 55 ppm escalation reference; critical at 425 ppm. Actual duration is not measured. Brain/heart risk markers begin at the 15 ppm reference; 10–14 ppm only shows the early environmental warning. No fire diagnosis is inferred.
- Cumulative effective dose: caution strictly above 150 mSv, critical at 600 mSv. The PDF provides no daily-dose alarm cutoff, so the former 2/10 mSv/day rule is removed; daily dose remains visible. SEP events retain a labeled project caution.
- Acute absorbed dose: separate Gy input; at least 1 Gy triggers experimental lower-abdomen GI risk. The organoid study does not establish a clinical human injury diagnosis. No conversion from mSv is performed.
- Mental: MHI below 80 cautions and below 50 is critical; PVT+ 250–350 ms cautions and above 350 is critical; 3–4 lapses caution and 5+ are critical per 300-second test; HRV 30–50 ms cautions and below 30 is critical. Worst input controls the mental category. Individual baseline HRV was not supplied, so relative-drop alerts are not invented.
- Local MHI uses the research's three channels. Previous relative weights of 0.4/0.15/0.25 are normalized to sum to one after removing PVT from the composite; they remain explicitly project-defined. PVT is evaluated separately.
- AST-001–AST-005 are selectable demo profiles, not actual crew records. Provided MHI is preserved until a scored journal check-in or a scenario switches to local computation. Too-short entries do not erase a supplied score. Switching crew starts a fresh profile session; reset restores the selected profile.
- Lab values and extracted RR-1/metabolic figures are supplied references only. Raw source series were not supplied, so no live/replayed dataset or verified laboratory integration is claimed. RR-1 figure units are mGy, not mSv. Current CO2 demonstration bands remain unchanged because the PDFs provide no updated CO2 cutoffs.

## Delivery checks

- [X] Encode operators, references, actions and bands in the backend configuration.
- [X] Update evaluation, source-specific escalation and local MHI composition.
- [X] Add five exact demo rows and independently track Gy and mSv.
- [X] Render lower-abdomen risk and show PVT+ lapses/HRV with severity.
- [X] Move the journal above the dock and the active alert below the header.
- [X] Add supplied reference tables/figures with source and simulation labels.
- [X] Verify boundary, crew-row and scenario behavior with unit tests.
- [X] Verify journal/profile interactions and layout in desktop/mobile browsers (1366×768 and 390×844); reference figures fit both viewports.
- [X] Finish build/lint and leave the production preview running at http://localhost:3002. Research and CSV regression tests cover fidelity and display precision.

## CSV fidelity follow-up

- Source: supplied `sample.csv`; preserved unchanged as `backend/data/crew-sample.csv`. SHA-256: `8b6840e75057c4c7198fcfa05a626fc510d191684a7eb19bf4f71752fdd0cc6e`.
- Grain: one snapshot per demo crew ID. Five unique IDs, 10 columns, 45 populated finite numeric values, no duplicate IDs or missing cells. All numeric fields exactly match the previously supplied PDF rows.
- No timestamps, sample cadence, exposure duration, individual HRV baselines, source-channel MHI inputs, heart rate, CO2 or acute Gy readings are present. Daily radiation is displayed as the supplied daily dose in mSv; it is not an instantaneous sensor rate. No new alert cutoffs are inferred from this sample.
- Supplied rows remain unchanged and do not create a fabricated time series or persistence escalation. Scenarios explicitly switch to generated simulation; reset restores the source row. Missing measurements are labeled, including the unavailable heart-rate trend.
- Supplied MHI is the imported aggregate; absent source channels cannot produce discrepancies. After a scored check-in, the local demo model is explicitly labeled as using simulated biometric/affect inputs.
- Core-temperature body markers identify the triggering metric rather than saying “Chest.” Combined causes retain their labels. Display formatting adds decimal places if rounding would imply a different configured severity; threshold text preserves the actual decimal limit.
- CO formatting also preserves concentration-reference bands, and MHI formatting cannot round a low score into a healthier band. The full suite contains 111 passing tests after the CSV and display regressions.
- These checks establish fidelity to supplied demo data and the configured team rules. They do not establish clinical validity, real astronaut provenance, actual flight-surgeon messaging or NASA certification. [NASA JSC-20584 Rev D](https://www.nasa.gov/wp-content/uploads/2026/02/jsc-20584-smacs-rev-d.pdf) distinguishes exposure-duration reference concentrations; a CSV snapshot alone does not establish that exposure duration.
