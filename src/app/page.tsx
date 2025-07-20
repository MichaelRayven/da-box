import type React from "react";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Search,
  Plus,
  FolderPlus,
  Upload,
  Grid3X3,
  List,
  Star,
  Clock,
  Trash2,
  Settings,
  Folder,
  FileText,
  ImageIcon,
  FileVideo,
  Music,
  Archive,
  ChevronUp,
  ChevronDown,
  Home,
  Users,
  HardDrive,
} from "lucide-react";
import { mockData } from "./_mock";
import type { FileItem } from "~/lib/interface";

type SortField = "name" | "modified" | "size" | "owner";
type SortDirection = "asc" | "desc";

export default function GoogleDriveClone() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const getCurrentItems = () => {
    return mockData.filter((item) => item.parentId === currentFolderId);
  };

  const getCurrentFolder = () => {
    if (!currentFolderId) return null;
    return mockData.find((item) => item.id === currentFolderId);
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = mockData.find((item) => item.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedItems = getCurrentItems().sort((a, b) => {
    let aValue: string | number = "";
    let bValue: string | number = "";

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "modified":
        aValue = new Date(a.modified).getTime();
        bValue = new Date(b.modified).getTime();
        break;
      case "size":
        aValue = a.size || "";
        bValue = b.size || "";
        break;
      case "owner":
        aValue = a.owner.toLowerCase();
        bValue = b.owner.toLowerCase();
        break;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder className="h-4 w-4 text-blue-400" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-green-400" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-red-400" />;
      case "audio":
        return <Music className="h-4 w-4 text-purple-400" />;
      case "archive":
        return <Archive className="h-4 w-4 text-yellow-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else if (item.url) {
      window.open(item.url, "_blank");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        ))}
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search in Drive"
                className="pl-10 w-96 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-800 bg-gray-900 h-screen fixed left-0 top-0">
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Drive</h1>
            </div>

            <Dialog
              open={isCreateFolderOpen}
              onOpenChange={setIsCreateFolderOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Folder
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name" className="text-white">
                      Folder Name
                    </Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Untitled folder"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateFolderOpen(false)}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setIsCreateFolderOpen(false)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Home className="mr-3 h-4 w-4" />
                My Drive
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Users className="mr-3 h-4 w-4" />
                Shared with me
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Clock className="mr-3 h-4 w-4" />
                Recent
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Star className="mr-3 h-4 w-4" />
                Starred
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Trash
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
              >
                <HardDrive className="mr-3 h-4 w-4" />
                Storage
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 ml-64">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {/* Breadcrumbs */}
              <Button
                variant="ghost"
                onClick={() => setCurrentFolderId(null)}
                className="text-gray-300 hover:bg-gray-800"
              >
                My Drive
              </Button>
              {getBreadcrumbs().map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  <span className="mx-2 text-gray-500">{">"}</span>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="text-gray-300 hover:bg-gray-800"
                  >
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>

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

          {/* File List */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800">
                  <TableHead className="text-gray-300">
                    <SortButton field="name">Name</SortButton>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <SortButton field="owner">Owner</SortButton>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <SortButton field="modified">Last modified</SortButton>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <SortButton field="size">File size</SortButton>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-gray-700 hover:bg-gray-750 cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <TableCell className="text-white">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(item.type)}
                        <span>{item.name}</span>
                        {item.starred && (
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        )}
                        {item.shared && (
                          <Users className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {item.owner}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {item.modified}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {item.size || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedItems.length === 0 && (
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
        </main>
      </div>
    </div>
  );
}
