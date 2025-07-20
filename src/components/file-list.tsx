"use client";

import { Folder } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mockFiles, mockFolders } from "~/app/_mock";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { File as IFile, Folder as IFolder } from "~/lib/interface";
import { FileRow, FolderRow } from "./file-row";

export default function FileList() {
  const router = useRouter();
  const params = useParams<{ folderId: string | undefined }>();
  const currentFolderId = params.folderId || "root";

  const [currentFolders, setCurrentFolders] = useState<IFolder[]>([]);
  const [currentFiles, setCurrentFiles] = useState<IFile[]>([]);

  useEffect(() => {
    const filteredFiles = mockFiles.filter(
      (item) => item.parent == currentFolderId
    );

    const filteredFolders = mockFolders.filter(
      (item) => item.parent == currentFolderId
    );

    setCurrentFiles(filteredFiles);
    setCurrentFolders(filteredFolders);
  }, [currentFolderId]);

  const handleFolderClick = (item: IFolder) => {
    router.push(`/drive/folders/${item.id}`);
  };

  const handleFileClick = (item: IFile) => {
    window.open(item.url, "_blank");
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="text-gray-300">Name</TableHead>
            <TableHead className="text-gray-300">Owner</TableHead>
            <TableHead className="text-gray-300">Last modified</TableHead>
            <TableHead className="text-gray-300">File size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentFolders.map((item) => (
            <FolderRow
              folder={item}
              key={item.id}
              handleFolderClick={() => {
                handleFolderClick(item);
              }}
            />
          ))}
          {currentFiles.map((item) => (
            <FileRow
              file={item}
              key={item.id}
              handleFileClick={() => {
                handleFileClick(item);
              }}
            />
          ))}
        </TableBody>
      </Table>
      {currentFiles.length === 0 && currentFolders.length === 0 && (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
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
