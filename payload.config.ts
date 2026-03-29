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
      // active: true is required by Payload's generated types (required field),
      // even though the schema has defaultValue: true — defaults are runtime-only.
      const servicesData = [
        {
          name: 'Įaugusio nago gydymas',
          slug: 'iaugusio-nago-gydymas',
          price: 35,
          duration: 30,
          description:
            'Įaugusio nago gydymas Titano siūlo korekcijos metodu — minimaliai invazyvus, neskausmingas sprendimas be operacijos. Procedūra trunka apie 30 minučių, taikoma vienam nagui.',
          shortDescription: 'Įaugusio nago korekcija Titano siūlu be operacijos.',
          icon: 'shield',
          active: true,
        },
        {
          name: 'Nagų grybelio gydymas',
          slug: 'nagu-grybelio-gydymas',
          price: 50,
          duration: 60,
          description:
            'Profesionali nagų grybelio diagnostika ir klinikinės procedūros Šiauliuose. Kai vaistinės priemonės nebepadeda — specialisto pagalba yra efektyviausia. Gydome nagų grybelį saugiai ir efektyviai specializuotomis priemonėmis.',
          shortDescription: 'Profesionalus nagų grybelio gydymas klinikoje.',
          icon: 'activity',
          active: true,
        },
        {
          name: 'Medicininis pedikiūras',
          slug: 'medicininis-pedikiuras',
          price: 40,
          duration: 120,
          description:
            'Medicininis pedikiūras (dar vadinamas gydomuoju pedikiūru) — profesionali pėdų priežiūra specializuotais aparatais. Procedūra saugi ir tinkama diabetikams, vyresnio amžiaus pacientams bei visiems, kuriems rūpi pėdų sveikata Šiauliuose.',
          shortDescription: 'Gydomasis pedikiūras specializuotais aparatais.',
          icon: 'heart',
          active: true,
        },
        {
          name: 'Nuospaudų šalinimas',
          slug: 'nuospaudu-salinimas',
          price: 50,
          duration: 90,
          description:
            'Profesionalus nuospaudų, mozolinių ir kietėjimų šalinimas Šiauliuose. Nustatome ir šaliname pėdų problemų priežastis, o ne vien simptomus — taip pasiekiamas ilgalaikis rezultatas.',
          shortDescription: 'Nuospaudų ir kietėjimų šalinimas.',
          icon: 'coffee',
          active: true,
        },
        {
          name: 'Nagų protezavimas',
          slug: 'nagu-protezavimas',
          price: 60,
          duration: 60,
          description:
            'Prarastos ar pažeistos nago plokštelės atkūrimas estetinio nagų protezavimo metodu. Rezultatas — natūraliai atrodantis nagas, kuris apsaugo pirštą ir leidžia normaliai gyventi.',
          shortDescription: 'Pažeisto nago plokštelės atkūrimas.',
          icon: 'smiley',
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
