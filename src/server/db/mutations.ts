import "server-only";

import { and, eq, inArray, isNotNull } from "drizzle-orm";
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
 * Mark a folder as trashed.
 */
export async function trashFolder(folderId: string): Promise<Result<null>> {
  return db
    .update(foldersSchema)
    .set({ trashed: true })
    .where(
      and(eq(foldersSchema.id, folderId), isNotNull(foldersSchema.parentId)),
    )
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
 * Restore folder if the name is available
 */
export async function restoreFolder(folderId: string): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const query = await QUERIES.getFolderById(folderId);
      if (!query.success) throw new Error(ERRORS.FOLDER_NOT_FOUND);

      const existing = await tx.query.folders.findFirst({
        where: and(
          eq(foldersSchema.parentId, query.data.parentId!),
          eq(foldersSchema.name, query.data.name),
          eq(foldersSchema.trashed, false),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FOLDER_ALREADY_EXISTS);
      }

      return tx
        .update(foldersSchema)
        .set({ trashed: false })
        .where(eq(foldersSchema.id, folderId));
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Restore a single file from trash.
 */
export async function restoreFile(fileId: string): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const query = await QUERIES.getFileById(fileId);
      if (!query.success) throw new Error(ERRORS.FILE_NOT_FOUND);

      const existing = await tx.query.files.findFirst({
        where: and(
          eq(filesSchema.parentId, query.data.parentId!),
          eq(filesSchema.name, query.data.name),
          eq(filesSchema.trashed, false),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FILE_ALREADY_EXISTS);
      }

      return tx
        .update(filesSchema)
        .set({ trashed: false })
        .where(eq(filesSchema.id, fileId));
    })
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

export async function shareFile({
  fileId,
  sharedWithId,
  permission = "view",
}: {
  fileId: string;
  sharedWithId: string;
  permission: "view" | "edit";
}): Promise<Result<null>> {
  return db.transaction(async (tx) => {
    // Check if file exists
    const file = await tx.query.files.findFirst({
      where: eq(filesSchema.id, fileId),
      with: {
        parent: true,
      },
    });

    if (!file) return { success: false, error: ERRORS.FILE_NOT_FOUND };

    // Check if parent is shared
    const share = await tx.query.shared.findFirst({
      where: and(
        eq(shared.sharedWithId, sharedWithId),
        eq(shared.folderId, file.parent.id),
      ),
    });

    return tx
      .insert(shared)
      .values({
        fileId,
        sharedWithId,
        sharedById: file.parent.ownerId,
        parentId: share?.id,
        permission,
      })
      .onConflictDoNothing()
      .then(handleSuccess)
      .catch(handleError);
  });
}

/**
 * Share a folder recursively with a user (includes child folders and files).
 */
export async function shareFolder({
  folderId,
  sharedWithId,
  permission = "view",
}: {
  folderId: string;
  sharedWithId: string;
  permission: "view" | "edit";
}): Promise<Result<null>> {
  return db
    .transaction(async (tx) => {
      const folder = await tx.query.folders.findFirst({
        where: eq(foldersSchema.id, folderId),
        with: { parent: true },
      });

      if (!folder) throw new Error(ERRORS.FOLDER_NOT_FOUND);
      if (!folder.parent) throw new Error(ERRORS.FOLDER_IS_ROOT);

      // Find parent shared entry
      const parentShare = await tx.query.shared.findFirst({
        where: and(
          eq(shared.sharedWithId, sharedWithId),
          eq(shared.folderId, folder.parent.id),
        ),
      });

      // Queue: each item has folderId and parentShareId
      const queue: { folderId: string; parentShareId: string | null }[] = [
        { folderId, parentShareId: parentShare?.id ?? null },
      ];

      while (queue.length > 0) {
        const { folderId: currentFolderId, parentShareId } = queue.shift()!;

        // Create shared entry for current folder
        const [folderShare] = await tx
          .insert(shared)
          .values({
            folderId: currentFolderId,
            sharedWithId,
            sharedById: folder.parent.ownerId,
            parentId: parentShareId,
            permission,
          })
          .onConflictDoNothing()
          .returning({ id: shared.id });

        const currentShareId = folderShare?.id ?? parentShareId;

        // Share all files inside the current folder
        const filesInFolder = await tx
          .select({ id: filesSchema.id })
          .from(filesSchema)
          .where(eq(filesSchema.parentId, currentFolderId));

        for (const file of filesInFolder) {
          await tx
            .insert(shared)
            .values({
              fileId: file.id,
              sharedWithId,
              sharedById: folder.parent.ownerId,
              parentId: currentShareId,
              permission,
            })
            .onConflictDoNothing();
        }

        // Enqueue all subfolders
        const subfolders = await tx
          .select({ id: foldersSchema.id })
          .from(foldersSchema)
          .where(eq(foldersSchema.parentId, currentFolderId));

        for (const subfolder of subfolders) {
          queue.push({ folderId: subfolder.id, parentShareId: currentShareId });
        }
      }
    })
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Remove sharing for a single file.
 */
export async function unshareFile({
  fileId,
  sharedWithId,
}: {
  fileId: string;
  sharedWithId: string;
}): Promise<Result<null>> {
  return db
    .delete(shared)
    .where(
      and(eq(shared.fileId, fileId), eq(shared.sharedWithId, sharedWithId)),
    )
    .then(handleSuccess)
    .catch(handleError);
}

/**
 * Remove sharing for a single folder.
 */
export async function unshareFolder({
  folderId,
  sharedWithId,
}: {
  folderId: string;
  sharedWithId: string;
}): Promise<Result<null>> {
  return db
    .delete(shared)
    .where(
      and(eq(shared.folderId, folderId), eq(shared.sharedWithId, sharedWithId)),
    )
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
  name,
  parentId,
  key,
  size,
  type,
}: {
  name: string;
  parentId: string;
  key: string;
  size: number;
  type: string;
}): Promise<Result<typeof filesSchema.$inferSelect>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderById(parentId);
      if (!query.success) throw new Error(query.error);
      const parent = query.data;

      // 2. Check if a file with the same name already exists in the same folder
      const existing = await tx.query.files.findFirst({
        where: and(
          eq(filesSchema.parentId, parentId),
          eq(filesSchema.name, name),
          eq(filesSchema.trashed, false),
        ),
      });

      if (existing) {
        throw new Error(ERRORS.FILE_ALREADY_EXISTS);
      }

      // Insert the new file
      const [file] = await tx
        .insert(filesSchema)
        .values({
          name,
          parentId,
          ownerId: parent.ownerId,
          key,
          size,
          type,
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
          parentId: shared.parentId,
          fileId: shared.fileId,
          permission: shared.permission,
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
                parentId: entry.parentId,
                permission: entry.permission,
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
 * Creates a folder under a specified parent folder, ensuring unique naming and propagating sharing permissions.
 */
export async function createFolder({
  name,
  parentId,
}: {
  name: string;
  parentId: string;
}): Promise<Result<typeof foldersSchema.$inferSelect>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderById(parentId);
      if (!query.success) throw new Error(query.error);
      const parent = query.data;

      // 2. Check if folder already exists under the same parent
      const existing = await tx.query.folders.findFirst({
        where: and(
          eq(foldersSchema.parentId, parentId),
          eq(foldersSchema.name, name),
          eq(foldersSchema.trashed, false),
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
          parentId: shared.parentId,
          folderId: shared.folderId,
          permission: shared.permission,
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
                parentId: entry.parentId,
                permission: entry.permission,
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

// Renames the file, handles name collisions
export async function renameFile({
  fileId,
  newName,
}: {
  fileId: string;
  newName: string;
}): Promise<Result<string>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFileById(fileId);
      if (!query.success) throw new Error(query.error);
      const file = query.data;

      // 2. Check if a file with the same name already exists in the same folder
      const existing = await tx.query.files.findFirst({
        where: and(
          eq(filesSchema.parentId, file.parentId),
          eq(filesSchema.name, newName),
          eq(filesSchema.trashed, false),
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

// Renames the folder, handles name collisions
export async function renameFolder({
  folderId,
  newName,
}: {
  folderId: string;
  newName: string;
}): Promise<Result<string>> {
  return db
    .transaction(async (tx) => {
      // 1. Check parent exists
      const query = await QUERIES.getFolderById(folderId);
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
