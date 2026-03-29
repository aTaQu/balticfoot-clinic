import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { Service, ClinicSetting } from '../../../../payload-types'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import styles from './Rezervacija.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Registracija vizitui | Baltic Foot',
  description:
    'Užsiregistruokite vizitui Baltic Foot podologijos klinikoje Šiauliuose. Pasirinkite paslaugą ir patogų laiką.',
}

type Props = { searchParams: Promise<{ service?: string }> }

export default async function RezervacijaPage({ searchParams }: Props) {
  const { service: serviceSlug } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [selectedResult, settings] = await Promise.all([
    serviceSlug
      ? payload.find({
          collection: 'services',
          where: { slug: { equals: serviceSlug }, active: { equals: true } },
          limit: 1,
        })
      : Promise.resolve({ docs: [] as Service[] }),
    payload.findGlobal({ slug: 'clinic-settings' }) as Promise<ClinicSetting>,
  ])

  const selectedService = selectedResult.docs[0] as Service | undefined
  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className="section-label">Baltic Foot · Šiauliai</div>
            <h1 className={styles.h1}>Registracija vizitui</h1>

            {selectedService && (
              <div className={styles.selectedService}>
                <span className={styles.selectedLabel}>Pasirinkta paslauga</span>
                <span className={styles.selectedName}>{selectedService.name}</span>
              </div>
            )}
          </div>
        </section>

        <section className={styles.placeholder}>
          <div className="container">
            <div className={styles.placeholderBox}>
              <p className={styles.placeholderText}>
                Registracijos forma bus prieinama netrukus.
              </p>
              <a href={`tel:${settings.phone}`} className="btn btn-primary">
                Skambinkite: {settings.phone}
              </a>
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
