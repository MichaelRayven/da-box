"use client";

import { useMutation } from "@tanstack/react-query";
import { EditIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { useControllableState } from "~/hook/useControllableState";
import { useContextMenuStore } from "~/lib/store/context-menu";
import { renameFile, renameFolder } from "~/server/actions";
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
  const { data, type } = useContextMenuStore((s) => s.selectedItem) ?? {};

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const mutation = useMutation({
    async mutationFn(newName: string) {
      const action = type === "file" ? renameFile : renameFolder;
      const result = await action(data!.id, newName);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess() {
      setOpen(false);
    },
    onError: (error: Error) => error,
  });

  const handleSubmit = (newName: string) => {
    toast.promise(mutation.mutateAsync(newName), {
      loading: "Renaming...",
      success: "Renamed successfully",
      error: (error: Error) => error?.message || "Rename failed",
    });
  };

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
          onSubmit={(values) => handleSubmit(values.name)}
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
