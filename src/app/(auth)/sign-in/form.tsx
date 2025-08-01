"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
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
import { signInSchema } from "~/lib/validation";

interface SignInFormProps {
  id?: string;
  className?: string;
  isPending?: boolean;
  onSubmit?: (data: z.infer<typeof signInSchema>) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

export function SignInForm({
  id,
  className,
  isPending,
  onSubmit = () => {},
  submitButton = (isPending) => (
    <Button type="submit" disabled={isPending} className="mt-2 w-full">
      {isPending ? (
        <>
          Signing in...
          <LoaderIcon className="animation-duration-[2s] size-6 animate-spin" />
        </>
      ) : (
        <>
          Sign in <KeyRoundIcon className="size-6" />
        </>
      )}
    </Button>
  ),
}: SignInFormProps) {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
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
                  type="text"
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Button
                  className="h-auto p-0 text-muted-foreground text-sm"
                  variant="link"
                  asChild
                >
                  <Link href="/password-recovery">Forgot your password?</Link>
                </Button>
              </div>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="password"
                  disabled={isPending}
                  placeholder="Password..."
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
