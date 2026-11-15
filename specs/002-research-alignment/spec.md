# Feature Specification: Align A.U.R.A. with the Revised Research

**Feature Branch**: `feat/research-alignment`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Align A.U.R.A. with the team's revised research document (second draft): carbon monoxide tiers per NASA JSC-20584 Rev D, mental fatigue thresholds per the NASA PVT+ User Guide and the team's MHI table, radiation-induced gastrointestinal damage at 1.0 Gy (Poplaski et al., 2025) on a new lower-abdomen region, radiation references from George et al. (2024), the Rodent Research-1 (RR-1) radiation time series as a NASA dataset, updated citations, and explicit resolution of the colour conflicts between the draft and the shipped colour system."

Extends spec `001-aura-health-dashboard`. Everything in 001 stays in force unless a requirement below replaces it.

## User Scenarios & Testing *(mandatory)*

Primary users are unchanged: the astronaut reading their own status, and the flight surgeon who receives escalations. The demo audience is NASA Space Apps judges, some with medical or space-science backgrounds who will compare the numbers on screen with the cited sources.

### User Story 1 - Carbon monoxide alerts follow NASA's exposure limits (Priority: P1)

An astronaut sees carbon monoxide rise. The dashboard grades the reading against the tiers in NASA JSC-20584 Rev D plus the team's early warning: an early warning before NASA limits are reached, escalation to the flight surgeon once the 7-day limit is exceeded, and a critical alert at the acute 1-hour limit. At the critical tier the brain and heart regions glow and the alert names the health risks (central nervous system effects, cardiac arrhythmia) without claiming there is a fire.

**Why this priority**: CO is the most cited environmental hazard in the revised research, and the shipped thresholds contradict it.

**Independent Test**: Set CO to 9, 10, 55 and 425 ppm and confirm severity, escalation target, highlighted regions and alert wording at each step.

**Acceptance Scenarios**:

1. **Given** CO at 9 ppm, **When** the dashboard evaluates it, **Then** air quality is nominal and no aura shows.
2. **Given** CO at 10 ppm, **When** evaluated, **Then** an air-quality caution appears labelled as the team-defined early warning, handled by the crew.
3. **Given** CO at 55 ppm, **When** evaluated, **Then** the caution escalates to the flight surgeon and cites the 7-day limit.
4. **Given** CO at 425 ppm, **When** evaluated, **Then** air quality is critical, the head and chest regions are highlighted, and the alert cites the acute 1-hour limit.
5. **Given** any CO alert, **When** the astronaut reads it, **Then** the text describes a potential health hazard and never states that a fire is confirmed.
6. **Given** the "CO leak" demo scenario, **When** it runs, **Then** it passes through the caution tiers and reaches the acute critical tier within the demo window.

---

### User Story 2 - Mental fatigue graded by MHI, PVT+ and HRV (Priority: P1)

An astronaut's cognitive state is graded with the team's MHI table and NASA's PVT+ test: the Mental Health Index, mean PVT+ reaction time, PVT+ lapses (responses over 500 ms in a 300-second test), and heart rate variability. Each reading shows which band it is in (optimal, warning, critical). Warnings stay with the crew; critical fatigue also notifies flight surgeons with countermeasures.

**Why this priority**: The mental module is the team's most developed research section, and the shipped thresholds differ from it.

**Independent Test**: Feed readings at each band boundary and confirm the band, the aura state and the escalation target.

**Acceptance Scenarios**:

1. **Given** MHI 80, reaction time 249 ms, 2 lapses and HRV 51 ms, **When** evaluated, **Then** mental status is nominal.
2. **Given** MHI 79 or reaction time 250 ms or 3 lapses or HRV 50 ms, **When** evaluated, **Then** mental status is caution (warning band) and the crew is the responder.
3. **Given** MHI 49 or reaction time 351 ms or 5 lapses or HRV 29 ms, **When** evaluated, **Then** mental status is critical, the flight surgeon is notified, and the recommended action includes adjusting the work-rest schedule and delaying high-risk tasks.
4. **Given** the sleep-deprivation scenario, **When** it runs, **Then** PVT+ lapses and reaction time worsen together with HRV and the index.

---

### User Story 3 - Radiation shows acute gut damage on the abdomen (Priority: P2)

During an acute radiation exposure the absorbed dose is tracked in gray (Gy), separately from the effective dose in millisieverts. When it reaches 1.0 Gy, the lower abdomen glows as a critical injury, citing NASA TRISH-funded research on acute gastrointestinal damage.

**Why this priority**: New research content with a clear on-body signal; it adds a body region but no new hazard category.

**Independent Test**: Run an acute-exposure scenario and confirm the abdomen highlight and alert appear at 1.0 Gy and not before.

**Acceptance Scenarios**:

1. **Given** an absorbed dose of 0.99 Gy, **When** evaluated, **Then** the abdomen is not highlighted.
2. **Given** an absorbed dose of 1.0 Gy, **When** evaluated, **Then** the lower abdomen glows as a critical injury and the alert cites Poplaski et al. (2025).
3. **Given** any effective-dose reading in mSv, **When** absorbed dose is shown, **Then** it is never calculated from the mSv value.

---

### User Story 4 - Sources match the revised research (Priority: P2)

Every alert and the Measurements reference cite the sources named in the revised research, so a judge can trace each number.

**Why this priority**: Scientific honesty is a constitution principle; mismatched citations undermine the pitch.

**Independent Test**: Open each alert type and confirm its citation matches the revised research.

**Acceptance Scenarios**:

1. **Given** any carbon monoxide alert, **When** viewed, **Then** it cites NASA JSC-20584 Rev D.
2. **Given** a mental fatigue alert, **When** viewed, **Then** it cites the NASA PVT+ User Guide.
3. **Given** a core body temperature alert, **When** viewed, **Then** it cites OCHMO-TB-015 and NASA (1999), with the 37.0 °C baseline from Stahn et al. (2017).
4. **Given** a radiation alert, **When** viewed, **Then** it cites George et al. (2024).

---

### User Story 5 - Rodent Research-1 radiation series as NASA data (Priority: P3, deferred: blocked on the dataset)

The radiation reading can be driven by NASA's Rodent Research-1 (RR-1) accumulated radiation series, shown as a curve over time, in addition to the DONKI solar particle events.

**Why this priority**: The revised research presents it as the app's NASA dataset, but the source file is not yet available.

**Independent Test**: Play back the RR-1 series and confirm the radiation reading follows it and crosses the radiation thresholds.

**Acceptance Scenarios**:

1. **Given** the RR-1 series is loaded, **When** playback runs, **Then** the dose curve follows the dataset and the radiation aura appears when a threshold is crossed.
2. **Given** RR-1 data is unavailable, **When** the dashboard loads, **Then** nothing breaks and the DONKI data remains the NASA source.

### Edge Cases

- A reading sits exactly on a band boundary: each band uses the exact comparison stated in the research. CO 10 and 425 ppm and 1.0 Gy are reached at the value; MHI is caution below 80 and critical below 50; PVT+ is caution from 250 ms and critical above 350 ms; lapses are caution from 3 and critical from 5; HRV is caution at 50 ms or less and critical below 30 ms.
- Several mental inputs disagree (good MHI, critical lapses): the worst input sets the mental severity, and the alert names which input triggered it.
- HRV is known only relative to a personal baseline: both the absolute value and the percentage drop are shown, and the worse of the two bands applies.
- CO falls back below a tier after escalation: the alert downgrades and the log records the change.
- RR-1 data is missing or malformed: the radiation reading falls back to the existing simulation and DONKI replay.

## Requirements *(mandatory)*

### Functional Requirements

**Carbon monoxide**

- **FR-001**: Air quality MUST be nominal below 10 ppm CO.
- **FR-002**: CO at or above 10 ppm MUST raise an air-quality caution labelled as the team-defined early warning, handled by the crew.
- **FR-003**: CO at or above 55 ppm MUST keep caution severity and escalate to the flight surgeon, citing the 7-day limit. The 15 ppm long-duration limit MUST be shown as reference context on CO alerts.
- **FR-004**: CO at or above 425 ppm MUST be critical, citing the acute 1-hour limit, and MUST highlight the head and chest regions.
- **FR-005**: CO alerts MUST describe the potential health effects (central nervous system effects, cardiac arrhythmia) and MUST NOT state or imply that a fire is confirmed.
- **FR-006**: The "CO leak" demo scenario MUST pass through the caution tiers and reach at least 425 ppm.

**Mental fatigue**

- **FR-007**: The Mental Health Index MUST be graded optimal at 80–100, caution at 50–79 and critical below 50.
- **FR-008**: PVT+ mean reaction time MUST be graded optimal below 250 ms, caution at 250–350 ms and critical above 350 ms.
- **FR-009**: The system MUST track PVT+ lapses (responses over 500 ms per 300-second test), graded optimal at 0–2, caution at 3–4 and critical at 5 or more.
- **FR-010**: HRV (RMSSD) MUST be graded optimal above 50 ms, caution at 30–50 ms and critical below 30 ms, and MUST also show the percentage drop from the astronaut's personal baseline (caution at a 15–25% drop, critical above 25%), with the worse band applying.
- **FR-011**: Mental severity MUST be the worst of the MHI, PVT+ reaction time, PVT+ lapses and HRV bands, and the alert MUST name the triggering input.
- **FR-012**: Caution-level mental alerts MUST go to the crew. Critical ones MUST also notify the flight surgeon and recommend adjusting the work-rest schedule and delaying high-risk tasks.
- **FR-013**: The discrepancy alert from spec 001 (FR-016) MUST remain, visible to the astronaut only.

**Radiation**

- **FR-014**: The system MUST track acute absorbed dose in gray separately from effective dose in millisieverts, and MUST NOT convert one into the other.
- **FR-015**: An absorbed dose at or above 1.0 Gy MUST highlight a new lower-abdomen body region as a critical injury, citing Poplaski et al. (2025).
- **FR-016**: A demo scenario MUST be able to reach the 1.0 Gy threshold.
- **FR-017**: Cumulative effective dose MUST raise a caution at 150 mSv (25% of the 600 mSv career limit, as in the revised research) and stay critical at 480 mSv (80%).
- **FR-018**: Radiation alerts MUST cite George et al. (2024) for the ~1.0 mSv/day deep-space background and the 600 mSv career limit.

**Colour system**

- **FR-019** (amended 2026-11-15): Every critical condition MUST use red. At caution, radiation uses green, air quality gray, lowered temperature blue, and other general warnings yellow. Nominal shows no aura; caution is steady and critical also pulses. Injury/cardiovascular effects stay localized. The updated team action-indicator table supersedes the previous category-only scheme.

**Sources and data**

- **FR-020**: Alerts and the Measurements reference MUST cite NASA JSC-20584 Rev D for CO; the NASA PVT+ User Guide (NASA, 2026) for PVT+; OCHMO-TB-015 and NASA (1999) for core temperature limits (hyperthermia above 40 °C, hypothermia below 33 °C) with the 37.0 °C baseline from Stahn et al. (2017); George et al. (2024) for radiation; Poplaski et al. (2025) for gastrointestinal damage.
- **FR-021**: Thresholds that come from the team rather than a published source (the 10 ppm early warning, the HRV percentage bands) MUST be labelled team-defined.
- **FR-022**: Rodent Research-1 playback is deferred until the team supplies the dataset file or its NASA repository ID. No placeholder or synthetic RR-1 data ships; DONKI remains the app's NASA dataset in the meantime.

### Key Entities

- **CO exposure tier**: a concentration threshold with its exposure basis (early warning, long-duration, 7-day, acute 1-hour), its severity, responder and citation.
- **Mental fatigue inputs**: Mental Health Index, PVT+ mean reaction time, PVT+ lapse count per 300-second test, HRV (absolute and percentage of personal baseline); each has three bands.
- **Absorbed dose**: acute radiation dose in gray, tracked separately from effective dose in millisieverts.
- **Body region: lower abdomen**: a new region that can be highlighted for gastrointestinal injury.
- **Radiation time series (RR-1)**: a dated sequence of accumulated dose values from NASA's Rodent Research-1 mission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every threshold on screen matches the revised research document and its cited source, with zero mismatches when a reviewer compares them.
- **SC-002**: Each CO tier (10, 55, 425 ppm) and each mental band boundary produces the correct severity and responder in 100% of boundary test cases.
- **SC-003**: The CO leak scenario reaches the acute critical tier within 15 seconds of being triggered.
- **SC-004**: A judge can trace any alert to its named source within 10 seconds of opening it.
- **SC-005**: No alert text on screen claims a confirmed fire, a diagnosis, or a dose conversion the research does not support.

## Clarifications

### Session 2026-11-14

- Q: Which cumulative radiation thresholds apply? → A: Caution at 150 mSv (research), critical at 480 mSv.
- Q: Keep the shipped colour rules or adopt the draft's? → A: Keep the shipped rules; the team updates the research doc.
- Q: How is the RR-1 dataset handled? → A: Wait for the team to supply it; no placeholder data.

## Assumptions

- CO exposure duration is not measured over real days in the demo. Concentration tiers are applied to the live reading, with the duration basis stated in the alert text.
- Core body temperature keeps the caution bands from spec 001 (38.0 °C and 35.0 °C) because the revised research lists only the critical limits and marks that section as still being edited.
- Cabin temperature keeps its spec 001 thresholds and "Verify" tag; the revised research no longer gives cabin values.
- PVT+ lapses and HRV are simulated, like all crew biometrics, and labelled "Simulated".
- The PVT+ input stays part of the Mental Health Index calculation from spec 001; the revised research's three-input formula is treated as the conceptual description, with PVT+ graded alongside it.
- The research document's own issues (the "1 mSv = 0.001 Gy" note, citing SMAC for radiation, the missing Smith (2025) reference, placeholder table captions) are reported to the team; correcting the document is outside this feature.
