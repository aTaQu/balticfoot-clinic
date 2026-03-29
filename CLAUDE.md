# Baltic Foot — Podology Booking & Management App

## Session start — Scan phase (not Read phase)

**Always read first (core context):**
- `docs/current-phase.md` — phase scope, acceptance criteria, rules
- `docs/codebase-map.md` — route→file map, collection inventory, conventions

**Load on demand — only when the task triggers it:**

| File | Load when the task involves… |
|------|------------------------------|
| `docs/PRD.md` | "user story", "out of scope", "should we build", "why does X exist", product decisions |
| `plans/backend-cms-seo.md` | a past/future phase, "what's planned for phase N", checking non-current acceptance criteria |
| `docs/DECISIONS.md` | "why was X chosen", making a new architectural decision, any tech-stack question |
| A specific source file | The task names a collection, component, route, or lib file — read it then, not upfront |

**Never pre-read:** PRD.md and plans/backend-cms-seo.md together are 600+ lines.
Load them only when they're the answer, not as a precaution.

## Stack
Next.js 15/16, TypeScript strict, PayloadCMS v3, PostgreSQL (Railway), Tailwind, Resend, SMSAPI

## Rules
- Do not work outside the current phase scope unless explicitly asked
- `docs/current-phase.md` is the source of truth for what's in scope
- After any architectural decision, append it to @docs/DECISIONS.md

## Phase transitions
When a phase is complete, run /phase-complete — draft the next
phase prompt for approval before writing anything to disk.

## Goal context
Baltic Foot is a real podiatry clinic in Šiauliai, Lithuania. The site
is a freelance portfolio piece targeting Lithuanian SMB clients.
Keep code clean and demo-ready.
