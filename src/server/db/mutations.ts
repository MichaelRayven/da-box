import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import {
  folders as foldersSchema,
  files as filesSchema,
  users,
  shared,
  starred,
} from "./schema";
import { isUniqueConstraintViolation } from "~/lib/utils";
import type { Result } from "~/lib/interface";
import { handleError, handleSuccess } from "./utils";
import * as QUERIES from "./queries";
import * as ERRORS from "~/lib/errors";

/**
 * Update user profile data.
 * Handles unique constraint errors for username.
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    image?: string;
    username?: string;
  },
): Promise<Result<null>> {
  return db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .then(handleSuccess)
    .catch((error) => {
      if (isUniqueConstraintViolation(error)) {
        return {
          success: false as const,
          error: "This username is already taken.",
        };
      }
      return {
        success: false as const,
        error: "Something went wrong while updating your profile.",
      };
    });
}

/**
 * Create a root folder for a user as part of onboarding.
 * @returns Root folder id
 */
export async function onboardUser(userId: string): Promise<Result<string>> {
  return await db
    .insert(foldersSchema)
    .values({
      name: "root",
      parentId: null,
      ownerId: userId,
    })
    .returning({ id: foldersSchema.id })
    .then(([root]) => ({ success: true as const, data: root!.id }))
    .catch(handleError);
}

/**
 * Recursively mark a folder and all its descendants as trashed.
 */
export async function trashFolder(folderId: string): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const query = await QUERIES.getAllSubfolders(folderId);
      if (!query.success) throw new Error(query.error);

      const subfolderIds = query.data.map((f) => f.id);

      const foldersToTrash = [...subfolderIds, folderId];

      await Promise.all([
        tx
          .update(foldersSchema)
          .set({ trashed: true })
          .where(inArray(foldersSchema.id, foldersToTrash)),
        tx
          .update(filesSchema)
          .set({ trashed: true })
          .where(inArray(filesSchema.parentId, foldersToTrash)),
      ]);
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Mark a single file as trashed.
 */
export async function trashFile(fileId: string): Promise<Result<null>> {
  return db
    .update(filesSchema)
    .set({ trashed: true })
    .where(eq(filesSchema.id, fileId))
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Recursively recover a trashed folder and its descendants.
 */
export async function recoverFolder(folderId: string): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const query = await QUERIES.getAllSubfolders(folderId);
      if (!query.success) throw new Error(query.error);

      const subfolderIds = query.data.map((f) => f.id);

      const foldersToRecover = [...subfolderIds, folderId];

      await Promise.all([
        tx
          .update(foldersSchema)
          .set({ trashed: false })
          .where(inArray(foldersSchema.id, foldersToRecover)),
        tx
          .update(filesSchema)
          .set({ trashed: false })
          .where(inArray(filesSchema.parentId, foldersToRecover)),
      ]);
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Recover a single file from trash.
 */
export async function recoverFile(fileId: string): Promise<Result<null>> {
  return db
    .update(filesSchema)
    .set({ trashed: false })
    .where(eq(filesSchema.id, fileId))
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Permanently delete a single file.
 */
export async function deleteFile(fileId: string): Promise<Result<null>> {
  return db
    .delete(filesSchema)
    .where(eq(filesSchema.id, fileId))
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Delete a folder and all its contents
 */
export async function deleteFolder(folderId: string): Promise<Result<null>> {
  return db
    .delete(foldersSchema)
    .where(eq(foldersSchema.id, folderId))
    .then(handleSuccess)
    .catch(handleError);
}

export async function shareFile(
  fileId: string,
  sharedWithId: string,
  sharedById: string,
  permission: "view" | "edit" = "view",
): Promise<Result<null>> {
  return db
    .insert(shared)
    .values({ fileId, sharedWithId, sharedById, permission })
    .onConflictDoNothing()
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Share a folder recursively with a user (includes child folders and files).
 */
export async function shareFolder(
  folderId: string,
  sharedWithId: string,
  sharedById: string,
  permission: "view" | "edit" = "view",
): Promise<Result<null>> {
  const query = await QUERIES.getAllSubfolders(folderId);
  if (!query.success) return query;

  const subfolderIds = query.data.map((f) => f.id);
  const folderIds = [...subfolderIds, folderId];

  return db
    .transaction(async (tx) => {
      const files = await tx
        .select({ id: filesSchema.id })
        .from(filesSchema)
        .where(inArray(filesSchema.parentId, folderIds))
        .catch(() => []);

      const folderShares = folderIds.map((id) =>
        tx
          .insert(shared)
          .values({ folderId: id, sharedWithId, sharedById, permission })
          .onConflictDoNothing(),
      );

      const fileShares = files.map((file) =>
        tx
          .insert(shared)
          .values({ fileId: file.id, sharedWithId, sharedById, permission })
          .onConflictDoNothing(),
      );

      await Promise.all([...folderShares, ...fileShares]);
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Remove sharing for a single file.
 */
export async function unshareFile(
  fileId: string,
  sharedWithId: string,
): Promise<Result<null>> {
  return db
    .delete(shared)
    .where(
      and(eq(shared.fileId, fileId), eq(shared.sharedWithId, sharedWithId)),
    )
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Recursively remove sharing for a folder and all its contents.
 */
export async function unshareFolder(
  folderId: string,
  sharedWithId: string,
): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const query = await QUERIES.getAllSubfolders(folderId);
      if (!query.success) throw new Error(query.error);

      const subfolderIds = query.data.map((f) => f.id);

      const folderIds = [...subfolderIds, folderId];

      const files = await tx
        .select({ id: filesSchema.id })
        .from(filesSchema)
        .where(inArray(filesSchema.parentId, folderIds))
        .catch(() => []);

      const folderDelete = tx
        .delete(shared)
        .where(
          and(
            inArray(shared.folderId, folderIds),
            eq(shared.sharedWithId, sharedWithId),
          ),
        );

      const fileDelete =
        files.length > 0
          ? tx.delete(shared).where(
              and(
                inArray(
                  shared.fileId,
                  files.map((f) => f.id),
                ),
                eq(shared.sharedWithId, sharedWithId),
              ),
            )
          : Promise.resolve();

      await Promise.all([folderDelete, fileDelete]);
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Star a single file for a user.
 */
export async function starFile(
  fileId: string,
  userId: string,
): Promise<Result<null>> {
  return db
    .insert(starred)
    .values({ userId, fileId })
    .onConflictDoNothing()
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Star a folder for a user.
 */
export async function starFolder(
  folderId: string,
  userId: string,
): Promise<Result<null>> {
  return db
    .insert(starred)
    .values({ userId, folderId })
    .onConflictDoNothing()
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Unstar a single file for a user.
 */
export async function unstarFile(
  fileId: string,
  userId: string,
): Promise<Result<null>> {
  return db
    .delete(starred)
    .where(and(eq(starred.userId, userId), eq(starred.fileId, fileId)))
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Unstar a folder for a user.
 */
export async function unstarFolder(
  folderId: string,
  userId: string,
): Promise<Result<null>> {
  return db
    .delete(starred)
    .where(and(eq(starred.userId, userId), eq(starred.folderId, folderId)))
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Creates a file in a specified folder, ensuring unique naming and propagating sharing permissions from the parent folder.
 */
export async function createFile({
  userId,
  name,
  parentId,
  key,
  size,
  type,
  hidden = false,
}: {
  userId: string;
  name: string;
  parentId: string;
  key: string;
  size: number;
  type: string;
  hidden: boolean;
}): Promise<Result<typeof filesSchema.$inferSelect>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderIfAccessible(
        parentId,
        userId,
        "edit",
      );
      if (!query.success) throw new Error(query.error);
      const parent = query.data;

      // 2. Check if a file with the same name already exists in the same folder
      const existing = await tx.query.files.findFirst({
        where: and(
          eq(filesSchema.parentId, parentId),
          eq(filesSchema.name, name),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FILE_ALREADY_EXISTS);
      }

      // Insert the new file as hidden
      const [file] = await tx
        .insert(filesSchema)
        .values({
          name,
          parentId,
          ownerId: parent.ownerId,
          key,
          size,
          type,
          hidden,
        })
        .returning();

      if (!file) {
        throw new Error(ERRORS.FILE_CREATION_FAILED);
      }

      // Propagate sharing if parent is shared
      const sharedWith = await tx
        .select({
          sharedWithId: shared.sharedWithId,
          sharedById: shared.sharedById,
        })
        .from(shared)
        .where(eq(shared.folderId, parentId));

      if (sharedWith.length > 0) {
        await Promise.all(
          sharedWith.map((entry) =>
            tx
              .insert(shared)
              .values({
                fileId: file.id,
                sharedWithId: entry.sharedWithId,
                sharedById: entry.sharedById,
              })
              .onConflictDoNothing(),
          ),
        );
      }

      return { success: true as const, data: file };
    })
    .catch(handleError);
}

/**
 * Creates a folder under a specified parent folder, ensuring unique naming, permissions and propagating sharing permissions.
 */
export async function createFolder(
  name: string,
  parentId: string,
  userId: string,
): Promise<Result<typeof foldersSchema.$inferSelect>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderIfAccessible(
        parentId,
        userId,
        "edit",
      );
      if (!query.success) throw new Error(query.error);
      const parent = query.data;

      // 2. Check if folder already exists under the same parent
      const existing = await tx.query.folders.findFirst({
        where: and(
          eq(foldersSchema.parentId, parentId),
          eq(foldersSchema.name, name),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FOLDER_ALREADY_EXISTS);
      }

      // 4. Insert new folder
      const [folder] = await tx
        .insert(foldersSchema)
        .values({ name, parentId, ownerId: parent.ownerId })
        .returning();

      if (!folder) {
        throw new Error(ERRORS.FOLDER_CREATION_FAILED);
      }

      // 5. Get share info from parent folder and propagate sharing
      const sharedWith = await tx
        .select({
          sharedById: shared.sharedById,
          sharedWithId: shared.sharedWithId,
        })
        .from(shared)
        .where(eq(shared.folderId, parentId));

      if (sharedWith.length > 0) {
        await Promise.all(
          sharedWith.map((entry) =>
            tx
              .insert(shared)
              .values({
                folderId: folder.id,
                sharedWithId: entry.sharedWithId,
                sharedById: entry.sharedById,
              })
              .onConflictDoNothing(),
          ),
        );
      }

      // Idk why but typescript thinks that the LITERAL true value is a boolean
      // not a "true", how tf was it going to change?
      return { success: true as const, data: folder };
    })
    .catch(handleError);
}

// Renames the file, handles permission checking and name collisions
export async function renameFile({
  userId,
  fileId,
  newName,
}: {
  userId: string;
  fileId: string;
  newName: string;
}): Promise<Result<string>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFileIfAccessible(fileId, userId, "edit");
      if (!query.success) throw new Error(query.error);
      const file = query.data;

      // 2. Check if a file with the same name already exists in the same folder
      const existing = await tx.query.files.findFirst({
        where: and(
          eq(filesSchema.parentId, file.parentId),
          eq(filesSchema.name, newName),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FILE_ALREADY_EXISTS);
      }

      // Update file
      await tx
        .update(filesSchema)
        .set({
          name: newName,
        })
        .where(eq(filesSchema.id, fileId));

      return { success: true as const, data: newName };
    })
    .catch(handleError);
}

// Renames the folder, handles permission checking and name collisions
export async function renameFolder({
  userId,
  folderId,
  newName,
}: {
  userId: string;
  folderId: string;
  newName: string;
}): Promise<Result<string>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderIfAccessible(
        folderId,
        userId,
        "edit",
      );
      if (!query.success) throw new Error(query.error);
      const folder = query.data;

      // 2. Check if a file with the same name already exists in the same folder
      const existing = await tx.query.folders.findFirst({
        where: and(
          eq(foldersSchema.parentId, folder.parentId!),
          eq(foldersSchema.name, newName),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FILE_ALREADY_EXISTS);
      }

      // Update file
      await tx
        .update(foldersSchema)
        .set({
          name: newName,
        })
        .where(eq(foldersSchema.id, folderId));

      return { success: true as const, data: newName };
    })
    .catch(handleError);
}
