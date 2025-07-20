import type { Config } from "drizzle-kit";

import { env } from "~/env";

const connectionUrl = `postgresql://${env.DATABASE_USER}:${env.DATABASE_PASS}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_DB_NAME}`;

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionUrl,
  },
  tablesFilter: ["da-box_*"],
} satisfies Config;
