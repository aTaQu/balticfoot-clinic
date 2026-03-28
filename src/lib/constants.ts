// TODO(Phase 8): Remove SERVICES — no longer used by Services component (Phase 4 done).
// Still used by BookingWizard; will be replaced when BookingWizard is wired to Payload in Phase 8.
export const SERVICES = [
  {
    id: 'aparatinis-pedikyuras',
    name: 'Saugus aparatinis pedikiūras',
    description: 'Profesionalus nagų ir odos priežiūra specializuotais aparatais. Saugi ir higieninė procedūra kiekvienam.',
    icon: 'smiley',
    price: '40 €',
    duration: '2 val.',
  },
  {
    id: 'higieninis-pedikyuras',
    name: 'Higieninis pedikiūras',
    description: 'Pėdų valymas, minkštinimas ir priežiūra — procedūra sveikoms ir gražioms pėdoms.',
    icon: 'heart',
    price: '40 €',
    duration: '2 val.',
  },
  {
    id: 'probleminiu-pedu-procedura',
    name: 'Probleminių pėdų procedūra',
    description: 'Nuospaudų, kietėjimų, įtrūkimų ir kitų pėdų problemų sprendimas.',
    icon: 'coffee',
    price: '50–80 €',
    duration: '2,5 val.',
  },
  {
    id: 'nagų-korekcija',
    name: 'Įaugusio nago korekcija Titano Siūlu',
    description: 'Minimaliai invazyvus metodas įaugusio nago problemai spręsti — be operacijos (1 nagui).',
    icon: 'shield',
    price: '35 €',
    duration: '0,5 val.',
  },
  {
    id: 'konsultacija',
    name: 'Konsultacija',
    description: 'Individualus pėdų būklės įvertinimas su rekomendacijomis ir gydymo planu.',
    icon: 'activity',
    price: '10 €',
    duration: '0,5 val.',
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
