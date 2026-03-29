import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Payload } from 'payload'

export type ParsedAdminRequest =
  | { payload: Payload; userId: number; bookingId: number }
  | { response: NextResponse }

export async function parseAdminRequest(
  request: NextRequest,
  params: Promise<{ id: string }>,
): Promise<ParsedAdminRequest> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { id } = await params
  const bookingId = parseInt(id, 10)
  if (isNaN(bookingId)) {
    return { response: NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 }) }
  }

  const userId = typeof user.id === 'number' ? user.id : parseInt(String(user.id), 10)

  return { payload, userId, bookingId }
}
