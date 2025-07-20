import { FolderPlus, Grid3X3, List, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import Breadcrumbs from "./_components/breadcrumbs";
import Header from "./_components/header";
import Sidebar from "./_components/sidebar";
import FileList from "./_components/file-list";

export default function GoogleDriveClone() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 ml-64">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <Header />

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
        </main>
      </div>
    </div>
  );
}
