"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRoundIcon, MailIcon, TriangleAlertIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { EmailAuthForm } from "~/components/email-auth-form";
import { GithubAuthForm } from "~/components/github-auth-form";
import { GoogleAuthForm } from "~/components/google-auth-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { emailSignInSchema, signInSchema } from "~/lib/validation";
import { SignInForm } from "./form";

export function SignInDialog() {
  const signInMutation = useMutation({
    mutationFn: async (values: z.infer<typeof signInSchema>) => {
      const result = await signIn("credentials", {
        ...values,
        redirectTo: "/drive",
      });

      if (result?.error) {
        throw new Error(
          result.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "Something went wrong. Please try again later."
        );
      }
    },
    onError(error: Error) {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  const emailSignInMutation = useMutation({
    async mutationFn(values: z.infer<typeof emailSignInSchema>) {
      const result = await signIn("resend", {
        ...values,
        redirectTo: "/drive",
      });
      if (result?.error) {
        throw new Error("Something went wrong. Please try again later.");
      }
    },
    onError(error: Error) {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  const isPending = emailSignInMutation.isPending || signInMutation.isPending;

  // Rendering logic
  const [method, setMethod] = useState<"credentials" | "email">("credentials");

  const switchMethodButton = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <Button
          className="w-full"
          variant="secondary"
          disabled={isPending}
          onClick={() => setMethod("email")}
        >
          Continue using E-mail <MailIcon className="size-6" />
        </Button>
      );
    }

    return (
      <Button
        className="w-full"
        variant="secondary"
        disabled={isPending}
        onClick={() => setMethod("credentials")}
      >
        Sign in using password <KeyRoundIcon className="size-6" />
      </Button>
    );
  };

  const renderMethodForm = (method: "credentials" | "email") =>
    method === "credentials" ? (
      <SignInForm
        onSubmit={(values) => signInMutation.mutate(values)}
        isPending={isPending}
      />
    ) : (
      <EmailAuthForm
        onSubmit={(values) => emailSignInMutation.mutate(values)}
        isPending={isPending}
      />
    );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-3xl">
          Welcome to <br />
          Da Box
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderMethodForm(method)}
        <span className="my-2 flex w-full items-center gap-4">
          <hr className="h-px flex-1" /> or <hr className="h-px flex-1" />
        </span>
        <div className="flex flex-col gap-2">
          {switchMethodButton(method)}
          <GoogleAuthForm isPending={isPending} />
          <GithubAuthForm isPending={isPending} />
          <span className="mt-4 text-center font-semibold">
            <Button
              className="p-0 text-base text-muted-foreground"
              variant="link"
              asChild
            >
              <Link href="/sign-up">
                Don't have an account yet?{" "}
                <span className="text-foreground">Sign up!</span>
              </Link>
            </Button>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
