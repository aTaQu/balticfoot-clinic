import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Services } from './src/collections/Services'
import { BlogPosts } from './src/collections/BlogPosts'
import { Bookings } from './src/collections/Bookings'
import { BlockedSlots } from './src/collections/BlockedSlots'
import { AuditLog } from './src/collections/AuditLog'
import { ClinicSettings } from './src/globals/ClinicSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const configPromise = buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Services, BlogPosts, Bookings, BlockedSlots, AuditLog],
  globals: [ClinicSettings],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5_000_000, // 5 MB
    },
  },
  onInit: async (payload) => {
    // ── Seed admin users ──────────────────────────────────────────────────────
    const existingUsers = await payload.find({ collection: 'users', limit: 1 })
    if (existingUsers.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: 'Veneta Liaudanskienė',
          email: 'veneta@balticfoot.lt',
          password: process.env.SEED_VENETA_PASSWORD || 'ChangeMe123!',
          role: 'admin',
        },
      })
      await payload.create({
        collection: 'users',
        data: {
          name: 'Lina',
          email: 'lina@balticfoot.lt',
          password: process.env.SEED_LINA_PASSWORD || 'ChangeMe123!',
          role: 'admin',
        },
      })
      payload.logger.info('Seeded admin users: Veneta & Lina')
    }

    // ── Seed ClinicSettings ───────────────────────────────────────────────────
    const settings = await payload.findGlobal({ slug: 'clinic-settings' })
    if (!settings.clinicName) {
      await payload.updateGlobal({
        slug: 'clinic-settings',
        data: {
          clinicName: 'Baltic Foot',
          phone: '+370 699 80980',
          email: 'info@balticfoot.lt',
          address: 'Šiauliai, Lietuva',
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          slotIntervalMinutes: '30',
          openDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
      })
      payload.logger.info('Seeded ClinicSettings')
    }

    // ── Seed Services ─────────────────────────────────────────────────────────
    const existingServices = await payload.find({ collection: 'services', limit: 1 })
    if (existingServices.totalDocs === 0) {
      const servicesData = [
        {
          name: 'Saugus aparatinis pedikiūras',
          slug: 'aparatinis-pedikyuras',
          price: 40,
          duration: 120,
          description:
            'Profesionalus nagų ir odos priežiūra specializuotais aparatais. Saugi ir higieninė procedūra kiekvienam.',
          icon: 'smiley',
          active: true,
        },
        {
          name: 'Higieninis pedikiūras',
          slug: 'higieninis-pedikyuras',
          price: 40,
          duration: 120,
          description:
            'Pėdų valymas, minkštinimas ir priežiūra — procedūra sveikoms ir gražioms pėdoms.',
          icon: 'heart',
          active: true,
        },
        {
          name: 'Probleminių pėdų procedūra',
          slug: 'probleminiu-pedu-procedura',
          price: 50,
          duration: 150,
          description:
            'Nuospaudų, kietėjimų, įtrūkimų ir kitų pėdų problemų sprendimas.',
          icon: 'coffee',
          active: true,
        },
        {
          name: 'Įaugusio nago korekcija Titano Siūlu',
          slug: 'nagu-korekcija',
          price: 35,
          duration: 30,
          description:
            'Minimaliai invazyvus metodas įaugusio nago problemai spręsti — be operacijos (1 nagui).',
          icon: 'shield',
          active: true,
        },
        {
          name: 'Konsultacija',
          slug: 'konsultacija',
          price: 10,
          duration: 30,
          description:
            'Individualus pėdų būklės įvertinimas su rekomendacijomis ir gydymo planu.',
          icon: 'activity',
          active: true,
        },
      ]

      for (const service of servicesData) {
        await payload.create({ collection: 'services', data: service })
      }
      payload.logger.info('Seeded 5 services')
    }
  },
})

export default configPromise
