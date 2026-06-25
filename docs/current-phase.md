## Status

**No active phase.** The planned roadmap (Phases 1–17) is complete. The most
recent phase — **Phase 17: Availability inversion (Darbo laikai)** — shipped to
production on 2026-06-25 (live at https://podologija-siauliai.lt). Full record:
`DECISIONS.md` → "Availability inversion (Darbo laikai)".

## What Phase 17 changed

The booking site is now **default-closed**: online availability comes only from
owner-published **Darbo laikai** windows (the `availability-windows` collection),
not from working-hours-minus-blocks. `ClinicSettings` working hours / open days
are advertising-only. The booking calendar enables only dates that have a free
slot and jumps to the next open day. Glossary in `CONTEXT.md`; route/lib map in
`docs/codebase-map.md`.

## Operational follow-up (owner, not code)

- **Veneta publishes Darbo laikai windows in `/admin`.** Until she does, the live
  booking page offers no online slots (patients see the phone CTA) — this is the
  intended default-closed behaviour, not a bug. Existing bookings are unaffected.

## Next phase

None scoped. Replace this file with the next phase spec when new work begins
(or run `/phase-complete` after the next phase).
