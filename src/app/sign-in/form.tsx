"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, LogInIcon, MailIcon } from "lucide-react";
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
import { emailSignInSchema, signInSchema } from "~/lib/validation";
import Image from "next/image";
import Link from "next/link";

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
        className={cn("flex flex-col gap-2", className)}
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
                  className="text-sm text-muted-foreground p-0"
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
                  placeholder="Password..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button type="submit" className="w-full mt-4">
            Sign in <KeyRoundIcon className="size-6" />
          </Button>
        )}
      </form>
    </Form>
  );
}

export function EmailSignInForm({
  id,
  className,
  showSubmit = true,
}: SignInFormProps) {
  const form = useForm<z.infer<typeof emailSignInSchema>>({
    resolver: zodResolver(emailSignInSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof emailSignInSchema>) => {
    signIn("credentials", { ...values });
  };

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-2", className)}
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
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button type="submit" className="w-full mt-4">
            Sign in <MailIcon className="size-6" />
          </Button>
        )}
      </form>
    </Form>
  );
}

export function GoogleSignInForm() {
  return (
    <form
      className="w-full flex justify-center"
      action={async () => {
        await signIn("google");
      }}
    >
      <Button type="submit" variant="secondary" className="w-full">
        Continue with Google
        <Image
          src="https://authjs.dev/img/providers/google.svg"
          alt="Google logo"
          width={24}
          height={24}
        />
      </Button>
    </form>
  );
}

export function GithubSignInForm() {
  return (
    <form
      className="w-full flex justify-center"
      action={async () => {
        await signIn("github");
      }}
    >
      <Button type="submit" variant="secondary" className="w-full">
        Continue with GitHub
        <Image
          src="https://authjs.dev/img/providers/github.svg"
          alt="Github logo"
          width={24}
          height={24}
        />
      </Button>
    </form>
  );
}
