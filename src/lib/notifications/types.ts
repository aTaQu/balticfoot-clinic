export type EmailTemplate =
  | 'booking-received'
  | 'booking-confirmed'
  | 'booking-rejected'
  | 'booking-reminder'
  | 'new-booking-alert'
  | 'booking-cancelled-alert'

export interface BookingEmailData {
  patientName: string
  serviceName: string
  date: string        // formatted: "2026 m. balandžio 15 d."
  time: string        // "14:00"
  clinicPhone: string
}

export interface BookingRejectedEmailData extends BookingEmailData {
  rejectionReason: string
}

export interface NewBookingAlertEmailData {
  patientName: string
  patientPhone: string
  patientEmail: string
  serviceName: string
  date: string
  time: string
  patientNotes?: string
}

export interface BookingCancelledAlertEmailData {
  patientName: string
  serviceName: string
  date: string
  time: string
}

export type EmailData =
  | BookingEmailData
  | BookingRejectedEmailData
  | NewBookingAlertEmailData
  | BookingCancelledAlertEmailData
