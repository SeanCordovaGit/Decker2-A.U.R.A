# Automatic first-visit demo

Approved direction: the website operates its own real controls, then hands control to the visitor. A skippable 38-second sequence runs after the astronaut model loads. Replay is available in Reference. Completion or Skip is remembered locally; unavailable storage does not prevent using the app.

| Element | Role | Starts | Duration | Motion | Relationship |
| --- | --- | --- | --- | --- | --- |
| Astronaut | Lead | 0 s | 4 s | Existing automatic rotation | Caption explains rotation and zoom; disabled with reduced motion |
| Crew status | Lead | 4 s | 4 s | Existing dropdown | Select AST-001 using the real store |
| Environment | Lead | 8 s | 4 s | Existing dropdown | Close Crew before opening Environment |
| Heart-rate adjustment | Lead | 12 s | 4 s | Open Telemetry and set simulated HR to 145 bpm | Show critical assessment and chest indicator |
| Hand injury scenario | Lead | 16 s | 6 s | Existing scenario/aura | Actual simulation progresses from caution to critical |
| Alert details | Support | 22 s | 4 s | Open existing alert content | Explain reading, source and responder |
| Gamma Radiation | Lead | 26 s | 6 s | Run the simulated gamma-dose condition | Distinguish the generated trend from NASA SEP records |
| Sample journal | Lead | 32 s | 6 s | Type explicitly labeled example; submit at 35 s | Show the real mental-health panel after local scoring |
| Caption, Pause, Skip | Static | 0 s | 38 s | No entrance or countdown animation | Remain accessible above the demo |

The demo temporarily replaces store data, captures the existing session, and restores it on completion, Skip, Escape or unmount. Input draft and manual viewer preference remain intact. Background controls are inert while the demonstration operates them. Pause stops timeline and simulated readings. Reduced motion removes automatic rotation and sample typing, preserving the explanation sequence.

The user requested animated focus and a caption location away from the bottom controls. On desktop, captions occupy the unused side opposite the highlighted control. On mobile, captions sit above the target. Non-focused UI transitions to 20% opacity and 3px blur over 260ms. Captions move between side positions over 300ms; their text fades/rises 5px over 220ms. Reduced-motion mode applies changes immediately.

## Implementation and checks

- [X] Add a frontend-only demo controller, real store actions and reliable cleanup; verify full run, Pause, Skip, repeat visit and replay in Playwright.
- [X] Wire controlled demonstration states into Dashboard, Environment, Viewport and JournalComposer; keep normal interactions intact and verify restored journal/profile.
- [X] Add frosted captions, source labels, focus handling and mobile highlights; verify screenshots and absence of page overflow.
- [X] Run unit tests, lint and production build; verify the final preview and leave it running.

Verification: desktop 1366×768 and mobile 390×844; first visit, remembered completion, pause/resume, Replay, Escape, early Reference dialog, Skip during details, and exact profile/draft restoration passed. A normal-motion video and screenshots verify 300ms caption movement, clear targets, blurred surroundings and cleanup after Skip. Reduced-motion mode was checked separately.

Feel check: review the hand-injury transition before alert details open, the journal typing-to-submit handoff, and Skip during an open details panel. The dashboard should return immediately without residual sample data or a delayed reopening.
