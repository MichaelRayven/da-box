"use server";

import {
  CompleteMultipartUploadCommand,
  type CompletedPart,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";
import mime from "mime-types";
import { cookies } from "next/headers";
import sharp from "sharp";
import type z from "zod";
import { env } from "~/env";
import type { Result, FileType, FolderType } from "~/lib/interface";
import { fileNameSchema, updateProfileSchema } from "~/lib/validation";
import { auth } from "./auth";
import { db } from "./db";
import * as MUTATIONS from "./db/mutations";
import * as QUERIES from "./db/queries";
import * as ERRORS from "~/lib/errors";
import { files as filesSchema, folders as foldersSchema } from "./db/schema";
import { s3 } from "./s3";

export async function getFileViewingUrl(
  fileId: string,
): Promise<Result<string>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  const query = await QUERIES.getFileIfAccessible(fileId, session.userId);
  if (!query.success) return query;

  const command = new GetObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: query.data.key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: url };
}

export async function createFolder(
  name: string,
  parentId: string,
): Promise<Result<FolderType>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  const folder = await MUTATIONS.createFolder(name, parentId, session.userId);

  if (!folder.success) return folder;

  return { success: true, data: folder.data };
}

export async function getFileUploadUrl(
  name: string,
  size: number,
  parentId: string,
): Promise<Result<{ file: FileType; url: string }>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  const type = mime.contentType(name) || "application/octet-stream";
  const ext = mime.extension(type) || "bin";
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  const mutation = await MUTATIONS.createFile({
    userId: session.userId,
    name,
    key,
    parentId,
    size,
    type,
    hidden: false,
  });

  if (!mutation.success) return mutation;

  const file = mutation.data;

  const command = new PutObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: { file, url } };
}

export async function startPartialFileUpload(
  name: string,
  size: number,
  parentId: string,
): Promise<Result<{ uploadId: string; key: string }>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  const type = mime.contentType(name) || "application/octet-stream";
  const ext = mime.extension(type) || "bin";
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  const mutation = await MUTATIONS.createFile({
    userId: session.userId,
    name,
    key,
    parentId,
    size,
    type,
    hidden: true,
  });

  // TODO: Resolve conflicts with hidden files
  if (!mutation.success) return mutation;

  const command = new CreateMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const { UploadId } = await s3.send(command);

  if (!UploadId) return { success: false, error: ERRORS.SERVER_ERROR };

  return { success: true, data: { uploadId: UploadId, key } };
}

export async function getUploadFilePartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
): Promise<Result<{ url: string }>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  const command = new UploadPartCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });
  return { success: true, data: { url } };
}

export async function completePartialFileUpload(
  key: string,
  uploadId: string,
  parts: CompletedPart[],
): Promise<Result<{ file: FileType }>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  const command = new CompleteMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3.send(command);

  try {
    const [updatedFile] = await db
      .update(filesSchema)
      .set({
        hidden: false,
      })
      .where(eq(filesSchema.key, key))
      .returning();

    if (!updatedFile) return { success: false, error: ERRORS.SERVER_ERROR };

    return { success: true, data: { file: updatedFile } };
  } catch (e) {
    console.error("Multipart upload error:", e);
    return { success: false, error: ERRORS.SERVER_ERROR };
  }
}

export async function deleteFile(
  fileId: string,
): Promise<Result<{ fileId: string }>> {
  const session = await auth();

  if (!session?.userId) {
    return {
      success: false,
      error: ERRORS.UNAUTHORIZED,
    };
  }

  const query = await QUERIES.getFileIfAccessible(
    fileId,
    session.userId,
    "edit",
  );
  if (!query.success) return query;

  try {
    // 1. Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_FILE_BUCKET_NAME,
        Key: query.data.key,
      }),
    );

    // 2. Delete from DB
    await MUTATIONS.deleteFile(fileId);

    // 3. Force revalidation cookie
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));

    return { success: true, data: { fileId } };
  } catch (err) {
    console.error("File deletion error:", err);
    return { success: false, error: "Failed to delete file" };
  }
}

export async function deleteFolder(
  folderId: string,
): Promise<Result<{ folderId: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  // Check delete folder permission
  const query = await QUERIES.getFolderIfAccessible(
    folderId,
    session.userId,
    "edit",
  );
  if (!query.success) return query;

  // Get all the files inside
  const filesQuery = await QUERIES.getAllNestedFiles(folderId);
  if (!filesQuery.success) return filesQuery;

  // Delete files one by one
  for (const file of filesQuery.data) {
    // 1. Delete from S3
    await s3
      .send(
        new DeleteObjectCommand({
          Bucket: env.S3_FILE_BUCKET_NAME,
          Key: file.key,
        }),
      )
      .catch((err) => {
        console.error(`Failed to delete S3 file: ${file.key}`, err);
        return { success: false, error: "Failed to delete file" };
      });

    // 2. Delete from DB
    const mutation = await MUTATIONS.deleteFile(file.id);
    if (!mutation.success)
      return { success: false as const, error: ERRORS.FOLDER_DELETION_FAILED };
  }

  // Delete the folder
  const mutation = await MUTATIONS.deleteFolder(folderId);
  if (!mutation.success)
    return { success: false as const, error: ERRORS.FOLDER_DELETION_FAILED };

  // Refresh the page
  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true, data: { folderId } };
}

// Accepts: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF
function convertToJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

export async function uploadAvatar(
  avatar: File,
): Promise<Result<{ url: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  if (avatar.size > 5 * 1024 * 1024)
    return { success: false, error: "This file is too large" };

  const buffer = Buffer.from(await avatar.arrayBuffer());
  const key = `${session.userId}/profile.jpeg`;

  const uploadCommand = new PutObjectCommand({
    Bucket: env.S3_AVATAR_BUCKET_NAME,
    Key: key,
    Body: await convertToJpeg(buffer),
    ContentType: "image/jpeg",
    ACL: "public-read",
  });

  await s3.send(uploadCommand);

  return {
    success: true,
    data: { url: `/api/user/avatar?userId=${session.userId}` },
  };
}

export async function updateUserProfile(
  unsafeData: z.infer<typeof updateProfileSchema>,
): Promise<Result<{ message: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const { data, error, success } = updateProfileSchema.safeParse(unsafeData);
  if (!success) {
    return { success: false, error: error.message };
  }

  const { name, username, avatar } = data;
  let avatarUrl: string | undefined;

  if (avatar instanceof File) {
    const res = await uploadAvatar(avatar).catch((e) => ({
      success: false as const,
      error: ERRORS.UPLOAD_FAILED,
    }));
    if (!res.success) return res;

    avatarUrl = res.data.url;
  } else if (typeof avatar === "string") {
    avatarUrl = avatar;
  }

  await MUTATIONS.updateUser(session.userId, {
    name,
    username,
    image: avatarUrl,
  });

  return {
    success: true,
    data: { message: "Your profile has been updated!" },
  };
}

export async function renameFolder(
  folderId: string,
  name: string,
): Promise<Result<{ folderId: string; name: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const { success, error } = fileNameSchema.safeParse({ name });
  if (!success) return { success: false, error: error.message };

  const mutation = await MUTATIONS.renameFolder({
    userId: session.userId,
    newName: name,
    folderId,
  });
  if (!mutation.success) return mutation;

  return { success: true, data: { folderId, name: name } };
}

export async function renameFile(
  fileId: string,
  name: string,
): Promise<Result<{ fileId: string; name: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const { success, error } = fileNameSchema.safeParse({ name });
  if (!success) return { success: false, error: error.message };

  const mutation = await MUTATIONS.renameFile({
    userId: session.userId,
    newName: name,
    fileId,
  });
  if (!mutation.success) return mutation;

  return { success: true, data: { fileId, name: name } };
}

export async function shareFile({
  fileId,
  email,
  permission,
}: {
  fileId: string;
  email: string;
  permission: "view" | "edit";
}): Promise<Result<null>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  // Check permissions
  const fileQuery = await QUERIES.getFileById(fileId);
  if (!fileQuery.success)
    return { success: false, error: ERRORS.FILE_NOT_FOUND };

  if (fileQuery.data.ownerId !== session.userId)
    return { success: false, error: ERRORS.FORBIDDEN };

  // Check user exists
  const userQuery = await QUERIES.getUserByEmail(email);
  if (!userQuery.success) return userQuery;

  const userToShareWith = userQuery.data;

  // Share file
  const mutation = await MUTATIONS.shareFile(
    fileId,
    userToShareWith.id,
    session.userId,
    permission,
  );
  if (!mutation.success) return mutation;

  return { success: true, data: null };
}

export async function shareFolder({
  fileId: folderId,
  email,
  permission,
}: {
  fileId: string;
  email: string;
  permission: "view" | "edit";
}): Promise<Result<null>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  // Check permissions
  const folderQuery = await QUERIES.getFolderById(folderId);
  if (!folderQuery.success)
    return { success: false, error: ERRORS.FILE_NOT_FOUND };

  if (folderQuery.data.ownerId !== session.userId)
    return { success: false, error: ERRORS.FORBIDDEN };

  // Check user exists
  const userQuery = await QUERIES.getUserByEmail(email);
  if (!userQuery.success) return userQuery;

  const userToShareWith = userQuery.data;

  // Share folder
  const mutation = await MUTATIONS.shareFolder(
    folderId,
    userToShareWith.id,
    session.userId,
    permission,
  );
  if (!mutation.success) return mutation;

  return { success: true, data: null };
}
