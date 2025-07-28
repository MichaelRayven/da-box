import type { CompletedPart } from "@aws-sdk/client-s3";
import { useMutation } from "@tanstack/react-query";

interface InitiateResponse {
  uploadId: string;
  key: string;
}

const PART_SIZE = 5 * 1024 * 1024; // 5MB

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Initiate
      const { uploadId, key }: InitiateResponse = await fetch(
        "/api/upload/multipart/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, type: file.type }),
        },
      ).then((res) => res.json());

      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts: CompletedPart[] = [];

      // Step 2: Upload parts to S3
      for (let i = 0; i < partCount; i++) {
        const partNumber = i + 1;
        const start = i * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const partBlob = file.slice(start, end);

        const { url } = await fetch("/api/upload/multipart/url", {
          method: "POST",
          body: JSON.stringify({ uploadId, key, partNumber }),
        }).then((res) => res.json());

        const uploadRes = await fetch(url, {
          method: "PUT",
          body: partBlob,
        });

        const ETag = uploadRes.headers.get("ETag");
        if (!uploadRes.ok || !ETag) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        parts.push({ ETag: ETag.replace(/"/g, ""), PartNumber: partNumber });
      }

      // Step 3: Complete upload
      await fetch("/api/upload/multipart/complete", {
        method: "POST",
        body: JSON.stringify({ uploadId, key, parts }),
      });

      return { success: true, key };
    },
  });
}
