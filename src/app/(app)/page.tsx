export const dynamic = 'force-dynamic'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import type { Service, ClinicSetting } from '../../../payload-types'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Trust from '@/components/Trust'
import Quote from '@/components/Quote'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import BookingWizard from '@/components/BookingWizard/BookingWizard'
import Footer from '@/components/Footer'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/` },
}

const DAY_SCHEMA: Record<string, string> = {
  monday: 'Mo', tuesday: 'Tu', wednesday: 'We',
  thursday: 'Th', friday: 'Fr', saturday: 'Sa',
}

const DAY_LONG_LT: Record<string, string> = {
  monday: 'Pirmadienis', tuesday: 'Antradienis', wednesday: 'Trečiadienis',
  thursday: 'Ketvirtadienis', friday: 'Penktadienis', saturday: 'Šeštadienis',
}

export default async function Home() {
  const payload = await getPayload({ config: configPromise })

  const [servicesResult, settings] = await Promise.all([
    payload.find({
      collection: 'services',
      where: { active: { equals: true } },
      limit: 20,
      sort: 'name',
    }),
    payload.findGlobal({ slug: 'clinic-settings' }) as Promise<ClinicSetting>,
  ])

  const services = servicesResult.docs as Service[]
  const openDays = settings.openDays ?? []

  // schema.org openingHours: ["Mo 09:00-18:00", "Tu 09:00-18:00", ...]
  const openingHours = openDays.map(
    (d) => `${DAY_SCHEMA[d] ?? d} ${settings.workingHoursStart}-${settings.workingHoursEnd}`,
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: settings.clinicName,
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
    },
    openingHours,
  }

  // Pre-format hours label for Contact (client component)
  const firstDay = DAY_LONG_LT[openDays[0]] ?? openDays[0] ?? ''
  const lastDay = DAY_LONG_LT[openDays[openDays.length - 1]] ?? openDays[openDays.length - 1] ?? ''
  const daysLabel = openDays.length > 1 ? `${firstDay}–${lastDay}` : firstDay
  const hoursDisplay = `${daysLabel}\n${settings.workingHoursStart}–${settings.workingHoursEnd}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollRevealInit />
      <Navigation />
      <main>
        <Hero phone={settings.phone} />
        <Services services={services} />
        <Trust />
        <About phone={settings.phone} />
        <Testimonials />
        <Gallery />
        <Quote />
        <BookingWizard services={services} openDays={openDays as string[]} />
        <Contact
          phone={settings.phone}
          email={settings.email}
          address={settings.address}
          hoursDisplay={hoursDisplay}
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
