"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, MailIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { emailSignInSchema } from "~/lib/validation";

interface EmailAuthFormProps {
  id?: string;
  className?: string;
  isPending?: boolean;
  onSubmit?: (data: z.infer<typeof emailSignInSchema>) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

export function EmailAuthForm({
  id,
  className,
  isPending,
  onSubmit = () => {},
  submitButton = (isPending) => (
    <Button type="submit" disabled={isPending} className="mt-2 w-full">
      {isPending ? (
        <>
          Sending...
          <LoaderIcon className="animation-duration-[2s] size-6 animate-spin" />
        </>
      ) : (
        <>
          Continue <MailIcon className="size-6" />
        </>
      )}
    </Button>
  ),
}: EmailAuthFormProps) {
  const form = useForm<z.infer<typeof emailSignInSchema>>({
    resolver: zodResolver(emailSignInSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-4", className)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  aria-required="true"
                  autoComplete="email"
                  disabled={isPending}
                  placeholder="email@example.com"
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
