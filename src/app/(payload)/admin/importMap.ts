import type { ImportMap } from 'payload'
import { CollectionCards as CollectionCards_0 } from '@payloadcms/next/rsc'
import { BookingActionsAfterFields as BookingActionsAfterFields_1 } from '@/components/admin/BookingActions'
import { WeekScheduleAfterDashboard as WeekScheduleAfterDashboard_2 } from '@/components/admin/WeekSchedule'

export const importMap: ImportMap = {
  '@payloadcms/next/rsc#CollectionCards': CollectionCards_0,
  '@/components/admin/BookingActions#BookingActionsAfterFields': BookingActionsAfterFields_1,
  '@/components/admin/WeekSchedule#WeekScheduleAfterDashboard': WeekScheduleAfterDashboard_2,
}
