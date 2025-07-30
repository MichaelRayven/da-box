"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { ReactNode } from "react";

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
    <Card className="p-4">
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
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitButton(isPending)}
        </form>
      </Form>
    </Card>
  );
}
