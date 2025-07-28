import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

export const conn =
  globalForDb.conn ??
  postgres({
    host: env.DATABASE_HOST,
    password: env.DATABASE_PASS,
    database: env.DATABASE_DB_NAME,
    user: env.DATABASE_USER,
    port: env.DATABASE_PORT,
  });

if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
