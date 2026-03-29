import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { confirmBooking, rejectBooking, cancelBooking } from './bookingActions'

// Far-future Monday to avoid conflicts
function nextWeekdayUTC(targetDay: number, fromISO = '2099-07-01'): string {
  const d = new Date(fromISO)
  while (d.getUTCDay() !== targetDay) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

const TEST_DATE = nextWeekdayUTC(1) // Monday in 2099

let payload: Payload
let adminUserId: number
let serviceId: number

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
  const users = await payload.find({ collection: 'users', limit: 1 })
  adminUserId = users.docs[0].id as number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = await payload.find({ collection: 'services' as any, where: { active: { equals: true } }, limit: 1 })
  serviceId = services.docs[0].id as number
})

afterEach(async () => {
  // Clean up bookings for test date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await payload.find({
    collection: 'bookings' as any,
    where: { date: { equals: TEST_DATE } },
    limit: 200,
  })
  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookings.docs.map((b) => payload.delete({ collection: 'bookings' as any, id: b.id })),
  )
  // Audit log entries can't be deleted (access control blocks it) — leave them
})

async function createPendingBooking(timeSlot = '10:00') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.create({
    collection: 'bookings' as any,
    data: {
      service: serviceId,
      date: TEST_DATE,
      timeSlot,
      status: 'pending',
      patientName: 'Test Patient',
      patientPhone: '+37060000099',
      patientEmail: 'test-actions@example.com',
      gdprConsent: true,
      smsOptIn: false,
    },
  })
}

describe('confirmBooking', () => {
  it('changes status to confirmed and writes AuditLog', async () => {
    const booking = await createPendingBooking()
    const result = await confirmBooking(payload, booking.id as number, adminUserId)

    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.booking.status).toBe('confirmed')

    // Verify in DB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await payload.findByID({ collection: 'bookings' as any, id: booking.id })
    expect(updated.status).toBe('confirmed')

    // Verify AuditLog
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await payload.find({
      collection: 'audit-log' as any,
      where: { booking: { equals: booking.id } },
      depth: 0,
      limit: 10,
    })
    expect(logs.docs).toHaveLength(1)
    expect(logs.docs[0].action).toBe('confirmed')
    expect(logs.docs[0].user).toBe(adminUserId)
  })

  it('returns 409 when booking is already confirmed', async () => {
    const booking = await createPendingBooking('11:00')
    await confirmBooking(payload, booking.id as number, adminUserId) // first confirm
    const result = await confirmBooking(payload, booking.id as number, adminUserId) // second

    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(409)
  })

  it('returns 404 for non-existent booking', async () => {
    const result = await confirmBooking(payload, 999999999, adminUserId)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(404)
  })
})

describe('rejectBooking', () => {
  it('changes status to rejected and records reason in AuditLog', async () => {
    const booking = await createPendingBooking('12:00')
    const result = await rejectBooking(payload, booking.id as number, adminUserId, 'Laikas užimtas')

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.booking.status).toBe('rejected')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await payload.findByID({ collection: 'bookings' as any, id: booking.id })
    expect(updated.status).toBe('rejected')
    expect(updated.rejectionReason).toBe('Laikas užimtas')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await payload.find({
      collection: 'audit-log' as any,
      where: { booking: { equals: booking.id } },
      limit: 10,
    })
    expect(logs.docs[0].action).toBe('rejected')
    expect(logs.docs[0].note).toBe('Laikas užimtas')
  })

  it('returns 400 when rejectionReason is empty', async () => {
    const booking = await createPendingBooking('13:00')
    const result = await rejectBooking(payload, booking.id as number, adminUserId, '')
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(400)
  })

  it('returns 409 when booking is already rejected', async () => {
    const booking = await createPendingBooking('14:00')
    await rejectBooking(payload, booking.id as number, adminUserId, 'First reason')
    const result = await rejectBooking(payload, booking.id as number, adminUserId, 'Second reason')
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(409)
  })

  it('returns 404 for non-existent booking', async () => {
    const result = await rejectBooking(payload, 999999999, adminUserId, 'reason')
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(404)
  })
})

describe('cancelBooking', () => {
  it('changes confirmed booking to cancelled and writes AuditLog', async () => {
    const booking = await createPendingBooking('15:00')
    await confirmBooking(payload, booking.id as number, adminUserId)
    const result = await cancelBooking(payload, booking.id as number, adminUserId)

    expect('error' in result).toBe(false)
    if ('error' in result) return
    expect(result.booking.status).toBe('cancelled')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await payload.findByID({ collection: 'bookings' as any, id: booking.id })
    expect(updated.status).toBe('cancelled')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await payload.find({
      collection: 'audit-log' as any,
      where: { booking: { equals: booking.id } },
      depth: 0,
      limit: 10,
    })
    const cancelLog = logs.docs.find((l) => l.action === 'cancelled')
    expect(cancelLog).toBeDefined()
    expect(cancelLog?.user).toBe(adminUserId)
  })

  it('returns 409 when booking is pending (not confirmed)', async () => {
    const booking = await createPendingBooking('16:00')
    const result = await cancelBooking(payload, booking.id as number, adminUserId)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(409)
  })

  it('returns 404 for non-existent booking', async () => {
    const result = await cancelBooking(payload, 999999999, adminUserId)
    expect('error' in result).toBe(true)
    if ('error' in result) expect(result.status).toBe(404)
  })
})
