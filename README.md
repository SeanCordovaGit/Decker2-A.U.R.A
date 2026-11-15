<div align="center">

# Decker2 A.U.R.A.

**Astro-Unified Response Algorithm: an astronaut health monitor where a 3D astronaut's aura shows what is wrong at a glance.**

![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.187-049EF4?style=for-the-badge&logo=threedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![NASA DONKI](https://img.shields.io/badge/NASA-DONKI-0B3D91?style=for-the-badge&logo=nasa&logoColor=white)

</div>

---

## About

A.U.R.A. is our entry for the NASA Space Apps Challenge 2026 challenge *Create Health Monitoring Software for Astronauts on Space Missions*. The dashboard shows a rotatable 3D astronaut. When a body or environment reading crosses a threshold, an aura appears around the astronaut: every critical condition is red, while caution colors identify general, temperature and environmental warnings. When everything is normal, there is no aura.

Every alert explains itself: the reading, the threshold it crossed, the source of that threshold, a recommended action, and whether the crew can handle it or the flight surgeon on the ground needs to know. Radiation status is driven by real solar particle events from NASA's DONKI space weather database. Crew biometrics are simulated, because astronaut medical data is not public, and the app labels them as simulated.

> **Status:** in development for NASA Space Apps 2026. Progress is tracked in [`specs/001-aura-health-dashboard/tasks.md`](specs/001-aura-health-dashboard/tasks.md).

## Key Features

- **The aura:** red for every critical condition; caution uses yellow for general warnings, blue for low temperature, green for radiation and gray for air quality. Injuries glow only on the affected body part.
- **Alerts that explain themselves:** reading, threshold, source citation, recommended action and who should respond on every alert.
- **Crew first, then ground:** caution alerts go to the crew to self-manage; critical or long-lasting ones escalate to the flight surgeon.
- **Real NASA data:** recorded solar energetic particle events from NASA DONKI add a space-weather precaution and radiation aura. Replays show event ID/time and never infer a personal crew dose.
- **Mental Health Index:** combines biometrics, voice/affect and a private journal into one score, and flags when they disagree (for example, the journal says "I'm fine" while the body shows strain). That flag goes to the astronaut only.
- **Live demo scenarios:** one click triggers a solar particle event, CO leak, CO₂ buildup, cabin overheat or cold, fever, sleep deprivation, an EVA hand injury or the "I'm fine" discrepancy.
- **Works offline:** a bundled copy of real NASA data is used automatically when the network or API is down.
- **Measurements reference:** what is measured, with which onboard device, and why it matters in space.

## Updated Research and Indicators

- On the first visit, a 28-second automatic demo operates the real controls, with Pause, Skip and Replay in Reference. The active area stays sharp while surrounding UI dims/blurs; captions occupy side space on desktop and the upper area on mobile. Completion/Skip is remembered locally. Demo data and sample journal entries are discarded and the previous session is restored.
- Hand injury and Cabin cold open **Next steps**: deterministic findings, follow-up questions, referral guidance, source links and an optional Gemini evidence summary. Explicit urgent-symptom answers create report-based alerts; they do not invent sensor measurements. Medical protocol review is pending and treatment instructions are withheld.
- To enable Gemini, add `GEMINI_API_KEY` to the root `.env.local` and restart the app. Optional `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite` (verified with the configured key); the model must support the generateContent JSON-schema response format. Keep the key server-only. **Explain with Gemini** explicitly sends the incident report, structured answers and relevant simulated readings to Google; journal entries are not sent. No key/network/model response is required for rule-based next steps.
- Gemini can return exact report excerpts and known source IDs only. Unrecognized fields, invented quotes/IDs, omitted critical findings and blocked/malformed responses are rejected. Severity, emergency escalation and guidance text are controlled by configuration. In-session response traces show source IDs and whether model output was accepted. No incident text is logged by the route. The route caps requests at 20/minute per server instance; a public deployment still needs appropriate access controls and provider-side quotas.

- Every critical condition is red. Caution uses yellow for general warnings, blue for low temperatures, green for radiation and gray for air quality. Nominal has no aura; critical also pulses.
- Five selectable AST demo profiles reproduce the supplied research rows. Supplied MHI values stay labeled as supplied until a scored journal check-in switches to the local three-source composite (biometrics, affect, journal; project-defined weights). PVT+ reaction time, lapses per 300-second test and absolute HRV bands are evaluated independently.
- `backend/data/crew-sample.csv` preserves the supplied `sample.csv` byte for byte. All five rows and 45 numeric fields are checked against the profiles. CSV snapshots remain fixed until a scenario is started; missing heart rate, CO2 and acute Gy values are shown as not supplied. Viewing a static snapshot does not infer sustained exposure. Core-temperature markers identify their cause, and readouts retain enough decimal places to avoid rounding across alert boundaries.
- CO has a team early warning at 10 ppm, 15 ppm long-duration context, escalation at the 55 ppm 7-day concentration reference, and critical at the 425 ppm 1-hour reference. The demo compares concentration; it does not establish exposure duration or confirm a fire.
- Cabin temperature is nominal at 18.3-26.7 C and critical below 16 C or above 29 C. Core temperature is nominal at 36.5-37.5 C and critical below 35 C or at/above 39 C. Intervening values remain caution, including the clarified gaps in the source table.
- Cumulative effective dose has a project warning above 150 mSv and a red career-dose review tier at 600 mSv; the career reference is not an acute emergency threshold. The independent experimental absorbed-dose input highlights a lower-abdomen research risk marker at 1 Gy, not a clinical diagnosis. Gy/mGy and mSv are not treated as interchangeable.
- The Research data reference tab contains the supplied lab table and figures. They are static research references, not live lab or RR-1 feeds. DONKI remains the bundled real NASA dataset used by the app.

Sources and operators live in `backend/config/aura.ts`. Project-defined bands and unverified source transcriptions are labeled in the UI. The implementation record is in [updated-data.md](specs/002-research-alignment/updated-data.md). The latest paper audit, checklist evidence and injury-first presenter script are in [judging-readiness.md](specs/002-research-alignment/judging-readiness.md).

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| 3D | three.js, React Three Fiber, drei |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Tests | Vitest (threshold, severity, Mental Health Index and sentiment logic) |
| NASA data | DONKI Solar Energetic Particle API |
| Tooling | pnpm workspace, Spec Kit, Docker |

## Getting Started

### Prerequisites

- Node.js 22.13 or newer
- pnpm 11 (`npm install -g pnpm@11`)
- Optional: a free NASA API key from [api.nasa.gov](https://api.nasa.gov). Without one the app uses `DEMO_KEY`, which is rate-limited, and falls back to the bundled data.

### Environment variables

Copy the example file and add your key:

```bash
cp .env.example .env.local
```

[`.env.example`](.env.example):

```bash
NASA_API_KEY=
```

| Variable | Required | Purpose |
|---|---|---|
| `NASA_API_KEY` | No | Key for NASA's DONKI API. Without it the app uses `DEMO_KEY` and the bundled data. |

Both live at the repository root and are shared by the frontend and the backend scripts. `.env.local` is git-ignored and kept out of the Docker image. On Vercel, set `NASA_API_KEY` under Project Settings → Environment Variables.

### Run locally

```bash
pnpm install
pnpm dev
```

`pnpm dev` first builds and starts the Docker container (needs Docker Desktop running), then the dev server. Open [http://localhost:3000](http://localhost:3000) for the dev server with hot reload; the container's production build is at [http://localhost:3001](http://localhost:3001). Run `pnpm docker:down` to stop the container when you're done.

### Run with Docker

The easiest way to run the app without worrying about your local Node or package versions. The image installs exactly what `pnpm-lock.yaml` pins, and rebuilds that step whenever `package.json` or the lockfile changes. It uses the same root `.env.local` (optional).

```bash
pnpm docker:up     # build and start in the background
pnpm docker:logs   # follow the app's logs (Ctrl+C to stop following)
pnpm docker:down   # stop and remove the container
```

Open [http://localhost:3001](http://localhost:3001) (port 3001, so it can run next to the dev server on 3000). Without Node or pnpm installed, run the same commands with `docker compose` directly: `docker compose up --build -d`, `docker compose logs -f aura`, `docker compose down`.

If the build fails with `ERR_PNPM_OUTDATED_LOCKFILE`, someone changed a `package.json` without updating the lockfile. Run `pnpm install` and commit `pnpm-lock.yaml`.

### Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Build and start the Docker container (port 3001), then the Next.js dev server (port 3000) and the backend unit tests in watch mode |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint the frontend |
| `pnpm test` | Run the unit tests |
| `pnpm docker:up` / `docker:logs` / `docker:down` | Build and run the app in Docker on port 3001, follow its logs, stop it |
| `bash backend/smoke-test.sh [url]` | Check the running app's API against its contract |

## Project Structure

```text
frontend/   Next.js app: pages, API route, 3D scene and dashboard panels
backend/    @aura/core: thresholds config, evaluation logic, NASA data cache
specs/      Spec Kit documents: spec, plan, tasks, research, contracts
.specify/   Spec Kit templates, scripts and the project constitution
```

## Data and Honesty

- **Real:** NASA DONKI solar energetic particle events.
- **Simulated:** crew biometrics, affect/voice scores and injuries, labeled "Simulated" in the app.
- A.U.R.A. is a prototype *designed to integrate with* onboard sensors and NASA systems; it is not connected to them.
