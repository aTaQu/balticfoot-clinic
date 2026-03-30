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

## Your task

### Phase 12 — Contact Form

**User stories**: implicit (contact enquiries reach Veneta)

**API route** — `POST /api/contact`:
- Input body (JSON): `name` (string), `phone` (string), `email` (string), `message` (string)
- Validation:
  - `name` and `message` are required and non-empty
  - At least one of `phone` / `email` must be non-empty
  - Return `400 { error: string }` on validation failure
- Send `ContactEnquiryAlertEmail` to `info@balticfoot.lt` via `sendEmail()`
- No Payload, no database writes
- Return `200 { ok: true }` on success

**Email template** — `src/lib/notifications/templates/ContactEnquiryAlertEmail.tsx`:
- Minimal styling consistent with `NewBookingAlertEmail` / `BookingCancelledAlertEmail`
- Displays: sender name, phone (if provided), email (if provided), message body
- Subject: `"Nauja žinutė — Baltic Foot kontaktų forma"`
- Register in `types.ts` (`'contact-enquiry-alert'`), `email.ts` (SUBJECTS + TEMPLATES), and `EmailData` union (`ContactEnquiryAlertEmailData`)

**Frontend** — update `src/components/Contact.tsx`:
- Replace the fake `setTimeout` submit handler with a real `fetch('POST /api/contact', ...)`
- Updated validation: `name` + `message` required; at least one of `phone` / `email` required
- Update field labels to reflect "at least one required" — e.g. add `"(bent vienas privalomas)"` below the phone/email pair
- Show the API `error` string inline (below the submit button) on `400` or `500`
- Existing `submitted` success state and `submitting` disabled-button state are already wired — keep them

**No integration tests** — no DB side-effects; validation logic is thin.

## Acceptance criteria

- [ ] `POST /api/contact` with `name`, at least one of `phone`/`email`, and `message` → sends email to `info@balticfoot.lt`, returns `200 { ok: true }`
- [ ] Missing `name` or `message` → `400`
- [ ] Neither `phone` nor `email` provided → `400`
- [ ] `ContactEnquiryAlertEmail` renders with name, phone (if present), email (if present), message
- [ ] Submitting the form calls the real API (not `setTimeout`)
- [ ] Success state shown after `200`
- [ ] API error message shown inline after `400`/`500`
- [ ] Submit button disabled while request is in flight
- [ ] No contact data written to the database

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- If you discover a blocker, stop and report it — do not improvise a workaround.
