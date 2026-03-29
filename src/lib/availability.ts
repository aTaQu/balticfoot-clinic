import type { Payload } from 'payload'

const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
] as const

export type Slot = { time: string; available: boolean }
export type AvailabilityOk = { slots: Slot[] }
export type AvailabilityErr = { error: string; status: 400 | 404 }
export type AvailabilityResult = AvailabilityOk | AvailabilityErr

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
}

export async function getAvailability(
  payload: Payload,
  date: string,
  serviceSlug: string,
): Promise<AvailabilityResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
  const openDays = (settings.openDays ?? []) as string[]
  const slotInterval = parseInt(settings.slotIntervalMinutes ?? '30', 10)
  const dayStart = timeToMinutes(settings.workingHoursStart)
  const dayEnd = timeToMinutes(settings.workingHoursEnd)

  // Parse date parts in UTC to avoid timezone shifts
  const [y, mo, d] = date.split('-').map(Number)
  const dayOfWeek = DAYS_OF_WEEK[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]

  if (!openDays.includes(dayOfWeek)) {
    return { slots: [] }
  }

  const [bookingsResult, blockedResult] = await Promise.all([
    payload.find({
      collection: 'bookings',
      where: { date: { equals: date }, status: { in: ['pending', 'confirmed'] } },
      limit: 200,
    }),
    payload.find({
      collection: 'blocked-slots',
      where: { date: { equals: date } },
      limit: 200,
    }),
  ])

  const occupied: [number, number][] = [
    ...bookingsResult.docs.map((b) => [
      timeToMinutes(b.timeSlot as string),
      timeToMinutes(b.endTime as string),
    ] as [number, number]),
    ...blockedResult.docs.map((b) => [
      timeToMinutes(b.startTime as string),
      timeToMinutes(b.endTime as string),
    ] as [number, number]),
  ]

  const slots: Slot[] = []
  for (let start = dayStart; start < dayEnd; start += slotInterval) {
    const end = start + duration
    if (end > dayEnd) {
      slots.push({ time: minutesToTime(start), available: false })
      continue
    }
    const available = !occupied.some(([os, oe]) => overlaps(start, end, os, oe))
    slots.push({ time: minutesToTime(start), available })
  }

  return { slots }
}
