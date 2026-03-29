## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).
- **Phase 5 — Service Pages + SEO Structure**: All 5 `/paslaugos/[slug]/` pages live with `generateMetadata()` SEO titles from keyword brief, price/duration from Payload, CTA to `/rezervacija/?service=[slug]`. `/rezervacija/` shell page reads `?service=` param. Homepage H1 updated. Services reseeded with SEO-optimised slugs.

## Your task

### Phase 6 — Notification Layer

**User stories**: US 4–7 (patient notifications), implicit (Veneta new-booking alert)

Set up Resend and SMSAPI as isolated notification services. Write all email templates and SMS strings. Expose two internal functions: `sendEmail()` and `sendSms()`. No booking logic this phase — the deliverable is the notification infrastructure only.

**Email templates** (React Email components, Lithuanian text):
- `BookingReceivedEmail` — to patient on submit
- `BookingConfirmedEmail` — to patient on confirm
- `BookingRejectedEmail` — to patient on reject (includes `rejectionReason`)
- `BookingReminderEmail` — to patient 1 day before
- `NewBookingAlertEmail` — to Veneta on new submission
- `BookingCancelledAlertEmail` — to Veneta on cancellation

**SMS strings** (Lithuanian, ≤160 chars each):
- Submit: "Jūsų vizito užklausa gauta. Patvirtinsime netrukus. — Baltic Foot"
- Confirm: "Vizitas patvirtintas: [date] [time], [service]. — Baltic Foot"
- Reject: "Deja, negalime patvirtinti jūsų užklausos. Skambinkite: +370 699 80980"
- Reminder: "Primename: rytoj [time] vizitas Baltic Foot klinikoje. — +370 699 80980"

**Internal API:**
```ts
// src/lib/notifications/email.ts
sendEmail(template: EmailTemplate, to: string, data: EmailData): Promise<void>

// src/lib/notifications/sms.ts
sendSms(to: string, message: string): Promise<void>
```

Both functions must handle API errors gracefully (log, don't throw) — a notification failure must never break a booking transaction.

## Acceptance criteria

- [ ] `RESEND_API_KEY` and `SMSAPI_TOKEN` documented in `.env.example`
- [ ] All 6 email templates render without errors
- [ ] All 4 SMS strings are ≤160 characters
- [ ] `sendEmail()` and `sendSms()` exist with typed parameters
- [ ] Notification functions catch and log errors without rethrowing
- [ ] Test script (or `console.log` smoke test) confirms templates render correctly

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Check off each acceptance criterion as you verify it.
- If you discover a blocker, stop and report it — do not improvise a workaround.
