import type { Payload } from 'payload'
import type { Booking, Service, AvailabilityWindow } from '../../payload-types'

export interface ScheduledBooking {
  id: number
  patientName: string
  serviceName: string
  timeSlot: string
  endTime: string | null
}

export interface ScheduledWindow {
  id: number
  startTime: string
  endTime: string
  note: string | null
}

export interface ScheduleDay {
  date: string
  bookings: ScheduledBooking[]
  windows: ScheduledWindow[]
}

export interface ScheduleResult {
  days: ScheduleDay[]
}

/** Add `days` calendar days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

/** Normalise a Payload date field (ISO string or Date object) to YYYY-MM-DD. */
function toDateString(value: string | Date): string {
  const s = typeof value === 'string' ? value : value.toISOString()
  return s.split('T')[0]
}

export async function getSchedule(
  payload: Payload,
  from: string,
  days: number,
): Promise<ScheduleResult> {
  const to = addDays(from, days)

  // Confirmed bookings + open windows (Darbo laikai) run in parallel — no data
  // dependency between them.
  const [bookingsResult, windowsResult] = await Promise.all([
    payload.find({
      collection: 'bookings',
      where: {
        and: [
          { date: { greater_than_equal: from } },
          { date: { less_than: to } },
          { status: { equals: 'confirmed' } },
        ],
      },
      limit: 1000,
      depth: 1,
    }),
    payload.find({
      collection: 'availability-windows',
      where: {
        and: [
          { date: { greater_than_equal: from } },
          { date: { less_than: to } },
        ],
      },
      limit: 1000,
      depth: 0,
    }),
  ])

  // Build a map keyed by date string for O(1) lookup
  const dayMap = new Map<string, ScheduleDay>()
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i)
    dayMap.set(d, { date: d, bookings: [], windows: [] })
  }

  for (const b of bookingsResult.docs as Booking[]) {
    const dateKey = toDateString(b.date)
    const day = dayMap.get(dateKey)
    if (!day) continue
    const serviceName =
      b.service && typeof b.service === 'object'
        ? (b.service as Service).name
        : ''
    day.bookings.push({
      id: b.id as number,
      patientName: b.patientName,
      serviceName,
      timeSlot: b.timeSlot,
      endTime: b.endTime ?? null,
    })
  }

  for (const w of windowsResult.docs as AvailabilityWindow[]) {
    const dateKey = toDateString(w.date)
    const day = dayMap.get(dateKey)
    if (!day) continue
    day.windows.push({
      id: w.id as number,
      startTime: w.startTime,
      endTime: w.endTime,
      note: w.note ?? null,
    })
  }

  // Sort bookings and windows by time within each day
  for (const day of dayMap.values()) {
    day.bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
    day.windows.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return { days: Array.from(dayMap.values()) }
}
