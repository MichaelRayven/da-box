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
import type { emailSignInSchema, signUpSchema } from "~/lib/validation";
import { SignUpForm } from "./form";

export function SignUpDialog() {
  const signUpMutation = useMutation({
    mutationFn: async (values: z.infer<typeof signUpSchema>) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Signup failed");
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirectTo: "/onboarding",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  const emailSignInMutation = useMutation({
    async mutationFn(values: z.infer<typeof emailSignInSchema>) {
      await signIn("resend", {
        ...values,
        redirectTo: "/drive",
      });
    },
  });

  const isPending = emailSignInMutation.isPending || signUpMutation.isPending;

  // Render logic
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
        Sign up using password <KeyRoundIcon className="size-6" />
      </Button>
    );
  };

  const renderMethodForm = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <SignUpForm
          isPending={isPending}
          onSubmit={(values) => signUpMutation.mutate(values)}
        />
      );
    }

    return (
      <EmailAuthForm
        isPending={isPending}
        onSubmit={(values) => emailSignInMutation.mutate(values)}
      />
    );
  };

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
              disabled={isPending}
              asChild
            >
              <Link href="/sign-in">
                Already have an account?{" "}
                <span className="text-foreground">Sign in!</span>
              </Link>
            </Button>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
