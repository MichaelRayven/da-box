"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderIcon, Share2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type z from "zod";
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
import type { shareSchema } from "~/lib/validation";
import {
  getSharedWithForFile,
  getSharedWithForFolder,
  shareFile,
  shareFolder,
  unshareFile,
  unshareFolder,
} from "~/server/actions";
import { ShareForm } from "./share-form"; // Assuming your form is in share-form.tsx

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
  const { type, data } = useContextMenuStore((s) => s.selectedItem) ?? {};

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  // Fetch shared users
  const {
    data: sharedWith,
    error: sharedError,
    isLoading: isSharedLoading,
    refetch: refetchShared,
  } = useQuery({
    queryKey: ["sharedWith", type, data?.id],
    queryFn: async () => {
      const action =
        type === "file" ? getSharedWithForFile : getSharedWithForFolder;
      const result = await action(data!.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!type && !!data?.id && open,
  });

  const shareMutation = useMutation({
    async mutationFn(values: z.infer<typeof shareSchema>) {
      const action = type === "file" ? shareFile : shareFolder;
      const result = await action(data!.id, values.email, values.permission);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess() {
      refetchShared();
    },
    onError: (error: Error) => error,
  });

  const unshareMutation = useMutation({
    async mutationFn(values: z.infer<typeof shareSchema>) {
      const action = type === "file" ? unshareFile : unshareFolder;
      const result = await action(data!.id, values.email);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess() {
      refetchShared();
    },
    onError: (error: Error) => error,
  });

  const handleSubmit = (values: z.infer<typeof shareSchema>) => {
    toast.promise(shareMutation.mutateAsync(values), {
      loading: "Sharing...",
      success: "Shared successfully",
      error: (error: Error) => error?.message || "Share failed",
    });
  };

  const handleRevoke = (values: z.infer<typeof shareSchema>) => {
    toast.promise(unshareMutation.mutateAsync(values), {
      loading: "Revoking permissions...",
      success: "Permissions revoked successfully",
      error: (error: Error) => error?.message || "Unshare failed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="gap-6">
        <DialogHeader>
          <DialogTitle>Share "{data?.name}"</DialogTitle>
        </DialogHeader>

        {/* Shared With List */}
        <div className="">
          <h3 className="font-medium text-gray-200 text-sm">Shared with</h3>
          {isSharedLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoaderIcon className="size-5 animate-spin text-gray-400" />
            </div>
          ) : sharedWith?.length ? (
            <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto">
              {sharedWith.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-md border border-gray-700 p-2 text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.username}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                        <span className="text-xs">
                          {user.username[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm">{user.username}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-800 px-2 py-1 text-xs capitalize">
                      {user.permission}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRevoke({
                          email: user.email,
                          permission: user.permission,
                        })
                      }
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-2 text-gray-400 text-sm">Not shared with anyone</p>
          )}
        </div>

        <ShareForm
          onSubmit={handleSubmit}
          error={shareMutation.error?.message}
          isPending={shareMutation.isPending}
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
