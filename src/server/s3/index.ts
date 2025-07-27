import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

export function getPublicObjectUrl(bucket: string, key: string) {
  const base = env.S3_ENDPOINT.slice(0, env.S3_ENDPOINT.lastIndexOf("/"));
  return `${base}/object/public/${bucket}/${key}`;
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
