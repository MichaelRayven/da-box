"use client";

import {
  DownloadIcon,
  EditIcon,
  EllipsisVerticalIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function RowDropdownMenu({
  onDownload,
  onShare,
  onRename,
  onDelete,
  onRestore,
  onTrash,
}: {
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onTrash?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVerticalIcon className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {onDownload && (
          <DropdownMenuItem onClick={onDownload} aria-label="Download item">
            <DownloadIcon /> Download
          </DropdownMenuItem>
        )}
        {onShare && (
          <DropdownMenuItem onClick={onShare} aria-label="Share item">
            <ShareIcon /> Share
          </DropdownMenuItem>
        )}
        {onRename && (
          <DropdownMenuItem onClick={onRename} aria-label="Rename item">
            <EditIcon /> Rename
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} aria-label="Delete item">
            <Trash2Icon /> Delete
          </DropdownMenuItem>
        )}
        {onRestore && (
          <DropdownMenuItem onClick={onRestore} aria-label="Restore item">
            <EditIcon /> Restore
          </DropdownMenuItem>
        )}
        {onTrash && (
          <DropdownMenuItem onClick={onTrash} aria-label="Move to trash">
            <Trash2Icon /> Move to trash
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
