import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'patientName',
    defaultColumns: ['patientName', 'service', 'date', 'timeSlot', 'status'],
  },
  fields: [
    {
      name: 'service',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'services' as any,
      required: true,
    },
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
      name: 'timeSlot',
      type: 'text',
      required: true,
      admin: {
        description: 'Pradžios laikas, pvz. "14:00"',
      },
    },
    {
      name: 'endTime',
      type: 'text',
      admin: {
        description: 'Pabaigos laikas (apskaičiuojamas automatiškai)',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Laukiama', value: 'pending' },
        { label: 'Patvirtinta', value: 'confirmed' },
        { label: 'Atmesta', value: 'rejected' },
        { label: 'Atšaukta', value: 'cancelled' },
      ],
    },
    {
      name: 'rejectionReason',
      type: 'text',
      admin: {
        condition: (data) => data?.status === 'rejected',
        description: 'Privaloma, kai statusas "Atmesta"',
      },
    },
    {
      name: 'patientName',
      type: 'text',
      required: true,
    },
    {
      name: 'patientPhone',
      type: 'text',
    },
    {
      name: 'patientEmail',
      type: 'email',
    },
    {
      name: 'patientNotes',
      type: 'textarea',
    },
    {
      name: 'reminderSent',
      type: 'checkbox',
      defaultValue: false,
      label: 'Priminimas išsiųstas',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'gdprConsent',
      type: 'checkbox',
      required: true,
      label: 'Sutinka su duomenų tvarkymu (BDAR)',
    },
    {
      name: 'bookingActions',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/BookingActions#BookingActionsAfterFields',
        },
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.timeSlot && data.service) {
          const serviceId = typeof data.service === 'object' ? data.service.id : data.service
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const service = await req.payload.findByID({ collection: 'services' as any, id: serviceId })
            if (service?.duration) {
              const [hours, minutes] = (data.timeSlot as string).split(':').map(Number)
              const totalMinutes = hours * 60 + minutes + (service.duration as number)
              const endHours = Math.floor(totalMinutes / 60)
              const endMins = totalMinutes % 60
              data.endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
            }
          } catch {
            // service lookup failed — endTime will remain unset
          }
        }
        return data
      },
    ],
  },
}
