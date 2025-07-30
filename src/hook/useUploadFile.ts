"use client";

import type { CompletedPart } from "@aws-sdk/client-s3";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { FileType } from "~/lib/interface";
import {
  completePartialFileUpload,
  getFileUploadUrl,
  getUploadFilePartUrl,
  startPartialFileUpload,
} from "~/server/actions";

interface UseUploadFileOptions {
  onSuccess?: (data: FileType[], variables: File[], context: unknown) => void;
  onError?: (error: unknown, variables: File[], context: unknown) => void;
  onUpload?: (variables: File[]) => void;
  onFileUpload?: (variables: File) => void;
  onFileUploaded?: (file: FileType) => void;
  onPartUpload?: (file: File, partNumber: number, totalParts: number) => void;
  onFinished?: (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
    const res = await getFileUploadUrl(
      file.name,
      file.type,
      parentId,
      file.size,
    );
    if (!res.success) throw new Error(res.error);

    const putRes = await fetch(res.data.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("Upload failed");

    return res.data.file;
  };

  const uploadLargeFile = async (
    file: File,
    parentId: string,
    onPartUpload?: (file: File, partNumber: number, totalParts: number) => void,
  ) => {
    const start = await startPartialFileUpload(file.name, file.size, parentId);
    if (!start.success) throw new Error(start.error);

    const totalParts = Math.ceil(file.size / PART_SIZE);
    const parts: CompletedPart[] = [];

    for (let i = 0; i < totalParts; i++) {
      const partNumber = i + 1;
      onPartUpload?.(file, partNumber, totalParts);

      const startByte = i * PART_SIZE;
      const endByte = Math.min(startByte + PART_SIZE, file.size);
      const blob = file.slice(startByte, endByte);

      const presigned = await getUploadFilePartUrl(
        start.data.key,
        start.data.uploadId,
        partNumber,
      );
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

    const complete = await completePartialFileUpload(
      start.data.key,
      start.data.uploadId,
      parts,
    );
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

      uploaded.push(uploadedFile);
      onFileUploaded?.(uploadedFile);
    }

    return uploaded;
  }

  const { mutate, mutateAsync, ...mutation } = useMutation<
    FileType[],
    unknown,
    File[]
  >({
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
