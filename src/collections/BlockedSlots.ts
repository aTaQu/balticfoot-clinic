import type { CollectionConfig } from 'payload'

export const BlockedSlots: CollectionConfig = {
  slug: 'blocked-slots',
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'startTime', 'endTime', 'reason', 'createdBy'],
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'startTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Pradžios laikas, pvz. "09:00"',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      admin: {
        description: 'Pabaigos laikas, pvz. "12:00"',
      },
    },
    {
      name: 'reason',
      type: 'text',
      admin: {
        description: 'Neprivaloma: blokavimo priežastis',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
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
