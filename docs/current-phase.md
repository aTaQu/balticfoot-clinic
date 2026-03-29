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

## Your task

### Phase 9 — Booking Admin Actions

**User stories**: US 6 (rejection with reason), US 21–25 (admin booking management), US 27 (audit log)

Add confirm, reject, and cancel actions to the Payload booking admin. Each action is a custom button rendered in the booking edit view via a Payload v3 `AfterFields` component override.

**Three internal API routes:**
- `POST /api/admin/bookings/[id]/confirm` — `pending` → `confirmed`; sends `BookingConfirmedEmail` + SMS (if `smsOptIn`); AuditLog entry
- `POST /api/admin/bookings/[id]/reject` — `pending` → `rejected`; body: `{ rejectionReason }` (required, non-empty); sends `BookingRejectedEmail` + SMS; AuditLog entry with `note = rejectionReason`
- `POST /api/admin/bookings/[id]/cancel` — `confirmed` → `cancelled`; sends `BookingCancelledAlertEmail` to Veneta; AuditLog entry

All routes verify the Payload session via `payload.auth({ headers })` — return 401 if no authenticated user.

**Shared helper** — `src/lib/bookingActions.ts`:
- `confirmBooking(payload, bookingId, userId)`
- `rejectBooking(payload, bookingId, userId, rejectionReason)`
- `cancelBooking(payload, bookingId, userId)`
All return `BookingActionResult = { booking } | { error, status }`.

**Admin UI** — `src/components/admin/BookingActions.tsx` (Client Component):
- Rendered via `admin.components.edit.AfterFields` in `Bookings` collection config
- Shows "Patvirtinti" button for `pending` bookings
- Shows rejection reason input + "Atmesti" button for `pending` bookings (button disabled until reason entered)
- Shows "Atšaukti vizitą" button for `confirmed` bookings
- Hidden for `rejected`/`cancelled` bookings
- On success: calls `router.refresh()` to reload the admin edit view

**Integration tests** — `src/lib/bookingActions.test.ts`:
- confirm: pending → confirmed, AuditLog entry created
- confirm: already-confirmed → 409
- confirm: non-existent booking → 404
- reject: pending → rejected with reason, AuditLog note set
- reject: empty reason → 400
- reject: already-rejected → 409
- reject: non-existent → 404
- cancel: confirmed → cancelled, AuditLog entry
- cancel: pending (not confirmed) → 409
- cancel: non-existent → 404

## Acceptance criteria

- [ ] `POST /api/admin/bookings/[id]/confirm` exists and enforces `pending` → `confirmed` transition
- [ ] `POST /api/admin/bookings/[id]/reject` requires non-empty `rejectionReason`, enforces `pending` → `rejected`
- [ ] `POST /api/admin/bookings/[id]/cancel` enforces `confirmed` → `cancelled`
- [ ] Each route returns 401 without a valid Payload session
- [ ] Each action writes an `AuditLog` entry with correct `user`, `action`, `booking` fields
- [ ] Confirm sends `BookingConfirmedEmail` + SMS (if smsOptIn) to patient
- [ ] Reject sends `BookingRejectedEmail` + SMS (if smsOptIn) to patient, includes rejection reason
- [ ] Cancel sends `BookingCancelledAlertEmail` to clinic email (Veneta)
- [ ] Admin UI shows correct buttons based on booking status
- [ ] Reject button disabled until rejection reason entered
- [ ] All 10 integration tests pass

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
