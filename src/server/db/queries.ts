import "server-only";

import * as ERRORS from "~/lib/errors";
import { and, eq, isNull, desc, or } from "drizzle-orm";
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
 * Get all parent folders of a given folder until reaching the root or a folder not owned by or shared with the user.
 * Excludes the root folder
 * @returns Array of accessible parent folders or error if a folder is not found.
 */
export async function getParentsForFolder(
  folderId: string,
  userId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  const parents: (typeof foldersSchema.$inferSelect)[] = [];
  let currentId: string | null = folderId;

  try {
    while (currentId) {
      const [result] = await db
        .select({
          folder: foldersSchema,
          share: shared,
        })
        .from(foldersSchema)
        .leftJoin(
          shared,
          and(
            eq(shared.folderId, foldersSchema.id),
            eq(shared.sharedWithId, userId),
          ),
        )
        .where(eq(foldersSchema.id, currentId));

      if (!result?.folder) {
        return { success: false, error: ERRORS.FOLDER_NOT_FOUND };
      }

      if (result.folder.ownerId === userId || result.share) {
        parents.unshift(result.folder);
        currentId = result.folder.parentId;
      } else {
        break;
      }
    }
  } catch (e) {
    return handleError(e);
  }

  parents.shift(); // Remove root
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
export async function getRootFolderForUser(
  userId: string,
): Promise<Result<typeof foldersSchema.$inferSelect>> {
  return db.query.folders
    .findFirst({
      where: and(
        eq(foldersSchema.ownerId, userId),
        isNull(foldersSchema.parentId),
      ),
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

export async function getFiles(
  folderId: string,
): Promise<Result<(typeof filesSchema.$inferSelect)[]>> {
  return db
    .select()
    .from(filesSchema)
    .where(
      and(eq(filesSchema.parentId, folderId), eq(filesSchema.trashed, false)),
    )
    .then((files) => ({ success: true as const, data: files }))
    .catch(handleError);
}

export async function getFolders(
  folderId: string,
): Promise<Result<(typeof foldersSchema.$inferSelect)[]>> {
  return db
    .select()
    .from(foldersSchema)
    .where(
      and(
        eq(foldersSchema.parentId, folderId),
        eq(foldersSchema.trashed, false),
      ),
    )
    .then((folders) => ({ success: true as const, data: folders }))
    .catch(handleError);
}

/**
 * Recursively fetch all subfolders of a given folder with their files.
 * @returns Array of subfolders with their files.
 */
export async function getAllNestedFolders(
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
 * Get all non-trashed files and folders shared with a user.
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
      and(eq(shared.fileId, filesSchema.id), eq(filesSchema.trashed, false)),
    )
    .leftJoin(
      foldersSchema,
      and(
        eq(shared.folderId, foldersSchema.id),
        eq(foldersSchema.trashed, false),
      ),
    )
    .where(and(eq(shared.sharedWithId, userId), isNull(shared.parentId)))
    .then((results) => {
      const files = results.map((r) => r.files).filter((r) => r !== null);
      const folders = results.map((r) => r.folders).filter((r) => r !== null);
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
      file: filesSchema,
      folder: foldersSchema,
    })
    .from(starred)
    .leftJoin(
      filesSchema,
      and(eq(starred.fileId, filesSchema.id), eq(filesSchema.trashed, false)),
    )
    .leftJoin(
      foldersSchema,
      and(
        eq(starred.folderId, foldersSchema.id),
        eq(foldersSchema.trashed, false),
      ),
    )
    .where(eq(starred.userId, userId))
    .then((results) => {
      const files = results.map((r) => r.file).filter((r) => r !== null);
      const folders = results.map((r) => r.folder).filter((r) => r !== null);
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

type Resource = "file" | "folder";
type Action = "view" | "edit" | "share";

async function hasAccessToResource(
  type: Resource,
  resourceId: string,
  ownerId: string,
  userId: string,
  action: Action,
): Promise<boolean> {
  if (ownerId === userId) return true;
  if (action === "share") return false;

  const share = await db.query.shared.findFirst({
    where: and(
      eq(type === "file" ? shared.fileId : shared.folderId, resourceId),
      eq(shared.sharedWithId, userId),
    ),
  });

  return (
    !!share && (share.permission === "edit" || share.permission === action)
  );
}

export async function requestFileFor({
  fileId,
  userId,
  action = "view",
}: {
  fileId: string;
  userId: string;
  action?: Action;
}): Promise<Result<typeof filesSchema.$inferSelect>> {
  const result = await getFileById(fileId);
  if (!result.success) return result;

  const file = result.data;
  const allowed = await hasAccessToResource(
    "file",
    fileId,
    file.ownerId,
    userId,
    action,
  );

  if (!allowed) return { success: false, error: ERRORS.FORBIDDEN };

  return { success: true, data: file };
}

export async function requestFolderFor({
  folderId,
  userId,
  action = "view",
}: {
  folderId: string;
  userId: string;
  action?: Action;
}): Promise<Result<typeof foldersSchema.$inferSelect>> {
  const result = await getFolderById(folderId);
  if (!result.success) return result;

  const folder = result.data;
  const allowed = await hasAccessToResource(
    "folder",
    folderId,
    folder.ownerId,
    userId,
    action,
  );

  if (!allowed) return { success: false, error: ERRORS.FORBIDDEN };

  return { success: true, data: folder };
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

export async function fileExists(
  name: string,
  parentId: string,
): Promise<boolean> {
  try {
    const existing = await db.query.files.findFirst({
      where: and(
        eq(filesSchema.name, name),
        eq(filesSchema.parentId, parentId),
        eq(filesSchema.trashed, false),
      ),
    });

    return !!existing;
  } catch (error) {
    return false;
  }
}

export async function folderExists(
  name: string,
  parentId: string,
): Promise<boolean> {
  try {
    const existing = await db.query.folders.findFirst({
      where: and(
        eq(foldersSchema.name, name),
        eq(foldersSchema.parentId, parentId),
        eq(foldersSchema.trashed, false),
      ),
    });

    return !!existing;
  } catch (error) {
    return false;
  }
}

async function isFileInTrash(fileId: string): Promise<boolean> {
  const file = await db.query.files.findFirst({
    where: eq(filesSchema.id, fileId),
    columns: { trashed: true, parentId: true },
  });

  if (!file) return false;
  if (file.trashed) return true;

  let currentParentId: string | null = file.parentId;

  while (currentParentId !== null) {
    const parent: any = await db.query.folders.findFirst({
      where: eq(foldersSchema.id, currentParentId),
      columns: { trashed: true, parentId: true },
    });

    if (!parent) break;
    if (parent.trashed) return true;

    currentParentId = parent.parentId;
  }

  return false;
}

export async function folderInTrash(folderId: string): Promise<boolean> {
  const folder = await db.query.folders.findFirst({
    where: eq(foldersSchema.id, folderId),
    columns: { trashed: true, parentId: true },
  });

  if (!folder) return false;
  if (folder.trashed) return true;

  let currentParentId: string | null = folder.parentId;

  while (currentParentId !== null) {
    const parent: any = await db.query.folders.findFirst({
      where: eq(foldersSchema.id, currentParentId),
      columns: { trashed: true, parentId: true },
    });

    if (!parent) break;
    if (parent.trashed) return true;

    currentParentId = parent.parentId;
  }

  return false;
}
