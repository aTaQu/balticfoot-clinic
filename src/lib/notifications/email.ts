import { render } from '@react-email/render'
import { Resend } from 'resend'
import type { EmailTemplate, EmailData, BookingEmailData, BookingRejectedEmailData, NewBookingAlertEmailData, BookingCancelledAlertEmailData } from './types'
import { BookingReceivedEmail } from './templates/BookingReceivedEmail'
import { BookingConfirmedEmail } from './templates/BookingConfirmedEmail'
import { BookingRejectedEmail } from './templates/BookingRejectedEmail'
import { BookingReminderEmail } from './templates/BookingReminderEmail'
import { NewBookingAlertEmail } from './templates/NewBookingAlertEmail'
import { BookingCancelledAlertEmail } from './templates/BookingCancelledAlertEmail'

const SUBJECTS: Record<EmailTemplate, string> = {
  'booking-received':         'Vizito užklausa gauta — Baltic Foot',
  'booking-confirmed':        'Vizitas patvirtintas — Baltic Foot',
  'booking-rejected':         'Dėl jūsų vizito užklausos — Baltic Foot',
  'booking-reminder':         'Primename apie rytojaus vizitą — Baltic Foot',
  'new-booking-alert':        'Nauja vizito užklausa',
  'booking-cancelled-alert':  'Vizitas atšauktas',
}

async function renderTemplate(template: EmailTemplate, data: EmailData): Promise<string> {
  switch (template) {
    case 'booking-received':
      return render(BookingReceivedEmail(data as BookingEmailData))
    case 'booking-confirmed':
      return render(BookingConfirmedEmail(data as BookingEmailData))
    case 'booking-rejected':
      return render(BookingRejectedEmail(data as BookingRejectedEmailData))
    case 'booking-reminder':
      return render(BookingReminderEmail(data as BookingEmailData))
    case 'new-booking-alert':
      return render(NewBookingAlertEmail(data as NewBookingAlertEmailData))
    case 'booking-cancelled-alert':
      return render(BookingCancelledAlertEmail(data as BookingCancelledAlertEmailData))
  }
}

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: EmailData,
): Promise<void> {
  try {
    const html = await renderTemplate(template, data)
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Baltic Foot <info@balticfoot.lt>',
      to,
      subject: SUBJECTS[template],
      html,
    })
  } catch (err) {
    console.error(`[notifications] sendEmail failed (template=${template}, to=${to}):`, err)
    // Intentionally not rethrowing — notification failure must never break a booking transaction
  }
}
