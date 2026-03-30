## Context

Phases 1–14 complete. See DECISIONS.md for full log.

## Your task

### Phase 15 — Go-Live Polish

**User stories**: US 19 (schema.org / SEO completeness), US 20 (privacy policy), US 29 (GDPR retention)

**Canonical URLs:**

Add `<link rel="canonical">` to all public pages:
- `/` — `https://www.balticfoot.lt/`
- `/paslaugos/[slug]/` — `https://www.balticfoot.lt/paslaugos/[slug]/`
- `/blog/` — `https://www.balticfoot.lt/blog/`
- `/blog/[slug]/` — `https://www.balticfoot.lt/blog/[slug]/`
- `/rezervacija/` — `https://www.balticfoot.lt/rezervacija/`
- `/privatumo-politika/` — `https://www.balticfoot.lt/privatumo-politika/`

Use Next.js `Metadata.alternates.canonical` — not a raw `<link>` tag.
Base URL from `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.balticfoot.lt'`.

**Alt text audit:**

Verify every `<Image>` on all public pages has a meaningful Lithuanian `alt` attribute.
Check: homepage, all service pages, blog list, blog post pages. Fix any missing or
generic (`""`, `"image"`) alt values.

**2-year data retention:**

Add a cron route `GET /api/cron/retention` (same Bearer auth pattern as reminders)
that deletes bookings older than 2 years.

Retention cron spec:
- Auth: `Authorization: Bearer <CRON_SECRET>` (same as reminders cron)
- Query: bookings where `date < today − 730 days`
- Action: hard delete via `payload.delete()`
- Returns: `{ deleted: number }`
- No new collection needed

**No new collections.**
**No integration tests** — canonical meta is Next.js framework behaviour; retention
cron follows the same pattern as reminders (already tested).

## Acceptance criteria

- [ ] `<link rel="canonical">` present in `<head>` on all 6 public page types
- [ ] No public page image is missing a meaningful alt attribute
- [ ] `GET /api/cron/retention` exists, requires Bearer token, deletes bookings
  older than 2 years, returns `{ deleted: number }`
- [ ] `NEXT_PUBLIC_SITE_URL` documented in `.env.example`

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- If you discover a blocker, stop and report it — do not improvise a workaround.
