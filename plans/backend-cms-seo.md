# Plan: Backend, CMS & SEO Implementation

> Source PRD: `PRD.md`

---

## Architectural Decisions

Durable decisions that apply across all phases:

- **Routes**: `/` · `/paslaugos/[slug]/` · `/blog/` · `/blog/[slug]/` · `/rezervacija/` · `/privatumo-politika/` · `/admin`
- **CMS**: PayloadCMS v3 — runs natively inside Next.js, admin at `/admin`, single Railway deployment
- **Database**: PostgreSQL via Payload ORM, hosted on Railway
- **Auth**: PayloadCMS built-in auth. Roles: `admin` (Veneta + Lina) · `staff` (scaffolded, unused in v1)
- **Key models**: `Users` · `ClinicSettings` (Global) · `Services` · `BlogPosts` · `Bookings` · `BlockedSlots` · `AuditLog`
- **Booking states**: `pending` → `confirmed` | `rejected` | `cancelled`
- **Availability rule**: PENDING + CONFIRMED + BlockedSlots all block time slots. Duration-aware: a service of N minutes blocks all slots from start to start+N.
- **Notifications**: Resend (email) + SMSAPI (SMS, sender ID "BalticFoot"). Patient gets SMS + Email. Veneta gets Email only.
- **SEO priority order for service pages**: įaugusio nago (+900% trend) → nagų grybelio (highest volume) → medicininis pedikiūras → nuospaudų šalinimas → nagų protezavimas

---

## Phase 1: Payload Bootstrap ✅

**User stories**: US 28 (separate logins)

### What to build

Install PayloadCMS v3 into the existing Next.js 15 app. Connect to PostgreSQL on Railway. Define only the `Users` collection with `name`, `email`, `password`, and `role` (enum: `admin` | `staff`). Seed two admin accounts (Veneta, Lina). Verify the admin panel loads at `/admin` and both accounts can log in independently.

### Acceptance criteria

- [x] `payload`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/db-postgres` installed
- [x] `payload.config.ts` exists at project root with `Users` collection and `db-postgres` adapter
- [x] `[[...segments]]` catch-all route serves the Payload admin UI at `/admin`
- [x] `DATABASE_URI` and `PAYLOAD_SECRET` env vars documented in `.env.example`
- [x] Admin panel loads at `/admin` without errors
- [x] Veneta and Lina can each log in with separate credentials
- [x] `staff` role defined in Users collection (no access rules yet — scaffolded only)
- [x] Existing Next.js pages (`/`, services, etc.) continue to render unchanged

### What was built

**Files created / modified:**

- `payload.config.ts` — root config: `Users` collection, `db-postgres` adapter, `onInit` seed hook
- `src/collections/Users.ts` — `name`, `email`, `password`, `role` (enum: `admin` | `staff`)
- `src/app/(payload)/admin/[[...segments]]/page.tsx` — catch-all for Payload admin UI
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx` — not-found handler (uses static import for `@payload-config`)
- `src/app/(payload)/admin/[[...segments]]/layout.tsx` — admin root layout, calls Payload's `RootLayout` + `handleServerFunctions`
- `src/app/(payload)/admin/importMap.ts` — generated import map
- `src/app/(payload)/api/[...slug]/route.ts` — Payload REST + GraphQL API handler
- `src/app/(app)/layout.tsx` — public site root layout (html/body, fonts, metadata)
- `src/app/(app)/page.tsx` — homepage (moved from `src/app/page.tsx`)
- `.env.example` — documents `DATABASE_URI`, `PAYLOAD_SECRET`, `SEED_VENETA_PASSWORD`, `SEED_LINA_PASSWORD`
- `.devcontainer/devcontainer.json` — `DATABASE_URI` + `PAYLOAD_SECRET` set via `remoteEnv`

**Key fixes applied:**

- `not-found.tsx` must use a **static** `import configPromise from '@payload-config'` (not dynamic `import('@payload-config')`). Dynamic import returns the module namespace `{ default: ... }` via webpack, which makes `BasePayload.init` see `secret: undefined`.
- The admin layout was missing entirely, so Payload's `ConfigProvider`/`ThemeProvider` were never mounted → `useConfig()` returned `undefined` → 500 on every admin page. Fixed by creating `layout.tsx` with `RootLayout`.
- Next.js was on 15.2.9 (Payload-warned version). Upgraded to 16.2.1.
- Route groups restructured to support multiple root layouts: public site in `(app)/`, admin in `(payload)/`. Old `src/app/layout.tsx` and `src/app/page.tsx` deleted.

---

## Phase 2: Content Collections Schema ✅

**User stories**: US 30 (update prices), US 31 (publish blog), US 33 (update contact/hours), US 34 (configure slot interval)

### What to build

Define three Payload collections/globals: `ClinicSettings` (singleton Global), `Services`, and `BlogPosts`. No frontend wiring yet — this phase is schema and data only. Seed ClinicSettings with current clinic data and seed all 5 existing services migrated from `constants.ts`.

**ClinicSettings** (Global): `clinicName`, `phone`, `email`, `address`, `workingHoursStart` (time string), `workingHoursEnd` (time string), `slotIntervalMinutes` (number: 30 | 60), `openDays` (array of day enums: Mon–Sat)

**Services**: `name` (Lithuanian), `slug` (unique), `price` (number), `duration` (minutes), `description`, `shortDescription`, `icon`, `active` (bool). Seeded with all 5 services.

**BlogPosts**: `title`, `slug` (auto-generated from title), `body` (Lexical rich text), `excerpt`, `featuredImage` (upload), `metaTitle`, `metaDescription`, `publishedAt` (datetime), `status` (enum: `published` | `draft`, default `published`)

### Acceptance criteria

- [x] `ClinicSettings` global is editable in admin with all fields
- [x] `Services` collection lists all 5 services, each editable (name, price, duration, active toggle)
- [x] `BlogPosts` collection supports rich text body via Lexical editor
- [x] Creating a blog post defaults status to `published`
- [x] All slugs are unique and URL-safe
- [x] `constants.ts` services data is preserved but marked for removal in Phase 4

### What was built

**Files created / modified:**

- `src/collections/Media.ts` — upload-enabled collection required by `featuredImage` on BlogPosts; stores files under `/public/media`, 5 MB limit; `alt` text field
- `src/collections/Services.ts` — `name`, `slug` (unique), `price` (number, EUR), `duration` (number, minutes), `description`, `shortDescription`, `icon`, `active` (checkbox, default `true`)
- `src/collections/BlogPosts.ts` — `title`, `slug` (unique, auto-generated from title via `beforeValidate` hook with Lithuanian character transliteration), `status` (select: `published` | `draft`, default `published`), `publishedAt`, `excerpt`, `featuredImage` (upload → `media`), `body` (richText / Lexical), `metaTitle`, `metaDescription`
- `src/globals/ClinicSettings.ts` — singleton global: `clinicName`, `phone`, `email`, `address`, `workingHoursStart`, `workingHoursEnd`, `slotIntervalMinutes` (select: `'30'` | `'60'`), `openDays` (multi-select: monday–saturday, Lithuanian labels)
- `payload.config.ts` — added `Media`, `Services`, `BlogPosts` to `collections`; added `globals: [ClinicSettings]`; added `upload.limits.fileSize = 5 MB`; extended `onInit` to seed `ClinicSettings` (checks `!clinicName`) and all 5 `Services` (checks `totalDocs === 0`)
- `src/lib/constants.ts` — `SERVICES` array marked with `// TODO(Phase 4): Remove SERVICES` comment

**Implementation notes:**

- `slotIntervalMinutes` is stored as a `select` string (`'30'` / `'60'`) for clean admin UX; consumers should `parseInt` when reading.
- Duration values converted from `constants.ts` string format: `'2 val.'` → 120 min, `'2,5 val.'` → 150 min, `'0,5 val.'` → 30 min. Price range `'50–80 €'` seeded as `50` (minimum); admin can adjust.
- Slug auto-generation transliterates Lithuanian diacritics (ą→a, č→c, ė→e, etc.) before URL-safe lowercasing.

---

## Phase 3: Booking Collections Schema ✅

**User stories**: US 21–27, US 29

### What to build

Define three Payload collections: `Bookings`, `BlockedSlots`, and `AuditLog`. No API logic yet — schema and admin list views only.

**Bookings**: `service` (relation → Services), `date` (date), `timeSlot` (string e.g. "14:00"), `endTime` (string, computed on save from timeSlot + service.duration), `status` (enum: `pending` | `confirmed` | `rejected` | `cancelled`, default `pending`), `rejectionReason` (text, visible only when status = rejected), `patientName`, `patientPhone`, `patientEmail`, `patientNotes`, `smsOptIn` (bool), `reminderSent` (bool, default false), `gdprConsent` (bool)

**BlockedSlots**: `date` (date), `startTime` (string), `endTime` (string), `reason` (text, optional), `createdBy` (relation → Users)

**AuditLog**: `user` (relation → Users), `action` (enum: `confirmed` | `rejected` | `cancelled` | `rescheduled` | `slot_blocked` | `slot_unblocked`), `booking` (relation → Bookings, optional), `note` (text), `createdAt` (auto). Collection is read-only in the admin UI — no create/edit/delete buttons. Written programmatically only.

Admin list view for `Bookings`: columns `patientName`, `service`, `date`, `timeSlot`, `status`. Sortable by `date`. Filterable by `status`.

### Acceptance criteria

- [x] `Bookings` collection visible in admin with correct fields and list view
- [x] `rejectionReason` field only appears in admin UI when status = `rejected`
- [x] `BlockedSlots` collection is creatable and editable in admin
- [x] `AuditLog` collection is visible but has no create/edit/delete actions in admin UI
- [x] All three collections survive a database migration without errors

### What was built

**Files created / modified:**

- `src/collections/Bookings.ts` — `service` (relation → `services`), `date`, `timeSlot`, `endTime` (read-only, auto-computed via `beforeChange` hook from timeSlot + service.duration), `status` (select: pending/confirmed/rejected/cancelled, default pending), `rejectionReason` (text, `admin.condition` hides it unless status = rejected), `patientName`, `patientPhone`, `patientEmail`, `patientNotes`, `smsOptIn`, `reminderSent` (read-only), `gdprConsent`
- `src/collections/BlockedSlots.ts` — `date`, `startTime`, `endTime`, `reason`, `createdBy` (relation → `users`, auto-set via `beforeChange` hook from `req.user`)
- `src/collections/AuditLog.ts` — `user` (relation → `users`), `action` (select), `booking` (relation → `bookings`), `note`; `access.create/update/delete` all return `false` making it read-only in admin
- `payload.config.ts` — added `Bookings`, `BlockedSlots`, `AuditLog` to `collections`
- `src/app/(payload)/layout.tsx` — **created** at the correct `(payload)/` level with `import '@payloadcms/next/css'`; replaces the misplaced layout that was inside `admin/[[...segments]]/`
- `src/app/(payload)/admin/[[...segments]]/layout.tsx` — **deleted** (was in wrong location with wrong CSS import)
- `src/app/(payload)/admin/importMap.ts` — manually populated with `CollectionCards` from `@payloadcms/next/rsc` (required for dashboard widget)
- `package.json` — added `"type": "module"`, changed dev script to `next dev --webpack`, added `generate:importmap` and `generate:types` scripts

**Implementation notes:**

- `relationTo: 'services' as any` and `relationTo: 'bookings' as any` required until `payload generate:types` regenerates `CollectionSlug` type to include the new slugs.
- `endTime` is derived server-side: `beforeChange` fetches the related service by ID, reads `duration`, and computes `timeSlot + duration` in HH:MM format. Field is `admin.readOnly: true`.
- Admin CSS fix: the correct import is `@payloadcms/next/css` (resolves to `dist/prod/styles.css`), placed in `src/app/(payload)/layout.tsx`. Using `@payloadcms/ui/styles.css` in the nested `admin/[[...segments]]/layout.tsx` caused the admin to render with no visual styling.

---

## Phase 4: CMS → Frontend Pipeline

**User stories**: US 19 (schema.org in search results), US 33 (contact/hours update propagates)

### What to build

Wire `ClinicSettings` and `Services` data into the existing frontend. The homepage footer, contact section, and navigation pull phone/email/hours from Payload at request time. The homepage services section renders from the `Services` collection instead of `constants.ts`. Add `LocalBusiness` schema.org JSON-LD to the homepage, populated from `ClinicSettings`.

### Acceptance criteria

- [ ] Homepage services section renders from Payload `Services` (active only), not `constants.ts`
- [ ] Footer phone, email, address, and hours come from `ClinicSettings`
- [ ] Contact section phone and email come from `ClinicSettings`
- [ ] Changing phone in `ClinicSettings` and reloading homepage reflects the new number
- [ ] `LocalBusiness` JSON-LD present in homepage `<head>` with correct `@type: "MedicalBusiness"`, name, telephone, address, openingHours
- [ ] `constants.ts` service entries removed or marked unused
- [ ] No hardcoded phone/email/address strings remain in components

---

## Phase 5: Service Pages + SEO Structure

**User stories**: US 12–16 (patients find service pages via Google), US 1 (see services with prices)

### What to build

Create individual `/paslaugos/[slug]/` pages driven by the `Services` collection. Each page has its own `generateMetadata()` with the SEO title and description from the keyword brief. Build in SEO priority order. Each page shows service description, price, duration, and a CTA button linking to `/rezervacija/?service=[slug]`. Create a `/rezervacija/` shell page that reads the `?service=` query param and displays the selected service name — full wizard wiring comes in Phase 8.

Build order (SEO priority):
1. `/paslaugos/iaugusio-nago-gydymas/` — H1: "Įaugusio nago gydymas Šiauliuose"
2. `/paslaugos/nagu-grybelio-gydymas/` — H1: "Nagų grybelio gydymas Šiauliuose"
3. `/paslaugos/medicininis-pedikiuras/` — H1: "Medicininis pedikiūras Šiauliuose"
4. `/paslaugos/nuospaudu-salinimas/` — H1: "Nuospaudų šalinimas Šiauliuose"
5. `/paslaugos/nagu-protezavimas/` — H1: "Nagų protezavimas Šiauliuose"

Homepage H1 updated to: "Podologijos klinika Šiauliuose — profesionali pėdų priežiūra"

### Acceptance criteria

- [ ] All 5 service pages exist and render without errors
- [ ] Each page `<title>` matches the SEO brief exactly
- [ ] Each page H1 includes "Šiauliuose"
- [ ] Price and duration on each page come from Payload `Services`, not hardcoded
- [ ] CTA on each service page links to `/rezervacija/?service=[slug]`
- [ ] `/rezervacija/` page exists, reads `?service=` param, and displays the pre-selected service name
- [ ] Homepage H1 updated per SEO brief
- [ ] Changing a service price in Payload is reflected on the service page after reload

---

## Phase 6: Notification Layer

**User stories**: US 4–7 (patient notifications), implicit (Veneta alert)

### What to build

Set up Resend and SMSAPI as isolated notification services before any booking logic references them. Write all email templates (React Email components, Lithuanian text, clinic branding) and all SMS message strings. Expose two internal functions: `sendEmail(template, to, data)` and `sendSms(to, message)`. Smoke test each template renders correctly and each service can reach its API.

**Email templates** (React Email, Lithuanian):
- `BookingReceivedEmail` — to patient on submit
- `BookingConfirmedEmail` — to patient on confirm
- `BookingRejectedEmail` — to patient on reject (includes `rejectionReason`)
- `BookingReminderEmail` — to patient 1 day before
- `NewBookingAlertEmail` — to Veneta on new submission
- `BookingCancelledAlertEmail` — to Veneta on cancellation

**SMS strings** (Lithuanian, under 160 chars):
- On submit: "Jūsų vizito užklausa gauta. Patvirtinsime netrukus. — Baltic Foot"
- On confirm: "Vizitas patvirtintas: [date] [time], [service]. — Baltic Foot"
- On reject: "Deja, negalime patvirtinti jūsų užklausos. Skambinkite: +370 699 80980"
- Reminder: "Primename: rytoj [time] vizitas Baltic Foot klinikoje. — +370 699 80980"

### Acceptance criteria

- [ ] `RESEND_API_KEY` and `SMSAPI_TOKEN` documented in `.env.example`
- [ ] All 6 email templates render without errors (verify via React Email preview)
- [ ] All 4 SMS strings are under 160 characters
- [ ] `sendEmail()` and `sendSms()` internal functions exist with typed parameters
- [ ] Sending a test email via Resend reaches inbox without landing in spam
- [ ] Sending a test SMS via SMSAPI delivers to a Lithuanian number with "BalticFoot" sender ID
- [ ] Notification functions handle API errors gracefully (log, don't throw) so a notification failure never breaks a booking transaction

---

## Phase 7: Availability API

**User stories**: US 3 (duration-aware slots), US 2 (slots shown correctly)

### What to build

Implement `GET /api/availability?date=&service=` as a standalone API route with full integration tests. No UI touches this phase — the endpoint is the deliverable.

**Algorithm:**
1. Fetch `ClinicSettings` (workingHoursStart, workingHoursEnd, slotIntervalMinutes, openDays)
2. Fetch `service.duration` for the requested service slug
3. Reject if requested date is a weekend or outside `openDays`
4. Query all `Bookings` where `date = requested date` AND `status IN (pending, confirmed)`
5. Query all `BlockedSlots` where `date = requested date`
6. Generate all candidate slots from workingHoursStart to workingHoursEnd at slotIntervalMinutes intervals
7. For each candidate slot: mark unavailable if any booking or block overlaps the window `[slot, slot + duration)`
8. Also mark unavailable if `slot + duration > workingHoursEnd`
9. Return `{ slots: [{ time: "09:00", available: boolean }] }`

**Integration tests (against real test database):**
- All slots available on an empty day
- PENDING booking blocks correct slots (duration-aware)
- CONFIRMED booking blocks correct slots
- BlockedSlot blocks correct slots
- 2h service cannot start in last 90 mins of working day
- Full day block returns all slots unavailable
- Weekend date returns empty slots array
- Closed day (not in openDays) returns empty slots array

### Acceptance criteria

- [ ] `GET /api/availability` returns correct shape for all test cases
- [ ] All integration tests pass
- [ ] Slot interval and working hours changes in `ClinicSettings` are reflected in API response
- [ ] Race condition: two simultaneous requests for same slot both return `available: true` (reservation handled at submit time in Phase 8, not here)

---

## Phase 8: Booking Submission

**User stories**: US 1–5, US 8–11

### What to build

Wire the `/rezervacija/` booking wizard to the real availability API and implement `POST /api/bookings`. The wizard replaces its hardcoded time slots with live data from Phase 7's availability endpoint. On submit, the server re-checks availability (race condition guard), creates a `Booking` with status `pending`, and triggers patient notifications from Phase 6.

**`POST /api/bookings` validation:**
- `service` slug exists and is active
- `date` + `timeSlot` combination passes a fresh availability check
- `gdprConsent` must be `true`
- `patientName`, `patientPhone` are required
- `patientEmail` required (for email notification)

**On success:** Create `Booking` (status: `pending`) → send `BookingReceivedEmail` + SMS to patient → send `NewBookingAlertEmail` to Veneta → return booking summary.

### Acceptance criteria

- [ ] Wizard step 2 fetches real time slots from `GET /api/availability`
- [ ] Slots unavailable in the API are unselectable in the UI
- [ ] `?service=` query param pre-selects correct service in step 1
- [ ] Submitting valid booking creates a `Booking` record with status `pending`
- [ ] Patient receives SMS and email after submission
- [ ] Veneta receives email alert after submission
- [ ] Submitting without GDPR consent returns a validation error
- [ ] Submitting a slot that becomes taken between page load and submit returns an error (race condition)
- [ ] Integration test: simultaneous submit of same slot — only one succeeds

---

## Phase 9: Booking Admin Actions

**User stories**: US 6, US 21–25, US 27

### What to build

Add confirm, reject, and cancel actions to the Payload booking admin. Each action is a custom button on the booking detail view. On confirm: status → `confirmed`, `AuditLog` entry written, `BookingConfirmedEmail` + SMS sent to patient. On reject: status → `rejected`, `rejectionReason` saved, `AuditLog` entry written, `BookingRejectedEmail` + SMS sent to patient. On cancel: status → `cancelled`, `AuditLog` entry written, `BookingCancelledAlertEmail` sent to Veneta.

Every action records: `user` (who clicked), `action`, `booking`, `note` (optional), `createdAt`.

### Acceptance criteria

- [ ] Confirm button visible on pending bookings, hidden on confirmed/rejected/cancelled
- [ ] Reject button requires a non-empty rejection reason before saving
- [ ] Cancel button available on confirmed bookings
- [ ] Each action updates booking status immediately in the list view
- [ ] Patient receives correct SMS + Email for confirm and reject
- [ ] Rejection email/SMS includes the typed reason
- [ ] AuditLog entry created for every action (correct `user`, `action`, `booking` fields)
- [ ] AuditLog is visible in admin but has no edit/delete controls
- [ ] Integration tests: confirm/reject/cancel each produce correct status, AuditLog entry, and notification call

---

## Phase 10: Slot Blocking

**User stories**: US 26 (block time slots)

### What to build

Enable admins to create, edit, and delete `BlockedSlots` from the admin panel. Verify the availability API (Phase 7) correctly excludes blocked ranges. Add a simple calendar or list view of upcoming bookings and blocks so Veneta can see her week at a glance.

### Acceptance criteria

- [ ] Admin can create a BlockedSlot with date, start time, end time, and optional reason
- [ ] Admin can delete a BlockedSlot
- [ ] Blocked time range is unavailable in `GET /api/availability` response
- [ ] Partial overlap is handled: a 2h service starting 30min before a block end is correctly blocked
- [ ] Calendar/list view shows confirmed bookings and blocked slots for the next 7 days
- [ ] Integration tests: blocked slot excludes correct candidate slots from availability

---

## Phase 11: Reminder Cron

**User stories**: US 7 (day-before reminder)

### What to build

A cron job that runs daily at 10:00 (Railway cron or Next.js route handler triggered by a cron service). Queries all bookings where `date = tomorrow` AND `status = confirmed` AND `smsOptIn = true` AND `reminderSent = false`. For each result: sends `BookingReminderEmail` + SMS, then sets `reminderSent = true`. Handles send failures gracefully — logs error, does not mark `reminderSent = true` on failure so it retries next run.

### Acceptance criteria

- [ ] Cron runs daily at 10:00 Lithuanian time (UTC+2/UTC+3)
- [ ] Only targets tomorrow's confirmed bookings
- [ ] Only sends SMS to patients with `smsOptIn = true`
- [ ] Sets `reminderSent = true` only after successful send
- [ ] Does not re-send if `reminderSent = true` already
- [ ] Failed send logged but does not crash the job
- [ ] Integration test: job with 3 eligible bookings sends 3 reminders and marks all as sent

---

## Phase 12: Contact Form

**User stories**: implicit (contact enquiries reach Veneta)

### What to build

Wire the existing contact form to `POST /api/contact`. On submit: validate name, phone/email, and message are present. Send a plain email to Veneta via Resend containing the enquiry details. No database storage. Return success/error state to the form UI.

### Acceptance criteria

- [ ] Submitting the contact form sends an email to `info@balticfoot.lt`
- [ ] Email contains sender name, phone/email, and message
- [ ] Submitting with missing required fields returns a validation error displayed in the UI
- [ ] Successful submit shows a confirmation message in the form
- [ ] No contact enquiry data is written to the database

---

## Phase 13: Blog

**User stories**: US 17 (read blog articles), US 18 (CTA at end of posts), US 31 (publish posts), US 32 (instant publish)

### What to build

Build `/blog/` (post list) and `/blog/[slug]/` (full post) pages driven by the `BlogPosts` Payload collection. Each post page has `generateMetadata()` using `metaTitle` and `metaDescription` from Payload. Rich text body rendered via Payload's Lexical renderer. Every post ends with a fixed CTA block: "Registruokitės konsultacijai" linking to `/rezervacija/`. List page shows post cards: title, excerpt, featured image, date.

Only `status = published` posts are shown publicly.

### Acceptance criteria

- [ ] `/blog/` lists all published posts sorted by `publishedAt` descending
- [ ] Draft posts do not appear on `/blog/` or at their slug URL
- [ ] `/blog/[slug]/` renders title, body (rich text), featured image, and publication date
- [ ] Each post has correct `<title>` and meta description from Payload fields
- [ ] Every post page ends with a CTA linking to `/rezervacija/`
- [ ] Creating a post in Payload admin with default status makes it immediately publicly visible
- [ ] Non-existent slug returns 404

---

## Phase 14: GDPR + SEO Polish

**User stories**: US 20 (privacy policy accessible), US 29 (delete patient data)

### What to build

Create the `/privatumo-politika/` privacy policy page in Lithuanian. Wire patient data deletion in the Payload booking admin (admin can delete a booking record to remove patient data). Add a 2-year retention hook or cron that flags/deletes bookings older than 2 years. Complete SEO infrastructure: `sitemap.ts` auto-generates XML sitemap from service pages + published blog posts. `robots.txt` disallows `/admin`. Canonical `<link>` tags on all pages. Verify all images have Lithuanian alt text.

**Privacy policy page must cover:**
- What data is collected (name, phone, email, booking notes)
- Purpose (appointment management)
- Retention period (2 years from appointment date)
- Patient rights (access, correction, deletion)
- Contact for data requests: info@balticfoot.lt

### Acceptance criteria

- [ ] `/privatumo-politika/` page exists and is linked from the footer
- [ ] Privacy policy covers all required GDPR elements in Lithuanian
- [ ] Admin can delete a booking record from the Payload admin (removes all patient PII)
- [ ] Cron or Payload hook flags bookings older than 2 years for deletion review
- [ ] `/sitemap.xml` includes homepage, all active service pages, and all published blog posts
- [ ] `/robots.txt` disallows `/admin`
- [ ] Canonical `<link rel="canonical">` present on all public pages
- [ ] No image on any public page is missing an `alt` attribute
