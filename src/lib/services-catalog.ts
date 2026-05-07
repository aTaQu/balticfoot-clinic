// Editorial source of truth for the public service catalogue and price list.
// Mirrors Veneta's price list (the client-supplied document). Bookable items
// (Lina) live additionally as Payload `services` records — the BookingWizard
// reads from Payload, while public marketing pages read from this catalogue.

export const VENETA_PHONE = '+370 6 998 0980'

export const PRICING_NOTE =
  'Kainos taikomos atsižvelgiant į būklės sudėtingumą ir progresą.'

export type Specialist = 'veneta' | 'lina'

export type Price =
  | { kind: 'single'; text: string }
  | { kind: 'perSpecialist'; veneta: string; lina: string }

export interface ServiceItem {
  name: string
  price: Price
  venetaOnly: boolean
  /** Set when a dedicated /paslaugos/[slug] page exists for this item. */
  slug?: string
  /** One-liner for service cards. */
  shortDescription?: string
}

export interface ServiceCategory {
  /** Section heading (e.g. "Pėdų priežiūra"). */
  label: string
  /** Optional intro paragraph rendered above the items. */
  intro?: string
  items: ServiceItem[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    label: 'Konsultacijos',
    items: [
      {
        name: 'Pirminė podologo konsultacija be procedūros',
        price: { kind: 'single', text: '35 €' },
        venetaOnly: false,
        shortDescription:
          'Pėdų ir nagų būklės įvertinimas, individualios priežiūros plano sudarymas.',
      },
    ],
  },
  {
    label: 'Skubioji pagalba',
    items: [
      {
        name: 'Prioritetinis vizitas esant skausmui',
        price: { kind: 'single', text: 'nuo 60 €' },
        venetaOnly: false,
        shortDescription:
          'Greitas priėmimas esant ūmiam pėdų ar nagų skausmui.',
      },
    ],
  },
  {
    label: 'Atvykimas į namus',
    items: [
      {
        name: 'Vizitas į namus esant įvairioms būklėms',
        price: { kind: 'single', text: 'nuo 150 €' },
        venetaOnly: true,
        shortDescription:
          'Profesionali pėdų priežiūra Jūsų namuose, kai apsilankymas klinikoje yra apsunkintas.',
      },
    ],
  },
  {
    label: 'Pėdų priežiūra',
    intro:
      'Individualiai pritaikyta procedūra esant įvairioms pėdų būklėms: nuospaudoms, įtrūkimams, pažeistiems nagams, skausmingoms odos problemoms ar padidėjusiam suragėjimui. Procedūros apimtis ir kaina priklauso nuo būklės sudėtingumo.',
    items: [
      {
        name: 'Higieninė pėdų priežiūra',
        price: { kind: 'perSpecialist', veneta: '70 €', lina: '50 €' },
        venetaOnly: false,
        shortDescription:
          'Saugus aparatinis pedikiūras su odos šveitimu (skirta sveikų pėdų profilaktikai).',
      },
      {
        name: 'Probleminių pėdų priežiūra',
        price: { kind: 'single', text: '70–120 €' },
        venetaOnly: false,
        slug: 'medicininis-pedikiuras',
        shortDescription:
          'Pilna probleminių pėdų procedūra esant įvairioms būklėms.',
      },
    ],
  },
  {
    label: 'Lokali probleminės odos priežiūra',
    intro:
      'Profesionali pėdų odos priežiūra, pritaikyta įvairioms odos būklėms. Atliekama suragėjusios, pažeistos ar įtrūkusios odos korekcija, siekiant pagerinti odos būklę ir sumažinti diskomfortą.',
    items: [
      {
        name: 'Grybelio pažeistos odos valdymas',
        price: { kind: 'single', text: '50–100 €' },
        venetaOnly: false,
      },
      {
        name: 'Įtrūkusių kulnų priežiūra',
        price: { kind: 'single', text: '50–100 €' },
        venetaOnly: false,
      },
      {
        name: 'Hiperkeratozės (suragėjusio odos sluoksnio) priežiūra',
        price: { kind: 'single', text: '70–100 €' },
        venetaOnly: false,
      },
      {
        name: 'Nuospaudų šalinimas',
        price: { kind: 'single', text: 'nuo 40 €' },
        venetaOnly: false,
        slug: 'nuospaudu-salinimas',
      },
      {
        name: 'Karpų priežiūra',
        price: { kind: 'single', text: 'nuo 40 €' },
        venetaOnly: false,
      },
      {
        name: 'Hiperhidrozės (padidėjusio prakaitavimo) valdymas',
        price: { kind: 'single', text: 'nuo 50 €' },
        venetaOnly: false,
      },
      {
        name: 'Tvarstymas ir iškrovos kompensacijos (pakartotinai)',
        price: { kind: 'single', text: 'nuo 20 €' },
        venetaOnly: false,
      },
      {
        name: 'Kitos odos būklės',
        price: { kind: 'single', text: 'nuo 50 €' },
        venetaOnly: false,
      },
    ],
  },
  {
    label: 'Lokali probleminių nagų priežiūra',
    intro:
      'Individualiai pritaikytos procedūros įvairioms nagų būklėms prižiūrėti ir koreguoti. Atliekama pažeistų, sustorėjusių, įaugusių ar traumuotų nagų priežiūra, siekiant sumažinti diskomfortą, pagerinti nagų būklę ir atkurti estetinį vaizdą.',
    items: [
      {
        name: 'Grybelio pažeistų nagų valdymas',
        price: { kind: 'single', text: 'nuo 60 €' },
        venetaOnly: false,
        slug: 'nagu-grybelio-gydymas',
      },
      {
        name: 'Sustorėjusių nagų valdymas (onichogrifozė)',
        price: { kind: 'single', text: 'nuo 50 € / 1 nagas' },
        venetaOnly: false,
      },
      {
        name: 'Įaugusio nago korekcija',
        price: { kind: 'single', text: 'nuo 50 € / 1 nagas' },
        venetaOnly: true,
        slug: 'iaugusio-nago-gydymas',
      },
      {
        name: 'Traumuoto nago korekcija',
        price: { kind: 'single', text: 'nuo 50 € / 1 nagas' },
        venetaOnly: true,
      },
      {
        name: 'Korekcinės nagų sistemos',
        price: { kind: 'single', text: 'nuo 40 € / 1 nagas' },
        venetaOnly: true,
      },
      {
        name: 'Tvarstymas ir tamponavimas (pakartotinai)',
        price: { kind: 'single', text: 'nuo 20 €' },
        venetaOnly: false,
      },
      {
        name: 'Nago protezavimas',
        price: { kind: 'single', text: 'nuo 40 €' },
        venetaOnly: true,
        slug: 'nagu-protezavimas',
      },
      {
        name: 'Kitos nagų būklės',
        price: { kind: 'single', text: 'nuo 50 €' },
        venetaOnly: false,
      },
    ],
  },
  {
    label: 'Rankų priežiūra',
    intro:
      'Profesionali rankų priežiūra, orientuota į rankų odos ir nagų būklės palaikymą. Atliekamos higieninės arba individualiai pritaikytos procedūros, siekiant užtikrinti tvarkingą išvaizdą, komfortą arba reikalingą priežiūrą.',
    items: [
      {
        name: 'Higieninis manikiūras su odos šveitimu',
        price: { kind: 'single', text: '25 €' },
        venetaOnly: false,
      },
      {
        name: 'Probleminių rankų procedūra',
        price: { kind: 'single', text: 'nuo 40 €' },
        venetaOnly: false,
      },
    ],
  },
]

/** Flat list of all items, useful for lookups by slug. */
export const ALL_SERVICE_ITEMS: ServiceItem[] = SERVICE_CATEGORIES.flatMap(
  (c) => c.items,
)

export function findServiceBySlug(slug: string): ServiceItem | undefined {
  return ALL_SERVICE_ITEMS.find((i) => i.slug === slug)
}

export function formatPrice(price: Price): string {
  if (price.kind === 'single') return price.text
  return `Pas Venetą – ${price.veneta} / Pas Liną – ${price.lina}`
}
