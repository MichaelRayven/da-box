"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, LoaderIcon } from "lucide-react";
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
import { signUpSchema } from "~/lib/validation";

interface SignUpFormProps {
  id?: string;
  className?: string;
  isPending?: boolean;
  onSubmit?: (data: z.infer<typeof signUpSchema>) => void;
  submitButton?: (isPending?: boolean) => ReactNode;
}

export function SignUpForm({
  id,
  className,
  isPending,
  onSubmit = () => {},
  submitButton = (isPending) => (
    <Button type="submit" className="mt-2 w-full" disabled={isPending}>
      {isPending ? (
        <>
          Creating account...
          <LoaderIcon className="animation-duration-[2s] size-6 animate-spin" />
        </>
      ) : (
        <>
          Create account <KeyRoundIcon className="size-6" />
        </>
      )}
    </Button>
  ),
}: SignUpFormProps) {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="name"
                  placeholder="John Doe..."
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="username"
                  placeholder="Username..."
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="email"
                  placeholder="email@example.com"
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="new-password"
                  placeholder="Password..."
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="new-password"
                  placeholder="Confirm password..."
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
