# Review PR

Run this before merging a phase branch into `main`.

1. **Identify changed files** — run `git diff main...HEAD --name-only` to get the full list of files changed on this branch.

2. **Run /simplify** on the changed files to review for:
   - TypeScript strictness (no untyped `any`, correct return types)
   - Hardcoded values that should come from Payload or config
   - Security issues (injection, exposed secrets, unvalidated input)
   - Reuse opportunities (repeated logic that should be extracted)
   - Dead code or leftover TODOs that shouldn't ship

3. **Fix any issues found** — apply fixes as a new commit on the branch (never amend after a PR is open).

4. **Confirm** — report back with:
   - Issues found and fixed
   - Issues found but deferred (with reason)
   - All-clear if nothing significant

5. **Merge** — only after David explicitly approves.
