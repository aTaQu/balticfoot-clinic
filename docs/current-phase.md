## Context

The following phases are complete:

- **Phase 1 — Payload Bootstrap**: PayloadCMS v3 installed, PostgreSQL connected, `Users` collection with roles, admin UI at `/admin`, two admin accounts seeded (Veneta + Lina). Next.js upgraded to 16.2.1. Route groups restructured: public site under `(app)/`, admin under `(payload)/` with CSS loaded via `@payloadcms/next/css` in `src/app/(payload)/layout.tsx`.
- **Phase 2 — Content Collections Schema**: `ClinicSettings` global, `Services` collection, `BlogPosts` collection, and `Media` upload collection defined and registered. All 5 services seeded from `constants.ts`. `ClinicSettings` seeded with clinic defaults. `BlogPosts` slug auto-generated from title with Lithuanian transliteration.
- **Phase 3 — Booking Collections Schema**: `Bookings`, `BlockedSlots`, and `AuditLog` collections defined. `endTime` auto-computed via `beforeChange` hook. `rejectionReason` conditionally visible. `AuditLog` is read-only in admin (access hooks block create/update/delete). Admin CSS fixed: `@payloadcms/next/css` imported in `(payload)/layout.tsx`.
- **Phase 4 — CMS → Frontend Pipeline**: Homepage services section renders from Payload `Services` (active only). Footer, Hero, About, Contact components accept ClinicSettings props — no hardcoded phone/email/address remains. `LocalBusiness` JSON-LD injected in homepage `<head>` from ClinicSettings. `constants.ts` SERVICES deferred to Phase 8 (BookingWizard dependency).

## Your task

### Phase 5 — Service Pages + SEO Structure

**User stories**: US 12–16 (patients find service pages via Google), US 1 (see services with prices)

Create individual `/paslaugos/[slug]/` pages driven by the `Services` collection. Each page has its own `generateMetadata()` with the SEO title and description from the keyword brief. Build in SEO priority order. Each page shows service description, price, duration, and a CTA button linking to `/rezervacija/?service=[slug]`. Create a `/rezervacija/` shell page that reads the `?service=` query param and displays the selected service name — full wizard wiring comes in Phase 8.

**Build order (SEO priority):**
1. `/paslaugos/iaugusio-nago-gydymas/` — H1: "Įaugusio nago gydymas Šiauliuose"
2. `/paslaugos/nagu-grybelio-gydymas/` — H1: "Nagų grybelio gydymas Šiauliuose"
3. `/paslaugos/medicininis-pedikiuras/` — H1: "Medicininis pedikiūras Šiauliuose"
4. `/paslaugos/nuospaudu-salinimas/` — H1: "Nuospaudų šalinimas Šiauliuose"
5. `/paslaugos/nagu-protezavimas/` — H1: "Nagų protezavimas Šiauliuose"

Homepage H1 updated to: "Podologijos klinika Šiauliuose — profesionali pėdų priežiūra"

**SEO notes from keyword brief:**
- "Šiauliai" or "Šiauliuose" must appear on every service page — omitting it loses all local search signal
- Nail fungus page: frame around professional clinical treatment, NOT pharmacy-intent variants ("vaistai nuo nagų grybelio")
- Medical pedicure page: both "medicininis pedikiūras" AND "gydomasis pedikiūras" must appear — patients use both terms
- Ingrown nail page is highest urgency (+900% search trend) — build first

## Acceptance criteria

- [ ] All 5 service pages exist and render without errors
- [ ] Each page `<title>` matches the SEO brief exactly
- [ ] Each page H1 includes "Šiauliuose"
- [ ] Price and duration on each page come from Payload `Services`, not hardcoded
- [ ] CTA on each service page links to `/rezervacija/?service=[slug]`
- [ ] `/rezervacija/` page exists, reads `?service=` param, and displays the pre-selected service name
- [ ] Homepage H1 updated per SEO brief
- [ ] Changing a service price in Payload is reflected on the service page after reload

## Rules

- Implement only this phase. Stop when all acceptance criteria are met.
- Do not modify files outside the scope of this phase.
- Check off each acceptance criterion as you verify it.
- If you discover a blocker, stop and report it — do not improvise a workaround.
