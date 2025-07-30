CREATE TABLE "da-box_authenticator_table" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "da-box_authenticator_table_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
ALTER TABLE "accounts" RENAME TO "da-box_accounts_table";--> statement-breakpoint
ALTER TABLE "files" RENAME TO "da-box_files_table";--> statement-breakpoint
ALTER TABLE "folders" RENAME TO "da-box_folders_table";--> statement-breakpoint
ALTER TABLE "sessions" RENAME TO "da-box_sessions_table";--> statement-breakpoint
ALTER TABLE "users" RENAME TO "da-box_users_table";--> statement-breakpoint
ALTER TABLE "verification_token" RENAME TO "da-box_verification_token_table";--> statement-breakpoint
ALTER TABLE "da-box_files_table" RENAME COLUMN "url" TO "key";--> statement-breakpoint
ALTER TABLE "da-box_files_table" RENAME COLUMN "parent" TO "parentId";--> statement-breakpoint
ALTER TABLE "da-box_files_table" RENAME COLUMN "owner" TO "ownerId";--> statement-breakpoint
ALTER TABLE "da-box_folders_table" RENAME COLUMN "parent" TO "parentId";--> statement-breakpoint
ALTER TABLE "da-box_folders_table" RENAME COLUMN "owner" TO "ownerId";--> statement-breakpoint
ALTER TABLE "da-box_users_table" DROP CONSTRAINT "username_key";--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_files_table" DROP CONSTRAINT "files_parent_folders_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_files_table" DROP CONSTRAINT "files_owner_users_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_folders_table" DROP CONSTRAINT "folders_owner_users_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_folders_table" DROP CONSTRAINT "folders_parent_folders_id_fk";
--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" DROP CONSTRAINT "sessions_userId_users_id_fk";
--> statement-breakpoint
DROP INDEX "account_user_id_idx";--> statement-breakpoint
DROP INDEX "modified_files_idx";--> statement-breakpoint
DROP INDEX "modified_folders_idx";--> statement-breakpoint
DROP INDEX "t_user_id_idx";--> statement-breakpoint
DROP INDEX "owner_files_idx";--> statement-breakpoint
DROP INDEX "parent_files_idx";--> statement-breakpoint
DROP INDEX "owner_folders_idx";--> statement-breakpoint
DROP INDEX "parent_folders_idx";--> statement-breakpoint
ALTER TABLE "da-box_verification_token_table" DROP CONSTRAINT "verification_token_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "providerAccountId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "token_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ALTER COLUMN "session_state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" ADD PRIMARY KEY ("sessionToken");--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" ALTER COLUMN "sessionToken" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" ALTER COLUMN "expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "username" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "password" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "salt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "emailVerified" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "emailVerified" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "da-box_users_table" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_verification_token_table" ALTER COLUMN "identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_verification_token_table" ALTER COLUMN "token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "da-box_verification_token_table" ALTER COLUMN "expires" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD COLUMN "hidden" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "da-box_authenticator_table" ADD CONSTRAINT "da-box_authenticator_table_userId_da-box_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" ADD CONSTRAINT "da-box_accounts_table_userId_da-box_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD CONSTRAINT "da-box_files_table_parentId_da-box_folders_table_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."da-box_folders_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD CONSTRAINT "da-box_files_table_ownerId_da-box_users_table_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD CONSTRAINT "da-box_folders_table_parentId_da-box_users_table_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."da-box_users_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD CONSTRAINT "da-box_folders_table_ownerId_da-box_users_table_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_folders_table" ADD CONSTRAINT "parent_foreign_key" FOREIGN KEY ("parentId") REFERENCES "public"."da-box_folders_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" ADD CONSTRAINT "da-box_sessions_table_userId_da-box_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."da-box_users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "owner_files_idx" ON "da-box_files_table" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "parent_files_idx" ON "da-box_files_table" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "owner_folders_idx" ON "da-box_folders_table" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "parent_folders_idx" ON "da-box_folders_table" USING btree ("parentId");--> statement-breakpoint
ALTER TABLE "da-box_accounts_table" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "da-box_sessions_table" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "da-box_files_table" ADD CONSTRAINT "da-box_files_table_key_unique" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "da-box_users_table" ADD CONSTRAINT "da-box_users_table_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "da-box_users_table" ADD CONSTRAINT "username_unique_index" UNIQUE("username");