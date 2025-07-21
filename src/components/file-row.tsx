import { FileText, Folder } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { files, folders } from "~/server/db/schema";

export function FileRow({ file }: { file: typeof files.$inferSelect }) {
  return (
    <TableRow className="border-gray-700 hover:bg-gray-750 cursor-pointer">
      <TableCell className="p-0 text-white hover:text-blue-400">
        <Link href={file.url} className="p-2 flex items-center space-x-3">
          <FileText className="size-6" />
          <span>{file.name}</span>
        </Link>
      </TableCell>
      <TableCell className="text-gray-300">{/*file.owner*/}</TableCell>
      <TableCell className="text-gray-300">
        {file.modified?.toDateString()}
      </TableCell>
      <TableCell className="text-gray-300">{file.size || "—"}</TableCell>
    </TableRow>
  );
}

export function FolderRow({ folder }: { folder: typeof folders.$inferSelect }) {
  return (
    <TableRow className="border-gray-700 hover:bg-gray-750 cursor-pointer">
      <TableCell className="p-0 text-white hover:text-blue-400">
        <Link
          className="p-2 flex items-center space-x-3"
          href={`/drive/folders/${folder.id}`}
        >
          <Folder className="size-6" />
          <span>{folder.name}</span>
        </Link>
      </TableCell>
      <TableCell className="text-gray-300">{/*folder.owner*/}</TableCell>
    </TableRow>
  );
}
