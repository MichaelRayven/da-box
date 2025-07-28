import "server-only";

import { db } from "~/server/db";
import { files, folders, users } from "./schema";
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
      error.cause.constraint === "username_unique_index"
    ) {
      throw new Error("This username is already taken.");
    }

    // Otherwise, rethrow the original error
    throw new Error("Something went wrong while updating your profile.");
  }
}

export function createFolder(name: string, ownerId: string, parentId?: number) {
  return db.insert(folders).values({
    name,
    parentId,
    ownerId,
  });
}

export function createFile(
  name: string,
  key: string,
  size: number,
  ownerId: string,
  parentId: number,
) {
  return db.insert(files).values({
    name,
    key,
    size,
    ownerId,
    parentId,
  });
}
