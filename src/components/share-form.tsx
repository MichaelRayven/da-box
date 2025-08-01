"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { shareSchema } from "~/lib/validation";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareFormProps {
  isPending?: boolean;
  error?: string;
  onSubmit?: (data: ShareFormData) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

function SubmitButton({ isPending = false }: { isPending?: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={isPending}>
      Share
    </Button>
  );
}

export function ShareForm({
  isPending = false,
  error,
  onSubmit = () => {},
  submitButton = (isPending) => <SubmitButton isPending={isPending} />,
}: ShareFormProps) {
  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: "",
      permission: "view",
    },
  });

  if (error) form.setError("email", { message: error }, { shouldFocus: true });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Share with (email address)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter email address"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permission"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permission</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-4"
                >
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="view" disabled={isPending} />
                    </FormControl>
                    <FormLabel className="flex flex-col items-start gap-0 font-normal">
                      <span>View only</span>
                      <FormDescription>Can view and download</FormDescription>
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="edit" disabled={isPending} />
                    </FormControl>
                    <FormLabel className="flex flex-col items-start gap-0 font-normal">
                      <span>Can edit</span>
                      <FormDescription>
                        Can view, download and modify
                      </FormDescription>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
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
