import { FolderPlus, Grid3X3, List, Upload } from "lucide-react";
import Breadcrumbs from "~/components/breadcrumbs";
import { CreateFolderDialog } from "~/components/create-folder-dialog";
import FileList from "~/components/file-list";
import { Button } from "~/components/ui/button";
import type { FileType, FolderType } from "~/lib/interface";
import DriveStoreHydrator from "./drive-store-hydrator";

export default function DriveContents(props: {
  parents?: FolderType[];
  files?: FileType[];
  folders?: FolderType[];
}) {
  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <Breadcrumbs
          breadcrumbs={props.parents}
          className="flex items-center space-x-2"
        />

        <DriveStoreHydrator
          files={props.files ?? []}
          folders={props.folders ?? []}
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
          <CreateFolderDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            }
          />

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
