export async function sendSms(to: string, message: string): Promise<void> {
  try {
    const token = process.env.SMSAPI_TOKEN
    if (!token) throw new Error('SMSAPI_TOKEN is not set')

    const body = new URLSearchParams({
      to,
      message,
      from: 'BalticFoot',
      format: 'json',
    })

    const res = await fetch('https://api.smsapi.com/sms.do', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SMSAPI responded ${res.status}: ${text}`)
    }
  } catch (err) {
    // Intentionally not rethrowing — notification failure must never break a booking transaction
    console.error(`[notifications] sendSms failed (to=${to}):`, err)
  }
}

export const SMS = {
  received: 'Jūsų vizito užklausa gauta. Patvirtinsime netrukus. — Baltic Foot',

  confirmed: (date: string, time: string, service: string) =>
    `Vizitas patvirtintas: ${date} ${time}, ${service}. — Baltic Foot`,

  rejected: 'Deja, negalime patvirtinti jūsų užklausos. Skambinkite: +370 699 80980',

  reminder: (time: string) =>
    `Primename: rytoj ${time} vizitas Baltic Foot klinikoje. — +370 699 80980`,
}
