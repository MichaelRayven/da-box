import { EllipsisVerticalIcon, FileTextIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { FileType, FolderType } from "~/lib/interface";
import { formatFileSize } from "~/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

function FileDropdownMenu({
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
        <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
        <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FileRow({ file }: { file: FileType }) {
  const handleShare = () => console.log("Share", file);
  const handleRename = () => console.log("Rename", file);
  const handleDelete = () => console.log("Delete", file);
  const handleDownload = () => console.log("Download", file);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
          <TableCell className="w-1/2 min-w-[200px] p-0 text-white hover:text-blue-400">
            <Link
              href={`/drive/files/${file.id}`}
              className="flex items-center gap-2 px-2"
            >
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
        <ContextMenuItem onClick={handleDownload}>Download</ContextMenuItem>
        <ContextMenuItem onClick={handleShare}>Share</ContextMenuItem>
        <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
        <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function FolderRow({ folder }: { folder: FolderType }) {
  return (
    <TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
      <TableCell className="w-1/2 min-w-[200px] p-0 text-white hover:text-blue-400">
        <Link
          className="flex items-center gap-2 p-2"
          href={`/drive/folders/${folder.id}`}
        >
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
