## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).
- **Phase 5 — Service Pages + SEO Structure**: All 5 `/paslaugos/[slug]/` pages live with `generateMetadata()` SEO titles from keyword brief, price/duration from Payload, CTA to `/rezervacija/?service=[slug]`. `/rezervacija/` shell page reads `?service=` param. Homepage H1 updated. Services reseeded with SEO-optimised slugs.
- **Phase 6 — Notification Layer**: `sendEmail()` and `sendSms()` live in `src/lib/notifications/`. 6 React Email templates (Lithuanian text, clinic branding), 4 SMS strings, shared style tokens in `styles.ts`. Both functions catch and log errors without rethrowing. Smoke test: `npx tsx src/lib/notifications/smoke-test.ts`.
- **Phase 7 — Availability API**: `GET /api/availability?date=YYYY-MM-DD&service=<slug>` implemented with `force-dynamic`. Core algorithm in `src/lib/availability.ts` — duration-aware slot blocking, PENDING+CONFIRMED+BlockedSlots all block `[slot, slot+duration)`. 11 integration tests pass against real DB.

## Your task

### Phase 8 — Booking Submission

**User stories**: US 1 (services with prices), US 2 (service pre-selected), US 4 (SMS+email on submit), US 8 (SMS opt-in), US 9 (patient notes), US 10 (GDPR consent), US 11 (direct URL)

Wire the `/rezervacija/` booking wizard to the live availability API and implement `POST /api/bookings`. The wizard currently shows hardcoded time slots and reads services from `constants.ts` — this phase replaces both with real Payload data.

**`POST /api/bookings` (new route handler):**
1. Validate: `service` slug exists + active, `gdprConsent = true`, `patientName` + `patientPhone` + `patientEmail` required
2. Re-check availability server-side (race condition guard — same algorithm as Phase 7)
3. Create `Booking` with status `pending`
4. Send `BookingReceivedEmail` + SMS to patient
5. Send `NewBookingAlertEmail` to Veneta
6. Return `{ booking: { id, service, date, timeSlot } }`

**BookingWizard changes:**
- Step 1: fetch services from Payload (passed as Server Component props to the wizard)
- Step 2: fetch slots from `GET /api/availability?date=&service=` on date/service change; mark unavailable slots unselectable
- `?service=` query param pre-selects correct service in step 1 (already reads param, needs to wire to wizard state)
- Step 3 (patient details): `smsOptIn` checkbox, `patientNotes` textarea, GDPR consent checkbox — all wired to submission payload
- On submit: POST to `/api/bookings`, show success/error state

**Integration tests:**
- Valid submission creates `Booking` with status `pending` and triggers notification calls
- Submitting without `gdprConsent` → 400
- Submitting missing `patientName` or `patientPhone` → 400
- Submitting inactive/unknown service → 404
- Race condition: two simultaneous POSTs for same slot — only one succeeds (second gets 409)
- `constants.ts` SERVICES array removed (BookingWizard no longer imports it)

## Acceptance criteria

- [ ] `POST /api/bookings` exists at `src/app/(app)/api/bookings/route.ts`
- [ ] BookingWizard step 1 fetches services from Payload (not `constants.ts`)
- [ ] BookingWizard step 2 fetches live slots from `GET /api/availability`; unavailable slots are unselectable
- [ ] `?service=` query param pre-selects service in step 1
- [ ] Submitting valid booking creates `Booking` (status `pending`) in DB
- [ ] Patient receives SMS + email on submit
- [ ] Veneta receives email alert on submit
- [ ] GDPR consent required; submitting without it returns 400
- [ ] Race condition test: simultaneous same-slot POSTs — only one succeeds
- [ ] `constants.ts` SERVICES array removed or replaced

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
