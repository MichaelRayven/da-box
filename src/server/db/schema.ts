import { type SQL, relations, sql } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/gel-core";
import {
  type AnyPgColumn,
  foreignKey,
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import type { AccountType } from "~/lib/interface";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `da-box_${name}`);

export function lower(text: AnyPgColumn): SQL {
  return sql`lower(${text})`;
}

export const files = createTable(
  "files_table",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text("name").notNull(),
    size: d.integer("size").notNull(),
    key: d.text("key").notNull().unique(),
    type: d.text("type").notNull(),
    hidden: d.boolean("hidden").notNull(), // Used to hide file during uploading
    parentId: d
      .text("parentId")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    ownerId: d
      .text("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    modified: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    trashed: d.boolean("trashed").notNull().default(false),
    trashedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => [
    index("owner_files_idx").on(table.ownerId),
    index("parent_files_idx").on(table.parentId),
    unique("unique_file_per_parent").on(table.parentId, table.name),
  ],
);

export const filesRelations = relations(files, ({ one }) => ({
  owner: one(users, {
    fields: [files.ownerId],
    references: [users.id],
    relationName: "user_files",
  }),

  parent: one(folders, {
    fields: [files.parentId],
    references: [folders.id],
    relationName: "folder_files", // 👈 must match the one in foldersRelations
  }),
}));

export const folders = createTable(
  "folders_table",
  (d) => {
    return {
      id: d
        .text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
      name: d.text("name").notNull(),
      parentId: d.text("parentId"),
      ownerId: d
        .text()
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
      modified: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
      trashed: d.boolean("trashed").notNull().default(false),
      trashedAt: d.timestamp({ withTimezone: true }),
      createdAt: d
        .timestamp({ withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    };
  },
  (table) => [
    foreignKey({
      name: "parent_foreign_key",
      foreignColumns: [table.id],
      columns: [table.parentId],
    }).onDelete("cascade"),
    index("owner_folders_idx").on(table.ownerId),
    index("parent_folders_idx").on(table.parentId),
    unique("unique_folder_per_parent").on(table.parentId, table.name),
  ],
);

export const foldersRelations = relations(folders, ({ one, many }) => ({
  owner: one(users, {
    fields: [folders.ownerId],
    references: [users.id],
    relationName: "user_folders",
  }),

  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "folder_children",
  }),

  files: many(files, {
    relationName: "folder_files",
  }),

  folders: many(folders, {
    relationName: "folder_children",
  }),
}));

export const permission = pgEnum("permission", ["view", "edit"]);

export const shared = createTable(
  "shared_table",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sharedById: d
      .text("sharedById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sharedWithId: d
      .text("sharedWithId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileId: d
      .text("fileId")
      .references(() => files.id, { onDelete: "cascade" }),
    folderId: d
      .text("folderId")
      .references(() => folders.id, { onDelete: "cascade" }),
    permission: permission().default("view"),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (table) => [
    unique("unique_file_share").on(table.sharedWithId, table.fileId),
    unique("unique_folder_share").on(table.sharedWithId, table.folderId),
  ],
);

export const starred = createTable(
  "starred_table",
  (d) => ({
    userId: d
      .text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fileId: d
      .text("fileId")
      .references(() => files.id, { onDelete: "cascade" }),
    folderId: d
      .text("folderId")
      .references(() => folders.id, { onDelete: "cascade" }),
    starredAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`),
  }),
  (table) => [
    unique("unique_star_file").on(table.userId, table.fileId),
    unique("unique_star_folder").on(table.userId, table.folderId),
  ],
);

export const users = createTable(
  "users_table",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text("name"),
    email: d.text("email").unique(),
    emailVerified: d.timestamp("emailVerified", { mode: "date" }),
    image: d.text("image"),
    username: d
      .text("username")
      .unique("username_unique_index", { nulls: "distinct" }),
    password: d.text(),
    salt: d.text(),
  }),
  (table) => [
    uniqueIndex("username_unique_index").on(lower(table.username)),
    uniqueIndex("email_unique_index").on(lower(table.email)),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  files: many(files, {
    relationName: "user_files",
  }),
  folders: many(folders, {
    relationName: "user_folders",
  }),
}));

export const accounts = createTable(
  "accounts_table",
  (d) => ({
    userId: d
      .text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: d.text("type").$type<AccountType>().notNull(),
    provider: d.text("provider").notNull(),
    providerAccountId: d.text("providerAccountId").notNull(),
    refresh_token: d.text("refresh_token"),
    access_token: d.text("access_token"),
    expires_at: d.integer("expires_at"),
    token_type: d.text("token_type"),
    scope: d.text("scope"),
    id_token: d.text("id_token"),
    session_state: d.text("session_state"),
  }),
  (table) => [
    {
      compoundKey: primaryKey({
        columns: [table.provider, table.providerAccountId],
      }),
    },
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = createTable("sessions_table", (d) => ({
  sessionToken: d.text("sessionToken").primaryKey(),
  userId: d
    .text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: d.timestamp("expires", { mode: "date" }).notNull(),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = createTable(
  "verification_token_table",
  (d) => ({
    identifier: d.text("identifier").notNull(),
    token: d.text("token").notNull(),
    expires: d.timestamp("expires", { mode: "date" }).notNull(),
  }),
  (table) => [
    {
      compositePk: primaryKey({
        columns: [table.identifier, table.token],
      }),
    },
  ],
);

export const authenticators = createTable(
  "authenticator_table",
  (d) => ({
    credentialID: d.text("credentialID").notNull().unique(),
    userId: d
      .text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: d.text("providerAccountId").notNull(),
    credentialPublicKey: d.text("credentialPublicKey").notNull(),
    counter: d.integer("counter").notNull(),
    credentialDeviceType: d.text("credentialDeviceType").notNull(),
    credentialBackedUp: d.boolean("credentialBackedUp").notNull(),
    transports: d.text("transports"),
  }),
  (table) => [
    {
      compositePK: primaryKey({
        columns: [table.userId, table.credentialID],
      }),
    },
  ],
);
