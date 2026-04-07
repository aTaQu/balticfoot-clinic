import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createBooking } from '@/lib/bookings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const {
      serviceSlug, date, timeSlot,
      patientName, patientPhone, patientEmail,
      patientNotes, gdprConsent,
    } = body

    if (!serviceSlug || !date || !timeSlot) {
      return NextResponse.json(
        { error: 'serviceSlug, date, and timeSlot are required' },
        { status: 400 },
      )
    }

    if (typeof serviceSlug !== 'string' || typeof date !== 'string' || typeof timeSlot !== 'string') {
      return NextResponse.json({ error: 'serviceSlug, date, and timeSlot must be strings' }, { status: 400 })
    }

    // Reject slugs with unexpected characters before they reach the DB query
    if (!/^[a-z0-9-]+$/.test(serviceSlug)) {
      return NextResponse.json({ error: 'Invalid serviceSlug format' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const result = await createBooking(payload, {
      serviceSlug,
      date,
      timeSlot,
      patientName: typeof patientName === 'string' ? patientName : '',
      patientPhone: typeof patientPhone === 'string' ? patientPhone : '',
      patientEmail: typeof patientEmail === 'string' ? patientEmail : '',
      patientNotes: typeof patientNotes === 'string' ? patientNotes : undefined,
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
