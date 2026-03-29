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

## Your task

### Phase 10 — Slot Blocking

**User stories**: US 26 (block time slots)

The `BlockedSlots` collection exists (Phase 3) and the availability algorithm already respects it (Phase 7). This phase makes slot blocking usable from the admin and adds a week schedule dashboard widget so Veneta can see her upcoming week at a glance.

**BlockedSlots admin** — collection is already defined. Verify and improve:
- `useAsTitle: 'date'` and `defaultColumns: ['date', 'startTime', 'endTime', 'reason', 'createdBy']` on the collection config
- Admin can create, edit, and delete entries without errors

**Schedule API route** — `GET /api/admin/schedule`:
- Requires Payload session (`payload.auth({ headers })`) — return 401 if unauthenticated
- Query params: `from` (YYYY-MM-DD, required), `days` (number 1–14, default 7)
- Returns `{ days: [{ date: string, bookings: ScheduledBooking[], blocks: ScheduledBlock[] }] }`
- `ScheduledBooking`: `{ id, patientName, serviceName, timeSlot, endTime }`
- `ScheduledBlock`: `{ id, startTime, endTime, reason }`
- Only CONFIRMED bookings appear — pending/rejected/cancelled excluded
- Core logic extracted to `src/lib/schedule.ts` — pure function taking a `Payload` instance

**Week schedule widget** — `src/components/admin/WeekSchedule.tsx` (Client Component):
- Registered via `admin.components.afterDashboard` in `payload.config.ts`
- Fetches `GET /api/admin/schedule?from=<today>&days=7` on mount
- Renders 7 columns (one per day), each listing confirmed bookings and blocked slots
- Read-only — no actions, just display
- Uses Payload CSS variables for consistent admin styling (same approach as `BookingActions.tsx`)
- Registered in `src/app/(payload)/admin/importMap.ts`

**Integration tests** — `src/lib/schedule.test.ts`:
- Confirmed booking appears in correct day's `bookings` array
- Pending booking does NOT appear
- BlockedSlot appears in correct day's `blocks` array
- Empty days return `{ date, bookings: [], blocks: [] }`
- Date range spanning multiple days returns correct structure

## Acceptance criteria

- [ ] Admin can create a `BlockedSlot` with date, start time, end time, and optional reason
- [ ] Admin can delete a `BlockedSlot`
- [ ] Blocked time range is excluded from `GET /api/availability` (already true — verify with a test covering a block added in this phase)
- [ ] `GET /api/admin/schedule` returns correct shape, 401 without session
- [ ] Only CONFIRMED bookings appear in schedule output
- [ ] Week schedule widget visible on Payload dashboard after login
- [ ] Widget shows confirmed bookings and blocked slots for the next 7 days
- [ ] All integration tests pass

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Integration tests run against the dev container DB — no mocks.
- If you discover a blocker, stop and report it — do not improvise a workaround.
