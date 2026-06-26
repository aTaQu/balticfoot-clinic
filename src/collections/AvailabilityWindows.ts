import type { CollectionConfig } from 'payload'
import { parseTimeToMinutes } from '../lib/time'

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
        description: 'Atidaryta nuo. Formatas: 9:00, 09:00 arba 9.00.',
      },
      validate: (value: unknown): true | string => {
        if (typeof value !== 'string' || parseTimeToMinutes(value) === null) {
          return 'Neteisingas laiko formatas (pvz. 9:00 arba 9.00).'
        }
        return true
      },
    },
    {
      name: 'endTime',
      type: 'text',
      required: true,
      label: 'Pabaigos laikas',
      admin: {
        description: 'Atidaryta iki. Formatas: 12:00 arba 12.00.',
      },
      validate: (value: unknown, options: { siblingData?: { startTime?: unknown } }): true | string => {
        if (typeof value !== 'string' || parseTimeToMinutes(value) === null) {
          return 'Neteisingas laiko formatas (pvz. 12:00 arba 12.00).'
        }
        const startRaw = options?.siblingData?.startTime
        const start = typeof startRaw === 'string' ? parseTimeToMinutes(startRaw) : null
        const end = parseTimeToMinutes(value)
        if (start !== null && end !== null && end <= start) {
          return 'Pabaigos laikas turi būti vėlesnis už pradžios laiką.'
        }
        return true
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
