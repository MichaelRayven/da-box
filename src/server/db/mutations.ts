import "server-only";

import { db } from "~/server/db";
import { files_table, folders_table, users } from "./schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { nameSchema, usernameSchema } from "~/lib/validation";

interface PostgresError extends Error {
  cause: {
    code?: string;
    constraint?: string;
    detail?: string;
    table?: string;
    column?: string;
    schema?: string;
  };
}

const updateUserProfileSchema = z.object({
  username: nameSchema.optional(),
  name: usernameSchema.optional(),
  image: z.string().url().optional(),
});

export async function updateUserProfile(
  id: string,
  data: z.infer<typeof updateUserProfileSchema>,
) {
  try {
    await db.update(users).set(data).where(eq(users.id, id));
  } catch (err) {
    const error = err as PostgresError;

    if (
      error.cause.code === "23505" &&
      error.cause.constraint === "username_key"
    ) {
      throw new Error("This username is already taken.");
    }

    // Otherwise, rethrow the original error
    throw new Error("Something went wrong while updating your profile.");
  }
}

export function createFolder(name: string, owner: string, parent: number) {
  return db.insert(folders_table).values({
    name,
    owner,
    parent,
  });
}

export function createFile(
  name: string,
  key: string,
  owner: string,
  parent: number,
  size: number,
) {
  return db.insert(files_table).values({
    name,
    key,
    owner,
    parent,
    size,
  });
}
