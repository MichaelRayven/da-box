"use client";

import {
  ArchiveRestoreIcon,
  DownloadIcon,
  EditIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export function RowContextMenu({
  children,
  onDownload,
  onShare,
  onRename,
  onDelete,
  onRestore,
  onTrash,
}: {
  children: ReactNode;
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onTrash?: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {onDownload && (
          <ContextMenuItem onClick={onDownload} aria-label="Download item">
            <DownloadIcon /> Download
          </ContextMenuItem>
        )}
        {onShare && (
          <ContextMenuItem onClick={onShare} aria-label="Share item">
            <ShareIcon /> Share
          </ContextMenuItem>
        )}
        {onRename && (
          <ContextMenuItem onClick={onRename} aria-label="Rename item">
            <EditIcon /> Rename
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem onClick={onDelete} aria-label="Delete item">
            <Trash2Icon /> Delete
          </ContextMenuItem>
        )}
        {onRestore && (
          <ContextMenuItem onClick={onRestore} aria-label="Restore item">
            <ArchiveRestoreIcon /> Restore
          </ContextMenuItem>
        )}
        {onTrash && (
          <ContextMenuItem onClick={onTrash} aria-label="Move to trash">
            <Trash2Icon /> Move to trash
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
