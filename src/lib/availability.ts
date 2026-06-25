import type { Payload } from 'payload'

export type Slot = { time: string; available: boolean }
export type AvailabilityOk = { slots: Slot[] }
export type AvailabilityErr = { error: string; status: 400 | 404 }
export type AvailabilityResult = AvailabilityOk | AvailabilityErr

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
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
    if (!b.timeSlot || !b.endTime) return []
    return [[timeToMinutes(b.timeSlot), timeToMinutes(b.endTime)] as [number, number]]
  })

  const slots: Slot[] = []
  for (const w of windowsResult.docs) {
    if (!w.startTime || !w.endTime) continue
    const winStart = timeToMinutes(w.startTime)
    const winEnd = timeToMinutes(w.endTime)
    // Snap the first candidate up to the clock grid (multiples of the interval).
    const first = Math.ceil(winStart / slotInterval) * slotInterval
    for (let start = first; start + duration <= winEnd; start += slotInterval) {
      const end = start + duration
      const available = !occupied.some(([os, oe]) => overlaps(start, end, os, oe))
      slots.push({ time: minutesToTime(start), available })
    }
  }

  slots.sort((a, b) => a.time.localeCompare(b.time))
  return { slots }
}
