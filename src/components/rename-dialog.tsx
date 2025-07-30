"use client";

import { EditIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
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
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (data: { name: string }) => {
    setIsPending(true);
    // toast
    //   .promise(
    //     onRename(data).then(() => {
    //       setOpen(false);
    //     }),
    //     {
    //       loading: "Renaming...",
    //       success: "Renamed successfully!",
    //       error: "Failed to rename",

    //     }
    //   )
    //   .finally(() => );
    setIsPending(false);
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
          isPending={isPending}
          onSubmit={handleSubmit}
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
