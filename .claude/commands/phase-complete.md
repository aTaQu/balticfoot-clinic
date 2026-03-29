# Phase Complete

A phase has just been completed. Do the following in order:

1. **Summarize** what was built this phase (3-5 bullet points)

2. **Log completion** — append to @docs/DECISIONS.md:
   - Phase N: Complete (date)
   - Phase N+1: Started (date)
   - Any architectural decisions made during the phase

3. **Update codebase map** — edit @docs/codebase-map.md:
   - Add any new routes, components, or collections created this phase
   - Update the "What's NOT built yet" section to remove completed items
   - Update any conventions that changed

4. **Git commit** — stage all files changed this phase and commit:
   ```
   git add <phase files>
   git commit -m "Phase N: <phase name>"
   ```

5. **Open PR** — push branch and open a PR against `main`:
   ```
   git push -u origin <branch>
   gh pr create --title "Phase N: <phase name>" --body "..."
   ```
   Remind David to run `/review-pr` before merging.

6. **Draft next phase prompt** — read @docs/PRD.md and @plans/backend-cms-seo.md
   to identify the next phase scope. Draft an updated `docs/current-phase.md`.

7. **Present the draft** to David — do NOT write to disk yet.

8. **On explicit approval** — write the new `docs/current-phase.md`.
