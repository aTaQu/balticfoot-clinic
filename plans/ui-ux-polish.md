# UI/UX Polish — Agentic Implementation Plan

> **Audience context:** Local Lithuanian patients, age 30–70, mobile-first, medical booking context.
> **Motion budget:** 150–300ms, no bounces, no neon. Calm and trustworthy.
> **This plan is self-contained.** An agent can execute every task in order without reading
> additional context files. Each task names the exact file, the exact selector/line to change,
> and includes the replacement code.

---

## Pre-flight

Before starting, confirm these files exist and read each one to establish baseline:

```
src/app/globals.css
src/components/Navigation.module.css
src/components/BookingWizard/BookingWizard.module.css
src/components/BookingWizard/BookingWizard.tsx
src/components/Contact.module.css
src/components/Services.module.css
src/components/Footer.tsx
```

Do **not** read any other file unless a task explicitly says to.

---

## Task 1 — Fix broken anchor link (1 min)

**File:** `src/components/Footer.tsx`

**Find:**
```tsx
<li><Link href="/#susisiekite">Susisiekite</Link></li>
```

**Replace with:**
```tsx
<li><Link href="/#kontaktai">Susisiekite</Link></li>
```

**Why:** The anchor `#susisiekite` matches nothing on the page. The Contact section's `id` is `kontaktai`. Clicking "Susisiekite" in the footer nav currently scrolls nowhere.

---

## Task 2 — Add `prefers-reduced-motion` global guard (5 min)

**File:** `src/app/globals.css`

**Append to the end of the file** (after the `@keyframes shake` block):

```css
/* ── Reduced Motion ─────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Why:** WCAG 2.1 AA requirement. Vestibular disorders are more common in the 50+ age bracket. This single rule disables all motion for users who have opted out at the OS level.

---

## Task 3 — Add `--stone-muted` token and fix low-contrast text (10 min)

### 3a. Add token

**File:** `src/app/globals.css`

**Find** the `:root` block:
```css
:root {
  --sand:  #E8DDD0;
  --stone: #6B5E52;
  --terra: #B5673D;
  --sage:  #8A9E8C;
  --cream: #FAF7F4;
  --soil:  #2C2420;
}
```

**Replace with:**
```css
:root {
  --sand:       #E8DDD0;
  --stone:      #6B5E52;
  --terra:      #B5673D;
  --sage:       #8A9E8C;
  --cream:      #FAF7F4;
  --soil:       #2C2420;
  --stone-muted: rgba(107, 94, 82, 0.65); /* AA-passing muted text */
}
```

### 3b. Fix wizard step label contrast

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Find:**
```css
.wizardStepLabel {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(107, 94, 82, 0.45);
  text-align: center;
  transition: color 0.3s;
}
```

**Replace with:**
```css
.wizardStepLabel {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--stone-muted);
  text-align: center;
  transition: color 0.3s;
}
```

### 3c. Fix time placeholder contrast

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Find:**
```css
.timePlaceholder {
  font-size: 0.88rem;
  color: rgba(107, 94, 82, 0.45);
  padding: 0.5rem 0;
  font-style: italic;
}
```

**Replace with:**
```css
.timePlaceholder {
  font-size: 0.88rem;
  color: var(--stone-muted);
  padding: 0.5rem 0;
  font-style: italic;
}
```

### 3d. Fix service card duration contrast

**File:** `src/components/Services.module.css`

**Find:**
```css
.serviceCardDuration {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--stone);
  opacity: 0.65;
}
```

**Replace with:**
```css
.serviceCardDuration {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--stone-muted);
}
```

---

## Task 4 — Fix input font-size (iOS zoom prevention) (5 min)

iOS Safari zooms into any `<input>` with `font-size < 16px`. Both form implementations are affected.

### 4a. Booking wizard inputs

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Find:**
```css
.wizFormGroup input,
.wizFormGroup textarea {
  width: 100%;
  background: var(--cream);
  border: 1.5px solid rgba(107, 94, 82, 0.18);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: var(--soil);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  appearance: none;
}
```

**Replace with:**
```css
.wizFormGroup input,
.wizFormGroup textarea {
  width: 100%;
  background: var(--cream);
  border: 1.5px solid rgba(107, 94, 82, 0.18);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
  font-size: 1rem;
  color: var(--soil);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  appearance: none;
}
```

### 4b. Contact form inputs

**File:** `src/components/Contact.module.css`

**Find:**
```css
.contactFormGroup input,
.contactFormGroup textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid rgba(107, 94, 82, 0.18);
  border-radius: 8px;
  background: #fff;
  font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--soil);
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
}
```

**Replace with:**
```css
.contactFormGroup input,
.contactFormGroup textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid rgba(107, 94, 82, 0.18);
  border-radius: 8px;
  background: #fff;
  font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
  font-size: 1rem;
  color: var(--soil);
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
}
```

---

## Task 5 — Add button `:active` states (5 min)

**File:** `src/app/globals.css`

**Find:**
```css
.btn-primary:hover {
  background: #9e5530;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(181, 103, 61, 0.32);
}
```

**Replace with:**
```css
.btn-primary:hover {
  background: #9e5530;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(181, 103, 61, 0.32);
}
.btn-primary:active {
  background: #8a4a28;
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(181, 103, 61, 0.2);
  transition-duration: 0.08s;
}
```

**Then find:**
```css
.btn-ghost:hover {
  border-color: var(--stone);
  background: rgba(107, 94, 82, 0.06);
}
```

**Replace with:**
```css
.btn-ghost:hover {
  border-color: var(--stone);
  background: rgba(107, 94, 82, 0.06);
}
.btn-ghost:active {
  background: rgba(107, 94, 82, 0.12);
  transform: translateY(1px);
  transition-duration: 0.08s;
}
```

---

## Task 6 — Enlarge calendar day cells and time slot touch targets (15 min)

**File:** `src/components/BookingWizard/BookingWizard.module.css`

### 6a. Calendar cells

**Find:**
```css
.calDay {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  border-radius: 7px;
  cursor: pointer;
  color: var(--soil);
  transition: background 0.15s, color 0.15s;
}
```

**Replace with:**
```css
.calDay {
  aspect-ratio: 1 / 1;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--soil);
  transition: background 0.15s, color 0.15s;
}
```

### 6b. Time slots

**Find:**
```css
.timeSlot {
  padding: 0.5rem 0.25rem;
  text-align: center;
  border: 1.5px solid rgba(107, 94, 82, 0.14);
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  color: var(--soil);
  background: var(--cream);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  user-select: none;
}
```

**Replace with:**
```css
.timeSlot {
  padding: 0.75rem 0.25rem;
  min-height: 44px;
  text-align: center;
  border: 1.5px solid rgba(107, 94, 82, 0.14);
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--soil);
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  user-select: none;
}
```

### 6c. Increase mobile time grid gap

**Find** (inside the `@media (max-width: 700px)` block):
```css
  .timeGrid { grid-template-columns: repeat(3, 1fr); }
```

**Replace with:**
```css
  .timeGrid { grid-template-columns: repeat(3, 1fr); gap: 0.625rem; }
```

---

## Task 7 — Mobile menu fade animation (15 min)

**File:** `src/components/Navigation.module.css`

**Find:**
```css
/* Mobile overlay */
.navMobile {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--cream);
  z-index: 150;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}
.navMobile.open { display: flex; }
```

**Replace with:**
```css
/* Mobile overlay */
.navMobile {
  position: fixed;
  inset: 0;
  background: var(--cream);
  z-index: 150;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
  pointer-events: none;
}

.navMobile.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

@starting-style {
  .navMobile.open {
    opacity: 0;
  }
}
```

**Why `pointer-events: none` on hidden state:** prevents the invisible overlay from capturing clicks when closed, since it stays in the DOM.

---

## Task 8 — Wizard step panel fade-in animation (10 min)

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Find:**
```css
/* ── Step panels */
.wizardBody { padding: 2.5rem; }
.wizardPanel { display: block; }
```

**Replace with:**
```css
/* ── Step panels */
.wizardBody { padding: 2.5rem; }

.wizardPanel {
  display: block;
  animation: panelIn 0.22s ease both;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

**Why this works without JS:** Each step is conditionally rendered (`{step === N && <div className={styles.wizardPanel}>...}`), so the element mounts fresh on each step change, triggering the keyframe automatically.

---

## Task 9 — Show active step label on mobile (10 min)

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Find** inside the `@media (max-width: 700px)` block:
```css
  .wizardStepLabel { display: none; }
```

**Replace with:**
```css
  .wizardStepLabel { display: none; }
  .wizardStepIndicator.active .wizardStepLabel {
    display: block;
    font-size: 0.65rem;
    white-space: nowrap;
    color: var(--terra);
  }
```

---

## Task 10 — Skeleton loader for time slots (25 min)

This task has two parts: CSS and TSX.

### 10a. Add skeleton CSS

**File:** `src/components/BookingWizard/BookingWizard.module.css`

**Append** after the `.timePlaceholder` rule block:

```css
/* Skeleton loader */
.timeSkeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.timeSkeletonCell {
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(107, 94, 82, 0.08) 25%,
    rgba(107, 94, 82, 0.15) 50%,
    rgba(107, 94, 82, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .timeSkeletonCell {
    animation: none;
    background: rgba(107, 94, 82, 0.08);
  }
}

@media (max-width: 700px) {
  .timeSkeleton { grid-template-columns: repeat(3, 1fr); }
}
```

### 10b. Swap loading text for skeleton in TSX

**File:** `src/components/BookingWizard/BookingWizard.tsx`

**Find** (inside the step 2 panel, the slots loading branch):
```tsx
                        ) : slotsLoading ? (
                          <p className={styles.timePlaceholder}>Kraunama...</p>
```

**Replace with:**
```tsx
                        ) : slotsLoading ? (
                          <div
                            className={styles.timeSkeleton}
                            role="status"
                            aria-label="Kraunami laikai..."
                            aria-busy="true"
                          >
                            {Array.from({ length: 8 }).map((_, i) => (
                              <div key={i} className={styles.timeSkeletonCell} />
                            ))}
                          </div>
```

---

## Task 11 — CSS scroll-driven reveal (replace JS-based) (30 min)

This is the most involved task. It has two parts: updating globals.css and removing the JS component.

### 11a. Replace the reveal animation block in globals.css

**File:** `src/app/globals.css`

**Find** the entire reveal block:
```css
/* ── Reveal Animations ──────────────────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }
```

**Replace with:**
```css
/* ── Reveal Animations ──────────────────────────────────── */

/* Base: always visible — no-JS fallback, good for LCP */
.reveal { opacity: 1; transform: none; }

/* Progressive enhancement: CSS scroll-driven (Chrome 115+, Firefox 110+) */
@supports (animation-timeline: scroll()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      opacity: 0;
      transform: translateY(20px);
      animation: revealUp linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 28%;
    }
    .reveal-delay-1 { animation-range: entry 3%  entry 31%; }
    .reveal-delay-2 { animation-range: entry 6%  entry 34%; }
    .reveal-delay-3 { animation-range: entry 9%  entry 37%; }
    .reveal-delay-4 { animation-range: entry 12% entry 40%; }
    .reveal-delay-5 { animation-range: entry 15% entry 43%; }

    @keyframes revealUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: none; }
    }
  }
}
```

### 11b. Find the ScrollRevealInit component and identify its usage

Read `src/components/ScrollRevealInit.tsx` to confirm it only adds/removes `.visible` class via IntersectionObserver (do not edit it yet — check first).

Then search for `ScrollRevealInit` in `src/app/(app)/page.tsx` (or wherever it is imported).

**If** the component does only IntersectionObserver `.visible` toggling (nothing else):
- Remove the import of `ScrollRevealInit` from the page file
- Remove the `<ScrollRevealInit />` JSX element from the page
- The `.reveal.visible` CSS selector is now unused and can be removed from globals.css if desired (not required)

**If** the component does additional work (analytics, other side-effects): leave it in place and only remove the `.visible` class toggling logic. Flag this to the user before deleting.

---

## Verification checklist

After all tasks are complete, verify the following:

- [ ] Clicking "Susisiekite" in the footer scrolls to the Contact section
- [ ] On a device with "Reduce Motion" OS setting enabled, no animations play
- [ ] Tapping a primary button on a touch device shows a visible press-down effect
- [ ] Tapping an input on iOS does not trigger browser zoom
- [ ] Calendar day cells are visually larger and easier to tap
- [ ] The mobile menu fades in/out smoothly instead of snapping
- [ ] Switching wizard steps shows a brief fade-up entrance for each panel
- [ ] Loading time slots shows a shimmer skeleton instead of "Kraunama..."
- [ ] On mobile at step 2, the active step label (e.g. "Data ir laikas") is visible
- [ ] Low-contrast muted text (step labels, placeholders, duration) is now readable

---

## What this plan does NOT change

- Color palette — it is already well-suited for the medical/local service context
- Font pairing (Cormorant + DM Sans) — appropriate and trust-building
- Layout structure and grid system — solid
- Trust section content — requires client decisions (real patient counts, certifications)
- Hero stats numbers — requires client verification before display
- Social links in Footer (Facebook/Instagram URLs) — require client confirmation

---

## Files modified by this plan

| File | Tasks |
|---|---|
| `src/app/globals.css` | 2, 3a, 5, 11a |
| `src/components/Navigation.module.css` | 7 |
| `src/components/BookingWizard/BookingWizard.module.css` | 3b, 3c, 6a, 6b, 6c, 8, 9, 10a |
| `src/components/BookingWizard/BookingWizard.tsx` | 10b |
| `src/components/Contact.module.css` | 4b |
| `src/components/Services.module.css` | 3d |
| `src/components/Footer.tsx` | 1 |
| `src/app/(app)/page.tsx` (or host page) | 11b |
