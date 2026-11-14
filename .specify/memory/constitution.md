<!--
Sync Impact Report
- Version change: template (unversioned) → 1.0.0
- Modified principles: all template placeholders replaced (initial ratification)
- Added principles: I. Demo-First; II. Scientific Honesty; III. Real NASA Data With Offline Fallback;
  IV. Single Source of Truth; V. Visual Clarity; VI. Simplicity; VII. Crew Autonomy & Privacy;
  VIII. Lightweight Verification
- Added sections: Technical Constraints; Development Workflow & Quality Gates; Governance
- Removed sections: none
- Deferred TODOs: none
-->

# Decker2 A.U.R.A. Constitution

A.U.R.A. (Astro-Unified Response Algorithm) is a NASA Space Apps 2026 entry for the challenge
"Create Health Monitoring Software for Astronauts on Space Missions". Hard deadline:
2026-11-15 23:59 (local time of the team).

## Core Principles

### I. Demo-First

- Every feature MUST be visible and triggerable during a live 3–5 minute pitch.
- A working, demonstrable feature MUST be preferred over a complete but unfinished one.
- Features that cannot be shown in the demo MUST NOT be built before the deadline.

Rationale: judging happens through the demo; unseen work earns no credit.

### II. Scientific Honesty

- Every alert threshold MUST cite a source (NASA-STD-3001, NASA SMAC tables, or peer-reviewed
  literature) in code and in the UI where the threshold is shown.
- Simulated data MUST be labeled "Simulated" in the UI and described as simulated in the pitch.
- The product MUST NOT claim live integration with real NASA systems; use "designed to
  integrate with".

Rationale: judges include domain experts; one unsupported number undermines the whole entry.

### III. Real NASA Data With Offline Fallback

- At least one real NASA dataset MUST drive visible app behavior. The baseline is the NASA
  DONKI space weather API (solar energetic particle events) driving the radiation aura.
- A cached copy of the NASA data MUST ship with the app and be used automatically when the
  network or API fails, so the demo never depends on connectivity.

Rationale: the challenge requires NASA data; venue networks are unreliable.

### IV. Single Source of Truth

- Thresholds, aura colors, severity levels, recommended actions, escalation rules, and source
  citations MUST live in one typed configuration module consumed by both UI and logic.
- Hard-coded threshold numbers or colors outside that module are prohibited.

Rationale: keeps the research document, the dashboard, and the pitch consistent.

### V. Visual Clarity

- Aura color MUST encode hazard category only; severity MUST be encoded by intensity and pulse.
- The nominal state MUST show no aura.
- Category colors: radiation = green, air quality = gray, cabin heat = orange, cabin cold = blue,
  mental/cognitive = yellow, injury/cardiovascular = red localized to the affected body region.
- Severity levels: nominal, caution, critical. Status badges (not aura colors) MAY use
  green/amber/red.

Rationale: one color with one meaning is readable at a glance during a demo.

### VI. Simplicity

- One Next.js application in TypeScript. No separate backend service, no database.
- New dependencies MUST be justified by a demo-visible need.
- Simulated telemetry is generated in-app by a scenario engine.

Rationale: a single deployable unit minimizes integration risk under a ~36-hour deadline.

### VII. Crew Autonomy & Privacy

- The astronaut MUST see their own alerts first.
- Escalation to flight surgeons MUST follow explicit, rule-based criteria defined in the
  configuration (e.g., critical severity or caution persisting beyond a defined duration).
- The system MUST NOT be framed as covert surveillance; monitoring is opt-in by design.

Rationale: crew acceptance determines whether health monitoring is used at all.

### VIII. Lightweight Verification

- Unit tests are REQUIRED for threshold evaluation, severity classification, the Mental Health
  Index, and discrepancy detection.
- UI is verified manually by running the demo script end to end before submission.
- Broader test suites are out of scope before the deadline.

Rationale: logic errors produce wrong alerts; UI issues are caught by rehearsal.

## Technical Constraints

- Stack: Next.js (App Router) + TypeScript, React Three Fiber + drei for 3D, Tailwind CSS for UI,
  Vitest for unit tests, deployment to Vercel.
- External data: NASA DONKI via api.nasa.gov with a personal API key; DEMO_KEY only for local
  development.
- Crew biometric data is simulated because astronaut medical data is not public.
- The app MUST run locally with `npm run dev` without network access (using cached data).

## Development Workflow & Quality Gates

- Work follows Spec Kit: specify → plan → tasks → implement → converge.
- Before submission: unit tests pass, `npm run build` succeeds, the demo script runs end to end
  offline and online, and every displayed threshold shows its citation.
- Commits are pushed regularly; the container and machines are not trusted to persist work.

## Governance

- This constitution supersedes other project practices. Plans and tasks MUST pass a
  Constitution Check against these principles.
- Amendments are made via `/speckit-constitution`, recorded with a version bump:
  MAJOR for principle removals or redefinitions, MINOR for added or expanded principles,
  PATCH for clarifications.
- Any deviation (e.g., adding a backend) MUST be justified in the plan's Complexity Tracking.

**Version**: 1.0.0 | **Ratified**: 2026-11-14 | **Last Amended**: 2026-11-14
