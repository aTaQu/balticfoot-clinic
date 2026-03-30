import type { Payload } from 'payload'
import type { Booking, Service, BlockedSlot } from '../../payload-types'

export interface ScheduledBooking {
  id: number
  patientName: string
  serviceName: string
  timeSlot: string
  endTime: string | null
}

export interface ScheduledBlock {
  id: number
  startTime: string
  endTime: string
  reason: string | null
}

export interface ScheduleDay {
  date: string
  bookings: ScheduledBooking[]
  blocks: ScheduledBlock[]
}

export interface ScheduleResult {
  days: ScheduleDay[]
}

const BOOKINGS = 'bookings' as const
const BLOCKED_SLOTS = 'blocked-slots' as const

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookingsResult, blocksResult] = await Promise.all([
    payload.find({
      collection: BOOKINGS as any,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.find({
      collection: BLOCKED_SLOTS as any,
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
    dayMap.set(d, { date: d, bookings: [], blocks: [] })
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

  for (const block of blocksResult.docs as BlockedSlot[]) {
    const dateKey = toDateString(block.date)
    const day = dayMap.get(dateKey)
    if (!day) continue
    day.blocks.push({
      id: block.id as number,
      startTime: block.startTime,
      endTime: block.endTime,
      reason: block.reason ?? null,
    })
  }

  // Sort bookings and blocks by time within each day
  for (const day of dayMap.values()) {
    day.bookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
    day.blocks.sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return { days: Array.from(dayMap.values()) }
}
