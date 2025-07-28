import { type SQL, relations, sql } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/gel-core";
import {
  type AnyPgColumn,
  foreignKey,
  index,
  pgTable,
  pgTableCreator,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AccountType } from "~/lib/interface";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = pgTableCreator((name) => `da-box_${name}`);

export function lower(text: AnyPgColumn): SQL {
  return sql`lower(${text})`;
}

export const files_table = pgTable(
  "files",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    size: d.integer().notNull(),
    url: d.varchar({ length: 256 }).notNull(),
    parent: d
      .integer()
      .notNull()
      .references(() => folders_table.id),
    owner: d
      .uuid()
      .notNull()
      .references(() => users.id),
    modified: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("modified_files_idx").on(t.modified),
    index("owner_files_idx").on(t.owner),
    index("parent_files_idx").on(t.parent),
  ],
);

export const folders_table = pgTable(
  "folders",
  (d) => {
    return {
      id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
      name: d.varchar({ length: 256 }).notNull(),
      parent: d.integer(),
      owner: d
        .uuid()
        .notNull()
        .references(() => users.id),
      modified: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
      createdAt: d
        .timestamp({ withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    };
  },
  (t) => [
    foreignKey({ columns: [t.parent], foreignColumns: [t.id] }).onDelete(
      "cascade",
    ),
    index("modified_folders_idx").on(t.modified),
    index("owner_folders_idx").on(t.owner),
    index("parent_folders_idx").on(t.parent),
  ],
);

export const users = pgTable(
  "users",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    name: d.varchar({ length: 255 }),
    username: d.varchar({ length: 255 }).unique("username_key", {
      nulls: "distinct",
    }),
    password: d.varchar({ length: 255 }),
    salt: d.varchar({ length: 255 }),
    email: d.varchar({ length: 255 }).notNull(),
    emailVerified: d
      .timestamp({
        mode: "date",
        withTimezone: true,
      })
      .default(sql`CURRENT_TIMESTAMP`),
    image: d.varchar({ length: 255 }),
  }),
  (table) => [uniqueIndex("emailUniqueIndex").on(lower(table.email))],
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = pgTable(
  "accounts",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: d.varchar({ length: 255 }).$type<AccountType>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "sessions",
  (d) => ({
    id: d.uuid("id").primaryKey().defaultRandom(),
    sessionToken: d.varchar({ length: 255 }).notNull(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
