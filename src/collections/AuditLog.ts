import type { CollectionConfig } from 'payload'

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: {
    singular: 'Audito įrašas',
    plural: 'Audito žurnalas',
  },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['user', 'action', 'booking', 'note', 'createdAt'],
  },
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Vartotojas',
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      label: 'Veiksmas',
      options: [
        { label: 'Patvirtinta', value: 'confirmed' },
        { label: 'Atmesta', value: 'rejected' },
        { label: 'Atšaukta', value: 'cancelled' },
        { label: 'Perkelta', value: 'rescheduled' },
        { label: 'Pridėtas nedarbo laikas', value: 'slot_blocked' },
        { label: 'Pašalintas nedarbo laikas', value: 'slot_unblocked' },
      ],
    },
    {
      name: 'booking',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'bookings' as any,
      label: 'Rezervacija',
    },
    {
      name: 'note',
      type: 'text',
      label: 'Pastaba',
    },
  ],
}
