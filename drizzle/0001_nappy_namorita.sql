ALTER TABLE "da-box_files_table" DROP CONSTRAINT "da-box_files_table_owner_da-box_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_folders_table" DROP CONSTRAINT "da-box_folders_table_owner_da-box_users_table_id_fk";
--> statement-breakpoint
DROP INDEX "owner_files_idx";--> statement-breakpoint
DROP INDEX "owner_folders_idx";--> statement-breakpoint
ALTER TABLE "da-box_files_table" DROP COLUMN "owner";--> statement-breakpoint
ALTER TABLE "da-box_folders_table" DROP COLUMN "owner";