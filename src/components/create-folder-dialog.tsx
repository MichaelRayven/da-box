"use client";

import { LoaderIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
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
import { toast } from "sonner";
import { useDriveStore } from "~/lib/store/drive";

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
  const addFolder = useDriveStore((s) => s.addFolder);
  const { folderId } = useParams();

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
      addFolder(data);
      toast.success(`Created folder "${name}"`);
      props?.onOpenChange?.(false);
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
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
          onSubmit={(values) => mutation.mutate(values.name)}
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
