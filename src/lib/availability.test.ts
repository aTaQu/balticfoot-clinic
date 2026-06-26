import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { getAvailability, getAvailableDates } from './availability'

// Dates far in the future to avoid conflicts with real bookings.
// Calculated at module load so tests are deterministic.
function nextWeekdayUTC(targetDay: number, fromISO = '2099-01-01'): string {
  const d = new Date(fromISO)
  while (d.getUTCDay() !== targetDay) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

const MON = nextWeekdayUTC(1) // Monday
const SUN = nextWeekdayUTC(0) // Sunday

// 30-min service (iaugusio-nago-gydymas), 2h service (medicininis-pedikiuras)
const SVC_30 = 'iaugusio-nago-gydymas'
const SVC_120 = 'medicininis-pedikiuras'

let payload: Payload
let adminUserId: number

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
  const users = await payload.find({ collection: 'users', limit: 1 })
  adminUserId = users.docs[0].id as number
})

afterEach(async () => {
  // Delete all test bookings and availability windows for the test dates
  for (const date of [MON, SUN]) {
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
    },
  })
}

// Helper to open an availability window (Darbo laikas)
async function createWindow(startTime: string, endTime: string, date = MON) {
  return payload.create({
    collection: 'availability-windows',
    data: { date, startTime, endTime, createdBy: adminUserId },
  })
}

describe('getAvailability', () => {
  it('empty day with no windows returns no slots (default closed)', async () => {
    const result = await getAvailability(payload, MON, SVC_30)
    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.slots).toHaveLength(0)
  })

  it('a single window exposes only the slots inside it, all available', async () => {
    await createWindow('14:00', '16:00') // 2h window, 30-min service @ 30-min interval
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.slots.map((s) => s.time)).toEqual(['14:00', '14:30', '15:00', '15:30'])
    expect(result.slots.every((s) => s.available)).toBe(true)
  })

  it('a booking inside a window removes only the overlapping slot', async () => {
    await createWindow('14:00', '16:00')
    await createBooking('14:30', SVC_30, 'confirmed') // occupies 14:30–15:00
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)

    const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]))
    expect(byTime['14:00']).toBe(true)
    expect(byTime['14:30']).toBe(false) // booked
    expect(byTime['15:00']).toBe(true)
    expect(byTime['15:30']).toBe(true)
  })

  it('a window on a non-working weekday still produces slots (windows are sole authority)', async () => {
    await createWindow('10:00', '11:00', SUN) // Sunday — formerly a closed day
    const result = await getAvailability(payload, SUN, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.slots.map((s) => s.time)).toEqual(['10:00', '10:30'])
  })

  it('15-min interval exposes quarter-hour starts inside a window', async () => {
    const original = await payload.findGlobal({ slug: 'clinic-settings' })
    await payload.updateGlobal({ slug: 'clinic-settings', data: { slotIntervalMinutes: '15' } })
    try {
      await createWindow('09:00', '10:00')
      const result = await getAvailability(payload, MON, SVC_30)
      if ('error' in result) throw new Error(result.error)
      expect(result.slots.map((s) => s.time)).toEqual(['09:00', '09:15', '09:30'])
    } finally {
      await payload.updateGlobal({
        slug: 'clinic-settings',
        data: { slotIntervalMinutes: original.slotIntervalMinutes ?? '30' },
      })
    }
  })

  it('snaps an off-grid window start up to the clock grid', async () => {
    const original = await payload.findGlobal({ slug: 'clinic-settings' })
    await payload.updateGlobal({ slug: 'clinic-settings', data: { slotIntervalMinutes: '15' } })
    try {
      await createWindow('14:20', '15:50') // off-grid start — first slot should be 14:30
      const result = await getAvailability(payload, MON, SVC_30)
      if ('error' in result) throw new Error(result.error)
      expect(result.slots.map((s) => s.time)).toEqual(['14:30', '14:45', '15:00', '15:15'])
    } finally {
      await payload.updateGlobal({
        slug: 'clinic-settings',
        data: { slotIntervalMinutes: original.slotIntervalMinutes ?? '30' },
      })
    }
  })

  it('a service that does not fit inside the window yields no slots', async () => {
    await createWindow('09:00', '10:00') // 1h window
    const result = await getAvailability(payload, MON, SVC_120) // 2h service
    if ('error' in result) throw new Error(result.error)
    expect(result.slots).toHaveLength(0)
  })

  it('multiple windows in a day are unioned and time-ordered', async () => {
    await createWindow('14:00', '15:00')
    await createWindow('09:00', '10:00')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)
    expect(result.slots.map((s) => s.time)).toEqual(['09:00', '09:30', '14:00', '14:30'])
  })

  it('parses window times typed with a dot or no minutes, not only HH:MM', async () => {
    await createWindow('17.00', '18.30') // owner-entered format (period), like the live data
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)
    expect(result.slots.map((s) => s.time)).toEqual(['17:00', '17:30', '18:00'])
  })

  it('parses an hours-only window time like "13"', async () => {
    await createWindow('13', '14')
    const result = await getAvailability(payload, MON, SVC_30)
    if ('error' in result) throw new Error(result.error)
    expect(result.slots.map((s) => s.time)).toEqual(['13:00', '13:30'])
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

describe('getAvailableDates', () => {
  it('returns no dates when the range has no windows', async () => {
    const result = await getAvailableDates(payload, '2099-01-01', 14, SVC_30)
    expect('error' in result).toBe(false)
    if ('error' in result) return

    expect(result.dates).toEqual([])
  })

  it('includes a date that has an open window with a free slot', async () => {
    await createWindow('10:00', '12:00') // MON
    const result = await getAvailableDates(payload, '2099-01-01', 14, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.dates).toEqual([MON])
  })

  it('excludes a date whose only window is fully booked', async () => {
    await createWindow('09:00', '09:30') // MON — exactly one 30-min slot
    await createBooking('09:00', SVC_30, 'confirmed') // takes it
    const result = await getAvailableDates(payload, '2099-01-01', 14, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.dates).toEqual([])
  })

  it('excludes a date whose window is too short for the service', async () => {
    await createWindow('09:00', '09:20') // 20 min, 30-min service
    const result = await getAvailableDates(payload, '2099-01-01', 14, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.dates).toEqual([])
  })

  it('returns dates sorted, including non-working weekdays', async () => {
    await createWindow('10:00', '11:00', MON)
    await createWindow('10:00', '11:00', SUN) // Sunday still counts
    const result = await getAvailableDates(payload, '2099-01-01', 14, SVC_30)
    if ('error' in result) throw new Error(result.error)

    expect(result.dates).toEqual([SUN, MON].sort())
  })
})

describe('AvailabilityWindows validation', () => {
  it('rejects a window whose end is not after its start', async () => {
    await expect(
      payload.create({
        collection: 'availability-windows',
        data: { date: MON, startTime: '14:00', endTime: '13:00' },
      }),
    ).rejects.toThrow()
  })

  it('rejects a window with an unparseable time', async () => {
    await expect(
      payload.create({
        collection: 'availability-windows',
        data: { date: MON, startTime: 'rytas', endTime: '12:00' },
      }),
    ).rejects.toThrow()
  })

  it('accepts dot-format times in the correct order', async () => {
    const w = await payload.create({
      collection: 'availability-windows',
      data: { date: MON, startTime: '11.30', endTime: '13.00' },
    })
    expect(w.id).toBeTruthy()
  })
})
