import { FileTextIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { File, Folder } from "~/lib/interface";

export function FileRow({ file }: { file: File }) {
  return (
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
      <TableCell className="w-1/6 text-gray-300">{/* file.owner */}</TableCell>
      <TableCell className="w-1/6 text-gray-300">
        {file.modified?.toDateString()}
      </TableCell>
      <TableCell className="w-1/6 text-gray-300">{file.size || "—"}</TableCell>
    </TableRow>
  );
}

export function FolderRow({ folder }: { folder: Folder }) {
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
