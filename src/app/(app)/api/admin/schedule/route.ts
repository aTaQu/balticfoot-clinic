import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getSchedule } from '@/lib/schedule'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const from = searchParams.get('from')
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return NextResponse.json({ error: 'Missing or invalid "from" param (YYYY-MM-DD required)' }, { status: 400 })
    }

    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam, 10) : 7
    if (isNaN(days) || days < 1 || days > 14) {
      return NextResponse.json({ error: '"days" must be between 1 and 14' }, { status: 400 })
    }

    const result = await getSchedule(payload, from, days)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error('[admin/schedule] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
