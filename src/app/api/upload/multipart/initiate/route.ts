import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getFolderById } from "~/server/db/queries";
import { files as filesSchema } from "~/server/db/schema";
import { s3 } from "~/server/s3";

export async function POST(req: Request) {
  const { name, type, size, parentId } = await req.json();

  const session = await auth();
  if (!session)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const parent = await getFolderById(parentId);

  if (parent?.ownerId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const userId = session.user.id;
  const ext = name?.split(".").pop() ?? "bin";
  const key = `${userId}/uploads/${crypto.randomUUID()}.${ext}`;

  await db.insert(filesSchema).values({
    name: name,
    key: key,
    ownerId: userId,
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

  const res = await s3.send(command);

  return NextResponse.json({ uploadId: res.UploadId, key });
}
