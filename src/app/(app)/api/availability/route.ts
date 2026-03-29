import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getAvailability } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const date = searchParams.get('date') ?? ''
  const service = searchParams.get('service') ?? ''

  if (!date || !service) {
    return NextResponse.json(
      { error: 'date and service query params are required' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await getAvailability(payload, date, service)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[availability] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
