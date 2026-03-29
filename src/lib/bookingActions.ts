import type { Payload } from 'payload'
import type { Booking, Service } from '../../payload-types'
import { formatDateLT } from './format'
import { sendEmail } from './notifications/email'
import { sendSms, SMS } from './notifications/sms'

export type BookingActionResult =
  | { booking: { id: number; status: string } }
  | { error: string; status: 400 | 403 | 404 | 409 }

// Typed collection slugs — avoids repeating `as any` at every call site
const BOOKINGS = 'bookings' as const
const AUDIT_LOG = 'audit-log' as const

function resolveServiceName(booking: Booking): string {
  return typeof booking.service === 'object'
    ? (booking.service as Service).name
    : ''
}

export async function confirmBooking(
  payload: Payload,
  bookingId: number,
  userId: number,
): Promise<BookingActionResult> {
  let booking: Booking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking = await payload.findByID({ collection: BOOKINGS as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  if (booking.status !== 'pending') {
    return { error: `Cannot confirm a booking with status "${booking.status}"`, status: 409 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await payload.update({ collection: BOOKINGS as any, id: bookingId, data: { status: 'confirmed' } })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({
    collection: AUDIT_LOG as any,
    data: { user: userId, action: 'confirmed', booking: bookingId },
  })

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const serviceName = resolveServiceName(booking)
  const formattedDate = formatDateLT(booking.date)

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

  return { booking: { id: updated.id, status: updated.status } }
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
    booking = await payload.findByID({ collection: BOOKINGS as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  if (booking.status !== 'pending') {
    return { error: `Cannot reject a booking with status "${booking.status}"`, status: 409 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await payload.update({
    collection: BOOKINGS as any,
    id: bookingId,
    data: { status: 'rejected', rejectionReason: rejectionReason.trim() },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({
    collection: AUDIT_LOG as any,
    data: { user: userId, action: 'rejected', booking: bookingId, note: rejectionReason.trim() },
  })

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const serviceName = resolveServiceName(booking)
  const formattedDate = formatDateLT(booking.date)

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

  return { booking: { id: updated.id, status: updated.status } }
}

export async function cancelBooking(
  payload: Payload,
  bookingId: number,
  userId: number,
): Promise<BookingActionResult> {
  let booking: Booking
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking = await payload.findByID({ collection: BOOKINGS as any, id: bookingId })
  } catch {
    return { error: 'Booking not found', status: 404 }
  }
  if (!booking) return { error: 'Booking not found', status: 404 }

  if (booking.status !== 'confirmed') {
    return { error: `Cannot cancel a booking with status "${booking.status}"`, status: 409 }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await payload.update({
    collection: BOOKINGS as any,
    id: bookingId,
    data: { status: 'cancelled' },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.create({
    collection: AUDIT_LOG as any,
    data: { user: userId, action: 'cancelled', booking: bookingId },
  })

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const serviceName = resolveServiceName(booking)
  const formattedDate = formatDateLT(booking.date)

  void sendEmail('booking-cancelled-alert', settings.email, {
    patientName: booking.patientName,
    serviceName,
    date: formattedDate,
    time: booking.timeSlot,
  })

  return { booking: { id: updated.id, status: updated.status } }
}
