"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { files as filesSchema, folders as foldersSchema } from "./db/schema";
import { auth } from "./auth";
import { getFileById, getFolderById } from "./db/queries";
import { env } from "~/env";
import type { ActionResponse } from "~/lib/interface";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3";
import { cookies } from "next/headers";

export async function getFileViewingUrl(fileId: string) {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = await getFileById(fileId);

  if (file?.ownerId !== session.user.id) {
    return { success: false, error: "Forbidden" };
  }

  const command = new GetObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: file.key,
    ResponseContentDisposition: `attachment; filename="${file.name}"`,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: url };
}

export async function createFolder(name: string, parentId: string) {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parent = await getFolderById(parentId);

  if (parent?.ownerId !== session.user.id) {
    return { success: false, error: "Forbidden" };
  }

  const exists = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.parentId, parentId),
      eq(foldersSchema.name, name),
    ),
  });

  if (exists) return { success: false, error: "This folder already exists" };

  const folderId = await db
    .insert(foldersSchema)
    .values({
      name: name,
      ownerId: session.user.id,
      parentId: parentId,
    })
    .returning({ id: foldersSchema.id });

  return { success: true, data: folderId };
}

export async function getFileUploadUrl(
  name: string,
  type: string,
  parentId: string,
  size: number,
): Promise<ActionResponse<{ key: string; url: string }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parent = await getFolderById(parentId);
  if (parent?.ownerId !== session.user.id) {
    return { success: false, error: "Forbidden" };
  }

  const exists = await db.query.files.findFirst({
    where: and(eq(filesSchema.parentId, parentId), eq(filesSchema.name, name)),
  });

  if (exists) return { success: false, error: "File already exists" };

  const userId = session.user.id;
  const ext = name?.split(".").pop() ?? "bin";
  const key = `${userId}/uploads/${crypto.randomUUID()}.${ext}`;

  await db.insert(filesSchema).values({
    name,
    key,
    ownerId: userId,
    parentId,
    size,
    type,
    hidden: false,
  });

  const command = new PutObjectCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: { key, url } };
}

export async function startPartialFileUpload(
  name: string,
  type: string,
  parentId: string,
  size: number,
): Promise<ActionResponse<{ uploadId: string; key: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const parent = await getFolderById(parentId);

  if (parent?.ownerId !== session.userId) {
    return { success: false, error: "Forbidden" };
  }

  const exists = await db.query.files.findFirst({
    where: and(eq(filesSchema.parentId, parentId), eq(filesSchema.name, name)),
  });

  if (exists) return { success: false, error: "File already exists" };

  const ext = name?.split(".").pop() ?? "bin";
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  await db.insert(filesSchema).values({
    name: name,
    key: key,
    ownerId: session.userId,
    parentId: parentId,
    size: size,
    type: type,
    hidden: true,
  });

  const command = new CreateMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const { UploadId } = await s3.send(command);

  if (!UploadId) return { success: false, error: "Something went wrong" };

  return { success: true, data: { uploadId: UploadId, key: key } };
}

export async function getUploadFilePartUrl(
  key: string,
  uploadId: string,
  partNumber: number,
): Promise<ActionResponse<{ url: string }>> {
  const session = await auth();

  if (!session?.userId) return { success: false, error: "Unauthorized" };

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: "Forbidden" };
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
): Promise<ActionResponse<{ id: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  if (!key.startsWith(`${session.userId}/`)) {
    return { success: false, error: "Forbidden" };
  }

  const command = new CompleteMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3.send(command);

  const [updatedFile] = await db
    .update(filesSchema)
    .set({
      hidden: false,
    })
    .where(eq(filesSchema.key, key))
    .returning({ id: filesSchema.id });

  if (!updatedFile) return { success: false, error: "Something went wrong" };

  return { success: true, data: { id: updatedFile.id } };
}

export async function deleteFile(
  fileId: string,
): Promise<ActionResponse<{ fileId: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const file = await db.query.files.findFirst({
    where: and(
      eq(filesSchema.id, fileId),
      eq(filesSchema.ownerId, session.userId),
    ),
  });

  if (!file) {
    return { success: false, error: "File not found" };
  }

  try {
    // 1. Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_FILE_BUCKET_NAME,
        Key: file.key,
      }),
    );

    // 2. Delete from DB
    await db.delete(filesSchema).where(eq(filesSchema.id, fileId));

    // 3. Force revalidation cookie
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));

    return { success: true, data: { fileId } };
  } catch (err) {
    console.error("File deletion error:", err);
    return { success: false, error: "Failed to delete file" };
  }
}
