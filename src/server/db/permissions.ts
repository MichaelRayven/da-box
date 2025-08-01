import "server-only";
import { and, eq } from "drizzle-orm";
import * as ERRORS from "~/lib/errors";
import type { Result } from "~/lib/interface";
import { db } from "~/server/db";
import { files, folders, shared } from "./schema";

export type Permission = "view" | "edit" | "share";

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  isOwner: boolean;
}

/**
 * Check permissions for a file
 */
export async function checkFilePermissions(
  fileId: string,
  userId: string,
): Promise<Result<PermissionCheck>> {
  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      return { success: false, error: ERRORS.FILE_NOT_FOUND };
    }

    const isOwner = file.ownerId === userId;

    if (isOwner) {
      return {
        success: true,
        data: {
          canView: true,
          canEdit: true,
          canShare: true,
          isOwner: true,
        },
      };
    }

    // Check if file is shared with user
    const share = await db.query.shared.findFirst({
      where: and(eq(shared.fileId, fileId), eq(shared.sharedWithId, userId)),
    });

    if (!share) {
      return { success: false, error: ERRORS.FORBIDDEN };
    }

    return {
      success: true,
      data: {
        canView: true,
        canEdit: share.permission === "edit",
        canShare: false, // Only owners can share
        isOwner: false,
      },
    };
  } catch (error) {
    return { success: false, error: ERRORS.SERVER_ERROR };
  }
}

/**
 * Check permissions for a folder
 */
export async function checkFolderPermissions(
  folderId: string,
  userId: string,
): Promise<Result<PermissionCheck>> {
  try {
    const folder = await db.query.folders.findFirst({
      where: eq(folders.id, folderId),
    });

    if (!folder) {
      return { success: false, error: ERRORS.FOLDER_NOT_FOUND };
    }

    const isOwner = folder.ownerId === userId;

    if (isOwner) {
      return {
        success: true,
        data: {
          canView: true,
          canEdit: true,
          canShare: true,
          isOwner: true,
        },
      };
    }

    // Check if folder is shared with user
    const share = await db.query.shared.findFirst({
      where: and(
        eq(shared.folderId, folderId),
        eq(shared.sharedWithId, userId),
      ),
    });

    if (!share) {
      return { success: false, error: ERRORS.FORBIDDEN };
    }

    return {
      success: true,
      data: {
        canView: true,
        canEdit: share.permission === "edit",
        canShare: false, // Only owners can share
        isOwner: false,
      },
    };
  } catch (error) {
    return { success: false, error: ERRORS.SERVER_ERROR };
  }
}

/**
 * Check if user has specific permission for a file
 */
export async function hasFilePermission(
  fileId: string,
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const result = await checkFilePermissions(fileId, userId);
  if (!result.success) return false;

  switch (permission) {
    case "view":
      return result.data.canView;
    case "edit":
      return result.data.canEdit;
    case "share":
      return result.data.canShare;
    default:
      return false;
  }
}

/**
 * Check if user has specific permission for a folder
 */
export async function hasFolderPermission(
  folderId: string,
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const result = await checkFolderPermissions(folderId, userId);
  if (!result.success) return false;

  switch (permission) {
    case "view":
      return result.data.canView;
    case "edit":
      return result.data.canEdit;
    case "share":
      return result.data.canShare;
    default:
      return false;
  }
}

/**
 * Require specific permission for a file - returns error if not allowed
 */
export async function requireFilePermission(
  fileId: string,
  userId: string,
  permission: Permission,
): Promise<Result<null>> {
  const hasPermission = await hasFilePermission(fileId, userId, permission);
  if (!hasPermission) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }
  return { success: true, data: null };
}

/**
 * Require specific permission for a folder - returns error if not allowed
 */
export async function requireFolderPermission(
  folderId: string,
  userId: string,
  permission: Permission,
): Promise<Result<null>> {
  const hasPermission = await hasFolderPermission(folderId, userId, permission);
  if (!hasPermission) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }
  return { success: true, data: null };
}
