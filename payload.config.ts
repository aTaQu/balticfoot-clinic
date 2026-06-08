import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { lt } from '@payloadcms/translations/languages/lt'
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
    components: {
      afterDashboard: ['@/components/admin/WeekSchedule#WeekScheduleAfterDashboard'],
    },
  },
  i18n: {
    supportedLanguages: { lt },
    fallbackLanguage: 'lt',
  },
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
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
          email: 'veneta@podologija-siauliai.lt',
          password: process.env.SEED_VENETA_PASSWORD || 'ChangeMe123!',
          role: 'admin',
        },
      })
      await payload.create({
        collection: 'users',
        data: {
          name: 'Lina',
          email: 'lina@podologija-siauliai.lt',
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
          email: 'info@podologija-siauliai.lt',
          address: 'Šiauliai, Lietuva',
          workingHoursStart: '09:00',
          workingHoursEnd: '18:00',
          slotIntervalMinutes: '30',
          openDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          notificationEmails: [
            { email: 'veneta@podologija-siauliai.lt' },
            { email: 'lina@podologija-siauliai.lt' },
          ],
        },
      })
      payload.logger.info('Seeded ClinicSettings')
    } else if (!settings.notificationEmails || settings.notificationEmails.length === 0) {
      // Backfill notificationEmails on existing ClinicSettings rows so the new
      // required field isn't empty after deploy.
      await payload.updateGlobal({
        slug: 'clinic-settings',
        data: {
          notificationEmails: [
            { email: 'veneta@podologija-siauliai.lt' },
            { email: 'lina@podologija-siauliai.lt' },
          ],
        },
      })
      payload.logger.info('Backfilled ClinicSettings.notificationEmails')
    }

    // ── Seed Services ─────────────────────────────────────────────────────────
    // Mirrors Veneta's price list (services-catalog.ts). Upsert-by-slug:
    // creates missing entries, updates name/price/duration/icon/shortDescription
    // on existing ones so the catalog remains the source of truth.
    // Long `description` is left to admin editing — only set on create.
    const servicesData = [
      // Veneta-only — kept in DB so /paslaugos/[slug] pages render.
      {
        name: 'Įaugusio nago korekcija',
        slug: 'iaugusio-nago-gydymas',
        price: 50,
        duration: 30,
        description:
          'Įaugusio nago gydymas Titano siūlo korekcijos metodu — minimaliai invazyvus, neskausmingas sprendimas be operacijos. Procedūra trunka apie 30 minučių, taikoma vienam nagui.',
        shortDescription: 'Įaugusio nago korekcija Titano siūlu be operacijos.',
        icon: 'shield',
        active: true,
      },
      {
        name: 'Nago protezavimas',
        slug: 'nagu-protezavimas',
        price: 40,
        duration: 60,
        description:
          'Prarastos ar pažeistos nago plokštelės atkūrimas estetinio nagų protezavimo metodu. Rezultatas — natūraliai atrodantis nagas, kuris apsaugo pirštą ir leidžia normaliai gyventi.',
        shortDescription: 'Pažeisto nago plokštelės atkūrimas.',
        icon: 'smiley',
        active: true,
      },
      // Bookable (Lina available — appear in widget).
      {
        name: 'Pirminė podologo konsultacija',
        slug: 'konsultacija',
        price: 35,
        duration: 30,
        shortDescription:
          'Pėdų ir nagų būklės įvertinimas, individualios priežiūros plano sudarymas.',
        icon: 'heart',
        active: true,
      },
      {
        name: 'Prioritetinis vizitas esant skausmui',
        slug: 'skubioji-pagalba',
        price: 60,
        duration: 30,
        shortDescription: 'Greitas priėmimas esant ūmiam pėdų ar nagų skausmui.',
        icon: 'activity',
        active: true,
      },
      {
        name: 'Higieninė pėdų priežiūra',
        slug: 'higienine-pedu-prieziura',
        price: 50,
        duration: 60,
        shortDescription:
          'Saugus aparatinis pedikiūras su odos šveitimu (skirta sveikų pėdų profilaktikai).',
        icon: 'smiley',
        active: true,
      },
      {
        name: 'Probleminių pėdų priežiūra',
        slug: 'medicininis-pedikiuras',
        price: 70,
        duration: 120,
        description:
          'Medicininis pedikiūras (dar vadinamas gydomuoju pedikiūru) — profesionali pėdų priežiūra specializuotais aparatais. Procedūra saugi ir tinkama diabetikams, vyresnio amžiaus pacientams bei visiems, kuriems rūpi pėdų sveikata Šiauliuose.',
        shortDescription: 'Gydomasis pedikiūras specializuotais aparatais.',
        icon: 'heart',
        active: true,
      },
      {
        name: 'Grybelio pažeistos odos valdymas',
        slug: 'grybelio-odos-valdymas',
        price: 50,
        duration: 60,
        icon: 'activity',
        active: true,
      },
      {
        name: 'Įtrūkusių kulnų priežiūra',
        slug: 'itrukusiu-kulnu-prieziura',
        price: 50,
        duration: 60,
        icon: 'coffee',
        active: true,
      },
      {
        name: 'Hiperkeratozės priežiūra',
        slug: 'hiperkeratozes-prieziura',
        price: 70,
        duration: 60,
        icon: 'shield',
        active: true,
      },
      {
        name: 'Nuospaudų šalinimas',
        slug: 'nuospaudu-salinimas',
        price: 40,
        duration: 90,
        description:
          'Profesionalus nuospaudų, mozolinių ir kietėjimų šalinimas Šiauliuose. Nustatome ir šaliname pėdų problemų priežastis, o ne vien simptomus — taip pasiekiamas ilgalaikis rezultatas.',
        shortDescription: 'Nuospaudų ir kietėjimų šalinimas.',
        icon: 'coffee',
        active: true,
      },
      {
        name: 'Karpų priežiūra',
        slug: 'karpu-prieziura',
        price: 40,
        duration: 60,
        icon: 'shield',
        active: true,
      },
      {
        name: 'Hiperhidrozės valdymas',
        slug: 'hiperhidrozes-valdymas',
        price: 50,
        duration: 60,
        icon: 'activity',
        active: true,
      },
      {
        name: 'Tvarstymas ir iškrovos kompensacijos',
        slug: 'tvarstymas-iskrovos-kompensacijos',
        price: 20,
        duration: 30,
        icon: 'heart',
        active: true,
      },
      {
        name: 'Kitos odos būklės',
        slug: 'kitos-odos-bukles',
        price: 50,
        duration: 60,
        icon: 'activity',
        active: true,
      },
      {
        name: 'Grybelio pažeistų nagų valdymas',
        slug: 'nagu-grybelio-gydymas',
        price: 60,
        duration: 60,
        description:
          'Profesionali nagų grybelio diagnostika ir klinikinės procedūros Šiauliuose. Kai vaistinės priemonės nebepadeda — specialisto pagalba yra efektyviausia. Gydome nagų grybelį saugiai ir efektyviai specializuotomis priemonėmis.',
        shortDescription: 'Profesionalus nagų grybelio gydymas klinikoje.',
        icon: 'activity',
        active: true,
      },
      {
        name: 'Sustorėjusių nagų valdymas',
        slug: 'sustorejusiu-nagu-valdymas',
        price: 50,
        duration: 60,
        shortDescription: 'Onichogrifozės korekcija (1 nagas).',
        icon: 'shield',
        active: true,
      },
      {
        name: 'Tvarstymas ir tamponavimas',
        slug: 'tvarstymas-tamponavimas',
        price: 20,
        duration: 30,
        icon: 'heart',
        active: true,
      },
      {
        name: 'Kitos nagų būklės',
        slug: 'kitos-nagu-bukles',
        price: 50,
        duration: 60,
        icon: 'activity',
        active: true,
      },
      {
        name: 'Higieninis manikiūras su odos šveitimu',
        slug: 'higieninis-manikiuras',
        price: 25,
        duration: 30,
        icon: 'smiley',
        active: true,
      },
      {
        name: 'Probleminių rankų procedūra',
        slug: 'probleminiu-ranku-procedura',
        price: 40,
        duration: 60,
        icon: 'heart',
        active: true,
      },
    ]

    let created = 0
    let updated = 0
    for (const service of servicesData) {
      const existing = await payload.find({
        collection: 'services',
        where: { slug: { equals: service.slug } },
        limit: 1,
      })
      if (existing.totalDocs === 0) {
        await payload.create({ collection: 'services', data: service })
        created++
      } else {
        // Don't overwrite admin-edited long description if we don't have one.
        const { description, ...catalogFields } = service
        const data = description ? service : catalogFields
        await payload.update({
          collection: 'services',
          id: existing.docs[0].id,
          data,
        })
        updated++
      }
    }
    payload.logger.info(`Services synced: ${created} created, ${updated} updated`)
  },
})

export default configPromise
