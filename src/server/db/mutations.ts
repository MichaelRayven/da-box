import "server-only";

import { eq } from "drizzle-orm";
import z from "zod";
import type { PostgresError } from "~/lib/interface";
import { nameSchema, usernameSchema } from "~/lib/validation";
import { db } from "~/server/db";
import { folders as foldersSchema, users } from "./schema";

const updateUserSchema = z.object({
  username: nameSchema.optional(),
  name: usernameSchema.optional(),
  image: z.string().url().optional(),
});

export async function updateUser(
  id: string,
  data: z.infer<typeof updateUserSchema>,
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

    throw new Error("Something went wrong while updating your profile.");
  }
}

export async function onboardUser(userId: string) {
  const rootFolder = await db
    .insert(foldersSchema)
    .values({
      name: "root",
      parentId: null,
      ownerId: userId,
    })
    .returning({ id: foldersSchema.id });

  const rootFolderId = rootFolder[0]!.id;

  const [driveFolderId] = await db
    .insert(foldersSchema)
    .values({
      name: "My Drive",
      parentId: rootFolderId,
      ownerId: userId,
    })
    .returning({ id: foldersSchema.id });

  await db.insert(foldersSchema).values([
    {
      name: "Trash",
      parentId: rootFolderId,
      ownerId: userId,
    },
    {
      name: "Shared",
      parentId: rootFolderId,
      ownerId: userId,
    },
    {
      name: "Starred",
      parentId: rootFolderId,
      ownerId: userId,
    },
  ]);

  return driveFolderId;
}
