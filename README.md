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

A.U.R.A. is our entry for the NASA Space Apps Challenge 2026 challenge *Create Health Monitoring Software for Astronauts on Space Missions*. The dashboard shows a rotatable 3D astronaut. When a body or environment reading crosses a threshold, an aura appears around the astronaut: its color tells you which hazard it is, and a steady or pulsing glow tells you how serious it is. When everything is normal, there is no aura.

Every alert explains itself: the reading, the threshold it crossed, the source of that threshold, a recommended action, and whether the crew can handle it or the flight surgeon on the ground needs to know. Radiation status is driven by real solar particle events from NASA's DONKI space weather database. Crew biometrics are simulated, because astronaut medical data is not public, and the app labels them as simulated.

> **Status:** in development for NASA Space Apps 2026. Progress is tracked in [`specs/001-aura-health-dashboard/tasks.md`](specs/001-aura-health-dashboard/tasks.md).

## Key Features

- **The aura:** one color per hazard, steady for caution, pulsing for critical. Injuries glow only on the affected body part.
- **Alerts that explain themselves:** reading, threshold, source citation, recommended action and who should respond on every alert.
- **Crew first, then ground:** caution alerts go to the crew to self-manage; critical or long-lasting ones escalate to the flight surgeon.
- **Real NASA data:** solar energetic particle events from NASA DONKI drive the radiation aura, and any real event can be replayed.
- **Mental Health Index:** combines biometrics, voice/affect and a private journal into one score, and flags when they disagree (for example, the journal says "I'm fine" while the body shows strain). That flag goes to the astronaut only.
- **Live demo scenarios:** one click triggers a solar particle event, CO leak, CO₂ buildup, cabin overheat or cold, fever, sleep deprivation, an EVA hand injury or the "I'm fine" discrepancy.
- **Works offline:** a bundled copy of real NASA data is used automatically when the network or API is down.
- **Measurements reference:** what is measured, with which onboard device, and why it matters in space.

## Aura Colors

| Color | Hazard | Example trigger |
|---|---|---|
| 🟢 Green | Radiation | Solar particle event, high cumulative mission dose |
| ⚪ Gray | Air quality | Carbon monoxide or CO₂ buildup |
| 🟠 Orange | Cabin heat | Cabin temperature above the habitable range |
| 🔵 Blue | Cabin cold | Cabin temperature below the habitable range |
| 🟡 Yellow | Mental / cognitive | Low Mental Health Index |
| 🔴 Red | Injury / cardiovascular | Injury or fever, shown on the affected body region |

No aura = nominal · steady glow = caution · pulsing glow = critical.

Thresholds and their sources (NASA-STD-3001, NASA SMAC tables, peer-reviewed literature) are listed in [`research.md`](specs/001-aura-health-dashboard/research.md).

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

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker

Uses the same root `.env.local` (optional). Then:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Next.js dev server and the backend unit tests in watch mode, side by side |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Lint the frontend |
| `pnpm test` | Run the unit tests |
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
