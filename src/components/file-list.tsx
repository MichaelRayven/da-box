"use client";

import { FolderIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { FileRow, FolderRow } from "./file-row";
import { useDriveStore } from "~/lib/store/drive";
import type { FileType, FolderType } from "~/lib/interface";

export default function FileList({
  folders: initialFolders,
  files: initialFiles,
}: {
  files?: FileType[];
  folders?: FolderType[];
}) {
  // Transition from SSR to local state
  const storeFiles = useDriveStore((s) => s.files);
  const storeFolders = useDriveStore((s) => s.folders);

  const files = storeFiles.length > 0 ? storeFiles : initialFiles ?? [];
  const folders = storeFolders.length > 0 ? storeFolders : initialFolders ?? [];

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="w-1/2 min-w-[200px] text-gray-300">
              Name
            </TableHead>
            <TableHead className="w-1/6 text-gray-300">Owner</TableHead>
            <TableHead className="w-1/6 text-gray-300">Last modified</TableHead>
            <TableHead className="w-1/6 text-gray-300">File size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((item) => (
            <FolderRow folder={item} key={item.id} />
          ))}
          {files.map((item) => (
            <FileRow file={item} key={item.id} />
          ))}
        </TableBody>
      </Table>
      {files.length === 0 && folders.length === 0 && (
        <div className="py-12 text-center">
          <FolderIcon className="mx-auto mb-4 h-12 w-12 text-gray-500" />
          <h3 className="mb-2 font-medium text-gray-300 text-lg">
            This folder is empty
          </h3>
          <p className="text-gray-500">
            Upload files or create folders to get started
          </p>
        </div>
      )}
    </div>
  );
}
