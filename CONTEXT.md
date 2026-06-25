# Baltic Foot — Ubiquitous Language

Glossary of canonical Lithuanian terms used across the admin and patient-facing
surfaces. When in doubt, prefer the term defined here over a synonym.

## Language

**Rezervacija** (pl. **Rezervacijos**):
A patient's request for a specific service at a specific date and time. The same
noun is used in the admin (collection name, form labels, action buttons) and on
the patient-facing surface (`/rezervacija`, booking wizard). One Rezervacija
moves through statuses: `pending` → `confirmed` | `rejected` | `cancelled`.
_Avoid_: Vizitas, Užsakymas, Susitikimas.

**Paslauga** (pl. **Paslaugos**):
A bookable service offered by the clinic (e.g. konsultacija, medicininis
pedikiūras). A Rezervacija references exactly one Paslauga. Defined by name,
price, duration in minutes, and a URL slug.

**Darbo laikas** (pl. **Darbo laikai**):
A specific date + time range the owner publishes as open for online booking.
The clinic's default state is **closed**: no slot is bookable online unless it
falls fully inside a Darbo laikas window *and* isn't already taken by a
Rezervacija. Backed by the `availability-windows` collection. The exact inverse
of the former "blocked time" model — the owner exposes her free slots rather
than carving out busy ones, because the paper notebook is the primary
appointment book. **Register difference:** the owner manages *Darbo laikai* in
the admin; the patient never sees that term — the booking wizard shows the
resulting slots under **Laisvi laikai** ("available times"). Same concept, two
audiences.
_Avoid (as the admin/canonical name)_: Nedarbo laikas, Priėmimo laikas, Laisvas
laikas. (_Laisvi laikai_ is reserved for the patient-facing label above, not an
alias for the admin term.)
_Not to be confused with_ the advertising-only **Darbo dienos** / **Darbo
pradžia–pabaiga** in Klinikos nustatymai (see that entry and Flagged
ambiguities).

**Vartotojas** (pl. **Vartotojai**):
An admin user who can sign into the Payload admin (Veneta, Lina). Has a role of
`admin` or `staff`.

**Audito įrašas** (pl. **Audito žurnalas**):
An immutable record of a status-changing action a Vartotojas performed on a
Rezervacija (confirmed, rejected, cancelled, rescheduled). Written
programmatically only — never editable in the admin UI. The action enum also
carries two legacy values, `slot_blocked` / `slot_unblocked`, that predate the
Darbo laikai model and are never written — retained only to avoid an enum
migration.

**Tinklaraščio įrašas** (pl. **Tinklaraščio įrašai**):
A long-form article on the public blog (`/blog/[slug]`). Has a draft/published
status; only published entries render publicly.

**Nuotrauka** (pl. **Nuotraukos**):
An uploaded image (max 5 MB). Currently consumed only by Tinklaraščio įrašas as
the featured image. Backed by the `media` collection.

**Klinikos nustatymai** (always plural — a Payload global):
The clinic's contact details, advertised working hours, slot interval, and open
days. Single record. Since the move to Darbo laikai, **Darbo dienos** (open
days) and **Darbo pradžia/pabaiga** (working hours) are *display-only* — they
feed the public footer's "our hours" text but no longer gate bookability.
**Laiko intervalas** (slot interval) still defines the step between bookable
start times inside a Darbo laikas window.

### Flagged ambiguities

- **"Vizitas" in `BookingActions.tsx:127`** ("Atšaukti vizitą") — pre-dates this
  glossary. To be replaced with "Atšaukti rezervaciją" in the admin-translation
  pass.

- **"Darbo laikai" vs "Darbo dienos" / "Darbo pradžia–pabaiga"** — same _darbo_
  root, different concepts. *Darbo laikai* (the `availability-windows`
  collection) is the authoritative, per-date bookable availability. *Darbo
  dienos* / *Darbo pradžia–pabaiga* (Klinikos nustatymai) are advertising copy
  only. Flagged because the labels invite conflation; revisit the settings
  labels if real-world confusion surfaces.
