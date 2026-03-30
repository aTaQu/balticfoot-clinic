## Context

Phases 1–13 complete. See DECISIONS.md for full log.

## Your task

### Phase 14 — GDPR + SEO Polish

**User stories**: US 20 (privacy policy), US 29 (delete patient data)

**Pages to build:**

`/privatumo-politika/` — privacy policy page:
- Static page in Lithuanian (no Payload fetch needed)
- Must cover: data collected (name, phone, email, notes), purpose (appointment
  management), retention (2 years from appointment date), patient rights
  (access, correction, deletion), contact: info@balticfoot.lt
- `generateMetadata()`: title `"Privatumo politika — Baltic Foot"`
- Link it from the Footer

**SEO infrastructure:**

`src/app/sitemap.ts` — auto-generated XML sitemap:
- Homepage `/`
- All active service pages `/paslaugos/[slug]`
- All published blog posts `/blog/[slug]`
- Exclude `/admin`, `/api/*`

`src/app/robots.ts` — robots.txt:
- Allow all
- Disallow `/admin`
- Sitemap URL pointing to production domain

**Patient data deletion:**
- Verify (don't change) that Payload admin already allows deleting a Booking
  record — if it does, document it; if access rules block it, fix them

**Footer update:**
- Add link to `/privatumo-politika/` in the Footer component

**No new collections.**
**No integration tests** — static content and sitemap generation.

## Acceptance criteria

- [ ] `/privatumo-politika/` exists and covers all required GDPR elements in Lithuanian
- [ ] Footer links to `/privatumo-politika/`
- [ ] `/sitemap.xml` includes homepage, all active service slugs, all published blog slugs
- [ ] `/robots.txt` disallows `/admin`, includes sitemap URL
- [ ] Admin can delete a Booking record (PII removal)
- [ ] `/privatumo-politika/` has correct `<title>` meta

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- If you discover a blocker, stop and report it — do not improvise a workaround.
