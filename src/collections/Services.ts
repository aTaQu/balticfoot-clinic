import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Paslauga',
    plural: 'Paslaugos',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'duration', 'active'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Pavadinimas',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL fragmentas',
      admin: {
        description: 'URL fragmentas, pvz. aparatinis-pedikiuras',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Kaina',
      admin: {
        description: 'Kaina (EUR)',
      },
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      label: 'Trukmė',
      admin: {
        description: 'Trukmė (minutėmis)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Aprašymas',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Trumpas aprašymas',
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Ikona',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      label: 'Aktyvi',
    },
  ],
}
