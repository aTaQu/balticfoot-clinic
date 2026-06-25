import type { CollectionConfig } from 'payload'

export const AvailabilityWindows: CollectionConfig = {
  slug: 'availability-windows',
  labels: {
    singular: 'Darbo laikas',
    plural: 'Darbo laikai',
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'startTime', 'endTime', 'note', 'createdBy'],
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
        description: 'Atidaryta nuo, pvz. „09:00".',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      label: 'Pabaigos laikas',
      admin: {
        description: 'Atidaryta iki, pvz. „12:00".',
      },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Pastaba',
      admin: {
        description: 'Neprivaloma pastaba (pvz. „tik šią savaitę").',
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
