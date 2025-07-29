"use server";

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
import { and, eq } from "drizzle-orm";
import mime from "mime-types";
import { cookies } from "next/headers";
import sharp from "sharp";
import type z from "zod";
import { env } from "~/env";
import type { ActionResponse } from "~/lib/interface";
import { updateProfileSchema } from "~/lib/validation";
import { auth } from "./auth";
import { db } from "./db";
import { updateUser } from "./db/mutations";
import { getFileById, getFolderById } from "./db/queries";
import { files as filesSchema, folders as foldersSchema } from "./db/schema";
import { s3 } from "./s3";

export async function getFileViewingUrl(fileId: string) {
  const session = await auth();

  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const file = await getFileById(fileId);

  if (file?.ownerId !== session.userId) {
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

  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parent = await getFolderById(parentId);

  if (parent?.ownerId !== session.userId) {
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
      ownerId: session.userId,
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
    name,
    key,
    ownerId: session.userId,
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
  size: number,
  parentId: string,
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

  const type = mime.contentType(name) || "application/octet-stream";
  const ext = mime.extension(type);
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

export function getPublicObjectUrl(bucket: string, key: string) {
  const base = env.S3_ENDPOINT.slice(0, env.S3_ENDPOINT.lastIndexOf("/"));
  return `${base}/object/public/${bucket}/${key}`;
}

// Accepts: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF
async function convertToJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

export async function uploadAvatar(
  avatar: File,
): Promise<ActionResponse<{ url: string }>> {
  const session = await auth();

  if (!session?.userId) return { success: false, error: "Unauthorized" };

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
    data: { url: getPublicObjectUrl(env.S3_AVATAR_BUCKET_NAME, key) },
  };
}

export async function updateUserProfile(
  unsafeData: z.infer<typeof updateProfileSchema>,
): Promise<ActionResponse<string>> {
  const session = await auth();
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error, success } = updateProfileSchema.safeParse(unsafeData);
  if (!success) {
    return { success: false, error: error.message };
  }

  const { name, username, avatar } = data;
  let avatarUrl: string | undefined;

  if (avatar instanceof File) {
    try {
      const res = await uploadAvatar(avatar);
      if (res.success) {
        avatarUrl = res.data.url;
      }
    } catch (err) {
      return { success: false, error: "Failed to upload avatar." };
    }
  } else if (typeof avatar === "string") {
    avatarUrl = avatar;
  }

  await updateUser(session.userId, {
    name,
    username,
    image: avatarUrl,
  });

  return {
    success: true,
    data: "Your profile has been updated!",
  };
}
