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

  parents.shift();

  return parents;
}

export async function getFolderById(folderId: string) {
  const folder = await db.query.folders.findFirst({
    where: eq(foldersSchema.id, folderId),
  });
  return folder;
}

export async function getFileById(fileId: string) {
  const file = await db.query.files.findFirst({
    where: eq(filesSchema.id, fileId),
  });
  return file;
}

export async function getRootFolderForUser(userId: string) {
  const folder = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.ownerId, userId),
      isNull(foldersSchema.parentId),
    ),
    with: {
      folders: true,
    },
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

type FolderWithFiles = typeof foldersSchema.$inferSelect & {
  files: (typeof filesSchema.$inferSelect)[];
};
export async function getAllSubfolders(folderId: string) {
  const allFolders: FolderWithFiles[] = [];
  const queue: string[] = [folderId];

  while (queue.length > 0) {
    const currentId = queue.pop()!;

    // Get all direct subfolders of the current folder
    const childFolders = await db.query.folders.findMany({
      where: eq(foldersSchema.parentId, currentId),
      with: {
        files: true,
      },
    });

    allFolders.push(...childFolders);

    for (const folder of childFolders) {
      queue.push(folder.id); // Recurse into children
    }
  }

  return allFolders;
}
