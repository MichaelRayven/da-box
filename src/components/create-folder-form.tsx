"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import type { ReactNode } from "react";
import { PlusIcon } from "lucide-react";

interface CreateFolderFormProps {
  className?: string;
  submitButton?: (isPending?: boolean) => ReactNode;
}

export function CreateFolderForm({
  className,
  submitButton = () => (
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

  const onSubmit = async (values: z.infer<typeof fileNameSchema>) => {
    console.log(values);
  };

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
                <Input type="text" aria-required="true" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitButton()}
      </form>
    </Form>
  );
}
