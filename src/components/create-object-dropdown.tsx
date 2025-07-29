"use client";

import React from "react";
import { PlusIcon, FolderPlusIcon, FilePlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CreateFolderDialog } from "./create-folder-dialog";
import { Button } from "./ui/button";
import { UploadFileDialog } from "./upload-file-dialog";

export function CreateObjectDropdown() {
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  // const uploader = useUploadFile();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Create new" asChild>
          <Button className="mb-4 w-full">
            <PlusIcon className="mr-2 size-4" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mt-2 w-56" align="start">
          <DropdownMenuItem
            onSelect={() => setFolderDialogOpen(true)}
            className="cursor-pointer"
          >
            <FolderPlusIcon /> New Folder
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setUploadDialogOpen(true)}
            className="cursor-pointer"
          >
            <FilePlusIcon /> Upload File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input */}
      <UploadFileDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        trigger={false}
      />

      {/* Folder creation dialog */}
      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        trigger={false}
      />
    </>
  );
}
