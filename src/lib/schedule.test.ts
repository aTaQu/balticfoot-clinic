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
  const services = await payload.find({ collection: 'services', where: { active: { equals: true } }, limit: 1 })
  serviceId = services.docs[0].id as number
  const users = await payload.find({ collection: 'users', limit: 1 })
  adminUserId = users.docs[0].id as number
})

afterEach(async () => {
  // Clean up bookings and availability windows for both test dates
  for (const date of [DATE_0, DATE_1]) {
    const bookings = await payload.find({
      collection: 'bookings',
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(bookings.docs.map((b) => payload.delete({ collection: 'bookings', id: b.id })))

    const windows = await payload.find({
      collection: 'availability-windows',
      where: { date: { equals: date } },
      limit: 200,
    })
    await Promise.all(
      windows.docs.map((w) => payload.delete({ collection: 'availability-windows', id: w.id })),
    )
  }
})

// ── Helpers ────────────────────────────────────────────────────────────────────

async function createConfirmedBooking(date = DATE_0, timeSlot = '10:00') {
  return payload.create({
    collection: 'bookings',
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
  return payload.create({
    collection: 'bookings',
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

async function createBookingWithStatus(
  status: 'rejected' | 'cancelled',
  date = DATE_0,
  timeSlot = '12:00',
) {
  return payload.create({
    collection: 'bookings',
    data: {
      service: serviceId,
      date,
      timeSlot,
      status,
      ...(status === 'rejected' ? { rejectionReason: 'Testas' } : { cancellationReason: 'Testas' }),
      patientName: 'Ponas Negalioja',
      patientPhone: '+37060000003',
      patientEmail: 'schedule-excluded@example.com',
      gdprConsent: true,
    },
  })
}

async function createWindow(date = DATE_0, startTime = '13:00', endTime = '14:00', note?: string) {
  return payload.create({
    collection: 'availability-windows',
    data: {
      date,
      startTime,
      endTime,
      note: note ?? null,
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
    expect(result.days[0].bookings[0].status).toBe('confirmed')
  })

  it('pending booking appears in schedule carrying status "pending"', async () => {
    // Pending Rezervacijos block their slot identically to confirmed ones, so the
    // planning schedule must surface them (rendered amber) — a slot that looks open
    // but is actually requested would mislead the owner.
    await createPendingBooking(DATE_0, '11:00')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days[0].bookings).toHaveLength(1)
    expect(result.days[0].bookings[0].timeSlot).toBe('11:00')
    expect(result.days[0].bookings[0].status).toBe('pending')
  })

  it('rejected and cancelled bookings do NOT appear in schedule', async () => {
    await createBookingWithStatus('rejected', DATE_0, '12:00')
    await createBookingWithStatus('cancelled', DATE_0, '13:00')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days[0].bookings).toHaveLength(0)
  })

  it('open window appears in the correct day windows array', async () => {
    await createWindow(DATE_0, '14:00', '15:00', 'Tik šią savaitę')
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days[0].windows).toHaveLength(1)
    expect(result.days[0].windows[0].startTime).toBe('14:00')
    expect(result.days[0].windows[0].endTime).toBe('15:00')
    expect(result.days[0].windows[0].note).toBe('Tik šią savaitę')
  })

  it('empty day returns { date, bookings: [], windows: [] }', async () => {
    const result = await getSchedule(payload, DATE_0, 1)

    expect(result.days).toHaveLength(1)
    expect(result.days[0].bookings).toHaveLength(0)
    expect(result.days[0].windows).toHaveLength(0)
  })

  it('date range spanning multiple days returns correct structure', async () => {
    await createConfirmedBooking(DATE_0, '10:00')
    await createWindow(DATE_1, '09:00', '09:30')
    const result = await getSchedule(payload, DATE_0, 2)

    expect(result.days).toHaveLength(2)

    const day0 = result.days.find((d) => d.date === DATE_0)
    const day1 = result.days.find((d) => d.date === DATE_1)

    expect(day0).toBeDefined()
    expect(day0!.bookings).toHaveLength(1)
    expect(day0!.windows).toHaveLength(0)

    expect(day1).toBeDefined()
    expect(day1!.bookings).toHaveLength(0)
    expect(day1!.windows).toHaveLength(1)
    expect(day1!.windows[0].startTime).toBe('09:00')
  })

  it('an open window enables availability (integration with getAvailability)', async () => {
    // The dashboard schedule and the availability algorithm must read the same
    // source of truth — availability-windows. A window shown here is bookable there.
    const { getAvailability } = await import('./availability')
    await createWindow(DATE_0, '09:00', '18:00')
    const avResult = await getAvailability(payload, DATE_0, 'medicininis-pedikiuras')
    if ('error' in avResult) throw new Error(avResult.error)

    expect(avResult.slots.length).toBeGreaterThan(0)
    expect(avResult.slots.some((s) => s.available)).toBe(true)
  })
})
