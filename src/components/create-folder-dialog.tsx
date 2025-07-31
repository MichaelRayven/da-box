"use client";

import type { DialogProps } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { useControllableState } from "~/hook/useControllableState";
import { useDriveStore } from "~/lib/store/drive";
import { createFolder } from "~/server/actions";
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

interface CreateFolderDialogProps extends DialogProps {
  trigger?: ReactNode;
}

export function CreateFolderDialog({
  trigger = (
    <Button variant="outline">
      <PlusIcon className="mr-2 size-4" />
      New
    </Button>
  ),
  ...props
}: CreateFolderDialogProps) {
  const addFolder = useDriveStore((s) => s.addFolder);
  const { folderId } = useParams();

  const [open, setOpen] = useControllableState({
    value: props.open,
    defaultValue: false,
    onChange: props.onOpenChange,
  });

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const parent = folderId as string | undefined;
      if (!parent) throw new Error("No parent folder selected");

      const response = await createFolder(name, parent);
      if (!response.success) {
        throw new Error(response.error);
      }

      return response.data.folder;
    },
    onSuccess: (data, name) => {
      addFolder({ url: `/drive/folders/${data.id}`, ...data });
      toast.success(`Created folder "${name}"`);
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <CreateFolderForm
          onSubmit={(values) => mutation.mutateAsync(values.name)}
          isPending={mutation.isPending}
          error={mutation.error?.message}
          submitButton={(isPending) => (
            <div className="flex justify-end space-x-2">
              <Button disabled={isPending} variant="outline" asChild>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    Creating...
                    <LoaderIcon className="animation-duration-[2s] size-6 animate-spin" />
                  </>
                ) : (
                  <>Create</>
                )}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
