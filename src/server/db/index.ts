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

const connectionUrl = `postgresql://${env.DATABASE_USER}:${env.DATABASE_PASS}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_DB_NAME}`;
const conn = globalForDb.conn ?? postgres(connectionUrl);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
