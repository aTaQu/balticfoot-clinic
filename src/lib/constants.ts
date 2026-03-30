// Site URL — used for canonical URLs and Open Graph
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.balticfoot.lt'

// Date and calendar helpers — used by BookingWizard

export const LT_MONTHS = [
  'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė',
  'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis',
]

export const LT_DAYS = [
  'sekmadienis', 'pirmadienis', 'antradienis',
  'trečiadienis', 'ketvirtadienis', 'penktadienis', 'šeštadienis',
]

export function formatDate(d: Date): string {
  return `${d.getDate()} ${LT_MONTHS[d.getMonth()]} ${d.getFullYear()} (${LT_DAYS[d.getDay()]})`
}
