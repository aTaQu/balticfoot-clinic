import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Availability inversion: replace the opt-out `blocked_slots` model with the
// opt-in `availability_windows` (Darbo laikai) model, and add '15' to the slot
// interval enum. See docs/DECISIONS.md → "Availability inversion".
//
// Drop & recreate: blocked<->open is a semantic inversion (an old "blocked" row
// can't become an "open" one), so existing blocked_slots rows are intentionally
// discarded rather than migrated. The site is live; cutover is default-closed
// until the owner publishes Darbo laikai windows.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_blocked_slots_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_blocked_slots_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "blocked_slots_id";
  DROP TABLE IF EXISTS "blocked_slots" CASCADE;

  CREATE TABLE "availability_windows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"note" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "availability_windows_id" integer;
  ALTER TABLE "availability_windows" ADD CONSTRAINT "availability_windows_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "availability_windows_created_by_idx" ON "availability_windows" USING btree ("created_by_id");
  CREATE INDEX "availability_windows_updated_at_idx" ON "availability_windows" USING btree ("updated_at");
  CREATE INDEX "availability_windows_created_at_idx" ON "availability_windows" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_availability_windows_fk" FOREIGN KEY ("availability_windows_id") REFERENCES "public"."availability_windows"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_availability_windows_id_idx" ON "payload_locked_documents_rels" USING btree ("availability_windows_id");

  ALTER TYPE "public"."enum_clinic_settings_slot_interval_minutes" ADD VALUE '15' BEFORE '30';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_availability_windows_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_availability_windows_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "availability_windows_id";
  DROP TABLE IF EXISTS "availability_windows" CASCADE;

  CREATE TABLE "blocked_slots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"reason" varchar,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blocked_slots_id" integer;
  ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "blocked_slots_created_by_idx" ON "blocked_slots" USING btree ("created_by_id");
  CREATE INDEX "blocked_slots_updated_at_idx" ON "blocked_slots" USING btree ("updated_at");
  CREATE INDEX "blocked_slots_created_at_idx" ON "blocked_slots" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blocked_slots_fk" FOREIGN KEY ("blocked_slots_id") REFERENCES "public"."blocked_slots"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blocked_slots_id_idx" ON "payload_locked_documents_rels" USING btree ("blocked_slots_id");

  ALTER TABLE "clinic_settings" ALTER COLUMN "slot_interval_minutes" DROP DEFAULT;
  ALTER TYPE "public"."enum_clinic_settings_slot_interval_minutes" RENAME TO "enum_clinic_settings_slot_interval_minutes_old";
  CREATE TYPE "public"."enum_clinic_settings_slot_interval_minutes" AS ENUM('30', '60');
  ALTER TABLE "clinic_settings" ALTER COLUMN "slot_interval_minutes" SET DATA TYPE "public"."enum_clinic_settings_slot_interval_minutes" USING "slot_interval_minutes"::text::"public"."enum_clinic_settings_slot_interval_minutes";
  ALTER TABLE "clinic_settings" ALTER COLUMN "slot_interval_minutes" SET DEFAULT '30';
  DROP TYPE "public"."enum_clinic_settings_slot_interval_minutes_old";`)
}
