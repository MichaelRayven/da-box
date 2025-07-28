ALTER TABLE "da-box_accounts_table" RENAME TO "accounts";--> statement-breakpoint
ALTER TABLE "da-box_files_table" RENAME TO "files";--> statement-breakpoint
ALTER TABLE "da-box_folders_table" RENAME TO "folders";--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" RENAME TO "sessions";--> statement-breakpoint
ALTER TABLE "da-box_users_table" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "da-box_verification_token" RENAME TO "verification_token";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "da-box_accounts_table_userId_da-box_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "da-box_files_table_parent_da-box_folders_table_id_fk";
--> statement-breakpoint
ALTER TABLE "folders" DROP CONSTRAINT "da-box_folders_table_parent_da-box_folders_table_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "da-box_sessions_table_userId_da-box_users_table_id_fk";
--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "da-box_accounts_table_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "verification_token" DROP CONSTRAINT "da-box_verification_token_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'sessions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "sessions" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "verification_token" ADD CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "owner" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "owner" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_parent_folders_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_folders_id_fk" FOREIGN KEY ("parent") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "owner_files_idx" ON "files" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "owner_folders_idx" ON "folders" USING btree ("owner");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "username_key" UNIQUE("username");