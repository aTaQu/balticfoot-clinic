import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

const BOOKINGS = 'bookings' as const

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 730)
  const cutoffDate = cutoff.toISOString().slice(0, 10) // YYYY-MM-DD

  const result = await payload.find({
    collection: BOOKINGS as any,
    where: { date: { less_than: cutoffDate } },
    limit: 1000,
    depth: 0,
  })

  let deleted = 0
  for (const booking of result.docs) {
    await payload.delete({ collection: BOOKINGS as any, id: booking.id })
    deleted++
  }

  return NextResponse.json({ deleted })
}
