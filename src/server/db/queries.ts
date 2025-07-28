import "server-only";

import { eq, isNull, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files as filesSchema,
  folders as foldersSchema,
} from "~/server/db/schema";

export async function getParentsForFolder(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;

  while (currentId !== null) {
    const folder = await getFolderById(currentId);

    if (!folder) {
      throw new Error("Parent folder not found");
    }

    parents.unshift(folder);
    currentId = folder.parentId;
  }

  return parents;
}

async function getFolderById(folderId: number) {
  const folder = await db.query.folders.findFirst({
    where: eq(foldersSchema.id, folderId),
  });
  return folder;
}

async function getRootFolderForUser(userId: string) {
  const folder = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.ownerId, userId),
      isNull(foldersSchema.parentId),
    ),
  });
  return folder;
}

export function getFiles(folderId: number) {
  return db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parentId, folderId));
}

export function getFolders(folderId: number) {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parentId, folderId));
}
