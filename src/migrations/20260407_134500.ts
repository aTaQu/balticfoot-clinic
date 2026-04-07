import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "bookings" DROP COLUMN IF EXISTS "sms_opt_in";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "bookings" ADD COLUMN "sms_opt_in" boolean DEFAULT false;`)
}
