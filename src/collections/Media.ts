import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  labels: {
    singular: 'Nuotrauka',
    plural: 'Nuotraukos',
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alternatyvus tekstas',
      admin: {
        description: 'Alternatyvus tekstas (privaloma prieinamumui)',
      },
    },
  ],
}
