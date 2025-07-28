import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { files as filesSchema } from "~/server/db/schema";
import { s3 } from "~/server/s3";

export async function POST(req: Request) {
  const { key, uploadId, parts } = await req.json();

  const session = await auth();
  if (!session)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const userId = session.user.id;
  if (!key.startsWith(`${userId}/`)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
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

  return NextResponse.json({ success: true, data: updatedFile!.id });
}
