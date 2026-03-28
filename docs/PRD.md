# PRD: Baltic Foot — Backend, CMS & SEO Implementation

## Problem Statement

Baltic Foot is a professional podiatry clinic in Šiauliai, Lithuania. Their current website is a single-page Next.js application with no backend — the booking wizard and contact form are UI-only with no real data persistence, notifications, or availability management. Veneta (clinic owner) and Lina (specialist) have no way to manage appointments digitally: they cannot see incoming requests, confirm or reject bookings, block time slots, or update website content without a developer.

The site is also structured as a single page, making it invisible to patients searching Google for specific services like "įaugęs nagas gydymas Šiauliuose" or "nagų grybelio gydymas" — terms with significant and growing search volume in the region.

## Solution

Build a full backend and content management system into the existing Next.js application using PayloadCMS v3 (runs natively inside Next.js), backed by PostgreSQL on Railway. The solution covers three interconnected areas:

1. **Real booking system** — patients submit requests that are stored, trigger SMS and email notifications, and await manual confirmation by clinic staff via an admin panel.
2. **Content management** — Veneta and Lina can edit service prices, publish blog posts, and update clinic contact details without touching code.
3. **SEO-driven multi-page structure** — replace the single-page app with individual pages per service and a blog, targeting 18 priority keywords identified in a third-party keyword research brief.

## User Stories

### Patient — Booking
1. As a patient, I want to see all available services with prices and durations before choosing, so I can pick the right treatment.
2. As a patient, I want to book a service directly from a service page with that service pre-selected, so I don't have to repeat my choice in the wizard.
3. As a patient, I want the booking calendar to only show time slots that fit the full duration of my chosen service, so I don't accidentally book a slot that runs past closing time.
4. As a patient, I want to receive an SMS and email immediately after submitting my booking request, so I know it was received.
5. As a patient, I want to receive an SMS and email when my booking is confirmed, so I can plan my day.
6. As a patient, I want to receive an SMS and email if my booking is rejected, including the reason given by the clinic, so I understand what happened and can rebook.
7. As a patient, I want to receive an SMS and email reminder the day before my appointment, so I don't forget.
8. As a patient, I want to opt in or out of SMS reminders during the booking process, so I control how I'm contacted.
9. As a patient, I want to add notes to my booking (e.g. which toe, prior treatments), so the specialist is prepared.
10. As a patient, I want to give GDPR consent explicitly during the booking process, so I understand my data is being stored.
11. As a patient, I want the booking page to be accessible via a direct URL (`/rezervacija/`), so I can share or bookmark it.

### Patient — Content & SEO
12. As a patient searching Google, I want to find a dedicated page for ingrown nail treatment in Šiauliai, so I can learn about the service and book directly.
13. As a patient searching Google, I want to find a dedicated page for nail fungus treatment in Šiauliai, so I can compare professional treatment to pharmacy options.
14. As a patient searching Google, I want to find a dedicated page for medical pedicure in Šiauliai with visible pricing, so I can decide before calling.
15. As a patient searching Google, I want to find a dedicated page for callus/corn removal in Šiauliai, so I can find a specialist rather than a beauty salon.
16. As a patient searching Google, I want to find a dedicated page for nail prosthetics in Šiauliai, so I know the clinic offers the procedure.
17. As a patient, I want to read blog articles about nail conditions (fungus symptoms, ingrown nail causes, when to see a specialist), so I can make an informed decision about seeking treatment.
18. As a patient, I want each blog post to end with a call to action to book a consultation, so I can act immediately on what I've read.
19. As a patient, I want the clinic's address, phone, and opening hours to appear in Google search results (via structured data), so I can contact them without visiting the site.
20. As a patient, I want the privacy policy to be clearly accessible, so I understand how my data is used.

### Veneta / Lina — Booking Admin
21. As a clinic admin, I want to see all pending booking requests in a list sorted by date, so I can process them in order.
22. As a clinic admin, I want to confirm a booking with one click, so the patient is notified immediately.
23. As a clinic admin, I want to reject a booking and type a short reason, so the patient receives a personalised response and understands why.
24. As a clinic admin, I want to cancel a confirmed booking, so the time slot is freed and the patient is notified.
25. As a clinic admin, I want to view patient contact details and notes on each booking, so I can prepare for the appointment.
26. As a clinic admin, I want to block specific time slots (e.g. lunch, holiday, personal absence), so patients cannot book during those times.
27. As a clinic admin, I want to see an audit log of all booking actions (who confirmed, rejected, or cancelled, and when), so there is accountability between staff.
28. As a clinic admin, I want my colleague (Veneta or Lina) to have a separate login, so actions are attributed to the right person.
29. As a clinic admin, I want to delete a patient's personal data from the system upon request, so the clinic complies with GDPR.

### Veneta / Lina — Content Management
30. As a clinic admin, I want to update service prices without calling a developer, so the website always reflects current pricing.
31. As a clinic admin, I want to publish a new blog post without calling a developer, so I can create content whenever I want.
32. As a clinic admin, I want blog posts to go live immediately when I save them, so there is no approval delay.
33. As a clinic admin, I want to update the clinic's phone number, email, and opening hours in one place, so every page on the site reflects the change automatically.
34. As a clinic admin, I want to configure the booking slot interval (30 or 60 minutes) and working hours from the admin panel, so I don't need a developer to change my schedule structure.

## Implementation Decisions

### Architecture
- PayloadCMS v3 runs natively inside the existing Next.js 15 app — no separate service, single Docker container, admin panel at `/admin`
- PostgreSQL hosted on Railway (managed), connected via `DATABASE_URI` env var
- Next.js App Router handles all frontend routes; Payload handles all data and admin UI
- Single Railway deployment for the entire stack

### Payload Collections
- **Users** — `name`, `email`, `password`, `role` (enum: `admin` | `staff`). Veneta and Lina both seeded as `admin`. `staff` role scaffolded for future use with read-only booking access.
- **ClinicSettings** (Global singleton) — `phone`, `email`, `address`, `workingHoursStart`, `workingHoursEnd`, `slotIntervalMinutes` (30 | 60), `openDays` (Mon–Sat checkboxes). Used by booking wizard, footer, contact section, and schema.org JSON-LD.
- **Services** — `name`, `slug`, `price`, `duration` (minutes), `description`, `shortDescription`, `icon`, `active`. Replaces hardcoded `constants.ts`.
- **BlogPosts** — `title`, `slug` (auto), `body` (Lexical rich text), `excerpt`, `featuredImage`, `metaTitle`, `metaDescription`, `publishedAt`, `status` (published | draft). Instant publish by default.
- **Bookings** — `service` (relation), `date`, `timeSlot`, `endTime` (computed), `status` (pending | confirmed | rejected | cancelled), `rejectionReason`, `patientName`, `patientPhone`, `patientEmail`, `patientNotes`, `smsOptIn`, `reminderSent`, `gdprConsent`. Includes `specialist` field if parallel appointments confirmed.
- **BlockedSlots** — `date`, `startTime`, `endTime`, `reason`, `createdBy` (relation → Users). Optional specialist field if parallel appointments confirmed.
- **AuditLog** — `user` (relation), `action` (enum), `booking` (relation, optional), `note`, `createdAt`. Read-only via UI, written programmatically on every state change.

### Booking Availability Algorithm
- `GET /api/availability?date=&service=` — fetches ClinicSettings (hours, interval), service duration, all PENDING + CONFIRMED bookings for that date, and all BlockedSlots
- For each candidate slot: checks that `slot` through `slot + duration` contains no overlap with existing bookings or blocks, and that `slot + duration ≤ workingHoursEnd`
- PENDING bookings block slots identically to CONFIRMED — double-booking is prevented at request time
- A final availability re-check occurs server-side at `POST /api/bookings` submit time to handle race conditions

### Booking Flow
1. Patient submits wizard → `Booking` created with status `pending`
2. Patient receives SMS + Email: "request received, pending confirmation"
3. Veneta receives Email: "new booking request from [name]"
4. Veneta confirms or rejects in `/admin`
5. Patient receives SMS + Email with result (rejection includes typed reason)
6. Cron job runs daily at 10:00: sends reminder SMS + Email for next-day confirmed bookings where `reminderSent = false`, then sets `reminderSent = true`

### Site Structure (new pages)
- `/` — homepage, refactored with SEO metadata from ClinicSettings + LocalBusiness JSON-LD
- `/paslaugos/iaugusio-nago-gydymas/` — **built first** (+900% search trend)
- `/paslaugos/nagu-grybelio-gydymas/` — highest absolute traffic potential
- `/paslaugos/medicininis-pedikiuras/`
- `/paslaugos/nuospaudu-salinimas/`
- `/paslaugos/nagu-protezavimas/`
- `/blog/` + `/blog/[slug]/`
- `/rezervacija/` — dedicated booking page, accepts `?service=` query param
- `/privatumo-politika/` — GDPR privacy policy
- `/admin` — PayloadCMS admin (excluded from sitemap, disallowed in robots.txt)

### SEO Implementation
- `generateMetadata()` on every page pulling title, description from Payload or per-page constants
- `LocalBusiness` schema.org JSON-LD on homepage, data sourced from ClinicSettings global
- `sitemap.ts` auto-generates XML sitemap including all service pages and published blog posts
- `robots.txt` disallows `/admin`
- All service pages link to `/rezervacija/?service=[slug]` for pre-selected booking

### Notifications
- **Resend** for all transactional emails (React Email templates, Lithuanian text, clinic branding)
- **SMSAPI** for SMS (Lithuanian sender ID "BalticFoot" registered; pay-as-you-go ~€0.04/SMS)
- Patient notifications: booking received, confirmed, rejected (with reason), 1-day reminder
- Veneta notifications: email only — new booking request, cancellation

### Contact Form
- Submits to `POST /api/contact`
- Sends email to Veneta via Resend
- No database storage

### GDPR
- Explicit consent checkbox in booking wizard (already present in UI, now wired to `gdprConsent` field)
- `/privatumo-politika/` page in Lithuanian: data collected, purpose, retention period (2 years), patient rights, deletion contact
- Manual deletion of patient data available to admins in Payload booking detail view
- Cron job or Payload hook auto-flags/deletes bookings older than 2 years

### Open Decision (blocking schema finalisation)
- **Parallel appointments**: if Veneta and Lina can serve patients simultaneously, `Bookings` and `BlockedSlots` gain a `specialist` field, availability is computed per-specialist, and the wizard may optionally show specialist selection. Awaiting client confirmation.

### Post-MVP (out of v1 scope)
- Google Calendar sync (OAuth2, one-way push of confirmed bookings)
- CSV export of bookings
- Staff role activation
- Nail fungus laser service page (service not yet confirmed as offered)

## Testing Decisions

### What makes a good test
- Test external behaviour (API responses, rendered output, state transitions) — not implementation details
- Tests should survive internal refactors without needing to be rewritten
- Prefer integration tests over unit tests for the booking flow — the availability algorithm, race condition handling, and notification triggers are only meaningful when tested end-to-end against a real database

### Modules to test
- **Availability API** — core algorithm: correct slots blocked for PENDING + CONFIRMED + BlockedSlots, duration-aware blocking, edge cases (last slot of day, full day blocked, zero bookings)
- **Booking submission** — race condition re-check (two simultaneous requests for same slot), GDPR consent validation, required field validation, correct initial status
- **Booking state transitions** — confirm/reject/cancel trigger correct notification calls and AuditLog entries
- **Reminder cron** — only fires for tomorrow's confirmed bookings with `reminderSent = false`, sets flag after send
- **ClinicSettings → wizard** — slot interval and working hours changes are reflected in availability output
- **Service pages** — price and duration rendered from Payload, not hardcoded

### No tests needed
- PayloadCMS admin UI (tested by Payload itself)
- Email/SMS template rendering (visual, manual QA)
- Blog rich text rendering (no business logic)

## Out of Scope

- Google Calendar two-way sync
- Online payments or deposit collection
- Patient accounts / login for patients
- Multi-location support
- Automated waitlist when a slot opens
- WhatsApp or other messaging channels
- Review/testimonials management
- Analytics dashboard inside admin panel
- Nail fungus laser dedicated page (service not confirmed)
- Any non-Lithuanian language version of the site

## Further Notes

- The SEO keyword research brief (March 2026) identifies `/paslaugos/iaugusio-nago-gydymas/` as the highest-urgency page (+900% search trend) — this should be the first service page built and deployed.
- The keyword "nagų grybelis" has 1k–10k monthly searches, the highest of all keywords in the brief, but the brief explicitly warns against targeting pharmacy-intent variants ("vaistai nuo nagų grybelio") — the page must be framed around professional clinical treatment.
- Both "medicininis pedikiūras" and "gydomasis pedikiūras" must appear together on the same page — patients use both terms for the same service.
- City name ("Šiauliai" or "Šiauliuose") must appear on every service page — omitting it loses all local search signal.
- The parallel appointments decision (#13) is the single most impactful open question. It should be resolved before writing the Bookings schema migration, as retrofitting a specialist field after data exists is significantly harder.
