import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { s3 } from "~/server/s3";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { key, uploadId, parts } = await req.json();
  const userId = session.user.id;
  if (!key.startsWith(`${userId}/`)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const command = new CompleteMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });

  await s3.send(command);
  return NextResponse.json({ success: true });
}
