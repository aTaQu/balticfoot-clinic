# Phase Complete

A phase has just been completed. Do the following in order:

1. **Code review** — Launch an Explore agent to review code quality of files changed this phase:
   - TypeScript strictness (no `any`, correct types)
   - No hardcoded values that should come from config or Payload
   - No obvious security issues (injection, exposed secrets)
   - Reuse opportunities missed (repeated logic that should be extracted)
   - Report findings. If blockers found, stop and fix before proceeding.

2. **Summarize** what was built this phase (3-5 bullet points)

3. **Log completion** — append to @docs/DECISIONS.md:
   - Phase N: Complete (date)
   - Phase N+1: Started (date)
   - Any architectural decisions made during the phase

4. **Git commit** — stage all files changed this phase and commit:
   ```
   git add <phase files>
   git commit -m "Phase N: <phase name>"
   ```

5. **Draft next phase prompt** — read @docs/PRD.md and @plans/backend-cms-seo.md
   to identify the next phase scope. Draft an updated `docs/prompt per phase.md`.

6. **Present the draft** to David — do NOT write to disk yet.

7. **On explicit approval** — write the new `docs/current-phase.md`.
