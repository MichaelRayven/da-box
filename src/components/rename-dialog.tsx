"use client";

import { EditIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useControllableState } from "~/hook/useControllableState";
import { RenameForm } from "./rename-form"; // adjust path as needed
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { renameFile, renameFolder } from "~/server/actions";
import { useMutation } from "@tanstack/react-query";
import { useDriveStore } from "~/lib/store/drive";

interface RenameDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  currentName?: string;
}

export function RenameDialog({
  open: openProp,
  onOpenChange,
  trigger = (
    <Button variant="outline">
      <EditIcon className="mr-2 size-4" />
      Rename
    </Button>
  ),
  currentName = "",
}: RenameDialogProps) {
  const { item, type } = useContextMenuStore((s) => s.selectedItem) ?? {};
  // const renameFileLocal = useDriveStore((s) => s.renameFile);

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const mutation = useMutation({
    async mutationFn(data: { name: string }) {
      let result: Awaited<ReturnType<typeof renameFile | typeof renameFolder>>;
      if (type === "file") {
        result = await renameFile(item!.id, data.name);
      } else {
        result = await renameFolder(item!.id, data.name);
      }

      if (!result.success) throw new Error(result.error);
    },
    onSuccess(data) {
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
          <DialogTitle>Rename Item</DialogTitle>
        </DialogHeader>

        <RenameForm
          defaultName={currentName}
          isPending={mutation.isPending}
          error={mutation.error?.message}
          onSubmit={(values) => mutation.mutate(values)}
          submitButton={(isPending) => (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild disabled={isPending}>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    Renaming...
                    <LoaderIcon className="ml-2 size-5 animate-spin" />
                  </>
                ) : (
                  "Rename"
                )}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
