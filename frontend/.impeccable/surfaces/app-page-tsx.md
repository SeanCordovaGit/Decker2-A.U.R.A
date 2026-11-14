---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief: A.U.R.A. dashboard (app/page.tsx)

## Scope
- Mode: Operate. One screen, desktop first (1280–1600 wide, projector), collapsing to one column at phone width. Dark and light themes with a toggle; the 3D viewport stays a dark observation window in both, because the aura glow needs a dark ground.
- Audience and job: astronaut reading their own status; judges watching a live pitch. Task: see which hazard is active from the body, read why, act.
- Content: spec FR-001…FR-029 and `specs/001-aura-health-dashboard/quickstart.md`. Stitch mock modules are reused as layouts only; no invented doses, organ panels or drug buttons.
- Code-led build (Operate surface; no image generation).

## Direction contract
THESIS: The astronaut is the display. NASA's suit model sits at the centre wearing its hazards as auras, and every panel around it explains what the body shows. Refuses the category default: a grid of KPI tiles with a 3D toy in a corner.
OWN-WORLD: Google Stitch telemetry HUD, pinned by the user. Ink ground #0B0E14 with tonal panel layers (light theme: cool porcelain ground, ink text). Cyan #00E5FF only for interaction, focus and selection. Category colours (radiation #00FF90, air #A3AEC2, heat #FF8A3D, cold #4D7CFF, mental #FFD23F, injury #FF3366) appear only where a hazard is meant. Space Grotesk for headings and prose, JetBrains Mono for readouts, units and labels. 1px hairlines, 6px corners, corner brackets on the viewport frame only.
STORY: The viewer sees a calm astronaut with no aura. A scenario fires; a coloured aura blooms and a callout pins to the body; the alert beside it gives reading, threshold, source, action and who responds. They trust it because sources and "Simulated" labels are visible.
FIRST VIEWPORT: Top bar: product name, mission elapsed clock, uplink state, theme toggle. Left rail (300px): crew status (callsign, overall state, six category rows with severity) then active alerts. Centre: 3D viewport filling the height minus a telemetry strip below it (dose rate, CO, CO₂, core temp, heart rate, PVT with recent history). Right rail (340px): demo scenarios first, then Mental Health Index with journal, then NASA space weather. Reference (measurements, objectives, legend) below the fold.
FORM: Stitch HUD as the user supplied it, enhanced for hierarchy; no roll. Signature move: body-anchored callouts, leader lines from a marker on the model to a label ("Radiation · caution", "Right hand · critical") that track the body as it rotates. seed: none (direction pinned by user; roll not run)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions
- Threshold values marked VERIFY await the research team.
