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

## Your task

### Phase 11 — Reminder Cron

**User stories**: US 7 (day-before reminder), US 8 (SMS opt-in respected)

**Cron route** — `GET /api/cron/reminders`:
- Protected by a static Bearer token — `Authorization: Bearer <CRON_SECRET>` header verified against `process.env.CRON_SECRET`
- Return 401 if token is missing or wrong (external cron callers cannot do cookie-based Payload session auth)
- Core logic extracted to `src/lib/reminders.ts` — pure function taking a `Payload` instance

**Reminder logic** — `src/lib/reminders.ts`:
- Query all `Bookings` where `date = tomorrow` AND `status = confirmed` AND `reminderSent = false`
- For each booking:
  - Always send `BookingReminderEmail` to `patientEmail`
  - Send reminder SMS only if `smsOptIn = true`
  - On successful send: update `reminderSent = true`
  - On send failure: log error, do NOT set `reminderSent = true` (retries on next run)
- Returns `{ sent: number, failed: number }`
- "Tomorrow" computed in Lithuanian timezone (`Europe/Vilnius`, UTC+2/UTC+3)

**Scheduling** — document in `.env.example`:
- Intended to be triggered daily at 10:00 Europe/Vilnius by Railway cron or an external cron service (e.g. cron-job.org) calling `GET /api/cron/reminders` with the Bearer token

**Integration tests** — `src/lib/reminders.test.ts`:
- Confirmed booking for tomorrow with `reminderSent = false` → sends reminder, sets flag to `true`
- Confirmed booking with `reminderSent = true` → skipped, flag unchanged
- Pending booking for tomorrow → skipped
- Booking with `smsOptIn = false` → email sent, SMS not sent
- Booking with `smsOptIn = true` → both email and SMS sent

## Acceptance criteria

- [ ] `GET /api/cron/reminders` returns 401 without correct `CRON_SECRET` Bearer token
- [ ] Only tomorrow's CONFIRMED bookings with `reminderSent = false` are processed
- [ ] `reminderSent` set to `true` after successful send
- [ ] `reminderSent` left `false` on send failure (retries next run)
- [ ] SMS only sent if `smsOptIn = true`
- [ ] "Tomorrow" resolved in Europe/Vilnius timezone
- [ ] `CRON_SECRET` documented in `.env.example`
- [ ] All integration tests pass

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
