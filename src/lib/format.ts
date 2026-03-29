const MONTHS_GEN = [
  'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės',
  'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio',
]

// "2026-04-15" or "2026-04-15T10:00:00.000Z" → "2026 m. balandžio 15 d."
export function formatDateLT(isoDate: string): string {
  const datePart = isoDate.split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  const month = MONTHS_GEN[m - 1] ?? datePart
  return `${y} m. ${month} ${d} d.`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min.`
  const h = minutes / 60
  const hStr = Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',')
  return `${hStr} val.`
}
