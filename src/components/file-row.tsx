import { FileText, Folder } from "lucide-react";
import { TableCell, TableRow } from "~/components/ui/table";
import type { File as IFile, Folder as IFolder } from "~/lib/interface";

export function FileRow({
  file,
  handleFileClick = () => {},
}: {
  file: IFile;
  handleFileClick?: () => void;
}) {
  return (
    <TableRow
      className="border-gray-700 hover:bg-gray-750 cursor-pointer"
      onClick={handleFileClick}
    >
      <TableCell className="text-white hover:text-blue-400">
        <div className="flex items-center space-x-3">
          <FileText className="size-6" />
          <span>{file.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-300">{file.owner}</TableCell>
      <TableCell className="text-gray-300">{file.modified}</TableCell>
      <TableCell className="text-gray-300">{file.size || "—"}</TableCell>
    </TableRow>
  );
}

export function FolderRow({
  folder,
  handleFolderClick = () => {},
}: {
  folder: IFolder;
  handleFolderClick?: () => void;
}) {
  return (
    <TableRow
      className="border-gray-700 hover:bg-gray-750 cursor-pointer"
      onClick={handleFolderClick}
    >
      <TableCell className="text-white hover:text-blue-400">
        <div className="flex items-center space-x-3">
          <Folder className="size-6" />
          <span>{folder.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-gray-300">{folder.owner}</TableCell>
    </TableRow>
  );
}
