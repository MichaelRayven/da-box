import { FolderPlus, Grid3X3, List, Upload } from "lucide-react";
import Breadcrumbs from "~/components/breadcrumbs";
import FileList from "~/components/file-list";
import { Button } from "~/components/ui/button";
import type { files_table, folders_table } from "~/server/db/schema";

export default function DriveContents(props: {
	folders: (typeof folders_table.$inferSelect)[];
	files: (typeof files_table.$inferSelect)[];
	parents?: (typeof folders_table.$inferSelect)[];
}) {
	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<Breadcrumbs
					breadcrumbs={props.parents}
					className="flex items-center space-x-2"
				/>

				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
					>
						<Upload className="mr-2 h-4 w-4" />
						Upload
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
					>
						<FolderPlus className="mr-2 h-4 w-4" />
						New Folder
					</Button>
					<div className="flex rounded border border-gray-600">
						<Button
							variant="ghost"
							size="sm"
							className="border-gray-600 border-r bg-gray-800"
						>
							<List className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="sm">
							<Grid3X3 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<FileList files={props.files} folders={props.folders} />
		</div>
	);
}
