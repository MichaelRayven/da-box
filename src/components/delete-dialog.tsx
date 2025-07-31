"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, Share2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useControllableState } from "~/hook/useControllableState";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { deleteFile, deleteFolder } from "~/server/actions";

interface DeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function DeleteDialog({
  open: openProp,
  onOpenChange,
  trigger = (
    <Button variant="outline">
      <Share2Icon className="mr-2 size-4" />
      Share
    </Button>
  ),
}: DeleteDialogProps) {
  const { item, type } = useContextMenuStore((s) => s.selectedItem) ?? {};

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const mutation = useMutation({
    async mutationFn() {
      if (type === "file") {
        return await deleteFile(item!.id);
      }

      return await deleteFolder(item!.id);
    },
    onSuccess() {
      setOpen(false);
    },
    onError(error: Error) {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Delete "{item?.name}"</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {type}?
            <br />
            You can't recover it after you proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" asChild disabled={mutation.isPending}>
            <DialogClose>Cancel</DialogClose>
          </Button>
          <form action={() => mutation.mutate()}>
            <Button
              type="submit"
              variant={"destructive"}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  Deleting...
                  <LoaderIcon className="ml-2 size-5 animate-spin" />
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
