import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { s3 } from "~/server/s3";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { fileName, fileType } = await req.json();
  const userId = session.user.id;
  const ext = fileName?.split(".").pop() ?? "bin";
  const key = `${userId}/uploads/${crypto.randomUUID()}.${ext}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const res = await s3.send(command);

  return NextResponse.json({
    uploadId: res.UploadId,
    key,
  });
}
