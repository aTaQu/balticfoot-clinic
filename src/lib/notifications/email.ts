import { render } from '@react-email/render'
import { Resend } from 'resend'
import type { EmailTemplate, EmailData, BookingEmailData, BookingRejectedEmailData, NewBookingAlertEmailData, BookingCancelledAlertEmailData, ContactEnquiryAlertEmailData } from './types'
import { BookingReceivedEmail } from './templates/BookingReceivedEmail'
import { BookingConfirmedEmail } from './templates/BookingConfirmedEmail'
import { BookingRejectedEmail } from './templates/BookingRejectedEmail'
import { BookingReminderEmail } from './templates/BookingReminderEmail'
import { NewBookingAlertEmail } from './templates/NewBookingAlertEmail'
import { BookingCancelledAlertEmail } from './templates/BookingCancelledAlertEmail'
import { ContactEnquiryAlertEmail } from './templates/ContactEnquiryAlertEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    await resend.emails.send({
      from: 'Baltic Foot <info@podologija-siauliai.lt>',
      to,
      subject: SUBJECTS[template],
      html,
    })
  } catch (err) {
    // Intentionally not rethrowing — notification failure must never break a booking transaction
    console.error(`[notifications] sendEmail failed (template=${template}, to=${to}):`, err)
  }
}
