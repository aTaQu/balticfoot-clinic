import type { Payload } from 'payload'
import { formatDateLT } from './format'
import { sendEmail } from './notifications/email'
import { sendSms, SMS } from './notifications/sms'
import type { Service } from '../../payload-types'

export type RemindersResult = { sent: number; failed: number }

const BOOKINGS = 'bookings' as const

/** Returns tomorrow's date string (YYYY-MM-DD) in the Europe/Vilnius timezone. */
export function getTomorrowVilnius(): string {
  const now = new Date()
  // Advance by 1 day in Vilnius local time
  const formatter = new Intl.DateTimeFormat('lt-LT', {
    timeZone: 'Europe/Vilnius',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  // Get today's date parts in Vilnius
  const parts = formatter.formatToParts(now)
  const y = Number(parts.find((p) => p.type === 'year')!.value)
  const m = Number(parts.find((p) => p.type === 'month')!.value)
  const d = Number(parts.find((p) => p.type === 'day')!.value)

  // Construct tomorrow
  const tomorrow = new Date(y, m - 1, d + 1)
  const ty = tomorrow.getFullYear()
  const tm = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const td = String(tomorrow.getDate()).padStart(2, '0')
  return `${ty}-${tm}-${td}`
}

export async function sendReminders(payload: Payload, tomorrow?: string): Promise<RemindersResult> {
  const date = tomorrow ?? getTomorrowVilnius()

  // Payload stores date as ISO timestamp at midnight UTC; query with equals on date string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs: bookings } = await payload.find({
    collection: BOOKINGS as any,
    where: {
      and: [
        { date: { equals: date } },
        { status: { equals: 'confirmed' } },
        { reminderSent: { equals: false } },
      ],
    },
    limit: 1000,
    depth: 1,
  })

  let sent = 0
  let failed = 0

  const settings = await payload.findGlobal({ slug: 'clinic-settings' })

  for (const booking of bookings) {
    const serviceName =
      typeof booking.service === 'object'
        ? (booking.service as Service).name
        : ''

    const formattedDate = formatDateLT(booking.date as string)

    try {
      await sendEmail('booking-reminder', booking.patientEmail as string, {
        patientName: booking.patientName as string,
        serviceName,
        date: formattedDate,
        time: booking.timeSlot as string,
        clinicPhone: settings.phone,
      })

      if (booking.smsOptIn) {
        await sendSms(booking.patientPhone as string, SMS.reminder(booking.timeSlot as string))
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({
        collection: BOOKINGS as any,
        id: booking.id as number,
        data: { reminderSent: true },
      })

      sent++
    } catch (err) {
      console.error(`[reminders] Failed to send reminder for booking ${booking.id}:`, err)
      failed++
    }
  }

  return { sent, failed }
}
