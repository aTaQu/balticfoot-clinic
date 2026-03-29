import type { Payload } from 'payload'
import type { Booking, Service } from '../../payload-types'
import { sendEmail } from './notifications/email'
import { sendSms, SMS } from './notifications/sms'

export type BookingActionResult =
  | { booking: { id: number; status: string } }
  | { error: string; status: 400 | 403 | 404 | 409 }

// Format date: "2099-06-02" → "2099 m. birželio 2 d."
function formatDateLT(isoDate: string): string {
  const MONTHS_GEN = [
    'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės',
    'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio',
  ]
  const [y, m, d] = isoDate.split('-').map(Number)
  const month = MONTHS_GEN[m - 1] ?? isoDate
  return `${y} m. ${month} ${d} d.`
}

export async function confirmBooking(
  payload: Payload,
  bookingId: number,
  userId: number,
): Promise<BookingActionResult> {
  // 1. Fetch booking
  let booking: Booking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking = await payload.findByID({ collection: 'bookings' as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  // 2. Validate state
  if (booking.status !== 'pending') {
    return { error: `Cannot confirm a booking with status "${booking.status}"`, status: 409 }
  }

  // 3. Update status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await payload.update({ collection: 'bookings' as any, id: bookingId, data: { status: 'confirmed' } })

  // 4. Write AuditLog
  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: 'audit-log' as any,
    data: { user: userId, action: 'confirmed', booking: bookingId },
  })

  // 5. Notifications (fire-and-forget)
  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const service = typeof booking.service === 'object' ? booking.service : null
  const serviceName = service ? (service as Service).name : ''
  const formattedDate = formatDateLT(booking.date.split('T')[0])

  void sendEmail('booking-confirmed', booking.patientEmail, {
    patientName: booking.patientName,
    serviceName,
    date: formattedDate,
    time: booking.timeSlot,
    clinicPhone: settings.phone,
  })

  if (booking.smsOptIn) {
    void sendSms(booking.patientPhone, SMS.confirmed(formattedDate, booking.timeSlot, serviceName))
  }

  return { booking: { id: updated.id as number, status: updated.status as string } }
}

export async function rejectBooking(
  payload: Payload,
  bookingId: number,
  userId: number,
  rejectionReason: string,
): Promise<BookingActionResult> {
  if (!rejectionReason?.trim()) {
    return { error: 'rejectionReason is required', status: 400 }
  }

  let booking: Booking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking = await payload.findByID({ collection: 'bookings' as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  if (booking.status !== 'pending') {
    return { error: `Cannot reject a booking with status "${booking.status}"`, status: 409 }
  }

  const updated = await payload.update({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: 'bookings' as any,
    id: bookingId,
    data: { status: 'rejected', rejectionReason: rejectionReason.trim() },
  })

  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: 'audit-log' as any,
    data: { user: userId, action: 'rejected', booking: bookingId, note: rejectionReason.trim() },
  })

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const service = typeof booking.service === 'object' ? booking.service : null
  const serviceName = service ? (service as Service).name : ''
  const formattedDate = formatDateLT(booking.date.split('T')[0])

  void sendEmail('booking-rejected', booking.patientEmail, {
    patientName: booking.patientName,
    serviceName,
    date: formattedDate,
    time: booking.timeSlot,
    clinicPhone: settings.phone,
    rejectionReason: rejectionReason.trim(),
  })

  if (booking.smsOptIn) {
    void sendSms(booking.patientPhone, SMS.rejected)
  }

  return { booking: { id: updated.id as number, status: updated.status as string } }
}

export async function cancelBooking(
  payload: Payload,
  bookingId: number,
  userId: number,
): Promise<BookingActionResult> {
  let booking: Booking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking = await payload.findByID({ collection: 'bookings' as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  if (booking.status !== 'confirmed') {
    return { error: `Cannot cancel a booking with status "${booking.status}"`, status: 409 }
  }

  const updated = await payload.update({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: 'bookings' as any,
    id: bookingId,
    data: { status: 'cancelled' },
  })

  await payload.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    collection: 'audit-log' as any,
    data: { user: userId, action: 'cancelled', booking: bookingId },
  })

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const service = typeof booking.service === 'object' ? booking.service : null
  const serviceName = service ? (service as Service).name : ''
  const formattedDate = formatDateLT(booking.date.split('T')[0])

  void sendEmail('booking-cancelled-alert', settings.email, {
    patientName: booking.patientName,
    serviceName,
    date: formattedDate,
    time: booking.timeSlot,
  })

  return { booking: { id: updated.id as number, status: updated.status as string } }
}
