"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRoundIcon, LoaderIcon, TriangleAlertIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof signInSchema>) => {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "Something went wrong. Please try again.";

        throw new Error(errorMessage);
      }
    },
    onSuccess() {
      toast.success("Signed into an account!");
      router.replace("/");
    },
    onError(error: Error) {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof signInSchema>) => {
    mutation.mutate(values);
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
                  type="text"
                  aria-required="true"
                  autoComplete="email"
                  disabled={mutation.isPending}
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
                  disabled={mutation.isPending}
                  placeholder="Password..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 w-full"
          >
            {mutation.isPending ? (
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
        )}
      </form>
    </Form>
  );
}
