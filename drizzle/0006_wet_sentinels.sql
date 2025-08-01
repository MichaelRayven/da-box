CREATE TYPE "public"."permission" AS ENUM('view', 'edit');--> statement-breakpoint
CREATE TABLE "da-box_shared_table" (
	"id" text PRIMARY KEY NOT NULL,
	"ownerId" text NOT NULL,
	"sharedWithId" text NOT NULL,
	"fileId" text,
	"folderId" text,
	"permission" "permission" DEFAULT 'view',
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_file_share" UNIQUE("sharedWithId","fileId"),
	CONSTRAINT "unique_folder_share" UNIQUE("sharedWithId","folderId")
);
--> statement-breakpoint
CREATE TABLE "da-box_starred_table" (
	"userId" text NOT NULL,
	"fileId" text,
	"folderId" text,
	"starredAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "unique_star_file" UNIQUE("userId","fileId"),
	CONSTRAINT "unique_star_folder" UNIQUE("userId","folderId")
);
--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD COLUMN "trashed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD COLUMN "trashedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD COLUMN "trashed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD COLUMN "trashedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "da-box_shared_table" ADD CONSTRAINT "da-box_shared_table_ownerId_da-box_users_table_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_shared_table" ADD CONSTRAINT "da-box_shared_table_sharedWithId_da-box_users_table_id_fk" FOREIGN KEY ("sharedWithId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_shared_table" ADD CONSTRAINT "da-box_shared_table_fileId_da-box_files_table_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."da-box_files_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_shared_table" ADD CONSTRAINT "da-box_shared_table_folderId_da-box_folders_table_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."da-box_folders_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_starred_table" ADD CONSTRAINT "da-box_starred_table_userId_da-box_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_starred_table" ADD CONSTRAINT "da-box_starred_table_fileId_da-box_files_table_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."da-box_files_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_starred_table" ADD CONSTRAINT "da-box_starred_table_folderId_da-box_folders_table_id_fk" FOREIGN KEY ("folderId") REFERENCES "public"."da-box_folders_table"("id") ON DELETE cascade ON UPDATE no action;