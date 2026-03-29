import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { Service, ClinicSetting } from '../../../../../payload-types'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'
import styles from './ServicePage.module.css'
import { formatDuration } from '@/lib/format'

export const dynamic = 'force-dynamic'

// SEO metadata from keyword brief — static per slug, not stored in Payload
const SEO: Record<string, { title: string; description: string; h1: string }> = {
  'iaugusio-nago-gydymas': {
    title: 'Įaugusio nago gydymas Šiauliuose | Baltic Foot',
    description:
      'Profesionalus įaugusio nago gydymas Šiauliuose be operacijos. Titano siūlo korekcija — greitas, neskausmingas sprendimas. Registruokitės internetu.',
    h1: 'Įaugusio nago gydymas Šiauliuose',
  },
  'nagu-grybelio-gydymas': {
    title: 'Nagų grybelio gydymas Šiauliuose | Baltic Foot',
    description:
      'Nagų grybelio gydymas Šiauliuose — klinikinė diagnostika ir profesionalios procedūros. Efektyviau nei vaistinės priemonės. Registruokitės.',
    h1: 'Nagų grybelio gydymas Šiauliuose',
  },
  'medicininis-pedikiuras': {
    title: 'Medicininis pedikiūras Šiauliuose | Baltic Foot',
    description:
      'Medicininis ir gydomasis pedikiūras Šiauliuose specializuotais aparatais. Saugi procedūra, tinkanti ir diabetikams. Kaina nuo 40 €.',
    h1: 'Medicininis pedikiūras Šiauliuose',
  },
  'nuospaudu-salinimas': {
    title: 'Nuospaudų šalinimas Šiauliuose | Baltic Foot',
    description:
      'Profesionalus nuospaudų ir mozolinių šalinimas Šiauliuose. Sprendžiame pėdų problemų priežastį, ne tik simptomus. Registruokitės.',
    h1: 'Nuospaudų šalinimas Šiauliuose',
  },
  'nagu-protezavimas': {
    title: 'Nagų protezavimas Šiauliuose | Baltic Foot',
    description:
      'Nagų protezavimas Šiauliuose — pažeistos ar prarastos nago plokštelės atkūrimas. Natūraliai atrodantis rezultatas. Registruokitės.',
    h1: 'Nagų protezavimas Šiauliuose',
  },
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meta = SEO[slug]
  if (!meta) return {}
  return { title: meta.title, description: meta.description }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })

  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { slug: { equals: slug }, active: { equals: true } },
      limit: 1,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }) as Promise<ClinicSetting>,
  ])

  const service = result.docs[0] as Service | undefined
  if (!service) notFound()

  const meta = SEO[slug]
  const h1 = meta?.h1 ?? `${service.name} Šiauliuose`
  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <a href="/#paslaugos">Paslaugos</a>
              <span aria-hidden="true">›</span>
              <span>{service.name}</span>
            </nav>
            <div className="section-label">{settings.clinicName} · Šiauliai</div>
            <h1 className={styles.h1}>{h1}</h1>
            {service.shortDescription && (
              <p className={styles.lead}>{service.shortDescription}</p>
            )}
          </div>
        </section>

        <section className={styles.details}>
          <div className="container">
            <div className={styles.grid}>
              <div className={styles.description}>
                <p>{service.description}</p>
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.card}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Kaina</span>
                    <span className={styles.cardValue}>{service.price} €</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Trukmė</span>
                    <span className={styles.cardValue}>{formatDuration(service.duration)}</span>
                  </div>
                  <Link
                    href={`/rezervacija?service=${service.slug}`}
                    className={`btn btn-primary ${styles.cta}`}
                  >
                    Registruotis vizitui
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        workingHoursStart={settings.workingHoursStart}
        workingHoursEnd={settings.workingHoursEnd}
        openDays={openDays}
      />
    </>
  )
}
