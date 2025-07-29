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
import type z from "zod";
import { env } from "~/env";
import type {
  ActionResponse,
  FileType,
  FolderType,
  PostgresError,
} from "~/lib/interface";
import { fileNameSchema, updateProfileSchema } from "~/lib/validation";
import { auth } from "./auth";
import { db } from "./db";
import { updateUser } from "./db/mutations";
import { getAllSubfolders, getFileById } from "./db/queries";
import { files as filesSchema, folders as foldersSchema } from "./db/schema";
import { s3 } from "./s3";
import sharp from "sharp";
import { isUniqueConstraintViolation } from "~/lib/utils";

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
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

  return { success: true, data: url };
}

export async function createFolder(
  name: string,
  parentId: string,
): Promise<ActionResponse<{ folder: FolderType }>> {
  const session = await auth();

  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parent = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.id, parentId),
      eq(foldersSchema.ownerId, session.userId),
    ),
  });

  if (!parent) return { success: false, error: "Forbidden" };

  try {
    const [folder] = await db
      .insert(foldersSchema)
      .values({
        name: name,
        ownerId: session.userId,
        parentId: parentId,
      })
      .returning();

    if (!folder) return { success: false, error: "Something went wrong" };

    return { success: true, data: { folder } };
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      return { success: false, error: "Folder with this name already exists" };
    }

    return { success: false, error: "Something went wrong" };
  }
}

export async function getFileUploadUrl(
  name: string,
  type: string,
  parentId: string,
  size: number,
): Promise<ActionResponse<{ file: FileType; url: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const parent = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.id, parentId),
      eq(foldersSchema.ownerId, session.userId),
    ),
  });

  if (!parent) return { success: false, error: "Forbidden" };

  const ext = name?.split(".").pop() ?? "bin";
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  try {
    const [file] = await db
      .insert(filesSchema)
      .values({
        name,
        key,
        ownerId: session.userId,
        parentId,
        size,
        type,
        hidden: false,
      })
      .returning();

    if (!file) return { success: false, error: "Something went wrong" };

    const command = new PutObjectCommand({
      Bucket: env.S3_FILE_BUCKET_NAME,
      Key: key,
      ContentType: type,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });

    return { success: true, data: { file, url } };
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      return { success: false, error: "File with this name already exists" };
    }
  }

  return { success: false, error: "Something went wrong" };
}

export async function startPartialFileUpload(
  name: string,
  size: number,
  parentId: string,
): Promise<ActionResponse<{ uploadId: string; key: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const parent = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.id, parentId),
      eq(foldersSchema.ownerId, session.userId),
    ),
  });

  if (!parent) return { success: false, error: "Forbidden" };

  const type = mime.contentType(name) || "application/octet-stream";
  const ext = mime.extension(type);
  const key = `${session.userId}/uploads/${crypto.randomUUID()}.${ext}`;

  let file: FileType | undefined;

  try {
    [file] = await db.insert(filesSchema).values({
      name: name,
      key: key,
      ownerId: session.userId,
      parentId: parentId,
      size: size,
      type: type,
      hidden: true,
    });

    if (!file) return { success: false, error: "Something went wrong" };
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      file = await db.query.files.findFirst({
        where: and(
          eq(filesSchema.name, name),
          eq(filesSchema.parentId, parentId),
        ),
      });

      if (file?.hidden) {
        await db
          .update(filesSchema)
          .set({
            name: name,
            key: key,
            ownerId: session.userId,
            parentId: parentId,
            size: size,
            type: type,
            hidden: true,
          })
          .where(eq(filesSchema.id, file.id));
      } else {
        return { success: false, error: "File with this name already exists" };
      }
    }
  }

  const command = new CreateMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: type,
  });

  const { UploadId } = await s3.send(command);

  if (!UploadId) return { success: false, error: "Something went wrong" };

  return { success: true, data: { uploadId: UploadId, key } };
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
): Promise<ActionResponse<{ file: FileType }>> {
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

  try {
    const [updatedFile] = await db
      .update(filesSchema)
      .set({
        hidden: false,
      })
      .where(eq(filesSchema.key, key))
      .returning();

    if (!updatedFile) return { success: false, error: "Something went wrong" };

    return { success: true, data: { file: updatedFile } };
  } catch (e) {
    console.error(e);
  }
  return { success: false, error: "Something went wrong" };
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

function getPublicObjectUrl(bucket: string, key: string) {
  const base = env.S3_ENDPOINT.slice(0, env.S3_ENDPOINT.lastIndexOf("/"));
  return `${base}/object/public/${bucket}/${key}`;
}

// Accepts: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF
function convertToJpeg(buffer: Buffer): Promise<Buffer> {
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
): Promise<ActionResponse<{ message: string }>> {
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
    data: { message: "Your profile has been updated!" },
  };
}

export async function deleteFolder(
  folderId: string,
): Promise<ActionResponse<{ folderId: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const rootFolder = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.id, folderId),
      eq(foldersSchema.ownerId, session.userId),
    ),
    with: {
      files: true,
    },
  });

  if (!rootFolder) {
    return { success: false, error: "Folder not found" };
  }

  const allFolders = await getAllSubfolders(folderId);

  const allFiles = [
    ...rootFolder.files,
    ...allFolders.flatMap((folder) => folder.files),
  ];

  for (const file of allFiles) {
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.S3_FILE_BUCKET_NAME,
          Key: file.key,
        }),
      );
    } catch (err) {
      console.error(`Failed to delete S3 file: ${file.key}`, err);
      return { success: false, error: "Failed to delete file" };
    }
  }

  // Delete root folder (all descendants are cascade deleted)
  await db.delete(foldersSchema).where(eq(foldersSchema.id, folderId));

  return { success: true, data: { folderId } };
}

export async function renameFolder(
  folderId: string,
  newName: string,
): Promise<ActionResponse<{ folderId: string; name: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const { success, data, error } = fileNameSchema.safeParse({ name: newName });
  if (!success) {
    return { success: false, error: error.message };
  }

  const folder = await db.query.folders.findFirst({
    where: and(
      eq(foldersSchema.id, folderId),
      eq(foldersSchema.ownerId, session.userId),
    ),
    with: {
      parent: true,
    },
  });

  if (!folder) return { success: false, error: "Folder not found" };

  // Cannot rename Root, Trash, Shared or Starred
  if (!folder.parentId || !folder.parent?.parentId)
    return { success: false, error: "Forbidden" };

  try {
    await db
      .update(foldersSchema)
      .set({ name: data.name })
      .where(eq(foldersSchema.id, folderId));
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      return { success: false, error: "Folder with this name already exists" };
    }

    return { success: false, error: "Something went wrong" };
  }

  return { success: true, data: { folderId, name: data.name } };
}

export async function renameFile(
  fileId: string,
  newName: string,
): Promise<ActionResponse<{ fileId: string; name: string }>> {
  const session = await auth();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const { success, data, error } = fileNameSchema.safeParse({ name: newName });
  if (!success) {
    return { success: false, error: error.message };
  }

  const file = await db.query.files.findFirst({
    where: and(
      eq(filesSchema.id, fileId),
      eq(filesSchema.ownerId, session.userId),
    ),
  });

  if (!file) return { success: false, error: "File not found" };

  try {
    await db
      .update(filesSchema)
      .set({ name: data.name })
      .where(eq(filesSchema.id, fileId));
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      return { success: false, error: "File with this name already exists" };
    }

    return { success: false, error: "Something went wrong" };
  }

  return { success: true, data: { fileId, name: data.name } };
}
