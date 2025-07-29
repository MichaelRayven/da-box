"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { UploadFilesForm } from "./upload-files-form";
import {
  UploadIcon,
  LoaderIcon,
  TriangleAlertIcon,
  CheckCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { DialogProps } from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { useDriveStore } from "~/lib/store/drive";
import { useUploadFile } from "~/hook/useUploadFile";

interface UploadFileDialogProps extends DialogProps {
  trigger?: ReactNode;
}

export function UploadFileDialog({
  trigger = (
    <Button>
      <UploadIcon className="mr-2 size-4" />
      Upload
    </Button>
  ),
  ...props
}: UploadFileDialogProps) {
  const addFile = useDriveStore((s) => s.addFile);

  const { uploadAsync, isPending } = useUploadFile({
    onFileUploaded(file) {
      addFile(file);
    },
    onError: (err) => {
      toast.error((err as Error).message, {
        icon: <TriangleAlertIcon />,
      });
    },
    onFinished: () => {
      props?.onOpenChange?.(false);
    },
  });

  const handleUpload = async (files: File[]) => {
    toast.promise(uploadAsync(files), {
      loading: "Uploading...",
      success: {
        message: "Files uploaded successfully!",
      },
      error: (err) => (err as Error).message || "Upload failed",
    });
  };

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <UploadFilesForm
          isPending={isPending}
          onSubmit={(values) => handleUpload(values.files)}
          multiple
          accept="*"
          submitButton={(isPending) => (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild disabled={isPending}>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    Uploading...
                    <LoaderIcon className="animation-duration-[2s] ml-2 size-6 animate-spin" />
                  </>
                ) : (
                  <>Upload</>
                )}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
