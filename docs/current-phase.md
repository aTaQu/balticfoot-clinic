## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).
- **Phase 5 — Service Pages + SEO Structure**: All 5 `/paslaugos/[slug]/` pages live with `generateMetadata()` SEO titles from keyword brief, price/duration from Payload, CTA to `/rezervacija/?service=[slug]`. `/rezervacija/` shell page reads `?service=` param. Homepage H1 updated. Services reseeded with SEO-optimised slugs.
- **Phase 6 — Notification Layer**: `sendEmail()` and `sendSms()` live in `src/lib/notifications/`. 6 React Email templates (Lithuanian text, clinic branding), 4 SMS strings, shared style tokens in `styles.ts`. Both functions catch and log errors without rethrowing. Smoke test: `npx tsx src/lib/notifications/smoke-test.ts`.
- **Phase 7 — Availability API**: `GET /api/availability?date=YYYY-MM-DD&service=<slug>` implemented with `force-dynamic`. Core algorithm in `src/lib/availability.ts` — duration-aware slot blocking, PENDING+CONFIRMED+BlockedSlots all block `[slot, slot+duration)`. 11 integration tests pass against real DB.
- **Phase 8 — Booking Submission**: `POST /api/bookings` implemented with GDPR validation, race condition guard (availability re-checked before create), fire-and-forget notifications. BookingWizard rewritten to fetch live services from Payload and time slots from `/api/availability`. `constants.ts` SERVICES array removed. 8 integration tests pass.
- **Phase 9 — Booking Admin Actions**: `POST /api/admin/bookings/[id]/{confirm,reject,cancel}` implemented with Payload session auth. `bookingActions.ts` shared helpers with state guards, AuditLog writes, fire-and-forget notifications. `BookingActions.tsx` AfterFields Client Component shows correct buttons by status. `parseAdminRequest.ts` extracts auth + ID-parse. `formatDateLT` extracted to `format.ts`. 10 integration tests pass.
- **Phase 10 — Slot Blocking**: BlockedSlots admin verified (config already correct from Phase 3). `GET /api/admin/schedule` returns confirmed bookings + blocked slots for a date range (Payload session auth required). `WeekScheduleAfterDashboard` Client Component mounted on Payload dashboard via `admin.components.afterDashboard`. Parallel `Promise.all` queries, `AbortController` fetch cleanup. 6 integration tests pass including cross-phase availability regression.
- **Phase 11 — Reminder Cron**: `GET /api/cron/reminders` protected by `Authorization: Bearer <CRON_SECRET>`. `sendReminders()` in `src/lib/reminders.ts` queries confirmed tomorrow bookings with `reminderSent=false`, sends `BookingReminderEmail` + optional SMS (if `smsOptIn=true`), sets `reminderSent=true` on success. `getTomorrowVilnius()` resolves date in `Europe/Vilnius` timezone. `CRON_SECRET` documented in `.env.example`. 5 integration tests pass.
- **Phase 12 — Contact Form**: `POST /api/contact` implemented (name + message required, at least one of phone/email required, no DB writes). `ContactEnquiryAlertEmail` template added. `Contact.tsx` wired to real API with inline error display and at-least-one phone/email validation.

## Your task

### Phase 13 — Blog

**User stories**: US 17 (read blog articles), US 18 (CTA at end of posts), US 31 (publish posts), US 32 (instant publish)

**Pages to build:**

`/blog/` — post list page:
- Fetches all `BlogPosts` where `status = 'published'`, sorted by `publishedAt` descending
- Renders post cards: title, excerpt, featured image (if set), formatted publish date
- `generateMetadata()`: title `"Blogas — Baltic Foot"`, standard meta description
- `force-dynamic`

`/blog/[slug]/` — individual post page:
- Fetches `BlogPosts` by slug where `status = 'published'`; returns 404 if not found or draft
- Renders: title (H1), featured image (if set), formatted publish date, rich text body via Payload's Lexical renderer (`@payloadcms/richtext-lexical/react`)
- Fixed CTA block at end: `"Registruokitės konsultacijai"` → `/rezervacija/`
- `generateMetadata()`: uses `metaTitle` and `metaDescription` from Payload fields
- `force-dynamic`

**No new collections** — `BlogPosts` is already defined and seeded from Phase 2.

**No integration tests** — no booking/availability logic; page rendering is sufficient for manual QA.

## Acceptance criteria

- [ ] `/blog/` lists all published posts sorted by `publishedAt` descending
- [ ] Draft posts do not appear on `/blog/` or at their slug URL
- [ ] `/blog/[slug]/` renders title, body (rich text), featured image (if present), and publication date
- [ ] Each post has correct `<title>` and meta description from Payload fields
- [ ] Every post page ends with a CTA linking to `/rezervacija/`
- [ ] Creating a post in Payload admin with default status makes it immediately publicly visible
- [ ] Non-existent slug returns 404
- [ ] `/blog/` page has correct `generateMetadata()`

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- If you discover a blocker, stop and report it — do not improvise a workaround.
