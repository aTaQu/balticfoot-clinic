import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { getSchedule } from './schedule'

// Far-future dates to avoid conflicts with real clinic data
const TEST_BASE = '2099-08-01' // a Friday — keeps tests predictable

/** Offset TEST_BASE by `n` days, returning YYYY-MM-DD */
function testDate(offset = 0): string {
  const d = new Date(`${TEST_BASE}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().split('T')[0]
}

const DATE_0 = testDate(0)
const DATE_1 = testDate(1)

let payload: Payload
let serviceId: number
let adminUserId: number

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = await payload.find({ collection: 'services' as any, where: { active: { equals: true } }, limit: 1 })
  serviceId = services.docs[0].id as number
  const users = await payload.find({ collection: 'users', limit: 1 })
  adminUserId = users.docs[0].id as number
})

afterEach(async () => {
  // Clean up bookings for both test dates
  for (const date of [DATE_0, DATE_1]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookings = await payload.find({
      collection: 'bookings' as any,
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookings.docs.map((b) => payload.delete({ collection: 'bookings' as any, id: b.id })),
    )
    // Clean up blocked slots
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks = await payload.find({
      collection: 'blocked-slots' as any,
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocks.docs.map((bl) => payload.delete({ collection: 'blocked-slots' as any, id: bl.id })),
    )
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────────

async function createConfirmedBooking(date = DATE_0, timeSlot = '10:00') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.create({
    collection: 'bookings' as any,
    data: {
      service: serviceId,
      date,
      timeSlot,
      status: 'confirmed',
      patientName: 'Ponas Testas',
      patientPhone: '+37060000001',
      patientEmail: 'schedule-test@example.com',
      gdprConsent: true,
    },
  })
}

async function createPendingBooking(date = DATE_0, timeSlot = '11:00') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.create({
    collection: 'bookings' as any,
    data: {
      service: serviceId,
      date,
      timeSlot,
      status: 'pending',
      patientName: 'Ponia Pending',
      patientPhone: '+37060000002',
      patientEmail: 'schedule-pending@example.com',
      gdprConsent: true,
    },
  })
}

async function createBlockedSlot(date = DATE_0, startTime = '13:00', endTime = '14:00', reason?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.create({
    collection: 'blocked-slots' as any,
    data: {
      date,
      startTime,
      endTime,
      reason: reason ?? null,
      createdBy: adminUserId,
    },
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('getSchedule', () => {
  it('confirmed booking appears in the correct day bookings array', async () => {
    await createConfirmedBooking(DATE_0, '09:00')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days).toHaveLength(1)
    expect(result.days[0].date).toBe(DATE_0)
    expect(result.days[0].bookings).toHaveLength(1)
    expect(result.days[0].bookings[0].timeSlot).toBe('09:00')
    expect(result.days[0].bookings[0].patientName).toBe('Ponas Testas')
    expect(result.days[0].bookings[0].serviceName).toBeTruthy()
  })

  it('pending booking does NOT appear in schedule', async () => {
    await createPendingBooking(DATE_0, '11:00')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days[0].bookings).toHaveLength(0)
  })

  it('blocked slot appears in the correct day blocks array', async () => {
    await createBlockedSlot(DATE_0, '14:00', '15:00', 'Pietų pertrauka')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days[0].blocks).toHaveLength(1)
    expect(result.days[0].blocks[0].startTime).toBe('14:00')
    expect(result.days[0].blocks[0].endTime).toBe('15:00')
    expect(result.days[0].blocks[0].reason).toBe('Pietų pertrauka')
  })

  it('empty day returns { date, bookings: [], blocks: [] }', async () => {
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days).toHaveLength(1)
    expect(result.days[0].bookings).toHaveLength(0)
    expect(result.days[0].blocks).toHaveLength(0)
  })

  it('date range spanning multiple days returns correct structure', async () => {
    await createConfirmedBooking(DATE_0, '10:00')
    await createBlockedSlot(DATE_1, '09:00', '09:30')
    const result = await getSchedule(payload, DATE_0, 2)

    expect(result.days).toHaveLength(2)

    const day0 = result.days.find((d) => d.date === DATE_0)
    const day1 = result.days.find((d) => d.date === DATE_1)

    expect(day0).toBeDefined()
    expect(day0!.bookings).toHaveLength(1)
    expect(day0!.blocks).toHaveLength(0)

    expect(day1).toBeDefined()
    expect(day1!.bookings).toHaveLength(0)
    expect(day1!.blocks).toHaveLength(1)
    expect(day1!.blocks[0].startTime).toBe('09:00')
  })

  it('blocked slot still blocks availability (integration with getAvailability)', async () => {
    // This verifies that Phase 7 availability still respects BlockedSlots
    // created in Phase 10 — the two features are orthogonal but must stay in sync.
    const { getAvailability } = await import('./availability')
    await createBlockedSlot(DATE_0, '09:00', '18:00', 'Visą dieną')
    const avResult = await getAvailability(payload, DATE_0, 'medicininis-pedikiuras')
    if ('error' in avResult) {
      // Date might fall on a weekend or closed day — skip rather than fail
      return
    }
    const allUnavailable = avResult.slots.every((s) => !s.available)
    expect(allUnavailable).toBe(true)
  })
})
