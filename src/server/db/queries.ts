import "server-only";

import { eq, isNull, and } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files as filesSchema,
  folders as foldersSchema,
} from "~/server/db/schema";

export async function getParentsForFolder(folderId: string) {
  const parents = [];
  let currentId: string | null = folderId;

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

export async function getFolderById(folderId: string) {
  const folder = await db.query.folders.findFirst({
    where: eq(foldersSchema.id, folderId),
  });
  return folder;
}

export async function getRootFolderForUser(userId: string) {
  const folder = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.ownerId, userId),
      isNull(foldersSchema.parentId),
    ),
  });
  return folder;
}

export function getFiles(folderId: string) {
  return db
    .select()
    .from(filesSchema)
    .where(
      and(eq(filesSchema.parentId, folderId), eq(filesSchema.hidden, false)),
    );
}

export function getFolders(folderId: string) {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parentId, folderId));
}
