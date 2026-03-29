export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min.`
  const h = minutes / 60
  const hStr = Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',')
  return `${hStr} val.`
}
