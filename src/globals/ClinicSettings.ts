import type { GlobalConfig } from 'payload'

export const ClinicSettings: GlobalConfig = {
  slug: 'clinic-settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'clinicName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'workingHoursStart',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: HH:MM, e.g. 09:00',
      },
    },
    {
      name: 'workingHoursEnd',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: HH:MM, e.g. 18:00',
      },
    },
    {
      name: 'slotIntervalMinutes',
      type: 'select',
      required: true,
      defaultValue: '30',
      options: [
        { label: '30 minutės', value: '30' },
        { label: '60 minučių', value: '60' },
      ],
      admin: {
        description: 'Booking slot interval',
      },
    },
    {
      name: 'openDays',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Pirmadienis', value: 'monday' },
        { label: 'Antradienis', value: 'tuesday' },
        { label: 'Trečiadienis', value: 'wednesday' },
        { label: 'Ketvirtadienis', value: 'thursday' },
        { label: 'Penktadienis', value: 'friday' },
        { label: 'Šeštadienis', value: 'saturday' },
      ],
    },
  ],
}
