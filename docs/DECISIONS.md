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
- Phase 5 (Service Pages + SEO Structure): Started 2026-03-28

## Phase 4 decisions
- `page.tsx` made async Server Component — fetches Services + ClinicSettings at request time (no static generation, ensures Payload changes reflect immediately on reload)
- Duration formatted as "X val." string in `Services.tsx` — matches existing UI convention from `constants.ts`
- `constants.ts` SERVICES array kept (not deleted) — BookingWizard still imports it; removal deferred to Phase 8
