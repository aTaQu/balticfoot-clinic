## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).
- **Phase 5 — Service Pages + SEO Structure**: All 5 `/paslaugos/[slug]/` pages live with `generateMetadata()` SEO titles from keyword brief, price/duration from Payload, CTA to `/rezervacija/?service=[slug]`. `/rezervacija/` shell page reads `?service=` param. Homepage H1 updated. Services reseeded with SEO-optimised slugs.
- **Phase 6 — Notification Layer**: `sendEmail()` and `sendSms()` live in `src/lib/notifications/`. 6 React Email templates (Lithuanian text, clinic branding), 4 SMS strings, shared style tokens in `styles.ts`. Both functions catch and log errors without rethrowing. Smoke test: `npx tsx src/lib/notifications/smoke-test.ts`.

## Your task

### Phase 7 — Availability API

**User stories**: US 2 (service pre-selected), US 3 (duration-aware slots)

Implement `GET /api/availability?date=YYYY-MM-DD&service=<slug>` as a Next.js route handler. No UI changes this phase — the endpoint and its integration tests are the deliverable.

**Algorithm:**
1. Fetch `ClinicSettings` (workingHoursStart, workingHoursEnd, slotIntervalMinutes, openDays)
2. Fetch service by slug — return 404 if not found or inactive
3. Return `{ slots: [] }` if date falls outside `openDays`
4. Query all `Bookings` for that date with `status IN (pending, confirmed)`
5. Query all `BlockedSlots` for that date
6. Generate candidate slots from workingHoursStart → workingHoursEnd at slotIntervalMinutes intervals
7. Mark each slot unavailable if: any booking/block overlaps `[slot, slot+duration)`, or `slot+duration > workingHoursEnd`
8. Return `{ slots: [{ time: "09:00", available: boolean }] }`

**Integration tests** (against real DB — no mocks):
- Empty day → all slots available
- PENDING booking blocks correct duration-aware range
- CONFIRMED booking blocks correct duration-aware range
- BlockedSlot blocks correct range
- 2h service unavailable in last 90 min of working day
- Full-day block → all slots unavailable
- Date outside openDays → `{ slots: [] }`
- Unknown/inactive service slug → 404
- `slotIntervalMinutes` change in ClinicSettings reflected in response

## Acceptance criteria

- [ ] `GET /api/availability?date=&service=` exists at `src/app/(app)/api/availability/route.ts`
- [ ] Returns `{ slots: [{ time: string, available: boolean }] }`
- [ ] All integration tests pass
- [ ] ClinicSettings changes (hours, interval) reflected without server restart
- [ ] Unknown/inactive service returns 404
- [ ] Date outside openDays returns `{ slots: [] }`

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
