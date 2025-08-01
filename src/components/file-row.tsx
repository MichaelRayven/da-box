"use client";

import { FileTextIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TableCell, TableRow } from "~/components/ui/table";
import { useContextMenuAction } from "~/hook/useContextMenuAction";
import type { FileType, FolderType, ItemType } from "~/lib/interface";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { formatFileSize } from "~/lib/utils";
import {
  favoriteFolder,
  restoreFile,
  restoreFolder,
  trashFile,
  trashFolder,
  unfavoriteFolder,
} from "~/server/actions";
import { RowContextMenu } from "./row-context-menu";
import { RowDropdownMenu } from "./row-dropdown-menu";

// Shared row component props
interface RowProps<T> {
  item: T;
  type: "file" | "folder";
}

// Generic row component for files and folders
function ItemRow({ item }: { item: ItemType }) {
  const actions = useContextMenuAction(item);

  const isFile = item.type === "file";

  const menuProps = {
    onShare: actions.share,
    onRename: actions.rename,
    onDelete: actions.delete,
    onDownload: actions.download,
    onRestore: actions.restore,
    onTrash: actions.trash,
    onFavorite: actions.favorite,
    onUnfavorite: actions.unfavorite,
  };

  return (
    <RowContextMenu {...menuProps}>
      <TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
        <TableCell className="w-1/2 min-w-[200px] p-0 text-white hover:text-blue-400">
          <Link href={item.data.url} className="flex items-center gap-2 px-2">
            {isFile ? (
              <FileTextIcon className="size-6 shrink-0" />
            ) : (
              <FolderIcon className="size-6 shrink-0" />
            )}
            <span className="max-w-[240px] truncate">{item.data.name}</span>
          </Link>
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {/* item.data.owner */}
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {isFile ? item.data.modified?.toDateString() : "—"}
        </TableCell>
        <TableCell className="w-1/6 text-gray-300">
          {isFile ? formatFileSize(item.data.size) : "—"}
        </TableCell>
        <TableCell>
          <RowDropdownMenu {...menuProps} />
        </TableCell>
      </TableRow>
    </RowContextMenu>
  );
}

// Specific components for files and folders
export function FileRow({ file }: { file: FileType }) {
  return <ItemRow item={{ type: "file", data: file }} />;
}

export function FolderRow({ folder }: { folder: FolderType }) {
  return <ItemRow item={{ type: "folder", data: folder }} />;
}
