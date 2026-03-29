# Codebase Map — Baltic Foot

> Keep this file up to date. Update it as part of every `/phase-complete`.
> Purpose: orient a new agent/session without requiring full tree exploration.

---

## Route → File

| URL | File | Rendering |
|-----|------|-----------|
| `/` | `src/app/(app)/page.tsx` | Dynamic (fetches Services + ClinicSettings) |
| `/paslaugos/[slug]` | `src/app/(app)/paslaugos/[slug]/page.tsx` | Dynamic (`force-dynamic`) |
| `/rezervacija` | `src/app/(app)/rezervacija/page.tsx` | Dynamic, reads `?service=` param |
| `/admin/[[...segments]]` | `src/app/(payload)/admin/[[...segments]]/page.tsx` | Payload admin UI |
| `/api/availability` | `src/app/(app)/api/availability/route.ts` | `force-dynamic`, GET only |
| `/api/bookings` | `src/app/(app)/api/bookings/route.ts` | `force-dynamic`, POST only |
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
| `bookings` | `src/collections/Bookings.ts` | `service` (rel), `date`, `timeSlot`, `endTime` (computed), `status`, `patientName/Phone/Email`, `gdprConsent`, `smsOptIn` |
| `blocked-slots` | `src/collections/BlockedSlots.ts` | `date`, `startTime`, `endTime`, `reason`, `createdBy` (rel → users) |
| `audit-log` | `src/collections/AuditLog.ts` | `user` (rel), `action`, `booking` (rel, optional), `note` — **read-only in admin** |
| `media` | `src/collections/Media.ts` | Upload collection, 5 MB limit, stored in `/public/media` |
| `clinic-settings` | `src/globals/ClinicSettings.ts` | `clinicName`, `phone`, `email`, `address`, `workingHoursStart/End`, `slotIntervalMinutes` ('30'\|'60'), `openDays` |

**How to fetch in a Server Component:**
```ts
const payload = await getPayload({ config: configPromise })
const services = await payload.find({ collection: 'services', where: { active: { equals: true } } })
const settings = await payload.findGlobal({ slug: 'clinic-settings' }) as Promise<ClinicSetting>
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
| `BookingWizard` | Multi-step booking form | `services: Service[]`, `preselectedSlug?: string\|null`, `openDays?: string[]` |
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

- **`slotIntervalMinutes`**: Stored as select string `'30'`/`'60'` in Postgres — consumers must `parseInt()`.

- **`endTime` on Bookings**: Computed server-side via `beforeChange` hook, never set by client.

- **AuditLog**: `access.create/update/delete` return `false` — written programmatically only.

- **Seed pattern**: `onInit` in `payload.config.ts` seeds users (if 0), ClinicSettings (if no `clinicName`), Services (if 0). Idempotent.

- **Dev container**: PostgreSQL runs inside the container. `DATABASE_URI` and `PAYLOAD_SECRET` injected via `devcontainer.json` `remoteEnv`. No `.env` needed on host.

---

## Notification Layer (`src/lib/notifications/`)

| File | Purpose |
|------|---------|
| `email.ts` | `sendEmail(template, to, data)` — renders + sends via Resend singleton |
| `sms.ts` | `sendSms(to, message)` + `SMS` string constants |
| `types.ts` | `EmailTemplate` union, `EmailData` variants |
| `styles.ts` | Shared inline style tokens for all email templates |
| `templates/` | 6 React Email components (received, confirmed, rejected, reminder, new-booking alert, cancelled alert) |
| `smoke-test.ts` | Run with `npx tsx src/lib/notifications/smoke-test.ts` — no API keys needed |

Both `sendEmail` and `sendSms` catch and log errors without rethrowing — notification failure never breaks a booking transaction.

---

## Availability API (`src/lib/availability.ts`)

| Export | Signature | Purpose |
|--------|-----------|---------|
| `getAvailability` | `(payload, date, serviceSlug) → Promise<AvailabilityResult>` | Core algorithm — pure fn, no HTTP |
| `AvailabilityResult` | `{ slots: SlotResult[] } \| { error: string, status: 400\|404 }` | Return type |

**Algorithm:** fetches ClinicSettings + service duration + bookings (pending/confirmed) + BlockedSlots for the date, generates slots at `slotIntervalMinutes` intervals, marks each unavailable if `[slot, slot+duration)` overlaps any existing booking/block or exceeds workingHoursEnd.

**Tests:** `src/lib/availability.test.ts` — 11 integration tests against real DB, dates in year 2099, `fileParallelism: false` in vitest.config.ts.

**Run tests:** `docker exec -e DATABASE_URI="..." -e PAYLOAD_SECRET="..." -e RESEND_API_KEY="test" -e SMSAPI_TOKEN="test" stoic_wing bash -c "cd /workspaces/podologija && npm test"`

---

## Booking Layer (`src/lib/bookings.ts`)

| Export | Signature | Purpose |
|--------|-----------|---------|
| `createBooking` | `(payload, input) → Promise<CreateBookingResult>` | Validate → re-check availability → create Booking → fire notifications |
| `CreateBookingInput` | interface | `serviceSlug`, `date`, `timeSlot`, `patientName/Phone/Email`, `patientNotes?`, `smsOptIn`, `gdprConsent` |
| `CreateBookingResult` | union | `{ booking: {...} }` or `{ error, status: 400\|404\|409 }` |

Race condition guard: `getAvailability` re-called inside `createBooking` after validation; returns 409 if slot taken between page load and submit.

**Tests:** `src/lib/bookings.test.ts` — 8 integration tests (valid booking, GDPR/name/phone/email validation, inactive service, race condition).

---

## What's NOT built yet (as of Phase 9)

- `/blog/` and `/blog/[slug]/` — Phase 13
- `/privatumo-politika/` — Phase 14
- Admin booking actions (confirm/reject/cancel) — **Phase 9 (in progress)**
- Sitemap + robots.txt — Phase 14
- Footer navigation updated for multi-page structure — deferred (no phase assigned)
