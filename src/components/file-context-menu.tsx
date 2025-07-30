"use client";

import { DownloadIcon, EditIcon, ShareIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export function FileContextMenu({
  children,
  onDownload,
  onShare,
  onRename,
  onDelete,
}: {
  children: ReactNode;
  onDownload: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onDownload} aria-label="Download file">
          <DownloadIcon /> Download
        </ContextMenuItem>
        <ContextMenuItem onClick={onShare} aria-label="Share file">
          <ShareIcon />
          Share
        </ContextMenuItem>
        <ContextMenuItem onClick={onRename} aria-label="Rename file">
          <EditIcon />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} aria-label="Delete file">
          <Trash2Icon />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
