/**
 * Smoke test — run with:
 *   npx tsx src/lib/notifications/smoke-test.ts
 *
 * Verifies all 6 templates render to HTML without errors and all SMS
 * strings are ≤160 characters. No API keys required.
 */
import { render } from '@react-email/render'
import { BookingReceivedEmail } from './templates/BookingReceivedEmail'
import { BookingConfirmedEmail } from './templates/BookingConfirmedEmail'
import { BookingRejectedEmail } from './templates/BookingRejectedEmail'
import { BookingReminderEmail } from './templates/BookingReminderEmail'
import { NewBookingAlertEmail } from './templates/NewBookingAlertEmail'
import { BookingCancelledAlertEmail } from './templates/BookingCancelledAlertEmail'
import { SMS } from './sms'

const BASE = {
  patientName: 'Jonas Jonaitis',
  serviceName: 'Įaugusio nago gydymas',
  date: '2026 m. balandžio 15 d.',
  time: '14:00',
  clinicPhone: '+370 699 80980',
}

const [r0, r1, r2, r3, r4, r5] = await Promise.all([
  render(BookingReceivedEmail(BASE)),
  render(BookingConfirmedEmail(BASE)),
  render(BookingRejectedEmail({ ...BASE, rejectionReason: 'Pasirinktas laikas užimtas.' })),
  render(BookingReminderEmail(BASE)),
  render(NewBookingAlertEmail({ ...BASE, patientPhone: '+370 600 00001', patientEmail: 'jonas@example.com', patientNotes: 'Kairys didysis pirštas.' })),
  render(BookingCancelledAlertEmail({ patientName: BASE.patientName, serviceName: BASE.serviceName, date: BASE.date, time: BASE.time })),
])

const templates = [
  { name: 'BookingReceivedEmail',      html: r0 },
  { name: 'BookingConfirmedEmail',      html: r1 },
  { name: 'BookingRejectedEmail',       html: r2 },
  { name: 'BookingReminderEmail',       html: r3 },
  { name: 'NewBookingAlertEmail',       html: r4 },
  { name: 'BookingCancelledAlertEmail', html: r5 },
]

const smsStrings = [
  { name: 'received',  text: SMS.received },
  { name: 'confirmed', text: SMS.confirmed(BASE.date, BASE.time, BASE.serviceName) },
  { name: 'rejected',  text: SMS.rejected },
  { name: 'reminder',  text: SMS.reminder(BASE.time) },
]

let passed = true

console.log('\n── Email templates ─────────────────────────────────')
for (const { name, html } of templates) {
  const ok = typeof html === 'string' && html.includes('<!DOCTYPE html')
  console.log(`  ${ok ? '✓' : '✗'} ${name}  (${html.length} chars)`)
  if (!ok) passed = false
}

console.log('\n── SMS strings ──────────────────────────────────────')
for (const { name, text } of smsStrings) {
  const ok = text.length <= 160
  console.log(`  ${ok ? '✓' : '✗'} ${name}  (${text.length} chars)`)
  if (!ok) {
    console.log(`      ↳ EXCEEDS 160 CHARS: "${text}"`)
    passed = false
  }
}

console.log(`\n${passed ? '✓ All checks passed' : '✗ Some checks failed'}\n`)
process.exit(passed ? 0 : 1)
