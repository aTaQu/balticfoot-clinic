import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getAvailableDates } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const service = searchParams.get('service') ?? ''
  const from = searchParams.get('from') ?? new Date().toISOString().split('T')[0]
  const daysParam = searchParams.get('days')
  const days = daysParam ? parseInt(daysParam, 10) : 120

  if (!service) {
    return NextResponse.json({ error: 'service query param is required' }, { status: 400 })
  }
  if (!Number.isFinite(days) || days < 1 || days > 366) {
    return NextResponse.json({ error: 'days must be between 1 and 366' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await getAvailableDates(payload, from, days, service)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[availability/dates] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
