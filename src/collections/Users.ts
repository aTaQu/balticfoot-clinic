import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: 'Vartotojas',
    plural: 'Vartotojai',
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Vardas',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      label: 'Rolė',
      options: [
        { label: 'Administratorius', value: 'admin' },
        { label: 'Personalas', value: 'staff' },
      ],
    },
  ],
}
