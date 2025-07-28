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
import type { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { createFolder } from "~/server/actions";

interface CreateFolderDialogProps extends DialogProps {
  trigger?: ReactNode;
}

export function CreateFolderDialog({
  trigger = (
    <Button>
      <PlusIcon className="mr-2 size-4" />
      New
    </Button>
  ),
  ...props
}: CreateFolderDialogProps) {
  const { folderId } = useParams();

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const parent = folderId as string | undefined;
      if (!parent) return null;

      createFolder(name, parent);
    },
  });

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

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
