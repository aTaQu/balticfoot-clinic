## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).
- **Phase 5 — Service Pages + SEO Structure**: All 5 `/paslaugos/[slug]/` pages live with `generateMetadata()` SEO titles from keyword brief, price/duration from Payload, CTA to `/rezervacija/?service=[slug]`. `/rezervacija/` shell page reads `?service=` param. Homepage H1 updated. Services reseeded with SEO-optimised slugs.
- **Phase 6 — Notification Layer**: `sendEmail()` and `sendSms()` live in `src/lib/notifications/`. 6 React Email templates (Lithuanian text, clinic branding), 4 SMS strings, shared style tokens in `styles.ts`. Both functions catch and log errors without rethrowing. Smoke test: `npx tsx src/lib/notifications/smoke-test.ts`.
- **Phase 7 — Availability API**: `GET /api/availability?date=YYYY-MM-DD&service=<slug>` implemented with `force-dynamic`. Core algorithm in `src/lib/availability.ts` — duration-aware slot blocking, PENDING+CONFIRMED+BlockedSlots all block `[slot, slot+duration)`. 12 integration tests pass against real DB.
- **Phase 8 — Booking Submission**: `POST /api/bookings` validates input, re-checks availability (race condition guard → 409), creates `Booking` (status: `pending`), fires email+SMS notifications. `createBooking()` extracted to `src/lib/bookings.ts`. `BookingWizard` fully wired to Payload — live services, live slots, `openDays` calendar gating, GDPR controlled state, real submission. `constants.ts` hardcoded data removed. 20/20 integration tests pass.

## Your task

### Phase 9 — Booking Admin Actions

**User stories**: US 6 (reject with reason notifies patient), US 21 (pending list sorted by date), US 22 (confirm with one click), US 23 (reject with typed reason), US 24 (cancel confirmed booking), US 25 (view patient details), US 27 (audit log)

Add confirm, reject, and cancel actions to the Payload booking admin. Each action is a custom button on the booking detail view. Every action writes an `AuditLog` entry and triggers the appropriate notification.

**Confirm action:**
- Status → `confirmed`
- `sendEmail('booking-confirmed', patientEmail, {...})` + SMS to patient (if `smsOptIn`)
- `AuditLog` entry: `action: 'confirmed'`, `user`, `booking`

**Reject action:**
- Requires non-empty `rejectionReason` input before saving
- Status → `rejected`, `rejectionReason` saved
- `sendEmail('booking-rejected', patientEmail, { ...rejectionReason })` + SMS to patient
- `AuditLog` entry: `action: 'rejected'`

**Cancel action:**
- Available only on `confirmed` bookings
- Status → `cancelled`
- `sendEmail('booking-cancelled-alert', venetaEmail, {...})` — Veneta only, no patient SMS
- `AuditLog` entry: `action: 'cancelled'`

**Implementation approach:**
- Three internal API routes: `POST /api/admin/bookings/[id]/confirm`, `/reject`, `/cancel`
- Called by custom Payload admin UI buttons (component overrides in the `Bookings` collection config)
- Buttons conditionally rendered based on current `status` (confirm/reject: only on `pending`; cancel: only on `confirmed`)
- All three handlers share a common `performBookingAction()` helper to avoid duplicating Payload fetch + AuditLog write

**Integration tests:**
- Confirm: status → `confirmed`, AuditLog entry created with correct fields
- Reject: requires `rejectionReason`, status → `rejected`, reason stored on booking
- Cancel: status → `cancelled`, AuditLog entry created
- Confirm already-confirmed booking → 409
- Reject already-rejected booking → 409

## Acceptance criteria

- [ ] `POST /api/admin/bookings/[id]/confirm` exists and sets status → `confirmed`
- [ ] `POST /api/admin/bookings/[id]/reject` requires non-empty `rejectionReason`, sets status → `rejected`
- [ ] `POST /api/admin/bookings/[id]/cancel` requires booking to be `confirmed`, sets status → `cancelled`
- [ ] Each action writes an `AuditLog` entry with correct `user`, `action`, `booking` fields
- [ ] Patient receives correct SMS + email for confirm and reject
- [ ] Rejection email/SMS includes the typed reason
- [ ] Custom buttons visible in Payload admin booking detail view, conditionally shown by status
- [ ] Integration tests: confirm/reject/cancel produce correct status + AuditLog entry
- [ ] Transitioning to an invalid status (e.g. confirming a rejected booking) returns 409

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
