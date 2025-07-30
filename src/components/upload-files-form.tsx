"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { cn, formatFileSize } from "~/lib/utils";
import { fileNameSchema } from "~/lib/validation";
import { Dropzone } from "./dropzone";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "Please upload at least one file"),
});

interface UploadFilesFormProps {
  className?: string;
  isPending?: boolean;
  onSubmit?: (values: z.infer<typeof fileUploadSchema>) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

function SubmitButton({ isPending = false }: { isPending?: boolean }) {
  return (
    <Button type="submit" className="mt-2 w-full" disabled={isPending}>
      {isPending ? (
        <>
          Signing in...
          <LoaderIcon className="animation-duration-[2s] ml-2 size-6 animate-spin" />
        </>
      ) : (
        <>
          Upload files <PlusIcon className="ml-2 size-6" />
        </>
      )}
    </Button>
  );
}

export function UploadFilesForm({
  className,
  isPending = false,
  onSubmit = () => {},
  submitButton = (isPending) => <SubmitButton isPending={isPending} />,
  accept,
  maxSizeMB,
  multiple = true,
}: UploadFilesFormProps) {
  const schemaWithSize = fileUploadSchema.superRefine((data, ctx) => {
    if (maxSizeMB) {
      const tooLarge = data.files.filter(
        (f) => f.size > maxSizeMB * 1024 * 1024,
      );
      if (tooLarge.length > 0) {
        ctx.addIssue({
          code: "custom",
          message: `Some files exceed the ${maxSizeMB}MB limit`,
        });
      }
    }
  });

  const form = useForm<z.infer<typeof fileUploadSchema>>({
    resolver: zodResolver(schemaWithSize),
    defaultValues: {
      files: [],
    },
  });

  const files = form.watch("files");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const fileArray = Array.from(fileList);
    form.setValue("files", multiple ? fileArray : [fileArray[0]!], {
      shouldValidate: true,
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const fileArray = Array.from(e.dataTransfer.files);
      form.setValue("files", multiple ? fileArray : [fileArray[0]!], {
        shouldValidate: true,
      });
    },
    [form, multiple],
  );

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    form.setValue("files", updated, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-4", className)}
      >
        <FormField
          control={form.control}
          name="files"
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel>
                <Dropzone
                  className="w-full py-16"
                  onDrop={handleDrop}
                  disabled={isPending}
                  hasError={!!fieldState.error}
                />
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  className="sr-only"
                  multiple={multiple}
                  accept={accept}
                  disabled={isPending}
                  onChange={handleFileChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {files.length > 0 && (
          <ScrollArea className="max-h-64 w-full rounded-md border p-2">
            <h3 className="mb-2 font-medium text-muted-foreground text-sm">
              Selected Files:
            </h3>
            <div className="w-full space-y-2">
              {files.map((file, index) => (
                <Card
                  key={`${file.name}-${index}`}
                  className="flex-row items-center justify-between p-3"
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="break-all font-medium text-sm">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={isPending}
                  >
                    <XIcon className="size-4 text-muted-foreground" />
                  </Button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {submitButton(isPending)}
      </form>
    </Form>
  );
}
