import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { sendReminders } from './reminders'
import * as emailMod from './notifications/email'
import * as smsMod from './notifications/sms'

// Far-future date used as "tomorrow" in tests
const TEST_TOMORROW = '2099-11-15'

let payload: Payload
let serviceId: number

beforeAll(async () => {
  payload = await getPayload({ config: configPromise })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = await payload.find({ collection: 'services' as any, where: { active: { equals: true } }, limit: 1 })
  serviceId = services.docs[0].id as number
})

afterEach(async () => {
  vi.restoreAllMocks()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await payload.find({
    collection: 'bookings' as any,
    where: { date: { equals: TEST_TOMORROW } },
    limit: 200,
  })
  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookings.docs.map((b) => payload.delete({ collection: 'bookings' as any, id: b.id })),
  )
})

async function createBooking(overrides: Record<string, unknown> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return payload.create({
    collection: 'bookings' as any,
    data: {
      service: serviceId,
      date: TEST_TOMORROW,
      timeSlot: '10:00',
      status: 'confirmed',
      patientName: 'Test Reminder',
      patientPhone: '+37060000099',
      patientEmail: 'reminder-test@example.com',
      gdprConsent: true,
      smsOptIn: false,
      reminderSent: false,
      ...overrides,
    },
  })
}

describe('sendReminders', () => {
  it('sends email and sets reminderSent=true for confirmed booking with reminderSent=false', async () => {
    const booking = await createBooking()
    vi.spyOn(emailMod, 'sendEmail').mockResolvedValue(undefined)
    vi.spyOn(smsMod, 'sendSms').mockResolvedValue(undefined)

    const result = await sendReminders(payload, TEST_TOMORROW)

    expect(result.sent).toBe(1)
    expect(result.failed).toBe(0)
    expect(emailMod.sendEmail).toHaveBeenCalledWith(
      'booking-reminder',
      'reminder-test@example.com',
      expect.objectContaining({ patientName: 'Test Reminder' }),
    )
    expect(smsMod.sendSms).not.toHaveBeenCalled()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await payload.findByID({ collection: 'bookings' as any, id: booking.id as number })
    expect(updated.reminderSent).toBe(true)
  })

  it('skips booking with reminderSent=true', async () => {
    await createBooking({ reminderSent: true })
    vi.spyOn(emailMod, 'sendEmail').mockResolvedValue(undefined)

    const result = await sendReminders(payload, TEST_TOMORROW)

    expect(result.sent).toBe(0)
    expect(result.failed).toBe(0)
    expect(emailMod.sendEmail).not.toHaveBeenCalled()
  })

  it('skips pending booking for tomorrow', async () => {
    await createBooking({ status: 'pending' })
    vi.spyOn(emailMod, 'sendEmail').mockResolvedValue(undefined)

    const result = await sendReminders(payload, TEST_TOMORROW)

    expect(result.sent).toBe(0)
    expect(emailMod.sendEmail).not.toHaveBeenCalled()
  })

  it('sends only email when smsOptIn=false', async () => {
    await createBooking({ smsOptIn: false })
    vi.spyOn(emailMod, 'sendEmail').mockResolvedValue(undefined)
    vi.spyOn(smsMod, 'sendSms').mockResolvedValue(undefined)

    const result = await sendReminders(payload, TEST_TOMORROW)

    expect(result.sent).toBe(1)
    expect(emailMod.sendEmail).toHaveBeenCalledOnce()
    expect(smsMod.sendSms).not.toHaveBeenCalled()
  })

  it('sends email and SMS when smsOptIn=true', async () => {
    await createBooking({ smsOptIn: true })
    vi.spyOn(emailMod, 'sendEmail').mockResolvedValue(undefined)
    vi.spyOn(smsMod, 'sendSms').mockResolvedValue(undefined)

    const result = await sendReminders(payload, TEST_TOMORROW)

    expect(result.sent).toBe(1)
    expect(emailMod.sendEmail).toHaveBeenCalledOnce()
    expect(smsMod.sendSms).toHaveBeenCalledOnce()
    expect(smsMod.sendSms).toHaveBeenCalledWith('+37060000099', expect.stringContaining('10:00'))
  })
})
