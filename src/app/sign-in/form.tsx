"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon, MailIcon } from "lucide-react";
import { signIn } from "next-auth/react";
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
import { signInSchema } from "~/lib/validation";

interface SignInFormProps {
  id?: string;
  className?: string;
  showSubmit?: boolean;
}

export function SignInForm({
  id,
  className,
  showSubmit = true,
}: SignInFormProps) {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    signIn("credentials", { ...values });
  };

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
                  placeholder="email@example.com ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="password"
                  placeholder="Enter your password ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button type="submit" className="w-1/2 self-center">
            <LogInIcon /> Sign In
          </Button>
        )}
      </form>
    </Form>
  );
}
