"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { files as filesSchema, folders as foldersSchema } from "./db/schema";
import { auth } from "./auth";
import { getFileById, getFolderById } from "./db/queries";
import { getPrivateObjectUrl } from "./s3";
import { env } from "~/env";

export async function getFileUrl(fileId: string) {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const file = await getFileById(fileId);

  if (file?.ownerId !== session.user.id) {
    return { success: false, error: "Forbidden" };
  }

  const url = await getPrivateObjectUrl(env.S3_FILE_BUCKET_NAME, file.key);

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

// export async function deleteFile(fileId: number) {
//   const session = await auth();
//   if (!session?.user.id) {
//     return { error: "Unauthorized" };
//   }

//   const file = await db.query.files.findFirst({
//     where: and(
//       eq(filesSchema.id, fileId),
//       eq(filesSchema.ownerId, session.user.id),
//     ),
//   });

//   if (!file) {
//     return { error: "File not found" };
//   }

//   const utapiResult = await utApi.deleteFiles([
//     file.url.replace("https://utfs.io/f/", ""),
//   ]);

//   console.log(utapiResult);

//   const dbDeleteResult = await db
//     .delete(filesSchema)
//     .where(eq(filesSchema.id, fileId));

//   console.log(dbDeleteResult);

//   const c = await cookies();

//   c.set("force-refresh", JSON.stringify(Math.random()));

//   return { success: true };
// }
