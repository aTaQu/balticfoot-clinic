/**
 * Parse a user-entered clock time to minutes since midnight, tolerant of the
 * formats people actually type for availability windows: "17:00", "17.00",
 * "17,00", "17" (hours only), "1700" (compact). Returns null for anything
 * unparseable or out of range (hours > 23 / minutes > 59).
 */
export function parseTimeToMinutes(time: string): number | null {
  const t = (time ?? '').trim()
  let h: number
  let min: number
  let m = t.match(/^(\d{1,2})[:.,](\d{1,2})$/) // 17:00 / 17.00 / 17,00
  if (m) {
    h = parseInt(m[1], 10)
    min = parseInt(m[2], 10)
  } else if ((m = t.match(/^(\d{1,2})$/))) {
    // 13 → 13:00
    h = parseInt(m[1], 10)
    min = 0
  } else if ((m = t.match(/^(\d{1,2})(\d{2})$/))) {
    // 1700 → 17:00
    h = parseInt(m[1], 10)
    min = parseInt(m[2], 10)
  } else {
    return null
  }
  if (h > 23 || min > 59) return null
  return h * 60 + min
}
