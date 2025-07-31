"use server";

import {
  CompleteMultipartUploadCommand,
  type CompletedPart,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime-types";
import { cookies } from "next/headers";
import sharp from "sharp";
import type z from "zod";
import { env } from "~/env";
import type { Result, FileType, FolderType } from "~/lib/interface";
import { fileNameSchema, updateProfileSchema } from "~/lib/validation";
import { auth } from "./auth";
import * as MUTATIONS from "./db/mutations";
import * as QUERIES from "./db/queries";
import * as ERRORS from "~/lib/errors";
import { s3 } from "./s3";

export async function getFileViewingUrl(
  fileId: string,
): Promise<Result<{ url: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const query = await QUERIES.requestFileFor(fileId, session.userId, "view");
  if (!query.success) return { success: false, error: ERRORS.FORBIDDEN };

  const command = new GetObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: query.data.key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: { url } };
}

export async function createFolder(
  name: string,
  parentId: string,
): Promise<Result<{ folder: FolderType }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const query = await QUERIES.requestFolderFor(
    parentId,
    session.userId,
    "edit",
  );
  if (!query.success) return { success: false, error: ERRORS.FORBIDDEN };

  const mutation = await MUTATIONS.createFolder({ name, parentId });
  if (!mutation.success) return mutation;

  return { success: true, data: { folder: mutation.data } };
}

async function canCreateFile({
  userId,
  name,
  parentId,
}: { userId: string; name: string; parentId: string }): Promise<Result<null>> {
  const folderQuery = await QUERIES.requestFolderFor(parentId, userId, "edit");
  if (!folderQuery.success) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  const fileExistsQuery = await QUERIES.fileExists(name, parentId);
  if (!fileExistsQuery.success) {
    return { success: false, error: ERRORS.FILE_ALREADY_EXISTS };
  }

  return { success: true, data: null };
}

export async function startFileUpload({
  name,
  parentId,
}: {
  name: string;
  parentId: string;
}): Promise<Result<{ url: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const can = await canCreateFile({ userId: session.userId, name, parentId });
  if (!can.success) return can;

  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${
    mime.extension(name) || "bin"
  }`;

  const command = new PutObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: mime.contentType(name) || "application/octet-stream",
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: { url } };
}

export async function completeFileUpload({
  key,
  name,
  parentId,
}: {
  key: string;
  name: string;
  parentId: string;
}): Promise<Result<{ file: FileType }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const can = await canCreateFile({ userId: session.userId, name, parentId });
  if (!can.success) return can;

  const { ContentLength, ContentType } = await s3
    .send(
      new HeadObjectCommand({
        Bucket: env.S3_FILE_BUCKET_NAME,
        Key: key,
      }),
    )
    .then((res) => res as { ContentLength: number; ContentType: string });

  if (!ContentLength || !ContentType) {
    return {
      success: false,
      error: ERRORS.UPLOAD_FAILED,
    };
  }

  const mutation = await MUTATIONS.createFile({
    name,
    parentId,
    key,
    size: ContentLength,
    type: ContentType,
  });
  if (!mutation.success) return mutation;

  return { success: true, data: { file: mutation.data } };
}

export async function initPartialFileUpload({
  name,
  parentId,
}: {
  name: string;
  parentId: string;
}): Promise<Result<{ uploadId: string; key: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  const can = await canCreateFile({ userId: session.userId, name, parentId });
  if (!can.success) return can;

  const type = mime.contentType(name) || "application/octet-stream";
  const ext = mime.extension(type) || "bin";
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const { UploadId } = await s3.send(command);

  if (!UploadId) return { success: false, error: ERRORS.SERVER_ERROR };

  return { success: true, data: { uploadId: UploadId, key } };
}

export async function startFilePartUpload({
  key,
  uploadId,
  partNumber,
}: {
  key: string;
  uploadId: string;
  partNumber: number;
}): Promise<Result<{ url: string }>> {
  const session = await auth();
  if (!session?.userId) {
    return { success: false, error: ERRORS.UNAUTHORIZED };
  }

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  const uploadPartCommand = new UploadPartCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const signedUrl = await getSignedUrl(s3, uploadPartCommand, {
    expiresIn: 300,
  });
  return { success: true, data: { url: signedUrl } };
}

export async function completePartialFileUpload({
  key,
  name,
  parentId,
  uploadId,
  parts,
}: {
  key: string;
  name: string;
  parentId: string;
  uploadId: string;
  parts: CompletedPart[];
}): Promise<Result<{ file: FileType }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: ERRORS.FORBIDDEN };
  }

  const can = await canCreateFile({ userId: session.userId, name, parentId });
  if (!can.success) return can;

  const finishUpload = new CompleteMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3.send(finishUpload);

  // Get file size from s3
  const getMeta = new HeadObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
  });
  const { ContentLength, ContentType } = await s3.send(getMeta);
  if (!ContentLength || !ContentType) {
    return {
      success: false,
      error: ERRORS.UPLOAD_FAILED,
    };
  }

  try {
    const mutation = await MUTATIONS.createFile({
      name,
      key,
      parentId,
      size: ContentLength,
      type: ContentType,
    });

    if (!mutation.success) return mutation;

    return { success: true, data: { file: mutation.data } };
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

  const query = await QUERIES.requestFileFor(fileId, session.userId, "edit");
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
  const query = await QUERIES.requestFolderFor(
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
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_FILE_BUCKET_NAME,
        Key: file.key,
      }),
    );

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
    folderId,
    newName: name,
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
    fileId,
    newName: name,
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
  const canShare = await QUERIES.requestFileFor(
    fileId,
    session.userId,
    "share",
  );
  if (!canShare.success) return canShare;

  // Check user exists
  const userQuery = await QUERIES.getUserByEmail(email);
  if (!userQuery.success) return userQuery;
  const userToShareWith = userQuery.data;

  // Share file
  const mutation = await MUTATIONS.shareFile({
    fileId,
    sharedWithId: userToShareWith.id,
    permission,
  });
  if (!mutation.success) return mutation;

  return { success: true, data: null };
}

export async function shareFolder({
  folderId,
  email,
  permission,
}: {
  folderId: string;
  email: string;
  permission: "view" | "edit";
}): Promise<Result<null>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: ERRORS.UNAUTHORIZED };

  // Check permissions
  const canShare = await QUERIES.requestFolderFor(
    folderId,
    session.userId,
    "share",
  );
  if (!canShare.success) return canShare;

  // Check user exists
  const userQuery = await QUERIES.getUserByEmail(email);
  if (!userQuery.success) return userQuery;

  const userToShareWith = userQuery.data;

  // Share folder
  const mutation = await MUTATIONS.shareFolder({
    folderId,
    sharedWithId: userToShareWith.id,
    permission,
  });
  if (!mutation.success) return mutation;

  return { success: true, data: null };
}
