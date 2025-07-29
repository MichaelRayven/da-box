import { type ClassValue, clsx } from "clsx";
import sharp from "sharp";
import { twMerge } from "tailwind-merge";
import { env } from "~/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function getPublicObjectUrl(bucket: string, key: string) {
  const base = env.S3_ENDPOINT.slice(0, env.S3_ENDPOINT.lastIndexOf("/"));
  return `${base}/object/public/${bucket}/${key}`;
}

// Accepts: JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF
export function convertToJpeg(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}
