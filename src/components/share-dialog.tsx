"use client";

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
import { ShareForm } from "./share-form"; // Assuming your form is in share-form.tsx
import { shareFile, shareFolder } from "~/server/actions";
import { useMutation } from "@tanstack/react-query";

interface ShareDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

type Values = {
  email: string;
  permission: "view" | "edit";
};

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
  const { type, data } = useContextMenuStore((s) => s.selectedItem) ?? {};

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const mutation = useMutation({
    async mutationFn(values: Values) {
      const action = type === "file" ? shareFile : shareFolder;
      const result = await action(data!.id, values.email, values.permission);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess() {
      setOpen(false);
    },
    onError: (error: Error) => error,
  });

  const handleSubmit = (values: Values) => {
    toast.promise(mutation.mutateAsync(values), {
      loading: "Sharing...",
      success: "Shared successfully",
      error: (error: Error) => error?.message || "Share failed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Share "{data?.name}"</DialogTitle>
        </DialogHeader>

        <ShareForm
          onSubmit={handleSubmit}
          error={mutation.error?.message}
          isPending={mutation.isPending}
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
