"use client";

import {
  ArchiveRestoreIcon,
  DownloadIcon,
  EditIcon,
  ShareIcon,
  StarIcon,
  StarOffIcon,
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
  onFavorite,
  onUnfavorite,
}: {
  children: ReactNode;
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onTrash?: () => void;
  onFavorite?: () => void;
  onUnfavorite?: () => void;
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
        {onFavorite && (
          <ContextMenuItem onClick={onFavorite} aria-label="Favorite item">
            <StarIcon /> Add to favorites
          </ContextMenuItem>
        )}
        {onUnfavorite && (
          <ContextMenuItem onClick={onUnfavorite} aria-label="Unfavorite item">
            <StarOffIcon /> Remove from favorites
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
        {onDelete && (
          <ContextMenuItem onClick={onDelete} aria-label="Delete item">
            <Trash2Icon /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
