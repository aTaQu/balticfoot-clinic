import { render } from '@react-email/render'
import type { EmailTemplate, EmailData, BookingEmailData, BookingRejectedEmailData, NewBookingAlertEmailData, BookingCancelledAlertEmailData, ContactEnquiryAlertEmailData } from './types'
import { BookingReceivedEmail } from './templates/BookingReceivedEmail'
import { BookingConfirmedEmail } from './templates/BookingConfirmedEmail'
import { BookingRejectedEmail } from './templates/BookingRejectedEmail'
import { BookingReminderEmail } from './templates/BookingReminderEmail'
import { NewBookingAlertEmail } from './templates/NewBookingAlertEmail'
import { BookingCancelledAlertEmail } from './templates/BookingCancelledAlertEmail'
import { ContactEnquiryAlertEmail } from './templates/ContactEnquiryAlertEmail'

const SUBJECTS: Record<EmailTemplate, string> = {
  'booking-received':         'Vizito užklausa gauta — Baltic Foot',
  'booking-confirmed':        'Vizitas patvirtintas — Baltic Foot',
  'booking-rejected':         'Dėl jūsų vizito užklausos — Baltic Foot',
  'booking-reminder':         'Primename apie rytojaus vizitą — Baltic Foot',
  'new-booking-alert':        'Nauja vizito užklausa',
  'booking-cancelled-alert':  'Vizitas atšauktas',
  'contact-enquiry-alert':    'Nauja žinutė — Baltic Foot kontaktų forma',
}

// Each template function is typed to its own data shape; callers pass the correct
// data type via the EmailData union — the registry avoids per-case type assertions.
const TEMPLATES: Record<EmailTemplate, (data: EmailData) => React.ReactElement> = {
  'booking-received':        (d) => BookingReceivedEmail(d as BookingEmailData),
  'booking-confirmed':       (d) => BookingConfirmedEmail(d as BookingEmailData),
  'booking-rejected':        (d) => BookingRejectedEmail(d as BookingRejectedEmailData),
  'booking-reminder':        (d) => BookingReminderEmail(d as BookingEmailData),
  'new-booking-alert':       (d) => NewBookingAlertEmail(d as NewBookingAlertEmailData),
  'booking-cancelled-alert': (d) => BookingCancelledAlertEmail(d as BookingCancelledAlertEmailData),
  'contact-enquiry-alert':   (d) => ContactEnquiryAlertEmail(d as ContactEnquiryAlertEmailData),
}

export async function sendEmail(
  template: EmailTemplate,
  to: string,
  data: EmailData,
): Promise<void> {
  try {
    const html = await render(TEMPLATES[template](data))
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Baltic Foot', email: 'info@podologija-siauliai.lt' },
        to: [{ email: to }],
        subject: SUBJECTS[template],
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Brevo ${res.status}: ${body}`)
    }
  } catch (err) {
    // Intentionally not rethrowing — notification failure must never break a booking transaction
    console.error(`[notifications] sendEmail failed (template=${template}, to=${to}):`, err)
  }
}
