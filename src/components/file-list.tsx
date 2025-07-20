"use client";

import {
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  FileVideo,
  Folder,
  ImageIcon,
  Music,
  Star,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { FileItem } from "~/lib/interface";
import { mockData } from "../app/_mock";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type SortField = "name" | "modified" | "size" | "owner";
type SortDirection = "asc" | "desc";

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

export default function FileList() {
  const router = useRouter();
  const { folderId: currentFolderId } = useParams<{
    folderId: string | undefined;
  }>();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [currentItems, setCurrentItems] = useState<FileItem[]>([]);

  useEffect(() => {
    const filtered = mockData.filter(
      (item) => item.parentId == currentFolderId
    );

    const sortedItems = filtered.sort((a, b) => {
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

    setCurrentItems(sortedItems);
  }, [currentFolderId]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      router.push(`/drive/folders/${item.id}`);
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
          {currentItems.map((item) => (
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
                  {item.shared && <Users className="h-3 w-3 text-blue-400" />}
                </div>
              </TableCell>
              <TableCell className="text-gray-300">{item.owner}</TableCell>
              <TableCell className="text-gray-300">{item.modified}</TableCell>
              <TableCell className="text-gray-300">
                {item.size || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {currentItems.length === 0 && (
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
