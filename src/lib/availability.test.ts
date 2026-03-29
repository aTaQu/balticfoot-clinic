import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { getAvailability } from './availability'

// Dates far in the future to avoid conflicts with real bookings.
// Calculated at module load so tests are deterministic.
function nextWeekdayUTC(targetDay: number, fromISO = '2099-01-01'): string {
  const d = new Date(fromISO)
  while (d.getUTCDay() !== targetDay) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

const MON = nextWeekdayUTC(1) // Monday — in openDays
const SUN = nextWeekdayUTC(0) // Sunday — not in openDays

// 30-min service (iaugusio-nago-gydymas), 2h service (medicininis-pedikiuras)
const SVC_30 = 'iaugusio-nago-gydymas'
const SVC_120 = 'medicininis-pedikiuras'

let payload: Payload
let adminUserId: number | string

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
  const users = await payload.find({ collection: 'users', limit: 1 })
  adminUserId = users.docs[0].id
})

afterEach(async () => {
  // Delete all test bookings and blocked slots for the test dates
  for (const date of [MON, SUN]) {
    const bookings = await payload.find({
      collection: 'bookings',
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(bookings.docs.map((b) => payload.delete({ collection: 'bookings', id: b.id })))

    const blocked = await payload.find({
      collection: 'blocked-slots',
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(blocked.docs.map((b) => payload.delete({ collection: 'blocked-slots', id: b.id })))
  }
})

// Helper to create a test booking
async function createBooking(timeSlot: string, serviceSlug = SVC_30, status = 'pending') {
  const svc = await payload.find({ collection: 'services', where: { slug: { equals: serviceSlug } }, limit: 1 })
  return payload.create({
    collection: 'bookings',
    data: {
      service: svc.docs[0].id,
      date: MON,
      timeSlot,
      status: status as 'pending' | 'confirmed' | 'rejected' | 'cancelled',
      patientName: 'Test Patient',
      patientPhone: '+37060000001',
      patientEmail: 'test@example.com',
      gdprConsent: true,
      smsOptIn: false,
    },
  })
}

// Helper to create a test blocked slot
async function createBlock(startTime: string, endTime: string) {
  return payload.create({
    collection: 'blocked-slots',
    data: {
      date: MON,
      startTime,
      endTime,
      createdBy: adminUserId,
    },
  })
}

describe('getAvailability', () => {
  it('returns all slots available on an empty day', async () => {
    const result = await getAvailability(payload, MON, SVC_30)
    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.slots.length).toBeGreaterThan(0)
    expect(result.slots.every((s) => s.available)).toBe(true)
    // 09:00–18:00 at 30-min intervals = 18 slots
    expect(result.slots).toHaveLength(18)
    expect(result.slots[0].time).toBe('09:00')
    expect(result.slots[result.slots.length - 1].time).toBe('17:30')
  })

  it('PENDING booking blocks correct duration-aware range (30-min service)', async () => {
    await createBooking('10:00', SVC_30, 'pending')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]))
    expect(byTime['09:30']).toBe(true)   // ends at 10:00, no overlap
    expect(byTime['10:00']).toBe(false)  // exact overlap
    expect(byTime['10:30']).toBe(true)   // starts after booking ends (10:30 > 10:30 is false → no overlap)
  })

  it('CONFIRMED booking blocks correct duration-aware range', async () => {
    await createBooking('14:00', SVC_30, 'confirmed')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]))
    expect(byTime['13:30']).toBe(true)
    expect(byTime['14:00']).toBe(false)
    expect(byTime['14:30']).toBe(true)
  })

  it('REJECTED and CANCELLED bookings do not block slots', async () => {
    await createBooking('10:00', SVC_30, 'rejected')
    await createBooking('12:00', SVC_30, 'cancelled')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.slots.every((s) => s.available)).toBe(true)
  })

  it('BlockedSlot blocks the correct range', async () => {
    await createBlock('11:00', '12:00')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]))
    expect(byTime['10:30']).toBe(true)  // 10:30–11:00 does not overlap 11:00–12:00 (touching endpoints, not overlapping)
    expect(byTime['11:00']).toBe(false) // 11:00–11:30 overlaps 11:00–12:00 ✓
    expect(byTime['11:30']).toBe(false) // 11:30–12:00 overlaps 11:00–12:00 ✓
    expect(byTime['12:00']).toBe(true)  // 12:00–12:30 does not overlap 11:00–12:00
  })

  it('2h service is unavailable in last 90 min of working day', async () => {
    const result = await getAvailability(payload, MON, SVC_120)
    if ('error' in result) throw new Error(result.error)

    const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]))
    expect(byTime['16:00']).toBe(true)  // 16:00 + 120min = 18:00 ≤ 18:00 ✓
    expect(byTime['16:30']).toBe(false) // 16:30 + 120min = 18:30 > 18:00
    expect(byTime['17:00']).toBe(false)
    expect(byTime['17:30']).toBe(false)
  })

  it('full-day block returns all slots unavailable', async () => {
    await createBlock('09:00', '18:00')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.slots.every((s) => !s.available)).toBe(true)
  })

  it('date outside openDays returns empty slots array', async () => {
    const result = await getAvailability(payload, SUN, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.slots).toHaveLength(0)
  })

  it('unknown service slug returns 404', async () => {
    const result = await getAvailability(payload, MON, 'does-not-exist')
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(404)
  })

  it('inactive service returns 404', async () => {
    const svc = await payload.find({ collection: 'services', where: { slug: { equals: SVC_30 } }, limit: 1 })
    const svcId = svc.docs[0].id
    await payload.update({ collection: 'services', id: svcId, data: { active: false } })
    try {
      const result = await getAvailability(payload, MON, SVC_30)
      expect('error' in result).toBe(true)
      if ('error' in result) expect(result.status).toBe(404)
    } finally {
      await payload.update({ collection: 'services', id: svcId, data: { active: true } })
    }
  })

  it('invalid date format returns 400', async () => {
    const result = await getAvailability(payload, '15-04-2026', SVC_30)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(400)
  })
})
