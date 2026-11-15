---
name: Decker2 A.U.R.A.
description: Telemetry HUD where the astronaut is the display; hazards bloom as auras on the body and every panel explains them.
colors:
  ink-ground: "#0b0e14"
  panel: "#11161f"
  panel-raised: "#171e2a"
  panel-high: "#1e2736"
  hairline: "#222b3a"
  hairline-strong: "#314058"
  text: "#e6edf7"
  text-2: "#a9b4c7"
  text-3: "#8591a6"
  signal-cyan: "#00e5ff"
  signal-cyan-ink: "#00161a"
  signal-cyan-soft: "rgb(0 229 255 / 0.12)"
  caution-amber: "#ffb020"
  caution-amber-soft: "rgb(255 176 32 / 0.14)"
  caution-on-observation: "#ffc861"
  uplink-ok: "#8ce3b4"
  observation-void: "#05070c"
  observation-glass: "rgb(8 11 17 / 0.8)"
  porcelain-ground: "#e9eef4"
  porcelain-panel: "#ffffff"
  porcelain-panel-raised: "#f4f7fa"
  porcelain-panel-high: "#e8edf3"
  porcelain-hairline: "#d6dee8"
  porcelain-hairline-strong: "#b8c4d3"
  porcelain-text: "#0b0e14"
  porcelain-text-2: "#3b4658"
  porcelain-text-3: "#556175"
  signal-cyan-text-light: "#00727f"
  signal-cyan-soft-light: "rgb(0 170 190 / 0.1)"
  caution-amber-light: "#a35f00"
  caution-amber-soft-light: "rgb(255 176 32 / 0.18)"
  uplink-ok-light: "#1d7a4a"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    letterSpacing: "-0.02em"
    fontFeature: "\"ss01\""
  brand:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  readout:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1
    fontFeature: "\"tnum\""
  body:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"ss01\""
  body-small:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
  tag:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  chip: "4px"
  control: "5px"
  panel: "6px"
  pill: "9999px"
spacing:
  hair: "2px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  rail-left: "300px"
  rail-right: "340px"
components:
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "16px"
  panel-header:
    typography: "{typography.title}"
    textColor: "{colors.text}"
    height: "44px"
    padding: "8px 16px"
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.signal-cyan-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-secondary:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.panel-high}"
  button-secondary-pressed:
    backgroundColor: "{colors.signal-cyan-soft}"
    textColor: "{colors.text}"
  button-ghost:
    textColor: "{colors.text-2}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-ghost-hover:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
  input:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  badge-nominal:
    textColor: "{colors.text-3}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  badge-caution:
    backgroundColor: "{colors.caution-amber-soft}"
    textColor: "{colors.caution-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  badge-critical:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ink-ground}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  tag-neutral:
    textColor: "{colors.text-2}"
    typography: "{typography.tag}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  tag-accent:
    backgroundColor: "{colors.signal-cyan-soft}"
    textColor: "{colors.signal-cyan}"
    typography: "{typography.tag}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  tag-caution:
    backgroundColor: "{colors.caution-amber-soft}"
    textColor: "{colors.caution-amber}"
    typography: "{typography.tag}"
    rounded: "{rounded.chip}"
    padding: "2px 6px"
  segmented-tab:
    textColor: "{colors.text-3}"
    rounded: "{rounded.chip}"
    padding: "2px 8px"
  segmented-tab-active:
    backgroundColor: "{colors.panel-high}"
    textColor: "{colors.text}"
  viewport-frame:
    backgroundColor: "{colors.observation-void}"
    rounded: "{rounded.panel}"
  viewport-chip:
    backgroundColor: "{colors.observation-glass}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "4px 8px"
  body-callout:
    backgroundColor: "{colors.observation-glass}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "4px 8px"
  telemetry-readout:
    textColor: "{colors.text}"
    typography: "{typography.readout}"
    padding: "10px 12px"
---

# Design System: Decker2 A.U.R.A.

## Overview

**Creative North Star: "The Body Is the Display"**

A.U.R.A. is a telemetry HUD built around one object: NASA's astronaut model standing in a dark observation window, wearing its hazards as coloured auras. Everything else is instrumentation that explains what the body shows. The surrounding panels are quiet, tonal and hairline-ruled so the only saturated colour on a calm screen comes from a hazard, and on a nominal screen there is almost none.

The world descends from the user-pinned Google Stitch telemetry mocks: an ink ground with stepped panel tones, 1px hairlines, tight 6px corners, Space Grotesk for words and JetBrains Mono for anything measured. It is dense in the way an operations console is dense: three columns, small type, every number tabular, nothing decorative that does not carry state. A light theme swaps the ground for cool porcelain, but the 3D viewport stays a dark observation window in both, because an aura needs a dark ground to read.

Rejected by the direction contract: a grid of KPI tiles with a 3D toy in a corner. The model is the centre of the layout, not an accessory to it.

**Key Characteristics:**
- Colour means hazard category; severity is carried by intensity and label, never by hue.
- Cyan is the hand of the operator: interaction, focus, selection, and the viewport's instrument framing.
- Flat tonal panels with a soft ambient shadow; depth comes from the observation window, not from cards.
- Mono for readouts, units, badges and labels; grotesk for titles and prose.
- Body-anchored callouts with leader lines are the signature move.

## Colors

A near-monochrome ink instrument panel where colour is rationed to two jobs: cyan for the operator's hand, category hues for hazards.

### Primary
- **Signal Cyan** (signal-cyan): interaction, focus and selection only. Primary button fill, pressed scenario state, focus rings, text selection, input caret, the "A.U.R.A." wordmark, the corner brackets on the viewport, and the rotating stage ring under the model. In the light theme, text-bearing cyan darkens to signal-cyan-text-light for contrast while fills keep the full cyan. Never used for data.

### Secondary
- **Caution Yellow**: general caution badges and warnings use the configured yellow; environmental and lowered-temperature caution indicators retain green, gray, and blue respectively.

### Hazard Category Colours (referenced, not owned)
Action indicator colors live only in `backend/config/aura.ts`. Use `getIndicatorColor(category, severity, context)` for active indicators: every critical condition is red; caution radiation is green, caution air quality is gray, caution low temperature is blue, and other caution conditions are yellow. Pass metric direction for low core temperature. Apply the result to auras, callouts, swatches, alert values, dose meters, and MHI bars.

### Neutral
- **Ink Ground** (ink-ground): page background in the dark theme; also the inverted critical badge text.
- **Panel / Panel Raised / Panel High** (panel, panel-raised, panel-high): three tonal steps for panels, nested surfaces (alert cards, inputs, secondary buttons) and active/pressed fills.
- **Hairline / Hairline Strong** (hairline, hairline-strong): panel borders and dividers; strong for control outlines, nominal badges and scrollbars.
- **Text / Text 2 / Text 3** (text, text-2, text-3): primary, secondary and tertiary ink. Text 3 carries labels, units and metadata.
- **Observation Void** (observation-void): the 3D viewport ground in both themes. **Observation Glass** (observation-glass): translucent fill for chips and callouts floating over the scene.
- **Porcelain set** (porcelain-*): the light-theme equivalents of ground, panels, hairlines and text.
- **Uplink OK** (uplink-ok): the live-data dot in the top bar only.

### Named Rules
**The Action Indicator Rule.** Read all indicator colors from the central configuration. Critical severity overrides every category with red; keep explicit category and severity labels beside indicators.

**The Critical Is Red Rule.** All critical conditions use red, including environmental hazards and low temperatures. Injury effects remain localized, with yellow at caution and red at critical.

**The Cyan Is the Operator Rule.** Signal Cyan marks what the user can touch, what has focus and what is selected. A cyan number or chart is a bug.

## Typography

**Display Font:** Space Grotesk (with ui-sans-serif, system-ui)
**Body Font:** Space Grotesk, stylistic set ss01 on
**Label/Mono Font:** JetBrains Mono (with ui-monospace)

**Character:** A slightly mechanical grotesk for names and sentences, set against a monospaced instrument face for every measured thing. The split is semantic: if it was read off a sensor or is a status word, it is mono.

### Hierarchy
- **Display** (JetBrains Mono 600, 40px, line-height 1, -0.03em, tabular): the Mental Health Index score; the single large number on screen.
- **Headline** (Space Grotesk 600, 20px, -0.02em): the crew-status summary sentence ("1 hazard active").
- **Brand** (Space Grotesk 700, 17px, -0.02em): product name in the top bar.
- **Title** (Space Grotesk 600, 14px, -0.01em): panel titles in sentence case.
- **Readout** (JetBrains Mono 500, 18px, line-height 1, tabular): telemetry values; critical values go to 700 weight, units drop to 11px text-3.
- **Body** (Space Grotesk 400, 13px): category rows, alert titles, buttons, inputs.
- **Body small** (Space Grotesk 400, 12px): alert detail grids, helper lines, scenario buttons.
- **Label** (JetBrains Mono 500, 11px, line-height 1): severity badges, viewport chips, callouts, log lines. Telemetry labels use the same 11px size in Space Grotesk, text-3.
- **Tag** (JetBrains Mono 500, 10px, 0.04em, uppercase): provenance tags only ("Simulated", "Team-defined", "Verify", "Cached").

### Named Rules
**The Measured-Is-Mono Rule.** Values, units, clocks, thresholds, badges and log lines use JetBrains Mono with tabular numerals; titles and prose never do.

**The Uppercase-Is-Provenance Rule.** Uppercase is reserved for the 10px provenance tag. Panel titles and labels stay sentence case; there are no eyebrows or kickers above titles.

## Layout

A three-column operations grid at desktop: a 300px left rail (crew status, then alerts), a fluid centre (3D viewport filling the height above a telemetry strip), and a 340px right rail (demo scenarios, Mental Health Index, NASA space weather). The grid uses 12px gaps and 12px outer padding, fills the viewport height at `lg` (minimum 760px) with independently scrolling rails, and places reference material below the fold. Panel bodies use 16px padding; panel headers are at least 44px tall with 8px by 16px padding. Rows inside panels step at 6px; detail grids use a fixed 76px label column.

Below `lg` the grid collapses to one column with the viewport first. The telemetry strip reflows from 7 columns (`xl`) to 4 (`sm`) to 2, with vertical hairline dividers only at `xl`. The top bar wraps, and the theme toggle moves beside the brand on phones.

## Elevation & Depth

Flat tonal layering with one soft ambient shadow. Panels sit on the ground with a 1px hairline and a quiet shadow (dark: `0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -12px rgb(0 0 0 / 0.6)`; light: `0 1px 2px rgb(15 30 50 / 0.06), 0 8px 24px -14px rgb(15 30 50 / 0.18)`). Nested surfaces step up through panel-raised and panel-high instead of adding shadows. Real depth lives in one place: the observation window, where the lit model, starfield and additive aura glow give the screen its only volume.

### Shadow Vocabulary
- **Panel ambient** (the theme's panel shadow above): every panel, including the viewport frame.
- **Category glow** (`0 0 10px 1px <category colour>` on swatches, `0 0 8px 1px` on callout markers): marks an active hazard; never applied to anything that is not a category.

### Named Rules
**The One Window Rule.** Volume, glow and darkness belong to the observation window. Panels stay flat and tonal in both themes.

## Shapes

Tight, instrument-like corners: 6px panels, 5px controls (buttons, inputs, alert cards, summary boxes, segmented tabs container), 4px chips (badges, tags, viewport chips, callouts, active tab), full pills only for dots, swatches and meter tracks. Every border is a 1px hairline. Corner brackets (14px arms, 1px, cyan at 55% opacity, inset 10px) frame the viewport and nothing else.

**The Brackets Are the Window Rule.** Corner brackets mark the observation window only; no panel, card or button gets them.

**The Even Border Rule.** Borders are uniform 1px on all sides. No coloured side stripes on cards, alerts or rows; category identity comes from the swatch beside the label.

## Components

### Buttons
Compact and quiet; the only loud button is the one that commits.
- **Shape:** 5px corners, 1px border, 6px by 12px padding, 13px medium grotesk, 150ms colour transitions.
- **Primary:** cyan fill with cyan-ink text (journal "Log"). Hover brightens 10%.
- **Secondary:** panel-raised fill, hairline-strong border; hover lifts to panel-high with a cyan-tinted border. Pressed (selected scenario) takes the cyan-soft fill and a cyan border, and its icon turns cyan.
- **Ghost:** no border or fill, text-2; hover fills panel-raised (Reset).
- **Disabled:** 50% opacity, not-allowed cursor.

### Severity Badges
- **Style:** 11px mono label with a 6px leading dot, 4px corners, 2px by 6px padding.
- **Nominal:** hairline-strong outline, text-3, dot at 60%.
- **Caution:** amber-soft fill, amber border at 50%, amber text; steady.
- **Critical:** inverted: ink fill (text colour), ground-colour text, semibold; the dot pulses.

### Provenance Tags
10px uppercase mono, 4px corners. Neutral (outline, text-2) for "Simulated" and "Team-defined"; caution for "Verify" and "Cached"; accent for interactive provenance.

### Cards / Containers
- **Corner Style:** 6px panels; 5px nested cards.
- **Background:** panel; nested alert cards and summary boxes on panel-raised.
- **Shadow Strategy:** panel ambient only (see Elevation).
- **Border:** 1px hairline; critical alert cards strengthen the border to text at 45%; the crew-status summary takes the amber-soft treatment at caution and panel-high with a stronger ink border at critical.
- **Internal Padding:** 16px panels, 12px cards, 10px by 12px summary box.

### Inputs / Fields
- **Style:** panel-raised fill, hairline-strong border, 5px corners, 13px text, text-3 placeholder, cyan caret.
- **Focus:** border shifts to cyan text at 70%; global focus-visible is a 2px cyan outline at 2px offset.

### Navigation
Top bar on panel with a bottom hairline: aura mark and product name left, a mono definition list (crew, mission clock, uplink dot and state) and a 32px square theme toggle right. Panel-level switching uses a segmented control: panel-raised track with 2px padding, active segment on panel-high in text colour, inactive in text-3.

### Telemetry Strip
Seven readouts, each a text-3 label, an 18px mono value with a small unit, and a 120 by 32 trace of the last 60 seconds. Nominal traces are text-2, caution values and traces are amber, critical values are bold in text colour. A dashed amber line marks the caution threshold. Values do not animate.

### Body Callout (signature)
A label pinned to the 3D model by a leader line that tracks the anchor as the model turns. Anatomy: an 8px marker dot in the category colour with category glow, a 40px 1px leader line in the category colour at 80% opacity, and a 4px-corner label on observation glass with a category-colour border at 60%, 11px mono text ("Right hand · critical"). The severity word is caution-on-observation at caution and white semibold at critical, where the marker dot also pulses. Callouts run left or right by the anchor's side and rise "up" for hands so they never run off the viewport edge.

### Observation Window
The viewport panel with the observation-void ground in both themes, corner brackets, a slowly rotating cyan stage ring under the model, translucent mono chips for active hazards and the rotation control at the top, and a category legend over a gradient fade at the bottom. Auras ease toward their severity target: nominal none, caution steady glow, critical pulsing; pulsing stops under reduced motion.

## Do's and Don'ts

### Do:
- **Do** read every category colour from `CATEGORY_META` in `backend/config/aura.ts`; that file is the only place they live.
- **Do** carry severity by intensity and words: no aura or outline badge at nominal, steady amber at caution, pulsing aura plus inverted ink badge at critical.
- **Do** keep the 3D viewport on observation-void (#05070c via the token) in both themes, framed by corner brackets.
- **Do** pair every colour swatch with a text label; colour is never the only signal.
- **Do** set every measured value in JetBrains Mono with tabular numerals.
- **Do** honour reduced motion: auto-rotation and pulses stop.

### Don't:
- **Don't** use red, or any colour, to mean severity; red means injury.
- **Don't** use Signal Cyan for data, charts or readings.
- **Don't** hard-code a category hex in frontend code or add a new hue outside the category set.
- **Don't** put corner brackets on anything but the viewport frame.
- **Don't** use coloured side borders on cards, alerts or rows.
- **Don't** put eyebrows or kickers above panel titles.
- **Don't** pulse telemetry numbers; the pulse belongs to auras, callout markers and critical badge dots.
