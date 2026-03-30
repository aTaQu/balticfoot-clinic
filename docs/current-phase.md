## Context

Phases 1–15 complete. See DECISIONS.md for full log.

## Your task

### Phase 16 — Pre-Launch

**User stories**: no new user stories — completing deferred polish items before go-live.

**Footer navigation fix:**

The Footer `Navigacija` column uses bare fragment links (`#paslaugos`, `#registracija`, etc.)
that only work on the homepage. From any other page they silently scroll nowhere.
Fix the links to work site-wide:

| Current | Replace with |
|---------|-------------|
| `#virsus` | `/` |
| `#paslaugos` | `/#paslaugos` |
| `#apie` | `/#apie` |
| `#susisiekite` | `/#susisiekite` |
| `#registracija` | `/rezervacija/` |

Also add a **Blogas** link pointing to `/blog/`.

Use Next.js `<Link>` for all entries (footer already imports it for the privacy link).

**SITE_URL / BASE_URL consolidation:**

`sitemap.ts` and `robots.ts` each declare `const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.balticfoot.lt'`
independently. Replace both with an import of `SITE_URL` from `@/lib/constants`.

**No new collections. No new routes. No integration tests.**

## Acceptance criteria

- [ ] Footer nav links work correctly when rendered on `/blog/`, `/paslaugos/[slug]/`,
  `/rezervacija/`, and `/privatumo-politika/`
- [ ] Footer nav includes a Blogas link to `/blog/`
- [ ] `/rezervacija/` link in footer goes directly to the booking page (not `#registracija`)
- [ ] `sitemap.ts` and `robots.ts` import `SITE_URL` from `@/lib/constants`
  (no more local `BASE_URL` declaration in those files)

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- If you discover a blocker, stop and report it — do not improvise a workaround.
