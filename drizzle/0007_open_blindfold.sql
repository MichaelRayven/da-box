ALTER TABLE "da-box_shared_table" RENAME COLUMN "ownerId" TO "sharedById";--> statement-breakpoint
ALTER TABLE "da-box_shared_table" DROP CONSTRAINT "da-box_shared_table_ownerId_da-box_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_shared_table" ADD CONSTRAINT "da-box_shared_table_sharedById_da-box_users_table_id_fk" FOREIGN KEY ("sharedById") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;