# Feature Specification: A.U.R.A. Astronaut Health Aura Dashboard

**Feature Branch**: `claude/pensive-euler-l3hy0f`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "A.U.R.A. (Astro-Unified Response Algorithm): a health monitoring
dashboard for astronauts that shows a 3D astronaut model whose surrounding aura changes when body
or environment readings cross thresholds. Covers radiation, air quality, cabin temperature, core
body temperature, mental/cognitive state (MHI + discrepancy alert), and localized
injury/cardiovascular issues. Every alert shows reading, threshold, source, severity, action and
escalation target. Demo scenarios, vitals charts, alert log, live journal sentiment, Measurements
panel, simulated crew data, offline operation with cached NASA data."

## User Scenarios & Testing *(mandatory)*

Primary users: the astronaut (sees own status first) and the ground flight surgeon (receives
escalations). Secondary audience: hackathon judges watching a live demo.

### User Story 1 - See health and environment status at a glance (Priority: P1)

An astronaut opens the dashboard and sees a 3D astronaut model. When every reading is nominal, no
aura is shown. When a reading crosses a caution or critical threshold, an aura appears in the
color of that hazard category (radiation green, air quality gray, cabin heat orange, cabin cold
blue, mental/cognitive yellow, injury/cardiovascular red on the affected body region). Caution
shows a steady glow; critical shows a pulsing glow.

**Why this priority**: this is the core concept and the centerpiece of the demo.

**Independent Test**: set readings to nominal, caution and critical for each category and confirm
the aura color, location and intensity match the rules.

**Acceptance Scenarios**:

1. **Given** all readings nominal, **When** the dashboard loads, **Then** no aura is visible and
   the status reads "All nominal".
2. **Given** cabin temperature rises above its caution threshold, **When** the reading updates,
   **Then** a steady orange aura surrounds the model.
3. **Given** an injury is reported on the right hand, **When** the reading updates, **Then** only
   the right hand region glows red.
4. **Given** two categories are abnormal at once, **When** the dashboard renders, **Then** both
   auras are visible and distinguishable, and the panel lists both alerts.

---

### User Story 2 - Understand and act on an alert (Priority: P1)

When an alert fires, the astronaut opens it and sees the current reading, the threshold crossed,
the source of that threshold, the severity, a recommended action, and who should handle it (crew
self-manage, or flight surgeon).

**Why this priority**: answers the challenge questions "when does a result warrant attention" and
"what actions prevent a critical condition".

**Independent Test**: trigger one alert per category and confirm all six details are shown and
the escalation target follows the rule.

**Acceptance Scenarios**:

1. **Given** a caution-level alert, **When** the astronaut views it, **Then** the escalation
   target is "Crew – self-manage" and a recommended action is shown.
2. **Given** a critical-level alert, **When** the astronaut views it, **Then** the escalation
   target is "Flight surgeon" and the alert is marked as escalated.
3. **Given** a caution alert persists beyond its persistence window, **When** the window elapses,
   **Then** the alert escalates to the flight surgeon.
4. **Given** any displayed threshold, **When** the astronaut views it, **Then** a source citation
   is visible.

---

### User Story 3 - Trigger live demo scenarios (Priority: P1)

A presenter clicks scenario buttons to cause realistic events: solar particle event, CO leak, CO2
buildup, cabin overheat, fever, sleep deprivation, EVA hand injury, and the "I'm fine"
discrepancy. A reset button returns everything to nominal.

**Why this priority**: the pitch depends on showing changes on demand.

**Independent Test**: click each scenario and confirm the expected aura, alert and log entry
appear within a few seconds; click reset and confirm return to nominal.

**Acceptance Scenarios**:

1. **Given** a nominal state, **When** "CO leak" is triggered, **Then** a gray aura appears, the
   brain and heart regions are highlighted red once CO is critical, and a critical alert is logged.
2. **Given** any active scenario, **When** "Reset" is clicked, **Then** all readings return to
   nominal and all auras disappear.

---

### User Story 4 - Real space weather drives radiation status (Priority: P2)

The dashboard shows recent solar energetic particle events from NASA's space weather database.
When an event is active (or the presenter replays a real historical event), the simulated
radiation dose rate rises and the green aura appears. Cumulative mission dose is shown against the
career limit.

**Why this priority**: satisfies the requirement to use NASA data and adds credibility.

**Independent Test**: load the dashboard with network access and confirm real NASA events are
listed with dates; repeat without network and confirm cached events are used and labeled as
cached.

**Acceptance Scenarios**:

1. **Given** network access, **When** the dashboard loads, **Then** recent NASA solar particle
   events are listed with their dates and a "Live NASA data" label.
2. **Given** no network access, **When** the dashboard loads, **Then** cached NASA events are
   shown with a "Cached NASA data" label and no error blocks the UI.
3. **Given** the presenter replays a listed real event, **When** replay starts, **Then** the dose
   rate rises and a green aura appears at the matching severity.

---

### User Story 5 - Mental health index and discrepancy detection (Priority: P2)

The astronaut types a short journal entry. The system scores its sentiment and combines it with
simulated biometrics (heart rate variability, resting heart rate, sleep) and an affect/voice score
into a Mental Health Index from 0 to 100. If the index falls below the caution threshold, a yellow
aura appears. If the sources disagree strongly (e.g., the journal says "I'm fine" while
biometrics show strain), a discrepancy alert is shown to the astronaut first.

**Why this priority**: the strongest research section of the project and a memorable live demo.

**Independent Test**: enter a positive entry while biometrics show strain and confirm a
discrepancy alert; enter a negative entry and confirm the index drops.

**Acceptance Scenarios**:

1. **Given** nominal biometrics, **When** the astronaut submits a clearly negative entry, **Then**
   the index decreases and the journal component of the breakdown reflects the negative score.
2. **Given** strained biometrics, **When** the astronaut submits "I'm fine, all good", **Then** a
   discrepancy alert appears addressed to the astronaut.
3. **Given** high physical activity with elevated heart rate, **When** the index is computed,
   **Then** the elevated heart rate is attributed to exertion and does not lower the index.
4. **Given** one source is unavailable, **When** the index is computed, **Then** its weight is
   redistributed across the remaining sources and the breakdown shows the source as missing.

---

### User Story 6 - Vitals history, alert log and measurements reference (Priority: P3)

The astronaut sees short-term charts of key vitals and environment readings, a time-ordered log
of alerts, and a Measurements panel listing each measurement, the onboard device type that
captures it, and why it matters in spaceflight.

**Why this priority**: supports the challenge question "which measurements can be performed in
space and why", but the dashboard works without it.

**Independent Test**: run a scenario and confirm the chart shows the change and the log records
it; open the Measurements panel and confirm every monitored reading is listed with device and
rationale.

**Acceptance Scenarios**:

1. **Given** a scenario ran, **When** the astronaut opens the alert log, **Then** each alert
   appears with time, category, severity and escalation target.
2. **Given** the Measurements panel is open, **When** the astronaut reads it, **Then** every
   monitored reading lists a device type and a reason it is measured in space.

### Edge Cases

- NASA data request fails, times out, or returns no events → cached data is used and labeled.
- Several hazards active simultaneously → all auras render; injury highlights remain localized.
- A reading sits exactly on a threshold → treated as reaching that severity (inclusive bounds).
- Empty or very short journal entry → not scored; the index uses remaining sources.
- Journal text with mixed sentiment → scored near neutral.
- Reset during an active scenario → all timers and escalations are cleared.
- Long demo session → charts show a bounded recent window and the log does not grow unbounded
  on screen.

## Requirements *(mandatory)*

### Functional Requirements

**Visualization**

- **FR-001**: System MUST display a 3D astronaut model that the viewer can rotate.
- **FR-002**: System MUST show an aura whose color encodes hazard category: radiation green, air
  quality gray, cabin heat orange, cabin cold blue, mental/cognitive yellow,
  injury/cardiovascular red.
- **FR-003**: System MUST encode severity by intensity: nominal = no aura, caution = steady glow,
  critical = pulsing glow.
- **FR-004**: Injury/cardiovascular indications MUST be localized to body regions: head, chest
  (heart), left arm, right arm, left hand, right hand, back, left leg, right leg.
- **FR-005**: System MUST show a status badge per category using green/amber/red for
  nominal/caution/critical.

**Thresholds and monitoring**

- **FR-006**: Radiation MUST track dose rate and cumulative mission dose. Cumulative dose MUST be
  compared to the 600 mSv career effective dose limit (NASA-STD-3001): caution at ≥50%, critical
  at ≥80%. An active solar particle event MUST raise severity to at least caution, and to critical
  when the dose rate exceeds the configured critical rate.
- **FR-007**: Air quality MUST track CO and CO2 against NASA SMAC limits with caution and critical
  levels defined in the shared configuration with citations. Critical CO MUST also highlight the
  head and chest regions red.
- **FR-008**: Cabin temperature MUST produce an orange aura when above the comfort range and a
  blue aura when below it, using thresholds from the shared configuration with citations.
- **FR-009**: Core body temperature MUST be evaluated as a health reading: caution at ≥38.0 °C or
  ≤35.0 °C, critical at ≥40.0 °C or ≤33.0 °C, with deviation from the astronaut's personal
  baseline shown (Stahn et al., 2017). Abnormal core temperature MUST appear in the
  injury/cardiovascular (red) category on the chest region.
- **FR-010**: Threshold comparisons MUST be inclusive at boundaries.
- **FR-011**: All thresholds, colors, actions, escalation rules and citations MUST come from a
  single shared configuration.

**Mental health**

- **FR-012**: System MUST compute a Mental Health Index (0–100, higher is better) as a weighted sum
  of normalized biometric, affect/voice and journal sentiment scores whose weights sum to 1.
- **FR-013**: When a source is missing, its weight MUST be redistributed proportionally to the
  remaining sources.
- **FR-014**: Elevated heart rate accompanied by high physical activity MUST NOT lower the
  biometric score.
- **FR-015**: Index below the caution threshold MUST show a yellow aura; below the critical
  threshold MUST pulse.
- **FR-016**: System MUST raise a discrepancy alert when the gap between any two source scores
  exceeds the configured discrepancy threshold; this alert MUST be shown to the astronaut and not
  escalated automatically.
- **FR-017**: Users MUST be able to type a journal entry and see its sentiment score and the
  updated index within 2 seconds.
- **FR-018**: System MUST show the index breakdown per source.

**Alerts and escalation**

- **FR-019**: Each alert MUST show reading, threshold, source citation, severity, recommended
  action and escalation target.
- **FR-020**: Caution alerts MUST target "Crew – self-manage"; critical alerts MUST target "Flight
  surgeon"; caution alerts persisting beyond the configured window MUST escalate to "Flight
  surgeon".
- **FR-021**: System MUST keep a time-ordered alert log for the session.

**NASA data**

- **FR-022**: System MUST retrieve recent solar energetic particle events from NASA's DONKI space
  weather service and list them with dates.
- **FR-023**: System MUST ship a cached copy of NASA event data and use it automatically when
  retrieval fails, labeling the data source as live or cached.
- **FR-024**: Users MUST be able to replay a listed real event to drive the radiation scenario.

**Demo and transparency**

- **FR-025**: System MUST provide scenario triggers for: solar particle event, CO leak, CO2
  buildup, cabin overheat, fever, sleep deprivation, EVA hand injury, "I'm fine" discrepancy,
  and Reset.
- **FR-026**: Simulated readings MUST be labeled "Simulated".
- **FR-027**: System MUST show short-term charts for key vitals and environment readings.
- **FR-028**: System MUST provide a Measurements panel listing each reading, onboard device type
  and spaceflight rationale.
- **FR-029**: The full dashboard MUST function without network access.

### Key Entities

- **Reading**: a measured or simulated value — category, metric, value, unit, timestamp,
  source (simulated / NASA live / NASA cached).
- **Threshold Rule**: metric, caution and critical bounds (high and/or low), persistence window,
  citation, recommended actions per severity.
- **Hazard Category**: name, aura color, affected body regions.
- **Alert**: category, metric, severity, reading, threshold, citation, recommended action,
  escalation target, created time, escalated flag.
- **Mental Health Index**: overall score, per-source scores, weights used, missing sources,
  discrepancy flag.
- **Journal Entry**: text, timestamp, sentiment score.
- **Space Weather Event**: NASA event identifier, start time, link, data source label.
- **Scenario**: name, description, ordered reading changes over time.
- **Astronaut Profile**: name/callsign, personal baselines (core temperature, resting heart rate,
  HRV), cumulative mission dose.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A viewer can identify which hazard category is active from the model alone within 5
  seconds, for each of the six categories.
- **SC-002**: Every scenario produces its visible aura change and alert within 3 seconds of being
  triggered.
- **SC-003**: 100% of displayed thresholds show a source citation.
- **SC-004**: The full demo script (all scenarios + journal + reset) runs end to end in under 5
  minutes, both with and without network access.
- **SC-005**: Each of the four challenge objectives can be pointed to on screen during the pitch.
- **SC-006**: A journal entry updates the Mental Health Index within 2 seconds of submission.
- **SC-007**: Threshold, severity, index and discrepancy logic pass 100% of their defined test
  cases.

## Assumptions

- Crew biometric and medical data are simulated because real astronaut data is not public.
- One astronaut profile is shown; a crew roster is out of scope.
- No user accounts or authentication; the dashboard is a single-user demo.
- SMAC values for CO and CO2 and cabin temperature comfort ranges will be taken from NASA
  documents during planning; until confirmed they are placeholders marked "verify" in the
  configuration.
- Sentiment analysis runs locally without an external AI service, so it works offline.
- The affect/voice score is simulated; live camera or microphone analysis is out of scope.
- Desktop browser at laptop or projector resolution is the target display; mobile is out of scope.
- Data is not persisted between sessions.
