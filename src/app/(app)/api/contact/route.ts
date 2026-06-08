export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendEmail } from '@/lib/notifications/email'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Netinkamas užklausos formatas.' }, { status: 400 })
  }

  const { name, phone, email, message } = body as Record<string, string>

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Vardas yra privalomas.' }, { status: 400 })
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Žinutė yra privaloma.' }, { status: 400 })
  }
  if (!phone?.trim() && !email?.trim()) {
    return NextResponse.json({ error: 'Nurodykite bent telefoną arba el. paštą.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'clinic-settings' })

  for (const recipient of settings.notificationEmails) {
    void sendEmail('contact-enquiry-alert', recipient.email, {
      senderName: name.trim(),
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      message: message.trim(),
    })
  }

  return NextResponse.json({ ok: true })
}
