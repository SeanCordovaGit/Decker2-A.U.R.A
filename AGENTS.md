# AGENTS.md

Drop-in operating instructions for coding agents. Read this file in its entirety and follow the directions before every task.

**Working code only. Finish the job. Plausibility is not correctness.**

This file follows the [AGENTS.md](https://agents.md) open standard (Linux Foundation / Agentic AI Foundation). Claude Code, Codex, Cursor, Windsurf, Copilot, Aider, Devin, Amp read it natively. For tools that look elsewhere, symlink:

```bash
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

---

## 0. Non-negotiables

These rules override everything else in this file when in conflict:

1. **No flattery, no filler.** Skip openers like "Great question", "You're absolutely right", "Excellent idea", "I'd be happy to". Start with the answer or the action.
2. **Disagree when you disagree.** If the user's premise is wrong, say so before doing the work. Agreeing with false premises to be polite is the single worst failure mode in coding agents.
3. **Never fabricate.** Not file paths, not commit hashes, not API names, not test results, not library functions. If you don't know, read the file, run the command, or say "I don't know, let me check."
4. **Stop when confused.** If the task has two plausible interpretations, ask. Do not pick silently and proceed.
5. **Touch only what you must.** Every changed line must trace directly to the user's request. No drive-by refactors, reformatting, or "while I was in there" cleanups.

---

## 1. Before writing code

**Goal: understand the problem and the codebase before producing a diff.**

- State your plan in one or two sentences before editing. For anything non-trivial, produce a numbered list of steps with a verification check for each.
- Read the files you will touch. Read the files that call the files you will touch. Claude Code: use subagents for exploration so the main context stays clean.
- Match existing patterns in the codebase. If the project uses pattern X, use pattern X, even if you'd do it differently in a greenfield repo.
- Surface assumptions out loud: "I'm assuming you want X, Y, Z. If that's wrong, say so." Do not bury assumptions inside the implementation.
- If two approaches exist, present both with tradeoffs. Do not pick one silently. Exception: trivial tasks (typo, rename, log line) where the diff fits in one sentence.

---

## 2. Writing code: simplicity first

**Goal: the minimum code that solves the stated problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code. No configurability, flexibility, or hooks that were not requested.
- No error handling for impossible scenarios. Handle the failures that can actually happen.
- If the solution runs 200 lines and could be 50, rewrite it before showing it.
- If you find yourself adding "for future extensibility", stop. Future extensibility is a future decision.
- Bias toward deleting code over adding code. Shipping less is almost always better.

The test: would a senior engineer reading the diff call this overcomplicated? If yes, simplify.

---

## 3. Surgical changes

**Goal: clean, reviewable diffs. Change only what the request requires.**

- Do not "improve" adjacent code, comments, formatting, or imports that are not part of the task.
- Do not refactor code that works just because you are in the file.
- Do not delete pre-existing dead code unless asked. If you notice it, mention it in the summary.
- Do clean up orphans created by your own changes (unused imports, variables, functions your edit made obsolete).
- Match the project's existing style exactly: indentation, quotes, naming, file layout.

The test: every changed line traces directly to the user's request. If a line fails that test, revert it.

---

## 4. Goal-driven execution

**Goal: define success as something you can verify, then loop until verified.**

Rewrite vague asks into verifiable goals before starting:

- "Add validation" becomes "Write tests for invalid inputs (empty, malformed, oversized), then make them pass."
- "Fix the bug" becomes "Write a failing test that reproduces the reported symptom, then make it pass."
- "Refactor X" becomes "Ensure the existing test suite passes before and after, and no public API changes."
- "Make it faster" becomes "Benchmark the current hot path, identify the bottleneck with profiling, change it, show the benchmark is faster."

For every task:

1. State the success criteria before writing code.
2. Write the verification (test, script, benchmark, screenshot diff) where practical.
3. Run the verification. Read the output. Do not claim success without checking.
4. If the verification fails, fix the cause, not the test.

---

## 5. Tool use and verification

- Prefer running the code to guessing about the code. If a test suite exists, run it. If a linter exists, run it. If a type checker exists, run it.
- Never report "done" based on a plausible-looking diff alone. Plausibility is not correctness.
- When debugging, address root causes, not symptoms. Suppressing the error is not fixing the error.
- For UI changes, verify visually: screenshot before, screenshot after, describe the diff.
- Use CLI tools (gh, aws, gcloud, kubectl) when they exist. They are more context-efficient than reading docs or hitting APIs unauthenticated.
- When reading logs, errors, or stack traces, read the whole thing. Half-read traces produce wrong fixes.

---

## 6. Session hygiene

- Context is the constraint. Long sessions with accumulated failed attempts perform worse than fresh sessions with a better prompt.
- After two failed corrections on the same issue, stop. Summarize what you learned and ask the user to reset the session with a sharper prompt.
- Use subagents (Claude Code: "use subagents to investigate X") for exploration tasks that would otherwise pollute the main context with dozens of file reads.
- When committing, write descriptive commit messages (subject under 72 chars, body explains the why). No "update file" or "fix bug" commits. No "Co-Authored-By: Claude" attribution unless the project explicitly wants it.
- When the user says "commit this" (or similar) after a multi-part change, do not make one commit. Split the diff into atomic commits along logical boundaries: core logic, then call-sites/wiring that use it, then tests, then docs — in that order, each buildable/passing on its own. One concern per commit; group only files that fail to compile or make no sense without each other. If a single concern touches multiple files, that is still one commit.

---

## 7. Communication style

- Direct, not diplomatic. "This won't scale because X" beats "That's an interesting approach, but have you considered...".
- Concise by default. Two or three short paragraphs unless the user asks for depth. No padding, no restating the question, no ceremonial closings.
- When a question has a clear answer, give it. When it does not, say so and give your best read on the tradeoffs.
- Celebrate only what matters: shipping, solving genuinely hard problems, metrics that moved. Not feature ideas, not scope creep, not "wouldn't it be cool if".
- No excessive bullet points, no unprompted headers, no emoji. Prose is usually clearer than structure for short answers.

---

## 8. When to ask, when to proceed

**Ask before proceeding when:**

- The request has two plausible interpretations and the choice materially affects the output.
- The change touches something you've been told is load-bearing, versioned, or has a migration path.
- You need a credential, a secret, or a production resource you don't have access to.
- The user's stated goal and the literal request appear to conflict.

**Proceed without asking when:**

- The task is trivial and reversible (typo, rename a local variable, add a log line).
- The ambiguity can be resolved by reading the code or running a command.
- The user has already answered the question once in this session.

---

## 9. Self-improvement loop

**This file is living. Keep it short by keeping it honest.**

After every session where the agent did something wrong:

1. Ask: was the mistake because this file lacks a rule, or because the agent ignored a rule?
2. If lacking: add the rule under "Project Learnings" below, written as concretely as possible ("Always use X for Y" not "be careful with Y").
3. If ignored: the rule may be too long, too vague, or buried. Tighten it or move it up.
4. Every few weeks, prune. For each line, ask: "Would removing this cause the agent to make a mistake?" If no, delete. Bloated AGENTS.md files get ignored wholesale.

Boris Cherny (creator of Claude Code) keeps his team's file around 100 lines. Under 300 is a good ceiling. Over 500 and you are fighting your own config.

---

## 10. Project context

A.U.R.A. (Astro-Unified Response Algorithm) is a NASA Space Apps 2026 entry for "Create Health Monitoring Software for Astronauts on Space Missions": a dashboard with a rotatable 3D astronaut whose aura changes when body or environment readings cross thresholds. **Hard deadline: 2026-11-15 23:59.** A working demo beats a complete but unfinished feature.

Read before building: [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) (8 principles every plan must pass) and [`specs/001-aura-health-dashboard/`](./specs/001-aura-health-dashboard/) — `spec.md` (FR-001…FR-029), `plan.md`, `tasks.md`, `research.md` (threshold values + citations), `data-model.md`, `contracts/`, `quickstart.md` (demo validation script). Workflow is Spec Kit: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` → `/speckit-converge`.

### Stack

- Language: TypeScript, Node.js 20+
- Framework(s): Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS 4; planned: React Three Fiber + drei (3D), Zustand (state), Vitest (unit tests)
- Package manager: pnpm workspace — `frontend` (the Next.js app) and `backend` (`@aura/core`, pure TypeScript logic)
- Runtime / deployment target: desktop browser on laptop/projector; Vercel with Root Directory `frontend`. Still one deployable app: no database, no separate backend server.

### Commands

All from the repo root:

- Install: `pnpm install`
- Dev: `pnpm dev` (http://localhost:3000)
- Build: `pnpm build` — must pass before submission
- Lint: `pnpm lint`
- Add a dependency: `pnpm --filter frontend add <pkg>` or `pnpm --filter @aura/core add <pkg>`
- Test: `pnpm test` — **not set up yet** (task T002 adds Vitest in `backend`)
- NASA cache refresh: `pnpm fetch:donki` — **not set up yet**; needs network + `NASA_API_KEY` in the root `.env.local` (shared by frontend and backend; `frontend/next.config.ts` loads it)

### Layout

- `frontend/` — Next.js app (own `package.json`, `tsconfig.json`, `next.config.ts`, `AGENTS.md` with the Next.js rules)
  - `app/` — App Router pages; `app/api/donki/sep/route.ts` (planned) proxies NASA DONKI with cache fallback
  - `store/useAuraStore.ts` (planned) — Zustand store, 1 Hz tick, alert log, escalation timers
  - `components/` (planned) — UI panels + `AstronautScene`
  - Imports use `@/*` → `frontend/`
- `backend/` — `@aura/core`, pure logic with no React and no server
  - `config/aura.ts` (planned) — single source of truth for thresholds, colors, actions, escalation, citations
  - `lib/` (planned) — `types`, `evaluate`, `mhi`, `sentiment`, `donki`, `scenarios`, `simulation`
  - `data/donki-sep-cache.json` — bundled real NASA DONKI data
  - `scripts/fetch-donki.mjs` (planned) — refreshes the cache
  - `tests/unit/` (planned) — Vitest, logic only
  - Use relative imports inside `backend/`
- Frontend imports backend as `@aura/core/config/aura`, `@aura/core/lib/<name>`, `@aura/core/data/<file>` (exports map in `backend/package.json`; Turbopack compiles it, no build step)

### Conventions specific to this repo

- Aura color = hazard category only: radiation green, air quality gray, cabin heat orange, cabin cold blue, mental yellow, injury/cardiovascular red on the affected body region. Severity = intensity: nominal shows no aura, caution steady, critical pulsing.
- Every threshold cites NASA-STD-3001, NASA SMAC or peer-reviewed literature, in code and in the UI. Comparisons are inclusive at the boundary.
- Caution alerts → "Crew – self-manage"; critical or persisting caution → "Flight surgeon"; discrepancy alerts go to the astronaut only.
- Simulated crew data is labeled "Simulated". Say "designed to integrate with" NASA systems, never "integrated with".
- The app must run fully offline; the DONKI route falls back to the bundled cache and never returns an error status.
- Unit tests are required only for threshold evaluation, severity, MHI, discrepancy and sentiment; UI is checked by running `quickstart.md`.
- Tick tasks `[X]` in `tasks.md` when done.

### Forbidden

- Do not hard-code threshold numbers or aura colors outside `backend/config/aura.ts`
- Do not hand-edit `backend/data/donki-sep-cache.json` — only `pnpm fetch:donki` writes it
- Do not import React, Next.js or browser APIs in `backend/`; do not put threshold or scoring logic in `frontend/`
- Do not call external AI services (sentiment runs locally)
- Do not add a database, separate backend, or dependency without a demo-visible reason
- Do not use npm or yarn
- Do not commit `.env*` or a NASA API key

---

## 11. Project Learnings

**Accumulated corrections. This section is for the agent to maintain, not just the human.**

When the user corrects your approach, append a one-line rule here before ending the session. Write it concretely ("Always use X for Y"), never abstractly ("be careful with Y"). If an existing line already covers the correction, tighten it instead of adding a new one. Remove lines when the underlying issue goes away (model upgrades, refactors, process changes).

- Never add `Co-Authored-By: Claude` or "Generated with Claude Code" lines to commits or PRs in this repo.
- When adapting this file, keep sections 0–9 as they are; only rewrite project-specific sections (10, 11). The Next.js block lives in `frontend/AGENTS.md` and is managed by `next dev`.
- `origin/main` gets work pushed from other machines and PR merges; `git fetch` and merge before pushing, never force-push `main`.

---
