import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { createBooking } from './bookings'

// Monday in 2099 — guaranteed open day
function nextWeekdayUTC(targetDay: number, fromISO = '2099-06-01'): string {
  const d = new Date(fromISO)
  while (d.getUTCDay() !== targetDay) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

const MON = nextWeekdayUTC(1)
const SVC = 'iaugusio-nago-gydymas'  // 30-min service

const VALID_INPUT = {
  serviceSlug: SVC,
  date: MON,
  timeSlot: '09:00',
  patientName: 'Test Pacientas',
  patientPhone: '+37060000099',
  patientEmail: 'test@example.com',
  gdprConsent: true,
}

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
})

afterEach(async () => {
  // Clean up test bookings and windows for the test date
  const bookings = await payload.find({
    collection: 'bookings',
    where: { date: { equals: MON } },
    limit: 200,
  })
  await Promise.all(
    bookings.docs.map((b) => payload.delete({ collection: 'bookings', id: b.id })),
  )

  const windows = await payload.find({
    collection: 'availability-windows',
    where: { date: { equals: MON } },
    limit: 200,
  })
  await Promise.all(
    windows.docs.map((w) => payload.delete({ collection: 'availability-windows', id: w.id })),
  )
})

// Open a window so the slot is bookable — default-closed means createBooking's
// availability re-check rejects any slot outside a Darbo laikas window.
async function createWindow(startTime = '09:00', endTime = '18:00') {
  return payload.create({
    collection: 'availability-windows',
    data: { date: MON, startTime, endTime },
  })
}

describe('createBooking', () => {
  it('valid input creates a pending booking and returns summary', async () => {
    await createWindow()
    const result = await createBooking(payload, VALID_INPUT)
    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.booking.date).toBe(MON)
    expect(result.booking.timeSlot).toBe('09:00')
    expect(result.booking.serviceName).toBe('Įaugusio nago korekcija')

    // Verify it's actually in the DB with status pending
    const found = await payload.findByID({ collection: 'bookings', id: result.booking.id })
    expect(found.status).toBe('pending')
    expect(found.gdprConsent).toBe(true)
  })

  it('missing gdprConsent returns 400', async () => {
    const result = await createBooking(payload, { ...VALID_INPUT, gdprConsent: false })
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(400)
  })

  it('missing patientName returns 400', async () => {
    const result = await createBooking(payload, { ...VALID_INPUT, patientName: '' })
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(400)
  })

  it('missing both phone and email returns 400', async () => {
    // bookings.ts requires at least one contact method, not both individually.
    const result = await createBooking(payload, { ...VALID_INPUT, patientPhone: '', patientEmail: '' })
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(400)
  })

  it('unknown service slug returns 404', async () => {
    const result = await createBooking(payload, { ...VALID_INPUT, serviceSlug: 'does-not-exist' })
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(404)
  })

  it('inactive service returns 404', async () => {
    const svc = await payload.find({ collection: 'services', where: { slug: { equals: SVC } }, limit: 1 })
    const svcId = svc.docs[0].id
    await payload.update({ collection: 'services', id: svcId, data: { active: false } })
    try {
      const result = await createBooking(payload, VALID_INPUT)
      expect('error' in result).toBe(true)
      if ('error' in result) expect(result.status).toBe(404)
    } finally {
      await payload.update({ collection: 'services', id: svcId, data: { active: true } })
    }
  })

  it('race condition: second booking for same slot returns 409', async () => {
    await createWindow()
    // First booking succeeds
    const first = await createBooking(payload, VALID_INPUT)
    expect('error' in first).toBe(false)

    // Second booking for same slot is blocked because first is PENDING
    const second = await createBooking(payload, VALID_INPUT)
    expect('error' in second).toBe(true)
    if ('error' in second) expect(second.status).toBe(409)
  })
})
