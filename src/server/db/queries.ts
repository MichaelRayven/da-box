import "server-only";

import * as ERRORS from "~/lib/errors";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "~/server/db";
import {
  files as filesSchema,
  folders as foldersSchema,
  shared,
  starred,
  users,
} from "~/server/db/schema";
import type { Result } from "~/lib/interface";
import { handleError } from "./utils";

/**
 * Get all parent folders of a given folder, excluding the root folder.
 * @returns Array of parent folders
 */
export async function getParentsForFolder(
  folderId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  const parents: (typeof foldersSchema.$inferSelect)[] = [];
  let currentId: string | null = folderId;

  while (currentId !== null) {
    const folderResult = await getFolderById(currentId);
    if (!folderResult.success) {
      return folderResult; // Propagate error (e.g., folder not found)
    }
    parents.unshift(folderResult.data);
    currentId = folderResult.data.parentId;
  }

  return { success: true, data: parents };
}

/**
 * Get all parent folders of a given folder until reaching the root or a folder not owned by or shared with the user.
 * @returns Array of accessible parent folders
 */
export async function getParentsForSharedFolder(
  folderId: string,
  userId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  const parents: (typeof foldersSchema.$inferSelect)[] = [];
  let currentId: string | null = folderId;

  while (currentId !== null) {
    const folderResult = await getFolderById(currentId);
    if (!folderResult.success) {
      return folderResult; // Propagate error (e.g., folder not found)
    }
    const folder = folderResult.data;

    // Check if the folder is owned by or shared with the user
    if (folder.ownerId !== userId) {
      const shares = await db
        .select({ id: shared.id })
        .from(shared)
        .where(
          and(eq(shared.folderId, currentId), eq(shared.sharedWithId, userId)),
        );

      if (shares.length <= 0) {
        break; // Stop if the folder is not accessible
      }
    }

    parents.unshift(folder);
    currentId = folder.parentId;
  }

  parents.shift(); // Remove the queried folder (not a parent)
  return { success: true, data: parents };
}

/**
 * Get a folder by its ID.
 * @returns Folder or error if not found.
 */
export async function getFolderById(
  folderId: string,
): Promise<Result<typeof foldersSchema.$inferSelect>> {
  return db.query.folders
    .findFirst({
      where: eq(foldersSchema.id, folderId),
    })
    .then((folder) => {
      if (!folder) {
        return { success: false as const, error: ERRORS.FOLDER_NOT_FOUND };
      }
      return { success: true as const, data: folder };
    })
    .catch(handleError);
}

/**
 * Get a file by its ID.
 * @returns File or error if not found.
 */
export async function getFileById(
  fileId: string,
): Promise<Result<typeof filesSchema.$inferSelect>> {
  return db.query.files
    .findFirst({
      where: eq(filesSchema.id, fileId),
    })
    .then((file) => {
      if (!file) {
        return { success: false as const, error: ERRORS.FILE_NOT_FOUND };
      }
      return { success: true as const, data: file };
    })
    .catch(handleError);
}

/**
 * Get the root folder for a user.
 * @returns Root folder with subfolders or error if not found.
 */
export async function getRootFolderForUser(userId: string): Promise<
  Result<
    typeof foldersSchema.$inferSelect & {
      folders: (typeof foldersSchema.$inferSelect)[];
    }
  >
> {
  return db.query.folders
    .findFirst({
      where: and(
        eq(foldersSchema.ownerId, userId),
        isNull(foldersSchema.parentId),
      ),
      with: {
        folders: true,
      },
    })
    .then((folder) => {
      if (!folder) {
        return {
          success: false as const,
          error: ERRORS.FOLDER_NOT_FOUND,
        };
      }
      return { success: true as const, data: folder };
    })
    .catch(handleError);
}

/**
 * Get all non-hidden files in a folder.
 * @returns Array of files.
 */
export async function getFiles(
  folderId: string,
): Promise<Result<(typeof filesSchema.$inferSelect)[]>> {
  return db
    .select()
    .from(filesSchema)
    .where(
      and(eq(filesSchema.parentId, folderId), eq(filesSchema.hidden, false)),
    )
    .then((files) => ({ success: true as const, data: files }))
    .catch(handleError);
}

/**
 * Get all subfolders in a folder.
 * @returns Array of subfolders.
 */
export async function getFolders(
  folderId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  return db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parentId, folderId))
    .then((folders) => ({ success: true as const, data: folders }))
    .catch(handleError);
}

/**
 * Recursively fetch all subfolders of a given folder with their files.
 * @returns Array of subfolders with their files.
 */
export async function getAllSubfolders(
  folderId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  const allFolders = [];
  const queue: string[] = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const foldersResult = await db.query.folders
      .findMany({
        where: eq(foldersSchema.parentId, currentId),
      })
      .catch(() => []); // Handle query errors gracefully

    allFolders.push(...foldersResult);
    queue.push(...foldersResult.map((folder) => folder.id));
  }

  return { success: true, data: allFolders };
}

export async function getAllNestedFiles(
  folderId: string,
): Promise<Result<(typeof filesSchema.$inferSelect)[]>> {
  const allFiles: (typeof filesSchema.$inferSelect)[] = [];
  const queue: string[] = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    // Fetch current folder's files and subfolders
    const folderResult = await db.query.folders
      .findFirst({
        where: eq(foldersSchema.id, currentId),
        with: {
          files: true,
          folders: true,
        },
      })
      .catch(() => undefined);

    if (!folderResult) {
      continue; // Skip if folder not found
    }

    // Add files from current folder
    allFiles.push(...(folderResult.files || []));
    // Add subfolder IDs to queue
    queue.push(...(folderResult.folders || []).map((folder) => folder.id));
  }

  return { success: true, data: allFiles };
}

/**
 * Get all non-trashed, non-hidden files and folders shared with a user.
 * @returns Array of shared files and folders.
 */
export async function getSharedWithUser(userId: string): Promise<
  Result<{
    files: (typeof filesSchema.$inferSelect)[];
    folders: (typeof foldersSchema.$inferSelect)[];
  }>
> {
  return db
    .select({
      files: filesSchema,
      folders: foldersSchema,
    })
    .from(shared)
    .leftJoin(
      filesSchema,
      and(
        eq(shared.fileId, filesSchema.id),
        eq(filesSchema.trashed, false),
        eq(filesSchema.hidden, false),
      ),
    )
    .leftJoin(
      foldersSchema,
      and(
        eq(shared.folderId, foldersSchema.id),
        eq(foldersSchema.trashed, false),
      ),
    )
    .where(eq(shared.sharedWithId, userId))
    .then((results) => {
      const files = results
        .filter((r) => r.files !== null)
        .map((r) => r.files) as (typeof filesSchema.$inferSelect)[];
      const folders = results
        .filter((r) => r.folders !== null)
        .map((r) => r.folders) as (typeof foldersSchema.$inferSelect)[];
      return { success: true as const, data: { files, folders } };
    })
    .catch(handleError);
}

export async function getStarredForUser(userId: string): Promise<
  Result<{
    files: (typeof filesSchema.$inferSelect)[];
    folders: (typeof foldersSchema.$inferSelect)[];
  }>
> {
  return db
    .select({
      files: filesSchema,
      folders: foldersSchema,
    })
    .from(starred)
    .leftJoin(
      filesSchema,
      and(eq(starred.fileId, filesSchema.id), eq(filesSchema.trashed, false)),
    )
    .leftJoin(foldersSchema, eq(starred.folderId, foldersSchema.id))
    .where(eq(starred.userId, userId))
    .then((results) => {
      const files = results
        .filter((r) => r.files !== null)
        .map((r) => r.files) as (typeof filesSchema.$inferSelect)[];
      const folders = results
        .filter((r) => r.folders !== null)
        .map((r) => r.folders) as (typeof foldersSchema.$inferSelect)[];
      return { success: true as const, data: { files, folders } };
    })
    .catch(handleError);
}

export async function getTrashedForUser(userId: string): Promise<
  Result<{
    files: (typeof filesSchema.$inferSelect)[];
    folders: (typeof foldersSchema.$inferSelect)[];
  }>
> {
  return Promise.all([
    db
      .select()
      .from(filesSchema)
      .where(
        and(eq(filesSchema.ownerId, userId), eq(filesSchema.trashed, true)),
      )
      .catch(() => []),
    db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), eq(foldersSchema.trashed, true)),
      )
      .catch(() => []),
  ])
    .then(([files, folders]) => ({
      success: true as const,
      data: { files, folders },
    }))
    .catch(handleError);
}
export async function getRecentFiles(
  userId: string,
  limit = 10,
): Promise<Result<(typeof filesSchema.$inferSelect)[]>> {
  return Promise.all([
    db
      .select()
      .from(filesSchema)
      .where(
        and(
          eq(filesSchema.ownerId, userId),
          eq(filesSchema.hidden, false),
          eq(filesSchema.trashed, false),
        ),
      )
      .orderBy(desc(filesSchema.modified))
      .limit(limit)
      .catch(() => []),
    db
      .select({ file: filesSchema })
      .from(shared)
      .innerJoin(
        filesSchema,
        and(
          eq(shared.fileId, filesSchema.id),
          eq(filesSchema.hidden, false),
          eq(filesSchema.trashed, false),
        ),
      )
      .where(eq(shared.sharedWithId, userId))
      .orderBy(desc(filesSchema.modified))
      .limit(limit)
      .catch(() => []),
  ])
    .then(([ownedFiles, sharedResults]) => {
      const sharedFiles = sharedResults.map((r) => r.file);
      const allFiles = [...ownedFiles, ...sharedFiles]
        .sort(
          (a, b) =>
            new Date(b.modified!).getTime() - new Date(a.modified!).getTime(),
        )
        .slice(0, limit);
      return { success: true as const, data: allFiles };
    })
    .catch(handleError);
}

export async function getFileIfAccessible(
  fileId: string,
  userId: string,
  permission: "edit" | "view" = "view",
): Promise<Result<typeof filesSchema.$inferSelect>> {
  const fileResult = await getFileById(fileId);
  if (!fileResult.success) {
    return fileResult; // File not found
  }

  const { data: file } = fileResult;
  const isOwner = file.ownerId === userId;

  const share = await db.query.shared.findFirst({
    where: and(eq(shared.fileId, fileId), eq(shared.sharedWithId, userId)),
  });
  const isShared =
    !!share && (share.permission === "edit" || share.permission === permission);

  if (!isOwner && !isShared) {
    return {
      success: false,
      error: ERRORS.FORBIDDEN,
    };
  }

  if (file.hidden || file.trashed) {
    return { success: false, error: ERRORS.FILE_NOT_ACCESSIBLE };
  }

  return { success: true, data: fileResult.data };
}

/**
 *  Returns folder when accessible (not hidden, not is trash, user has required permissions)
 * @param folderId string
 * @param userId string
 * @param permission "view" or "edit"
 * @returns Folder on success
 */
export async function getFolderIfAccessible(
  folderId: string,
  userId: string,
  permission: "edit" | "view" = "view",
): Promise<Result<typeof foldersSchema.$inferSelect>> {
  const folderResult = await getFolderById(folderId);
  if (!folderResult.success) {
    return folderResult; // Folder not found
  }

  const { data: folder } = folderResult;
  const isOwner = folder.ownerId === userId;

  const share = await db.query.shared.findFirst({
    where: and(eq(shared.folderId, folderId), eq(shared.sharedWithId, userId)),
  });

  const isShared =
    !!share && (share.permission === "edit" || share.permission === permission);

  if (!isOwner && !isShared) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  if (folder.trashed) {
    return { success: false, error: ERRORS.FOLDER_NOT_ACCESSIBLE };
  }

  return { success: true, data: folderResult.data };
}

export async function getUserByEmail(
  email: string,
): Promise<
  Result<{ id: string; username: string; email: string; image?: string }>
> {
  return db.query.users
    .findFirst({ where: eq(users.email, email) })
    .then((res) => {
      if (!res)
        return { success: false as const, error: ERRORS.USER_NOT_FOUND };

      return {
        success: true as const,
        data: {
          id: res.id,
          username: res.username!,
          image: res.image ?? undefined,
          email: res.email!,
        },
      };
    })
    .catch(handleError);
}
