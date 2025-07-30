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
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card } from "./ui/card";
import type { ReactNode } from "react";

const shareSchema = z.object({
  email: z.string().email("Enter a valid email"),
  permission: z.enum(["view", "edit"]),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareFormProps {
  isPending?: boolean;
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

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email to Share With</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    {...field}
                    disabled={isPending}
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
                    className="flex gap-4"
                  >
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="view" disabled={isPending} />
                      </FormControl>
                      <FormLabel className="font-normal">View</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="edit" disabled={isPending} />
                      </FormControl>
                      <FormLabel className="font-normal">Edit</FormLabel>
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
    </Card>
  );
}
