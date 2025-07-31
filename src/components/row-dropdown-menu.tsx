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
}: {
  onDownload: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVerticalIcon className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onDownload} aria-label="Download item">
          <DownloadIcon /> Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare} aria-label="Share item">
          <ShareIcon /> Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename} aria-label="Rename item">
          <EditIcon /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} aria-label="Delete item">
          <Trash2Icon /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
