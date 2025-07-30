"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

const renameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type RenameFormData = z.infer<typeof renameSchema>;

interface RenameFormProps {
  defaultName?: string;
  isPending?: boolean;
  onSubmit?: (data: RenameFormData) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

function SubmitButton({ isPending = false }: { isPending?: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      Rename
    </Button>
  );
}

export function RenameForm({
  defaultName = "",
  isPending = false,
  onSubmit = () => {},
  submitButton = (isPending) => <SubmitButton isPending={isPending} />,
}: RenameFormProps) {
  const form = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: defaultName,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter new name"
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
