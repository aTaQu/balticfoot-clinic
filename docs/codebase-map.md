# Codebase Map — Baltic Foot

> Keep this file up to date. Update it as part of every `/phase-complete`.
> Purpose: orient a new agent/session without requiring full tree exploration.

---

## Canonical patterns

Read **one** of these before writing the corresponding code type — don't read the whole file, just use it as the pattern reference.

| Task | Read this | Key thing it shows |
|------|-----------|--------------------|
| New lib helper | `src/lib/bookingActions.ts` | Result-type union, typed collection constants, fire-and-forget notifications |
| New admin API route | `src/app/(app)/api/admin/bookings/[id]/confirm/route.ts` | `parseAdminRequest` usage, thin handler pattern |
| New public API route | `src/app/(app)/api/bookings/route.ts` | Input validation, `force-dynamic`, error shape |
| New AfterFields widget | `src/components/admin/BookingActions.tsx` | `useDocumentInfo`, inline styles (not Tailwind), `router.refresh()` |
| New AfterDashboard widget | `src/components/admin/WeekSchedule.tsx` | `useEffect` fetch with `AbortController`, inline styles, registered via `admin.components.afterDashboard` + `importMap.ts` |
| Integration test | `src/lib/bookingActions.test.ts` | `beforeAll` payload init, `afterEach` cleanup, far-future dates |
| Sending notifications | `src/lib/bookingActions.ts` lines 44–65 | `findGlobal` for clinic settings, `void sendEmail(...)` pattern |
| New Server Component page | `src/app/(app)/paslaugos/[slug]/page.tsx` | `force-dynamic`, `generateMetadata`, Payload fetch |
| Lexical rich text rendering | `src/app/(app)/blog/[slug]/page.tsx` | `import { RichText } from '@payloadcms/richtext-lexical/react'`, pass `data={post.body}` |

---

## Known gotchas

- **Collection slug type casts** — Payload's generated `CollectionSlug` type may not include new collections until `generate:types` runs. Use typed constants: `const BOOKINGS = 'bookings' as const` then `collection: BOOKINGS as any`.
- **Payload relationship depth** — `payload.find()` defaults to `depth: 2`, returning full nested objects. Use `depth: 0` when you only need IDs (e.g. asserting `log.user === userId` in tests).
- **Test env vars** — any test that imports `bookingActions.ts` or `bookings.ts` (which import `notifications/email.ts`) will fail at module load unless `RESEND_API_KEY` is set. Run as: `RESEND_API_KEY=re_test_dummy SMSAPI_TOKEN=test_dummy npx vitest run <file>`.
- **`slotIntervalMinutes` is a string** — stored as `'30'`/`'60'` select in Postgres. Always `parseInt()` before arithmetic.
- **`endTime` on Bookings** — computed server-side via `beforeChange` hook, typed `string | null`. Null-guard with `flatMap` or `??` before use.
- **Admin UI styling** — Payload admin doesn't reliably pick up Tailwind classes. Use inline `style={{ }}` with `var(--theme-*)` CSS variables (see `BookingActions.tsx`).
- **`formatDateLT`** — lives in `src/lib/format.ts`. Don't add it elsewhere.
- **CRLF on this devcontainer** — WSL2/Windows writes CRLF to the working tree. `.gitattributes` normalises on commit. Always `git add <specific files>` — never `git add .` — to avoid staging line-ending-only noise.

---

## Route → File

| URL | File | Rendering |
|-----|------|-----------|
| `/` | `src/app/(app)/page.tsx` | Dynamic (fetches Services + ClinicSettings) |
| `/paslaugos/[slug]` | `src/app/(app)/paslaugos/[slug]/page.tsx` | Dynamic (`force-dynamic`) |
| `/blog` | `src/app/(app)/blog/page.tsx` | Dynamic (fetches published posts) |
| `/blog/[slug]` | `src/app/(app)/blog/[slug]/page.tsx` | Dynamic (`force-dynamic`), 404 on draft/missing |
| `/privatumo-politika` | `src/app/(app)/privatumo-politika/page.tsx` | Dynamic (`force-dynamic`), Lithuanian GDPR policy |
| `/sitemap.xml` | `src/app/sitemap.ts` | Auto-generated; active services + published posts |
| `/robots.txt` | `src/app/robots.ts` | Allow all, disallow `/admin` |
| `/rezervacija` | `src/app/(app)/rezervacija/page.tsx` | Dynamic, reads `?service=` param |
| `/admin/[[...segments]]` | `src/app/(payload)/admin/[[...segments]]/page.tsx` | Payload admin UI |
| `/api/availability` | `src/app/(app)/api/availability/route.ts` | `force-dynamic`, GET only |
| `/api/bookings` | `src/app/(app)/api/bookings/route.ts` | `force-dynamic`, POST only |
| `/api/admin/bookings/[id]/confirm` | `src/app/(app)/api/admin/bookings/[id]/confirm/route.ts` | POST, requires Payload session |
| `/api/admin/bookings/[id]/reject` | `src/app/(app)/api/admin/bookings/[id]/reject/route.ts` | POST, requires Payload session |
| `/api/admin/bookings/[id]/cancel` | `src/app/(app)/api/admin/bookings/[id]/cancel/route.ts` | POST, requires Payload session |
| `/api/admin/schedule` | `src/app/(app)/api/admin/schedule/route.ts` | GET, requires Payload session, `?from=YYYY-MM-DD&days=1-14` |
| `/api/contact` | `src/app/(app)/api/contact/route.ts` | POST only, no auth, no DB writes |
| `/api/cron/reminders` | `src/app/(app)/api/cron/reminders/route.ts` | GET, `Authorization: Bearer <CRON_SECRET>`, returns `{ sent, failed }` |
| `/api/[...slug]` | `src/app/(payload)/api/[...slug]/route.ts` | Payload REST + GraphQL |

**Route groups:**
- `src/app/(app)/` — public site (own layout: fonts, metadata)
- `src/app/(payload)/` — Payload admin + API (own layout: `@payloadcms/next/css`)

---

## Payload Collections & Globals

| Slug | File | Key fields |
|------|------|------------|
| `users` | `src/collections/Users.ts` | `name`, `email`, `role` (admin\|staff) |
| `services` | `src/collections/Services.ts` | `name`, `slug`, `price`, `duration` (min), `description`, `shortDescription`, `icon`, `active` |
| `blog-posts` | `src/collections/BlogPosts.ts` | `title`, `slug` (auto), `body` (Lexical), `status` (published\|draft), `publishedAt` |
| `bookings` | `src/collections/Bookings.ts` | `service` (rel), `date`, `timeSlot`, `endTime` (computed, nullable), `status` (pending\|confirmed\|rejected\|cancelled), `patientName/Phone/Email`, `gdprConsent`, `smsOptIn` |
| `blocked-slots` | `src/collections/BlockedSlots.ts` | `date`, `startTime`, `endTime`, `reason`, `createdBy` (rel → users) |
| `audit-log` | `src/collections/AuditLog.ts` | `user` (rel), `action` (confirmed\|rejected\|cancelled\|rescheduled\|slot_blocked\|slot_unblocked), `booking` (rel, optional), `note` — **read-only in admin** |
| `media` | `src/collections/Media.ts` | Upload collection, 5 MB limit, stored in `/public/media` |
| `clinic-settings` | `src/globals/ClinicSettings.ts` | `clinicName`, `phone`, `email`, `address`, `workingHoursStart/End`, `slotIntervalMinutes` ('30'\|'60'), `openDays` |

**How to fetch in a Server Component:**
```ts
const payload = await getPayload({ config: configPromise })
const services = await payload.find({ collection: 'services', where: { active: { equals: true } } })
const settings = await payload.findGlobal({ slug: 'clinic-settings' })
```

---

## Component Inventory

All components live in `src/components/`. Each has a co-located `.module.css`.

| Component | What it does | Notable props |
|-----------|-------------|---------------|
| `Navigation` | Top nav bar | none |
| `Hero` | Homepage hero section | `phone: string` |
| `Services` | Service card grid | `services: Service[]`, `onServiceSelect?: fn` |
| `About` | About section | `phone: string` |
| `Contact` | Contact section | `phone`, `email`, `address`, `hoursDisplay` |
| `Footer` | Site footer | `phone`, `email`, `address`, `workingHoursStart`, `workingHoursEnd`, `openDays: string[]` |
| `Trust` | Trust signals strip | none |
| `Quote` | Pull-quote block | none |
| `Gallery` | Photo gallery | none |
| `BookingWizard` | Multi-step booking form — fetches live services + availability | none |
| `BookingActions` | Payload admin `AfterFields` — confirm/reject/cancel buttons | rendered via `admin.components.edit.AfterFields` in `Bookings` collection |
| `WeekSchedule` | Payload admin `AfterDashboard` — 7-day read-only schedule widget | registered via `admin.components.afterDashboard` in `payload.config.ts` |
| `ScrollRevealInit` | Mounts scroll-reveal animations | none |

**Footer nav links** are currently homepage fragment links (`#paslaugos`, `#registracija`, etc.) — not yet updated for multi-page structure.

---

## Data Flow Pattern (Server Components)

```
Request → Next.js Server Component
  → getPayload({ config: configPromise })
  → payload.find() / payload.findGlobal()
  → props passed down to Client Components
  → Client Components marked 'use client' only where needed (BookingWizard, Services click handlers)
```

Pages use `export const dynamic = 'force-dynamic'` where data must reflect Payload changes immediately on reload (service pages, rezervacija).

---

## Key Conventions

- **CSS**: CSS Modules per component (`Component.module.css`). Global tokens in `src/app/globals.css`.
  - Tokens: `--sand`, `--stone`, `--terra`, `--sage`, `--cream`, `--soil`
  - Utility classes: `container`, `btn btn-primary`, `btn btn-ghost`, `section-label`, `reveal`, `reveal-delay-{1-4}`
  - Fonts: `var(--font-dm-sans)` (body), `var(--font-cormorant)` (headings/display numbers)

- **SEO per service page**: SEO titles/descriptions live in a static `SEO` map in `paslaugos/[slug]/page.tsx` — not in Payload. They match the keyword brief exactly and should not be changed without updating the keyword strategy.

- **Slug generation**: `BlogPosts` slugs auto-generated from title via `beforeValidate` hook with Lithuanian transliteration. `Services` slugs are set manually at seed time.

- **AuditLog**: `access.create/update/delete` return `false` — written programmatically only.

- **Seed pattern**: `onInit` in `payload.config.ts` seeds users (if 0), ClinicSettings (if no `clinicName`), Services (if 0). Idempotent.

- **Dev container**: PostgreSQL runs inside the container. `DATABASE_URI` and `PAYLOAD_SECRET` injected via `devcontainer.json` `remoteEnv`. No `.env` needed on host.

---

## Lib API reference

### `src/lib/format.ts`
```ts
formatDateLT(isoDate: string): string        // "2026-04-15" → "2026 m. balandžio 15 d."
formatDuration(minutes: number): string      // 90 → "1,5 val."
```

### `src/lib/availability.ts`
```ts
getAvailability(payload, date: string, serviceSlug: string): Promise<AvailabilityResult>
// AvailabilityResult = { slots: { time: string, available: boolean }[] } | { error: string, status: 400|404 }
```
Algorithm: fetches ClinicSettings + service duration + PENDING/CONFIRMED bookings + BlockedSlots, marks slots unavailable if `[slot, slot+duration)` overlaps any booking/block or exceeds `workingHoursEnd`.

### `src/lib/bookings.ts`
```ts
createBooking(payload, input: CreateBookingInput): Promise<CreateBookingResult>
// CreateBookingResult = { booking: { id, date, timeSlot, serviceName } } | { error: string, status: 400|404|409 }
```
Validates → re-checks availability (race guard) → creates `pending` booking → fire-and-forget notifications.

### `src/lib/schedule.ts`
```ts
getSchedule(payload, from: string, days: number): Promise<ScheduleResult>
// ScheduleResult = { days: ScheduleDay[] }
// ScheduleDay = { date: string, bookings: ScheduledBooking[], blocks: ScheduledBlock[] }
// ScheduledBooking = { id, patientName, serviceName, timeSlot, endTime }
// ScheduledBlock = { id, startTime, endTime, reason }
```
Only CONFIRMED bookings appear. Queries bookings + blocked-slots in parallel via `Promise.all`. Days sorted chronologically, entries within each day sorted by time.

### `src/lib/reminders.ts`
```ts
getTomorrowVilnius(): string                          // "YYYY-MM-DD" for tomorrow in Europe/Vilnius
sendReminders(payload, tomorrow?: string): Promise<RemindersResult>
// RemindersResult = { sent: number, failed: number }
```
Queries confirmed bookings for `tomorrow` with `reminderSent=false`. Sends `BookingReminderEmail` (always) + reminder SMS (if `smsOptIn=true`). Sets `reminderSent=true` on success. `tomorrow` param is a test seam; defaults to `getTomorrowVilnius()`.

### `src/lib/bookingActions.ts`
```ts
confirmBooking(payload, bookingId: number, userId: number): Promise<BookingActionResult>
rejectBooking(payload, bookingId: number, userId: number, reason: string): Promise<BookingActionResult>
cancelBooking(payload, bookingId: number, userId: number): Promise<BookingActionResult>
// BookingActionResult = { booking: { id, status } } | { error: string, status: 400|403|404|409 }
```
Each: validates state transition → updates booking → writes AuditLog → fire-and-forget notifications.

### `src/lib/notifications/`
```ts
sendEmail(template: EmailTemplate, to: string, data: EmailData): Promise<void>
sendSms(to: string, message: string): Promise<void>
SMS.received / SMS.confirmed(date, time, service) / SMS.rejected / SMS.reminder(time)
```
Both functions catch and log — never rethrow. `EmailTemplate` = `'booking-received' | 'booking-confirmed' | 'booking-rejected' | 'booking-reminder' | 'new-booking-alert' | 'booking-cancelled-alert' | 'contact-enquiry-alert'`.

### `src/app/(app)/api/admin/parseAdminRequest.ts`
```ts
parseAdminRequest(request, params): Promise<{ payload, userId: number, bookingId: number } | { response: NextResponse }>
```
Authenticates via `payload.auth()`, parses `[id]` param. Check `'response' in result` to short-circuit on 401/400.

---

## Test conventions

- **Dates**: always far-future (year 2099) to avoid collisions with real clinic data
- **Run**: `RESEND_API_KEY=re_test_dummy SMSAPI_TOKEN=test_dummy npx vitest run <file>`
- **DB cleanup**: `afterEach` deletes test records by the test date field
- **Audit-log queries**: use `depth: 0` to get IDs, not populated objects
- **Config**: `fileParallelism: false` in `vitest.config.ts` — integration tests share a real DB

---

## Notification Layer (`src/lib/notifications/`)

| File | Purpose |
|------|---------|
| `email.ts` | `sendEmail(template, to, data)` — renders + sends via Resend singleton |
| `sms.ts` | `sendSms(to, message)` + `SMS` string constants |
| `types.ts` | `EmailTemplate` union, `EmailData` variants |
| `styles.ts` | Shared inline style tokens for all email templates |
| `templates/` | 7 React Email components (received, confirmed, rejected, reminder, new-booking alert, cancelled alert, contact enquiry alert) |
| `smoke-test.ts` | Run with `npx tsx src/lib/notifications/smoke-test.ts` — no API keys needed |

---

## What's NOT built yet (as of Phase 14)

- Canonical `<link rel="canonical">` on all public pages — Phase 15
- Alt text audit across all public images — Phase 15
- 2-year data retention cron (auto-flag/delete old bookings) — Phase 15
- `NEXT_PUBLIC_SITE_URL` env var set on Railway — deployment step before go-live
- Footer navigation updated for multi-page structure — deferred (no phase assigned)
