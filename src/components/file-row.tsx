import { FileText, Folder } from "lucide-react";
import Link from "next/link";
import { TableCell, TableRow } from "~/components/ui/table";
import type { files_table, folders_table } from "~/server/db/schema";

export function FileRow({ file }: { file: typeof files_table.$inferSelect }) {
	return (
		<TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
			<TableCell className="p-0 text-white hover:text-blue-400">
				<Link href={file.url} className="flex items-center space-x-3 p-2">
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

export function FolderRow({
	folder,
}: {
	folder: typeof folders_table.$inferSelect;
}) {
	return (
		<TableRow className="cursor-pointer border-gray-700 hover:bg-gray-750">
			<TableCell className="p-0 text-white hover:text-blue-400">
				<Link
					className="flex items-center space-x-3 p-2"
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
