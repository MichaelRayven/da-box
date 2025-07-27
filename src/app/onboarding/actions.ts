"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import type z from "zod";
import { onboardingSchema } from "~/lib/validation";
import { auth } from "~/server/auth";
import mime from "mime-types";
import { getPublicObjectUrl, s3 } from "~/server/s3";
import { updateUserProfile } from "~/server/db/mutations";
import sharp from "sharp";

function getFileExtension(filename: string) {
  return filename.split(".").pop();
}

async function convertToJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .jpeg({ quality: 90 }) // convert to JPEG
    .toBuffer();
}

async function uploadAvatar(key: string, avatar: File) {
  const arrayBuffer = await avatar.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = getFileExtension(avatar.name);
  const mimeType = mime.lookup(ext || "") || "application/octet-stream";

  const uploadCommand = new PutObjectCommand({
    Bucket: "avatar-bucket",
    Key: key,
    Body: await convertToJpeg(buffer),
    ContentType: mimeType,
    ACL: "public-read",
  });

  await s3.send(uploadCommand);
  return getPublicObjectUrl("avatar-bucket", key);
}

export async function submitOnboarding(
  unsafeData: z.infer<typeof onboardingSchema>,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { success, data, error } = onboardingSchema.safeParse(unsafeData);

  if (!success) throw new Error(error.message);

  // TODO: encode all avatar formats to jpg
  const avatarFile = data.avatar as File | null;
  let avatarUrl: string | undefined;
  if (avatarFile) {
    avatarUrl = await uploadAvatar(
      `${session.user.id}/profile.jpeg`,
      avatarFile,
    );
  }

  await updateUserProfile(session.user.id, {
    image: avatarUrl,
    name: data.name,
    username: data.username,
  });

  return "Your profile has been updated!";
}
