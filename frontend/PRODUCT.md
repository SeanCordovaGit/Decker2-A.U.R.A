# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** an astronaut on a long-duration mission checking their own health and cabin status. They see their own data first; a flight surgeon on the ground sees what escalates.
- **Demo audience:** NASA Space Apps 2026 judges watching a 3–5 minute live pitch on a laptop or projector. Every feature must be visible and triggerable in that pitch.

## Product Purpose

A.U.R.A. (Astro-Unified Response Algorithm) shows a rotatable 3D astronaut whose aura changes when a body or environment reading crosses a threshold. It answers the challenge's four objectives: which measurements can be taken in space and why, how spaceflight hazards affect health indicators, when a result needs the crew versus flight surgeons, and what action prevents a critical condition. Success: a viewer names the active hazard from the model alone within seconds, and every alert explains itself.

## Positioning

One glance at one body: hazard category is encoded as aura color and severity as steady versus pulsing glow, so status reads from the astronaut, not from a wall of numbers. Every alert carries its reading, threshold, cited source, recommended action and escalation target.

## Operating Context

- Desktop-first: laptop and projector during the pitch; collapses to a single-column phone layout.
- Demo is driven by scenario buttons (solar particle event, CO leak, CO₂ buildup, cabin overheat, cabin cold, fever, sleep deprivation, EVA hand injury, "I'm fine" discrepancy, reset) and a live journal entry.
- Must run fully offline using a bundled copy of real NASA data.

## Capabilities and Constraints

- Hazard categories and aura colors (color = category only): radiation green, air quality gray, cabin heat orange, cabin cold blue, mental/cognitive yellow, injury/cardiovascular red on the affected body region. Nominal = no aura, caution = steady, critical = pulsing.
- Mental Health Index (0–100) from biometrics, affect/voice, journal sentiment and PVT reaction time; a discrepancy alert goes to the astronaut only.
- Escalation: caution → crew self-manage; critical or persistent caution → flight surgeon.
- Stack: pnpm workspace; `frontend` (Next.js 16, React 19, Tailwind 4, three.js via React Three Fiber) and `backend` (`@aura/core`, pure TypeScript logic, Vitest). No database, no separate server.
- 3D model: NASA 3D Resources "Z2 Spacesuit" GLB (NASA's exploration suit prototype), a single Draco-compressed mesh with no skeleton; injuries render as glows anchored at body-region positions. The Draco decoder is served locally from `frontend/public/draco/` so the app stays offline-capable.
- Dark and light themes with a toggle.
- Specs: `specs/001-aura-health-dashboard/`; rules: `.specify/memory/constitution.md`.

## Brand Commitments

- Name: "Decker2 A.U.R.A.", Astro-Unified Response Algorithm.
- Visual reference supplied by the user: Google Stitch mocks "Astronaut Biometric Telemetry & 3D Aura HUD" (palette primary #00E5FF, secondary #00FF90, tertiary #FF3366, neutral #0B0E14; Space Grotesk for headlines and body, JetBrains Mono for labels; telemetry-HUD panels). Used as the basis, enhanced for hierarchy; content follows the spec, not the mocks.
- Wording: "designed to integrate with" NASA systems, never "integrated with".

## Evidence on Hand

- Real NASA DONKI solar energetic particle events: `backend/data/donki-sep-cache.json` (fetched 2026-11-14).
- NASA "Z2 Spacesuit" GLB from github.com/nasa/NASA-3D-Resources (JPEG fallback textures stripped, 2 MB).
- Thresholds and citations: `specs/001-aura-health-dashboard/research.md`; values marked VERIFY are not yet checked against NASA documents.
- Crew biometrics are simulated and must be labeled "Simulated". No real astronaut data, testimonials or endorsements exist; do not invent them.

## Product Principles

1. Status reads from the body first, numbers second.
2. Every threshold shows its source; unverified values say so.
3. Honest data: simulated is labeled, NASA data is real, no invented doses or treatments.
4. Crew autonomy: the astronaut sees alerts first; escalation is rule-based and visible.
5. Demo-first: anything not triggerable in the pitch is not built.

## Accessibility & Inclusion

Aura color is never the only signal: every hazard also has a text label, severity badge and icon, so color-blind viewers and projector washout still read status.
