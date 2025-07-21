import { Folder } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { FileRow, FolderRow } from "./file-row";
import type { files_table, folders_table } from "~/server/db/schema";

export default function FileList(props: {
  files: (typeof files_table.$inferSelect)[];
  folders: (typeof folders_table.$inferSelect)[];
}) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-800">
            <TableHead className="text-gray-300">Name</TableHead>
            <TableHead className="text-gray-300">Owner</TableHead>
            <TableHead className="text-gray-300">Last modified</TableHead>
            <TableHead className="text-gray-300">File size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.folders.map((item) => (
            <FolderRow folder={item} key={item.id} />
          ))}
          {props.files.map((item) => (
            <FileRow file={item} key={item.id} />
          ))}
        </TableBody>
      </Table>
      {props.files.length === 0 && props.folders.length === 0 && (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            This folder is empty
          </h3>
          <p className="text-gray-500">
            Upload files or create folders to get started
          </p>
        </div>
      )}
    </div>
  );
}
