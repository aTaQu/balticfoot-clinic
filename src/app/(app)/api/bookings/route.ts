import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createBooking } from '@/lib/bookings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceSlug, date, timeSlot,
      patientName, patientPhone, patientEmail,
      patientNotes, smsOptIn, gdprConsent,
    } = body

    if (!serviceSlug || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'serviceSlug, date, and timeSlot are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const result = await createBooking(payload, {
      serviceSlug,
      date,
      timeSlot,
      patientName: patientName ?? '',
      patientPhone: patientPhone ?? '',
      patientEmail: patientEmail ?? '',
      patientNotes,
      smsOptIn: Boolean(smsOptIn),
      gdprConsent: Boolean(gdprConsent),
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    console.error('[bookings] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
