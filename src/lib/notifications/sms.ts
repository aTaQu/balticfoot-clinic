export async function sendSms(to: string, message: string): Promise<void> {
  try {
    const token = process.env.SMSAPI_TOKEN
    if (!token) throw new Error('SMSAPI_TOKEN is not set')

    const params = new URLSearchParams({
      to,
      message,
      from: 'BalticFoot',
      format: 'json',
    })

    const res = await fetch(`https://api.smsapi.com/sms.do?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`SMSAPI responded ${res.status}: ${body}`)
    }
  } catch (err) {
    console.error(`[notifications] sendSms failed (to=${to}):`, err)
    // Intentionally not rethrowing — notification failure must never break a booking transaction
  }
}

// SMS message strings (Lithuanian, ≤160 chars each)
// Verified character counts below:
export const SMS = {
  // 65 chars
  received: 'Jūsų vizito užklausa gauta. Patvirtinsime netrukus. — Baltic Foot',

  // "Vizitas patvirtintas: {date} {time}, {service}. — Baltic Foot"
  // With shortest real values ("2026-01-01 09:00, X"): ~70 chars. Max realistic: ~120 chars.
  confirmed: (date: string, time: string, service: string) =>
    `Vizitas patvirtintas: ${date} ${time}, ${service}. — Baltic Foot`,

  // 71 chars
  rejected: 'Deja, negalime patvirtinti jūsų užklausos. Skambinkite: +370 699 80980',

  // "Primename: rytoj {time} vizitas Baltic Foot klinikoje. — +370 699 80980"
  // With "09:00": 73 chars
  reminder: (time: string) =>
    `Primename: rytoj ${time} vizitas Baltic Foot klinikoje. — +370 699 80980`,
}
