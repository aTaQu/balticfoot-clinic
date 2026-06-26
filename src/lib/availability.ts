import type { Payload } from 'payload'
import { parseTimeToMinutes } from './time'

export type Slot = { time: string; available: boolean }
export type AvailabilityOk = { slots: Slot[] }
export type AvailabilityErr = { error: string; status: 400 | 404 }
export type AvailabilityResult = AvailabilityOk | AvailabilityErr

export type AvailableDatesOk = { dates: string[] }
export type AvailableDatesResult = AvailableDatesOk | AvailabilityErr

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
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

type WindowLike = { startTime?: string | null; endTime?: string | null }

/**
 * Default-closed slot computation for a single day: emit clock-grid slots that
 * fit fully inside an open window, flagging each unavailable if it overlaps a
 * booking. Windows with an unparseable time are skipped. Shared by
 * `getAvailability` (one date) and `getAvailableDates` (range).
 */
function computeDaySlots(
  windows: WindowLike[],
  occupied: [number, number][],
  duration: number,
  slotInterval: number,
): Slot[] {
  const slots: Slot[] = []
  for (const w of windows) {
    const winStart = parseTimeToMinutes(w.startTime ?? '')
    const winEnd = parseTimeToMinutes(w.endTime ?? '')
    if (winStart === null || winEnd === null) continue
    // Snap the first candidate up to the clock grid (multiples of the interval).
    const first = Math.ceil(winStart / slotInterval) * slotInterval
    for (let start = first; start + duration <= winEnd; start += slotInterval) {
      const end = start + duration
      const available = !occupied.some(([os, oe]) => overlaps(start, end, os, oe))
      slots.push({ time: minutesToTime(start), available })
    }
  }
  slots.sort((a, b) => a.time.localeCompare(b.time))
  return slots
}

export async function getAvailability(
  payload: Payload,
  date: string,
  serviceSlug: string,
): Promise<AvailabilityResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
    return { error: 'Invalid date format. Use YYYY-MM-DD.', status: 400 }
  }

  const [serviceResult, settings] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { slug: { equals: serviceSlug }, active: { equals: true } },
      limit: 1,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }),
  ])

  if (serviceResult.totalDocs === 0) {
    return { error: 'Service not found', status: 404 }
  }

  const duration = serviceResult.docs[0].duration
  const slotInterval = parseInt(settings.slotIntervalMinutes ?? '30', 10)

  // Default-closed model: bookable slots come ONLY from open windows
  // (Darbo laikai). Confirmed/pending bookings subtract from them.
  const [windowsResult, bookingsResult] = await Promise.all([
    payload.find({
      collection: 'availability-windows',
      where: { date: { equals: date } },
      limit: 200,
    }),
    payload.find({
      collection: 'bookings',
      where: { date: { equals: date }, status: { in: ['pending', 'confirmed'] } },
      limit: 200,
    }),
  ])

  const occupied: [number, number][] = bookingsResult.docs.flatMap((b) => {
    const s = parseTimeToMinutes(b.timeSlot ?? '')
    const e = parseTimeToMinutes(b.endTime ?? '')
    return s === null || e === null ? [] : [[s, e] as [number, number]]
  })

  return { slots: computeDaySlots(windowsResult.docs, occupied, duration, slotInterval) }
}

/**
 * Which dates in `[from, from + days)` have at least one *free* slot for the
 * service — i.e. an open window with a slot no booking has taken. Powers the
 * booking calendar (enable/accent only bookable days). Batches the whole range
 * into two queries and computes per date in memory.
 */
export async function getAvailableDates(
  payload: Payload,
  from: string,
  days: number,
  serviceSlug: string,
): Promise<AvailableDatesResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || isNaN(new Date(from).getTime())) {
    return { error: 'Invalid date format. Use YYYY-MM-DD.', status: 400 }
  }

  const [serviceResult, settings] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { slug: { equals: serviceSlug }, active: { equals: true } },
      limit: 1,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }),
  ])

  if (serviceResult.totalDocs === 0) {
    return { error: 'Service not found', status: 404 }
  }

  const duration = serviceResult.docs[0].duration
  const slotInterval = parseInt(settings.slotIntervalMinutes ?? '30', 10)
  const to = addDays(from, days)

  const [windowsResult, bookingsResult] = await Promise.all([
    payload.find({
      collection: 'availability-windows',
      where: { and: [{ date: { greater_than_equal: from } }, { date: { less_than: to } }] },
      limit: 1000,
    }),
    payload.find({
      collection: 'bookings',
      where: {
        and: [
          { date: { greater_than_equal: from } },
          { date: { less_than: to } },
          { status: { in: ['pending', 'confirmed'] } },
        ],
      },
      limit: 1000,
    }),
  ])

  const windowsByDate = new Map<string, WindowLike[]>()
  for (const w of windowsResult.docs) {
    const key = toDateString(w.date)
    const arr = windowsByDate.get(key)
    if (arr) arr.push(w)
    else windowsByDate.set(key, [w])
  }

  const occupiedByDate = new Map<string, [number, number][]>()
  for (const b of bookingsResult.docs) {
    const s = parseTimeToMinutes(b.timeSlot ?? '')
    const e = parseTimeToMinutes(b.endTime ?? '')
    if (s === null || e === null) continue
    const key = toDateString(b.date)
    const entry: [number, number] = [s, e]
    const arr = occupiedByDate.get(key)
    if (arr) arr.push(entry)
    else occupiedByDate.set(key, [entry])
  }

  // Only dates with a window can be bookable; exclude those fully taken by bookings.
  const dates: string[] = []
  for (const [date, windows] of windowsByDate) {
    const occupied = occupiedByDate.get(date) ?? []
    if (computeDaySlots(windows, occupied, duration, slotInterval).some((s) => s.available)) {
      dates.push(date)
    }
  }
  dates.sort()
  return { dates }
}
