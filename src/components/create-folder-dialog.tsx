"use client";

import { PlusIcon } from "lucide-react";
import { CreateFolderForm } from "./create-folder-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

interface CreateFolderDialogProps extends DialogProps {
  showTrigger?: boolean;
}

export function CreateFolderDialog({
  showTrigger = true,
  ...props
}: CreateFolderDialogProps) {
  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mb-4 w-full">
            <PlusIcon className="mr-2 size-4" />
            New
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <CreateFolderForm
          submitButton={() => (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button type="submit">Create</Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
