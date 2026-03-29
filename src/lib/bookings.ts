import type { Payload } from 'payload'
import { getAvailability } from './availability'
import { sendEmail } from './notifications/email'
import { sendSms, SMS } from './notifications/sms'

export interface CreateBookingInput {
  serviceSlug: string
  date: string         // YYYY-MM-DD
  timeSlot: string     // HH:MM  e.g. "10:00"
  patientName: string
  patientPhone: string
  patientEmail: string
  patientNotes?: string
  smsOptIn: boolean
  gdprConsent: boolean
}

export type CreateBookingResult =
  | { booking: { id: string | number; date: string; timeSlot: string; serviceName: string } }
  | { error: string; status: 400 | 404 | 409 }

export async function createBooking(
  payload: Payload,
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const {
    serviceSlug, date, timeSlot,
    patientName, patientPhone, patientEmail,
    patientNotes, smsOptIn, gdprConsent,
  } = input

  // --- Validation ---
  if (!gdprConsent) return { error: 'GDPR consent is required', status: 400 }
  if (!patientName.trim()) return { error: 'patientName is required', status: 400 }
  if (!patientPhone.trim()) return { error: 'patientPhone is required', status: 400 }
  if (!patientEmail.trim()) return { error: 'patientEmail is required', status: 400 }

  // --- Fetch service ---
  const serviceResult = await payload.find({
    collection: 'services',
    where: { slug: { equals: serviceSlug }, active: { equals: true } },
    limit: 1,
  })
  if (serviceResult.totalDocs === 0) return { error: 'Service not found', status: 404 }
  const service = serviceResult.docs[0]

  // --- Re-check availability (race condition guard) ---
  const availability = await getAvailability(payload, date, serviceSlug)
  if ('error' in availability) {
    return { error: availability.error, status: availability.status as 400 | 404 }
  }
  const slot = availability.slots.find((s) => s.time === timeSlot)
  if (!slot?.available) {
    return { error: 'This time slot is no longer available', status: 409 }
  }

  // --- Create booking ---
  const booking = await payload.create({
    collection: 'bookings',
    data: {
      service: service.id,
      date,
      timeSlot,
      status: 'pending',
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim(),
      patientNotes: patientNotes?.trim() ?? undefined,
      smsOptIn,
      gdprConsent: true,
      reminderSent: false,
    },
  })

  // --- Fetch clinic settings for notifications ---
  const settings = await payload.findGlobal({ slug: 'clinic-settings' })
  const formattedDate = formatDateLT(date)

  // Fire-and-forget: errors caught inside sendEmail/sendSms, never throw
  void sendEmail('booking-received', patientEmail, {
    patientName,
    serviceName: service.name,
    date: formattedDate,
    time: timeSlot,
    clinicPhone: settings.phone,
  })

  if (smsOptIn) {
    void sendSms(patientPhone, SMS.received)
  }

  void sendEmail('new-booking-alert', settings.email, {
    patientName,
    patientPhone,
    patientEmail,
    serviceName: service.name,
    date: formattedDate,
    time: timeSlot,
    patientNotes,
  })

  return {
    booking: {
      id: booking.id,
      date,
      timeSlot,
      serviceName: service.name,
    },
  }
}

// "2026-04-15" → "2026 m. balandžio 15 d."
function formatDateLT(isoDate: string): string {
  const MONTHS_GEN = [
    'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės',
    'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio',
  ]
  const [y, m, d] = isoDate.split('-').map(Number)
  const month = MONTHS_GEN[m - 1] ?? isoDate  // fallback to raw string if month out of range
  return `${y} m. ${month} ${d} d.`
}
