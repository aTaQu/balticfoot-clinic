import type { GlobalConfig } from 'payload'

export const ClinicSettings: GlobalConfig = {
  slug: 'clinic-settings',
  label: 'Klinikos nustatymai',
  admin: {
    group: 'Nustatymai',
  },
  fields: [
    {
      name: 'clinicName',
      type: 'text',
      required: true,
      label: 'Klinikos pavadinimas',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Telefonas',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'El. paštas',
      admin: {
        description: 'Viešas kontaktinis el. paštas (rodomas svetainėje ir laiškuose pacientams).',
      },
    },
    {
      name: 'notificationEmails',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Pranešimų gavėjai',
      labels: {
        singular: 'Gavėjas',
        plural: 'Gavėjai',
      },
      admin: {
        description: 'El. pašto adresai, į kuriuos siunčiami pranešimai apie naujas rezervacijas, atšaukimus ir kontaktų formos užklausas.',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'El. paštas',
        },
      ],
    },
    {
      name: 'address',
      type: 'text',
      required: true,
      label: 'Adresas',
    },
    {
      name: 'workingHoursStart',
      type: 'text',
      required: true,
      label: 'Darbo pradžia',
      admin: {
        description: 'Formatas: HH:MM, pvz. 09:00',
      },
    },
    {
      name: 'workingHoursEnd',
      type: 'text',
      required: true,
      label: 'Darbo pabaiga',
      admin: {
        description: 'Formatas: HH:MM, pvz. 18:00',
      },
    },
    {
      name: 'slotIntervalMinutes',
      type: 'select',
      required: true,
      defaultValue: '30',
      label: 'Laiko intervalas',
      options: [
        { label: '15 minučių', value: '15' },
        { label: '30 minučių', value: '30' },
        { label: '60 minučių', value: '60' },
      ],
      admin: {
        description: 'Rezervacijos laiko intervalas',
      },
    },
    {
      name: 'openDays',
      type: 'select',
      hasMany: true,
      required: true,
      label: 'Darbo dienos',
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
