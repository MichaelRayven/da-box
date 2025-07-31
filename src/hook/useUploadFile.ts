"use client";

import type { CompletedPart } from "@aws-sdk/client-s3";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { FileType } from "~/lib/interface";
import {
  completePartialFileUpload,
  startFileUpload,
  startFilePartUpload,
  completeFileUpload,
  initPartialFileUpload,
} from "~/server/actions";
import { files } from "~/server/db/schema";

interface UseUploadFileOptions {
  onSuccess?: (data: FileType[], variables: File[], context: unknown) => void;
  onError?: (error: any, variables: File[], context: unknown) => void;
  onUpload?: (variables: File[]) => void;
  onFileUpload?: (variables: File) => void;
  onFileUploaded?: (file: FileType) => void;
  onPartUpload?: (file: File, partNumber: number, totalParts: number) => void;
  onFinished?: (
    data: any,
    error: unknown,
    variables: File[],
    context: unknown,
  ) => void;
}

const PART_SIZE = 5 * 1024 * 1024; // 5MB

export function useUploadFile({
  onSuccess,
  onError,
  onUpload,
  onFinished,
  onFileUpload,
  onFileUploaded,
  onPartUpload,
}: UseUploadFileOptions = {}) {
  const { folderId } = useParams();
  const parentId = folderId as string | undefined;

  const uploadSmallFile = async (file: File, parentId: string) => {
    const res = await startFileUpload({
      name: file.name,
      parentId: parentId,
    });

    if (!res.success) throw new Error(res.error);

    const putRes = await fetch(res.data.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("Upload failed");

    const completeRes = await completeFileUpload({
      key: res.data.key,
      name: file.name,
      parentId: parentId,
    });
    if (!completeRes.success) throw new Error(completeRes.error);

    return completeRes.data.file;
  };

  const uploadLargeFile = async (
    file: File,
    parentId: string,
    onPartUpload?: (file: File, partNumber: number, totalParts: number) => void,
  ) => {
    const start = await initPartialFileUpload({
      name: file.name,
      parentId: parentId,
    });
    if (!start.success) throw new Error(start.error);

    const totalParts = Math.ceil(file.size / PART_SIZE);
    const parts: CompletedPart[] = [];

    for (let i = 0; i < totalParts; i++) {
      const partNumber = i + 1;
      onPartUpload?.(file, partNumber, totalParts);

      const startByte = i * PART_SIZE;
      const endByte = Math.min(startByte + PART_SIZE, file.size);
      const blob = file.slice(startByte, endByte);

      const presigned = await startFilePartUpload({
        key: start.data.key,
        uploadId: start.data.uploadId,
        partNumber: partNumber,
      });
      if (!presigned.success) throw new Error(presigned.error);

      const uploadRes = await fetch(presigned.data.url, {
        method: "PUT",
        body: blob,
      });

      const eTag = uploadRes.headers.get("ETag")?.replace(/"/g, "");
      if (!uploadRes.ok || !eTag) {
        throw new Error(`Failed to upload part ${partNumber}`);
      }

      parts.push({ PartNumber: partNumber, ETag: eTag });
    }

    const complete = await completePartialFileUpload({
      key: start.data.key,
      name: file.name,
      parentId: parentId,
      uploadId: start.data.uploadId,
      parts,
    });
    if (!complete.success) throw new Error(complete.error);

    return complete.data.file;
  };

  async function uploadFiles(files: File[]): Promise<FileType[]> {
    if (!parentId) throw new Error("No parent folder selected");

    const uploaded: FileType[] = [];

    for (const file of files) {
      onFileUpload?.(file);

      const uploadedFile =
        file.size < 10 * 1024 * 1024
          ? await uploadSmallFile(file, parentId)
          : await uploadLargeFile(file, parentId, onPartUpload);

      uploaded.push({
        ...uploadedFile,
        url: `/drive/files/${uploadedFile.key}`,
      });
      onFileUploaded?.({
        ...uploadedFile,
        url: `/drive/files/${uploadedFile.key}`,
      });
    }

    return uploaded;
  }

  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationFn: uploadFiles,
    onMutate: onUpload,
    onSuccess,
    onError,
    onSettled: onFinished,
  });

  return {
    upload: mutate,
    uploadAsync: mutateAsync,
    ...mutation,
  };
}
