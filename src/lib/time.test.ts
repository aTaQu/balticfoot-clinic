import { describe, it, expect } from 'vitest'
import { parseTimeToMinutes } from './time'

describe('parseTimeToMinutes', () => {
  it('parses HH:MM', () => {
    expect(parseTimeToMinutes('17:00')).toBe(1020)
    expect(parseTimeToMinutes('09:30')).toBe(570)
  })

  it('parses dot and comma separators', () => {
    expect(parseTimeToMinutes('17.00')).toBe(1020)
    expect(parseTimeToMinutes('11,30')).toBe(690)
  })

  it('parses hours-only and compact forms', () => {
    expect(parseTimeToMinutes('13')).toBe(780)
    expect(parseTimeToMinutes('1700')).toBe(1020)
  })

  it('trims surrounding whitespace', () => {
    expect(parseTimeToMinutes('  9:00 ')).toBe(540)
  })

  it('returns null for unparseable or out-of-range input', () => {
    expect(parseTimeToMinutes('rytas')).toBeNull()
    expect(parseTimeToMinutes('25:00')).toBeNull()
    expect(parseTimeToMinutes('12:99')).toBeNull()
    expect(parseTimeToMinutes('')).toBeNull()
  })
})
