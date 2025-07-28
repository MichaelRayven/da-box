"use client";

import React, { useRef } from "react";
import { PlusIcon, ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CreateFolderDialog } from "./create-folder-dialog";
import { Button } from "./ui/button";

export function CreateObjectDropdown() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false);

  // Handler for Create File
  function handleCreateFileClick() {
    fileInputRef.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log("Selected file:", file);
    // Add your upload logic here

    // Clear input so same file can be selected again if needed
    event.target.value = "";
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Create new" asChild>
          <Button className="mb-4 w-full">
            <PlusIcon className="mr-2 size-4" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuItem onSelect={handleCreateFileClick}>
            Create File
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setFolderDialogOpen(true)}>
            Create Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileChange}
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
