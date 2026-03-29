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
- Phase 8 (Booking Submission): Started 2026-03-29

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

## Phase 5 decisions
- Services reseeded with SEO-optimised slugs (`iaugusio-nago-gydymas` etc.) — old slugs (`aparatinis-pedikyuras` etc.) had no SEO signal; blocker discovered and resolved before building pages
- SEO titles/descriptions stored as a static `SEO` map in `paslaugos/[slug]/page.tsx`, not in Payload — keyword brief is the source of truth, not editable by admins
- `formatDuration()` extracted to `src/lib/format.ts` — was duplicated between `Services.tsx` and service page
- `active: true` kept explicit in seed data despite `defaultValue: true` in schema — Payload's generated types require it at call sites (`required` field)
- `force-dynamic` on service pages and `/rezervacija` — ensures Payload price changes reflect immediately on reload without cache invalidation
- Codebase map (`docs/codebase-map.md`) introduced for progressive agent context; updated as part of every `/phase-complete`
