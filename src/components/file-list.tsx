"use client";

import { FolderIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { FileType, FolderType } from "~/lib/interface";
import { DeleteDialog } from "./delete-dialog";
import { FileRow, FolderRow } from "./file-row";
import { RenameDialog } from "./rename-dialog";
import { ShareDialog } from "./share-dialog";
import { useContextMenuStore } from "~/lib/store/context-menu";

export default function FileList({
  folders,
  files,
}: {
  files: FileType[];
  folders: FolderType[];
}) {
  const {
    isShareOpen,
    isRenameOpen,
    isDeleteOpen,
    closeRenameDialog,
    closeShareDialog,
    closeDeleteDialog,
  } = useContextMenuStore();

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
            <FolderRow folder={item} key={item.url} />
          ))}
          {files.map((item) => (
            <FileRow file={item} key={item.url} />
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

      {/* Context Dialogs */}
      <RenameDialog
        trigger={false}
        open={isRenameOpen}
        onOpenChange={closeRenameDialog}
      />
      <ShareDialog
        trigger={false}
        open={isShareOpen}
        onOpenChange={closeShareDialog}
      />
      <DeleteDialog
        trigger={false}
        open={isDeleteOpen}
        onOpenChange={closeDeleteDialog}
      />
    </div>
  );
}
