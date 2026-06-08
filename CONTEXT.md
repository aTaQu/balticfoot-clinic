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

**Nedarbo laikas** (pl. **Nedarbo laikai**):
A range of time when no Rezervacija can be made — vacation, lunch break, staff
meeting, etc. Backed by the `blocked-slots` collection. Blocks slot availability
identically to a confirmed Rezervacija.
_Avoid_: Užblokuotas laikas, Užimtas laikas.

**Vartotojas** (pl. **Vartotojai**):
An admin user who can sign into the Payload admin (Veneta, Lina). Has a role of
`admin` or `staff`.

**Audito įrašas** (pl. **Audito žurnalas**):
An immutable record of a status-changing action a Vartotojas performed on a
Rezervacija or Nedarbo laikas (confirmed, rejected, cancelled, rescheduled,
slot_blocked, slot_unblocked). Written programmatically only — never editable
in the admin UI.

**Tinklaraščio įrašas** (pl. **Tinklaraščio įrašai**):
A long-form article on the public blog (`/blog/[slug]`). Has a draft/published
status; only published entries render publicly.

**Nuotrauka** (pl. **Nuotraukos**):
An uploaded image (max 5 MB). Currently consumed only by Tinklaraščio įrašas as
the featured image. Backed by the `media` collection.

**Klinikos nustatymai** (always plural — a Payload global):
The clinic's contact details, working hours, slot interval, and open days.
Single record; consumed by the public site, email templates, and the
availability algorithm.

### Flagged ambiguities

- **"Vizitas" in `BookingActions.tsx:127`** ("Atšaukti vizitą") — pre-dates this
  glossary. To be replaced with "Atšaukti rezervaciją" in the admin-translation
  pass.
