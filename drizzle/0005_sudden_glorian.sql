ALTER TABLE "da-box_folders_table" DROP CONSTRAINT "da-box_folders_table_parentId_da-box_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD CONSTRAINT "unique_file_per_parent" UNIQUE("parentId","name");--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD CONSTRAINT "unique_folder_per_parent" UNIQUE("parentId","name");