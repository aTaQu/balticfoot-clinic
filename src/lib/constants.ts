// TODO(Phase 8): Remove SERVICES — still used by BookingWizard only.
// Slugs updated in Phase 5 to match SEO-optimised services in DB.
// Will be replaced when BookingWizard is wired to Payload in Phase 8.
export const SERVICES = [
  {
    id: 'iaugusio-nago-gydymas',
    name: 'Įaugusio nago gydymas',
    description: 'Įaugusio nago gydymas Titano siūlo korekcijos metodu — minimaliai invazyvus, neskausmingas sprendimas be operacijos.',
    icon: 'shield',
    price: '35 €',
    duration: '30 min.',
  },
  {
    id: 'nagu-grybelio-gydymas',
    name: 'Nagų grybelio gydymas',
    description: 'Profesionali nagų grybelio diagnostika ir klinikinės procedūros.',
    icon: 'activity',
    price: '50 €',
    duration: '1 val.',
  },
  {
    id: 'medicininis-pedikiuras',
    name: 'Medicininis pedikiūras',
    description: 'Medicininis pedikiūras specializuotais aparatais. Saugi procedūra, tinkanti ir diabetikams.',
    icon: 'heart',
    price: '40 €',
    duration: '2 val.',
  },
  {
    id: 'nuospaudu-salinimas',
    name: 'Nuospaudų šalinimas',
    description: 'Profesionalus nuospaudų, mozolinių ir kietėjimų šalinimas.',
    icon: 'coffee',
    price: '50 €',
    duration: '1,5 val.',
  },
  {
    id: 'nagu-protezavimas',
    name: 'Nagų protezavimas',
    description: 'Prarastos ar pažeistos nago plokštelės atkūrimas estetinio nagų protezavimo metodu.',
    icon: 'smiley',
    price: '60 €',
    duration: '1 val.',
  },
] as const;

export type ServiceName = (typeof SERVICES)[number]['name'];

export const ALL_SLOTS = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
] as const;

// Hardcoded unavailable slots by day-of-week (1=Mon … 5=Fri)
export const UNAVAIL_BY_DOW: Record<number, string[]> = {
  1: ['9:00', '10:30', '14:00', '16:30'],
  2: ['11:00', '11:30', '13:30', '17:00'],
  3: ['9:30', '12:00', '15:00', '17:30'],
  4: ['10:00', '13:00', '15:30', '16:00'],
  5: ['9:00', '11:00', '14:30', '17:00'],
};

export const LT_MONTHS = [
  'Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė',
  'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis',
];

export const LT_DAYS = [
  'sekmadienis', 'pirmadienis', 'antradienis',
  'trečiadienis', 'ketvirtadienis', 'penktadienis', 'šeštadienis',
];

export function formatDate(d: Date): string {
  return `${d.getDate()} ${LT_MONTHS[d.getMonth()]} ${d.getFullYear()} (${LT_DAYS[d.getDay()]})`;
}
