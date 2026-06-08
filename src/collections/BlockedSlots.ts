import type { CollectionConfig } from 'payload'

export const BlockedSlots: CollectionConfig = {
  slug: 'blocked-slots',
  labels: {
    singular: 'Nedarbo laikas',
    plural: 'Nedarbo laikai',
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'startTime', 'endTime', 'reason', 'createdBy'],
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Data',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd EEEE',
        },
      },
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      label: 'Pradžios laikas',
      admin: {
        description: 'Pradžios laikas, pvz. "09:00"',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      label: 'Pabaigos laikas',
      admin: {
        description: 'Pabaigos laikas, pvz. "12:00"',
      },
    },
    {
      name: 'reason',
      type: 'text',
      label: 'Priežastis',
      admin: {
        description: 'Neprivaloma: nedarbo priežastis',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Pridėjo',
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.user && !data.createdBy) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
  },
}
