import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { Service, ClinicSetting } from '../../../../payload-types'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BookingWizard from '@/components/BookingWizard/BookingWizard'
import { SITE_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Registracija vizitui | Baltic Foot',
  description:
    'Užsiregistruokite vizitui Baltic Foot podologijos klinikoje Šiauliuose. Pasirinkite paslaugą ir patogų laiką.',
  alternates: { canonical: `${SITE_URL}/rezervacija/` },
}

type Props = { searchParams: Promise<{ service?: string }> }

export default async function RezervacijaPage({ searchParams }: Props) {
  const { service: serviceSlug } = await searchParams

  const payload = await getPayload({ config: configPromise })

  const [servicesResult, settings] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      sort: 'name',
      limit: 20,
    }),
    payload.findGlobal({ slug: 'clinic-settings' }) as Promise<ClinicSetting>,
  ])

  const services = servicesResult.docs as Service[]
  const openDays = (settings.openDays ?? []) as string[]

  return (
    <>
      <Navigation />
      <main>
        <BookingWizard
          services={services}
          preselectedSlug={serviceSlug ?? null}
          openDays={openDays}
        />
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
