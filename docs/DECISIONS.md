# Architecture Decisions — Baltic Foot

## Stack choices
- Next.js 15/16 App Router — Payload v3 requires Next.js; upgraded from 15.2.9 to 16.2.1 to avoid Payload-warned version
- PayloadCMS v3 — runs natively inside Next.js, no separate service, single Railway deployment, admin at `/admin`
- PostgreSQL (Railway) — managed hosting, connected via `DATABASE_URI`; Payload ORM handles migrations
- Resend — transactional email (React Email templates, Lithuanian text)
- SMSAPI — SMS notifications, sender ID "BalticFoot", Lithuanian numbers, ~€0.04/SMS
- Tailwind + shadcn — UI

## Key schema decisions
- `slotIntervalMinutes` stored as select string (`'30'`/`'60'`), not number — cleaner admin UX; consumers must `parseInt`
- `endTime` on Bookings is computed server-side via `beforeChange` hook, not stored by client
- PENDING bookings block slots identically to CONFIRMED — prevents double-booking at request time
- `AuditLog` access: `create/update/delete` all return `false` — written programmatically only, never via admin UI
- Parallel appointments decision (Veneta + Lina simultaneous patients) is UNRESOLVED — awaiting client confirmation before finalising Bookings schema

## Route groups
- `src/app/(app)/` — public site (homepage, service pages, blog, booking, etc.)
- `src/app/(payload)/` — PayloadCMS admin and API

## Phase log
- Phase 1 (Payload Bootstrap): Complete
- Phase 2 (Content Collections Schema): Complete
- Phase 3 (Booking Collections Schema): Complete
- Phase 4 (CMS → Frontend Pipeline): Complete 2026-03-28
- Phase 5 (Service Pages + SEO Structure): Complete 2026-03-29
- Phase 6 (Notification Layer): Complete 2026-03-29
- Phase 7 (Availability API): Complete 2026-03-29
- Phase 8 (Booking Submission): Complete 2026-03-29
- Phase 9 (Booking Admin Actions): Complete 2026-03-29
- Phase 10 (Slot Blocking): Complete 2026-03-30
- Phase 11 (Reminder Cron): Complete 2026-03-30
- Phase 12 (Contact Form): Complete 2026-03-30
- Phase 13 (Blog): Complete 2026-03-30
- Phase 14 (GDPR + SEO Polish): Complete 2026-03-30
- Phase 15 (Go-Live Polish): Complete 2026-03-30
- Phase 16 (Pre-Launch): Started 2026-03-30

## Phase 4 decisions
- `page.tsx` made async Server Component — fetches Services + ClinicSettings at request time (no static generation, ensures Payload changes reflect immediately on reload)
- Duration formatted as "X val." string in `Services.tsx` — matches existing UI convention from `constants.ts`
- `constants.ts` SERVICES array kept (not deleted) — BookingWizard still imports it; removal deferred to Phase 8

## Phase 6 decisions
- `sendEmail` / `sendSms` catch and log errors without rethrowing — notification failure must never break a booking transaction
- Resend client instantiated as module-level singleton — not per-call, avoids unnecessary HTTP client churn
- Shared email styles extracted to `styles.ts` — single source of truth for brand tokens across all 6 templates
- SMS params sent in POST body with `Content-Type: application/x-www-form-urlencoded` — SMSAPI requires body, not query string
- `SMS` strings and `sendSms` kept in same file for Phase 6 scope — can separate if Phase 9 expands SMS logic

## Phase 7 decisions
- `getAvailability()` extracted to `src/lib/availability.ts` — pure function taking a `Payload` instance, testable without HTTP layer
- `timeToMinutes`/`minutesToTime` kept private (unexported) — internal helpers only, not part of the public API
- `export const dynamic = 'force-dynamic'` on the route handler — prevents Next.js from caching GET responses and serving stale slot availability
- `Booking.endTime` null-guarded via `flatMap` — field is typed `string | null` in payload-types; bookings without a computed endTime are silently skipped rather than crashing the algorithm
- Integration tests use far-future dates (year 2099) — avoids interference with real clinic data in the dev DB
- Test env vars injected via `docker exec -e` flags — `remoteEnv` in devcontainer.json is only available inside the VS Code terminal, not in plain `docker exec` shells
- `slotIntervalMinutes` change reflected without restart — route uses `force-dynamic` + reads ClinicSettings fresh per request

## Phase 9 decisions
- Booking action logic extracted to `src/lib/bookingActions.ts` — pure functions taking a `Payload` instance, same pattern as `bookings.ts` and `availability.ts`; keeps route handlers thin
- Admin action routes live under `src/app/(app)/api/admin/bookings/[id]/` — co-located with other app API routes, not under `(payload)/`; authenticated via `payload.auth({ headers })`
- `BookingActionsAfterFields` rendered via Payload v3 `admin.components.edit.AfterFields` — Client Component using `useDocumentInfo()` to read current status; avoids custom admin page
- AuditLog relationship queries in tests require `depth: 0` — Payload defaults to depth 2 which populates the `user` relation into a full object; tests assert on the raw ID

## Phase 10 decisions
- `getSchedule()` extracted to `src/lib/schedule.ts` — same pure-function-taking-Payload pattern as `getAvailability()` and `bookingActions.ts`; keeps route handler thin
- Two `payload.find()` queries (bookings + blocked slots) run in parallel via `Promise.all` — no data dependency between them
- `WeekScheduleAfterDashboard` registered via `admin.components.afterDashboard` — Payload v3 dashboard extension point; Client Component with `useEffect` fetch + `AbortController` cleanup
- `ScheduleResult` exported from `schedule.ts` and imported into `WeekSchedule.tsx` — avoids re-declaring the same interface locally
- `afterDashboard` component pattern established in `importMap.ts` — same registration approach as `AfterFields` in Phase 9

## Phase 11 decisions
- `sendReminders()` accepts `tomorrow?: string` as a test seam — avoids same-module spy issues; production path calls `getTomorrowVilnius()` automatically
- Bearer token auth for cron route (not Payload session auth) — external cron callers cannot do cookie-based auth; fail-closed when `CRON_SECRET` is unset
- `getTomorrowVilnius()` uses `Intl.DateTimeFormat` with `timeZone: 'Europe/Vilnius'` to extract date parts, then constructs tomorrow via local `Date` arithmetic (handles month/year rollover)
- Notification failures are silently swallowed by existing `sendEmail`/`sendSms` — `reminderSent` may be set `true` on a silent failure; fixing requires modifying Phase 6 notification layer (deferred)

## Phase 12 decisions
- `POST /api/contact` uses no Payload reads — phase spec forbids DB writes; hardcoding `info@balticfoot.lt` is intentional given no-Payload constraint
- `void sendEmail()` (fire-and-forget) — matches established pattern in `bookings.ts` and `bookingActions.ts`; `sendEmail` catches internally so awaiting adds only latency
- Phone/email validated as "at least one required" — matches spec; both fields remain optional individually
- No integration tests — no DB side-effects; validation logic is thin (per spec)

## Phase 13 decisions
- `RichText` from `@payloadcms/richtext-lexical/react` used directly — no custom JSX converters needed for a basic prose blog; component accepts `data={post.body}` prop
- `generateMetadata()` on the post page does a second Payload query — acceptable for a `force-dynamic` page; avoids prop-drilling from a layout or sharing a singleton
- `metaDescription: post.metaDescription ?? undefined` — coerces `null` to `undefined` so Next.js `Metadata` type is satisfied without a cast
- Featured image rendered with `fill` + `aspect-ratio: 16/9` wrapper — maintains layout even before image loads; consistent with service page pattern
- No integration tests — per spec; rich text rendering has no business logic

## Phase 14 decisions
- `force-dynamic` on `/privatumo-politika/` — page fetches ClinicSettings (address, email) for both body content and Footer; static generation would bake in stale data requiring redeploy on any CMS change
- `settings.email` used in privacy policy body — not hardcoded; ensures contact email stays current if ClinicSettings changes
- Production domain via `NEXT_PUBLIC_SITE_URL ?? 'https://www.balticfoot.lt'` in `sitemap.ts` and `robots.ts` — two consumers, no shared constant yet; set env var on Railway before go-live
- Bookings deletion verified, no code change — `Bookings` collection has no `access` key; Payload defaults allow authenticated admin users to delete records, satisfying GDPR US 29

## Phase 15 decisions
- `SITE_URL` extracted to `src/lib/constants.ts` — was redeclared identically in 6 page files; `BASE_URL` in `sitemap.ts`/`robots.ts` (Phase 14) left as-is to stay within phase scope; consolidation of both names is deferred
- `Metadata.alternates.canonical` used (not a raw `<link>` tag) — Next.js injects the correct `<link rel="canonical">` into `<head>` automatically; raw tags would duplicate it
- Retention cron uses `less_than` Payload operator — only range-based date query in codebase; all other date queries use `equals` for exact daily matches; `less_than` is the correct operator for open-ended cutoff queries
- `const BOOKINGS = 'bookings' as const` pattern used in retention route — matches established pattern from `reminders.ts`; `as any` cast required until `generate:types` is re-run on a schema with `bookings` in `CollectionSlug`

## Phase 5 decisions
- Services reseeded with SEO-optimised slugs (`iaugusio-nago-gydymas` etc.) — old slugs (`aparatinis-pedikyuras` etc.) had no SEO signal; blocker discovered and resolved before building pages
- SEO titles/descriptions stored as a static `SEO` map in `paslaugos/[slug]/page.tsx`, not in Payload — keyword brief is the source of truth, not editable by admins
- `formatDuration()` extracted to `src/lib/format.ts` — was duplicated between `Services.tsx` and service page
- `active: true` kept explicit in seed data despite `defaultValue: true` in schema — Payload's generated types require it at call sites (`required` field)
- `force-dynamic` on service pages and `/rezervacija` — ensures Payload price changes reflect immediately on reload without cache invalidation
- Codebase map (`docs/codebase-map.md`) introduced for progressive agent context; updated as part of every `/phase-complete`
