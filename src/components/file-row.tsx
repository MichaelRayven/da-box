"use client";

import { FileTextIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { FileType, FolderType } from "~/lib/interface";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { formatFileSize } from "~/lib/utils";
import { RowContextMenu } from "./row-context-menu";
import { RowDropdownMenu } from "./row-dropdown-menu";
import { restoreFolder } from "~/server/actions";

export function FileRow({ file }: { file: FileType }) {
  const { openRenameDialog, openShareDialog, openDeleteDialog } =
    useContextMenuStore();
  const handleShare = () => openShareDialog({ type: "file", item: file });
  const handleRename = () => openRenameDialog({ type: "file", item: file });
  const handleDelete = () => openDeleteDialog({ type: "file", item: file });
  const handleDownload = () => console.log("Download", file);

  return (
    <RowContextMenu
      onDownload={handleDownload}
      onDelete={handleDelete}
      onShare={handleShare}
      onRename={handleRename}
    >
      <TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
        <TableCell className="w-1/2 min-w-[200px] p-0 text-white hover:text-blue-400">
          <Link href={file.url} className="flex items-center gap-2 px-2">
            <FileTextIcon className="size-6" />
            <span className="max-w-[240px] truncate">{file.name}</span>
          </Link>
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {/* file.owner */}
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {file.modified?.toDateString()}
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {formatFileSize(file.size) || "—"}
        </TableCell>
        <TableCell>
          <RowDropdownMenu
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShare={handleShare}
            onRename={handleRename}
          />
        </TableCell>
      </TableRow>
    </RowContextMenu>
  );
}

export function FolderRow({ folder }: { folder: FolderType }) {
  const { openRenameDialog, openShareDialog, openDeleteDialog } =
    useContextMenuStore();
  const handleShare = () => openShareDialog({ type: "folder", item: folder });
  const handleRename = () => openRenameDialog({ type: "folder", item: folder });
  const handleDelete = () => openDeleteDialog({ type: "folder", item: folder });
  const handleDownload = () => console.log("Download", folder);

  return (
    <RowContextMenu
      onDownload={handleDownload}
      onTrash={handleDelete}
      onShare={handleShare}
      onRename={handleRename}
      onRestore={async () => await restoreFolder(folder.id)}
    >
      <TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
        <TableCell className="w-1/2 min-w-[200px] p-0 text-white hover:text-blue-400">
          <Link className="flex items-center gap-2 p-2" href={folder.url}>
            <FolderIcon className="size-6 shrink-0" />
            <span className="max-w-[240px] truncate">{folder.name}</span>
          </Link>
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {/* folder.owner */}
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">—</TableCell>
        <TableCell className="w-1/6 text-gray-300">—</TableCell>
        <TableCell>
          <RowDropdownMenu
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShare={handleShare}
            onRename={handleRename}
          />
        </TableCell>
      </TableRow>
    </RowContextMenu>
  );
}
