import { FolderPlus, Grid3X3, List, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import Breadcrumbs from "~/components/breadcrumbs";
import FileList from "~/components/file-list";

export default function GoogleDriveClone() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Breadcrumbs className="flex items-center space-x-2" />

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <div className="flex border border-gray-600 rounded">
            <Button
              variant="ghost"
              size="sm"
              className="border-r border-gray-600 bg-gray-800"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FileList />
    </div>
  );
}
