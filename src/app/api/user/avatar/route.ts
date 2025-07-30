import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import { s3 } from "~/server/s3";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: env.S3_AVATAR_BUCKET_NAME,
      Key: `${userId}/profile.jpeg`,
    });

    const response = await s3.send(command);

    const bodyStream = response.Body;
    const contentType = "image/jpeg";

    if (!bodyStream || typeof bodyStream === "string") {
      return new NextResponse("Invalid S3 response", { status: 500 });
    }

    return new NextResponse(bodyStream as ReadableStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("S3 GetObject error:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}
