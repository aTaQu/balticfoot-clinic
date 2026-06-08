import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "clinic_settings_notification_emails" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL
    );

    ALTER TABLE "clinic_settings_notification_emails"
      ADD CONSTRAINT "clinic_settings_notification_emails_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."clinic_settings"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "clinic_settings_notification_emails_order_idx"
      ON "clinic_settings_notification_emails" USING btree ("_order");
    CREATE INDEX "clinic_settings_notification_emails_parent_id_idx"
      ON "clinic_settings_notification_emails" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "clinic_settings_notification_emails" CASCADE;`)
}
