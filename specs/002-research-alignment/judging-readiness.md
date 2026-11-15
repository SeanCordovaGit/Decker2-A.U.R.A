# Judging readiness audit — 2026-11-15

Sources: the user's five-point checklist, `Nasa Space Apps 26 (2).pdf` (13 pages), the previously supplied `sample.csv`, and the primary references linked below. The PDF is research input; its proposed features are not treated as implemented capabilities.

## Checklist

- [X] Actionable hand injury: right side, verbatim reported symptoms, simulated/crew-report source, current rule tier, referral steps and responder are visible. The panel stays beside the viewer on desktop and is collapsible on phones. Verified at 1366, 1024, 623 and 390 px widths, including rotation and mobile expansion. Reports/answers survive closing or switching panels in browser memory and clear on scenario change/reset.
- [X] Scientific distinctions: absorbed Gy/mGy are independent of effective mSv. The 600 mSv career-dose reference is explicitly not an acute emergency threshold. The 150 mSv cumulative warning and red review tier are identified as project policies.
- [X] Functional NASA input: real instrument-associated DONKI records carry event IDs, UTC timestamps and source metadata into an actual precaution alert without starting a synthetic crew-dose ramp. Browser replay confirmed an instrument-associated SOHO record, unchanged 145.0 mSv sample dose, retained hand incident/report and independent replay clearing.
- [X] Rule evidence: independently expected normal/caution/critical examples run against the backend evaluator in Reference → Research data. Unit tests cover boundaries, dose separation, report authority, NASA replay, MHI and Gemini grounding failures.
- [X] Presentation: an injury-first presenter script below demonstrates the localized incident, assessment, escalation and a second NASA space-weather hazard. The automatic orientation tour remains available separately.

## Parameter alignment and paper corrections

| Paper location | Finding and implementation decision |
| --- | --- |
| p.2 versus pp.3, 7 | The early orange-heat/category-red prose conflicts with the later action table. Retain the user's confirmed policy: all critical tiers red; caution radiation green, air gray, lowered temperatures blue, other general warnings yellow. |
| p.4 radiation table | Background daily dose is context, not a universal safe minimum. Above 150 mSv remains a project cumulative warning. At 600 mSv, the project red tier requests career-dose review; it does not diagnose acute radiation injury. “Acute warning threshold” at 150 mSv needs revision in the paper. |
| pp.4–5, 1 Gy | Keep an independent absorbed-dose input and the experimental lower-abdomen risk marker. Organoid findings do not establish a clinical human injury diagnosis or justify a general Gy-to-mSv conversion. |
| pp.5–6, CO | Retain 10/15/55/425 ppm references. The 10 ppm early warning and the app's concentration-only warning/escalation tiers are project-defined. A snapshot does not establish the stated 1-hour, 7-day or 30–180-day exposure duration and cannot confirm a fire. |
| pp.6–7, temperatures | Cabin nominal 18.3–26.7 °C; critical strictly below 16 or above 29 °C. Core nominal 36.5–37.5 °C; critical strictly below 35 or at/above 39 °C. Previously confirmed gaps remain caution. No new numeric thresholds were introduced by this version. |
| pp.8–9, fatigue | Preserve MHI, PVT reaction/lapse and absolute HRV cutoffs already implemented. Individual HRV baselines were not supplied. Alert cutoffs and composite weights remain project-defined; the NASA PVT+ guide supports the test protocol, not clinical validation of the composite. |
| pp.10–11, RR-1 | The statement that the exact RR-1 dataset is running in the background is not supported by supplied raw data. Only a static figure was provided. The app labels it as a reference; actual functional NASA input is DONKI. SMAC air-contaminant references are not radiation dose limits. |
| pp.11–13, architecture | Wearable ingestion, camera/voice analysis, encrypted persistent journals and a central database are proposed capabilities, not implemented integrations. Journal scoring is local/in-memory; Gemini incident review is optional, explicit and cloud-based. |

## Validate the photographed Gemini result

The model returns exact reported excerpts and existing finding IDs. A quoted statement is not itself a clinical conclusion. With a simulated hand grade of caution and no urgent answer, “I can't feel my hands” must not let Gemini independently change the tier. An explicit Yes to the blue/numb question creates a separate critical report alert. A simulated critical grade can also be critical without any urgent answer; its source must remain distinguishable. Persisted report flags say they came from an earlier confirmed answer and remain active until reset.

The public [NHS finger-injury reference](https://www.nhs.uk/conditions/broken-finger/) identifies numbness after injury as requiring immediate assessment. This supports an escalation prompt, not a fracture diagnosis or a mission-approved treatment procedure. Medical protocol review remains pending and treatment instructions remain withheld.

## Injury-first presenter script

1. **Establish provenance.** Start a fresh demonstration. Select AST-001 if showing the supplied CSV baseline: explain that it is a team-provided snapshot, not an actual astronaut record. The astronaut is the primary display.
2. **Report the incident.** Select Hand injury. Identify the right hand and the simulated crew assessment. Enter: “I injured my right hand while moving equipment. It hurts when I try to grip something.” Explain that the demo scenario advances its simulated grade; the app is not detecting damage from a camera.
3. **Show the decision.** The side panel gives the current tier, source, referral steps and responder. Answer follow-ups truthfully for the example. A separate numbness example can demonstrate explicit urgent-answer escalation; show its exact question ID in the findings. Do not call the outcome a diagnosis.
4. **Show bounded Gemini assistance.** Select Explain with Gemini. Point out exact report excerpts, canonical findings, source IDs, provider/model and timestamp in Trace. Severity and escalation remain controlled by the rule engine. The journal is not sent.
5. **Add a real NASA input.** Keep the injury active. Open dashboard panels → Space weather and replay an instrument-associated GOES or SOHO record. Read its event ID, UTC time, instrument/model and catalog source. The recorded NASA event adds a caution-level space-weather precaution while the hand incident remains active. It does not establish a current SEP event or a personal crew dose.
6. **State the missing measurements.** Open the exposure explanation: personal/area dosimetry, duration, shielding, location/EVA history and particle energy/flux are needed to assess actual exposure. Show that the replay did not inject a synthetic dose ramp. Clear only the NASA replay to demonstrate that the hand incident remains.
7. **Show proof.** Reference → Research data → Known-input rule checks displays expected versus actual results. Examples: core 37 °C nominal, 38.6 °C caution, 39 °C critical; cabin 16.5 °C caution, 15.9 °C critical. Explain the separate career-dose review and experimental Gy example.
8. **Close with the scope.** A working research demonstration of localized visualization, explicit assessment rules and traceable inputs. Integration with real onboard medical sensors and clinical approval remain future work.

## Primary references

- [NASA human-performance requirements, V1 4030](https://www.nasa.gov/reference/4-0-human-performance/): total career effective dose below 600 mSv.
- [NASA natural/induced environments](https://www.nasa.gov/reference/6-0-natural-and-induced-environments-vol-2/): separate acute and career protection requirements.
- [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/): catalog/API scope and event types.
- [NASA DONKI event guide](https://ccmc.gsfc.nasa.gov/DONKI/guide/events/): event metadata and instrument/location context.

## Verification record

- `pnpm test`: 148 tests passed across 11 files.
- `pnpm lint`: passed.
- `pnpm build`: passed, including TypeScript and both API routes.
- Playwright: four viewport layouts verified; no modal blocks the viewer; drag rotation remains available; mobile expansion reserves a separate astronaut area. Screenshots are in `output/playwright/workflow-uncovered-*.png`.
- Playwright: actual SOHO catalog ID/time displayed and used in precaution alert; crew dose unchanged; injury and its report/answers survive NASA replay and panel switching; clearing NASA replay preserves the injury. Reference shows 14 expected/actual checks passing.
- Live Gemini: identical numbness report with no structured urgent answer stays caution; Yes to `hand-sensation` becomes critical with question-specific evidence. Both accepted model responses preserve deterministic severity and contain no treatment steps.
- Surface motion: menus/notifications use 180 ms fade/scale; side panels/dialogs use 220 ms. Browser checks confirm opacity/transform transitions and zero-duration reduced-motion behavior.
- Production preview: http://localhost:3002.

No unit equivalence, live RR-1 stream, clinical approval or real flight-surgeon notification is claimed. The PDF itself has not been edited; the scientific revisions above are still required in the submission paper.
