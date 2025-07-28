import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/env";

export function getPublicObjectUrl(bucket: string, key: string) {
  const base = env.S3_ENDPOINT.slice(0, env.S3_ENDPOINT.lastIndexOf("/"));
  return `${base}/object/public/${bucket}/${key}`;
}

export async function getPrivateObjectUrl(bucket: string, key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 3600, // expires in 5 minutes
  });

  return url;
}

export const s3 = new S3Client({
  forcePathStyle: true,
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  },
});
