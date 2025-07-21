import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { files_table, folders_table } from "~/server/db/schema";

export async function getParentFolders(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;

  while (currentId !== null) {
    const folder: typeof folders_table.$inferSelect | undefined = (
      await db
        .select()
        .from(folders_table)
        .where(eq(folders_table.id, currentId))
    )[0];

    if (!folder) {
      throw new Error("Folder not found");
    }
    parents.unshift(folder);
    currentId = folder.parent;
  }

  return parents;
}

export function getFiles(folderId: number) {
  return db.select().from(files_table).where(eq(files_table.parent, folderId));
}

export function getFolders(folderId: number) {
  return db
    .select()
    .from(folders_table)
    .where(eq(folders_table.parent, folderId));
}
