"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Share2Icon, LoaderIcon } from "lucide-react";
import { ShareForm } from "./share-form"; // Assuming your form is in share-form.tsx
import { toast } from "sonner";
import { useControllableState } from "~/hook/useControllableState";
import { useContextMenuStore } from "~/lib/store/context-menu";

interface ShareDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ShareDialog({
  open: openProp,
  onOpenChange,
  trigger = (
    <Button variant="outline">
      <Share2Icon className="mr-2 size-4" />
      Share
    </Button>
  ),
}: ShareDialogProps) {
  const file = useContextMenuStore((s) => s.selectedFile);

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const handleSubmit = (data: {
    email: string;
    permission: "view" | "edit";
  }) => {
    toast.promise(
      // Replace this with your actual API/mutation logic
      new Promise((resolve) => setTimeout(() => resolve(data), 1000)),
      {
        loading: "Sharing...",
        success: () => {
          setOpen(false);
          return `Shared with ${data.email}`;
        },
        error: "Failed to share",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Share "{file?.name}"</DialogTitle>
        </DialogHeader>

        <ShareForm
          onSubmit={handleSubmit}
          submitButton={(isPending) => (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" asChild disabled={isPending}>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    Sharing...
                    <LoaderIcon className="ml-2 size-5 animate-spin" />
                  </>
                ) : (
                  "Share"
                )}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
