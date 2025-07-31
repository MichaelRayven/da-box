"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { fileNameSchema } from "~/lib/validation";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

interface CreateFolderFormProps {
  className?: string;
  error?: string;
  isPending?: boolean;
  onSubmit?: (values: z.infer<typeof fileNameSchema>) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

export function CreateFolderForm({
  className,
  error,
  isPending = false,
  onSubmit = () => {},
  submitButton = (isPending) => (
    <Button type="submit" className="mt-2 w-full">
      Create <PlusIcon className="size-6" />
    </Button>
  ),
}: CreateFolderFormProps) {
  const form = useForm<z.infer<typeof fileNameSchema>>({
    resolver: zodResolver(fileNameSchema),
    defaultValues: {
      name: "",
    },
  });

  if (error) form.setError("name", { message: error }, { shouldFocus: true });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className ?? "flex flex-col gap-4"}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  placeholder="Folder name"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitButton(isPending)}
      </form>
    </Form>
  );
}
