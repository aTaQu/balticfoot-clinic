import type { CollectionConfig } from 'payload'

export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
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
    },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Patvirtinta', value: 'confirmed' },
        { label: 'Atmesta', value: 'rejected' },
        { label: 'Atšaukta', value: 'cancelled' },
        { label: 'Perkelta', value: 'rescheduled' },
        { label: 'Laikas užblokuotas', value: 'slot_blocked' },
        { label: 'Blokas pašalintas', value: 'slot_unblocked' },
      ],
    },
    {
      name: 'booking',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'bookings' as any,
    },
    {
      name: 'note',
      type: 'text',
    },
  ],
}
