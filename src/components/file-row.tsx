"use client";

import {
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  FolderIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { FileType, FolderType } from "~/lib/interface";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { formatFileSize } from "~/lib/utils";
import { FileDropdownMenu } from "./file-dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export function FileRow({ file }: { file: FileType }) {
  const { openRenameDialog, openShareDialog, openDeleteDialog } =
    useContextMenuStore();
  const handleShare = () => openShareDialog(file);
  const handleRename = () => openRenameDialog(file);
  const handleDelete = () => openDeleteDialog(file);
  const handleDownload = () => console.log("Download", file);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
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
            <FileDropdownMenu
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              onRename={handleRename}
            />
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDownload} aria-label="Download file">
          <DownloadIcon /> Download
        </ContextMenuItem>
        <ContextMenuItem onClick={handleShare} aria-label="Share file">
          <ShareIcon />
          Share
        </ContextMenuItem>
        <ContextMenuItem onClick={handleRename} aria-label="Rename file">
          <EditIcon />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} aria-label="Delete file">
          <Trash2Icon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function FolderRow({ folder }: { folder: FolderType }) {
  return (
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
    </TableRow>
  );
}
