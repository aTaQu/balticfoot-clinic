import { NextRequest, NextResponse } from 'next/server'
import { parseAdminRequest } from '../../../parseAdminRequest'
import { cancelBooking } from '@/lib/bookingActions'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsed = await parseAdminRequest(request, params)
    if ('response' in parsed) return parsed.response

    const body = await request.json() as Record<string, unknown>
    const cancellationReason = typeof body.cancellationReason === 'string' ? body.cancellationReason : ''

    const result = await cancelBooking(parsed.payload, parsed.bookingId, parsed.userId, cancellationReason)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error('[admin/cancel] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
