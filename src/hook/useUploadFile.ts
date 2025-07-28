import type { CompletedPart } from "@aws-sdk/client-s3";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface InitiateResponse {
  uploadId: string;
  key: string;
}

const PART_SIZE = 5 * 1024 * 1024; // 5MB

interface UseUploadFileOptions {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onSuccess?: (data: any, variables: File, context: unknown) => void;
  onError?: (error: unknown, variables: File, context: unknown) => void;
  onUpload?: (variables: File) => void;
  onPartUpload?: (partNumber: number, totalParts: number) => void;
  onFinished?: (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    data: any,
    error: unknown,
    variables: File,
    context: unknown,
  ) => void;
}

export function useUploadFile({
  onSuccess,
  onPartUpload,
  onUpload,
  onFinished,
  onError,
}: UseUploadFileOptions = {}) {
  const { folderId } = useParams();
  const parentId = folderId as string | undefined;

  const { mutate, mutateAsync, ...mutation } = useMutation({
    onSuccess: onSuccess,
    onError: onError,
    onMutate: onUpload,
    onSettled: onFinished,
    mutationFn: async (file: File) => {
      // Step 1: Initiate
      const { uploadId, key }: InitiateResponse = await fetch(
        "/api/upload/multipart/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            parentId,
          }),
        },
      ).then((res) => res.json());

      const partCount = Math.ceil(file.size / PART_SIZE);
      const parts: CompletedPart[] = [];

      // Step 2: Upload parts to S3
      for (let i = 0; i < partCount; i++) {
        const partNumber = i + 1;
        onPartUpload?.(partNumber, partCount);
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
      const { success } = await fetch("/api/upload/multipart/complete", {
        method: "POST",
        body: JSON.stringify({ uploadId, parentId, key, parts }),
      }).then((res) => res.json());

      if (!success) throw new Error(`Failed to upload file: ${file.name}`);

      return key;
    },
  });
  return {
    upload: mutate,
    uploadAsync: mutateAsync,
    ...mutation,
  };
}
