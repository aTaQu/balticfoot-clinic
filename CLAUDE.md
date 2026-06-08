# Baltic Foot — Podology Booking & Management App

## Session start — Scan phase (not Read phase)

**Always read first (core context):**

<!-- - `docs/current-phase.md` — phase scope, acceptance criteria, rules -->

- `docs/codebase-map.md` — route→file map, collection inventory, conventions

**Load on demand — only when the task triggers it:**

| File                       | Load when the task involves…                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `docs/PRD.md`              | "user story", "out of scope", "should we build", "why does X exist", product decisions      |
| `plans/backend-cms-seo.md` | a past/future phase, "what's planned for phase N", checking non-current acceptance criteria |
| `docs/DECISIONS.md`        | "why was X chosen", making a new architectural decision, any tech-stack question            |
| A specific source file     | The task names a collection, component, route, or lib file — read it then, not upfront      |

**Never pre-read:** PRD.md and plans/backend-cms-seo.md together are 600+ lines.
Load them only when they're the answer, not as a precaution.

## Stack

Next.js 15/16, TypeScript strict, PayloadCMS v3, PostgreSQL (Railway), Tailwind, Resend, SMSAPI

## Rules

- Do not work outside the current phase scope unless explicitly asked
- `docs/current-phase.md` is the source of truth for what's in scope
- After any architectural decision, append it to @docs/DECISIONS.md

## Dev environment — devcontainer only

`node_modules` is shared between the Windows host and the Linux devcontainer.
**Never run dependency or build commands on the Windows host** — they pull
platform-specific native binaries (esbuild, swc, sharp, etc.) and silently
swap out the Linux ones the devcontainer needs.

Run inside the devcontainer only:

- `npm install` / `npm ci` / `npm update`
- `npx payload generate:types` / `generate:importmap`
- `npm run dev` (also needs the in-container Postgres)
- `npx vitest` / `npm test` (needs the in-container Postgres + `RESEND_API_KEY`)
- Anything that runs esbuild, tsx, swc, or sharp under the hood

Safe on Windows host:

- File reads/edits, Grep, Glob
- Git
- `node node_modules/typescript/bin/tsc --noEmit` (pure JS, no native deps)

If a Windows-host run is unavoidable, flag it and note the devcontainer will
need an `npm install` on next open to restore Linux binaries.

## Phase transitions

When a phase is complete, run /phase-complete — draft the next
phase prompt for approval before writing anything to disk.

## Goal context

Baltic Foot is a real podiatry clinic in Šiauliai, Lithuania. The site
is a freelance portfolio piece targeting Lithuanian SMB clients.
Keep code clean and demo-ready.
