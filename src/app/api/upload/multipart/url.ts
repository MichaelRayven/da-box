import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { s3 } from "~/server/s3";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const uploadId = searchParams.get("uploadId")!;
  const partNumber = Number.parseInt(searchParams.get("partNumber")!, 10);
  const key = searchParams.get("key")!;

  const userId = session.user.id;
  if (!key.startsWith(`${userId}/`)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const command = new UploadPartCommand({
    Bucket: env.S3_FILE_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return NextResponse.json({ url });
}
