"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRoundIcon, MailIcon, TriangleAlertIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { EmailAuthForm } from "~/components/email-auth-form";
import { GithubAuthForm } from "~/components/github-auth-form";
import { GoogleAuthForm } from "~/components/google-auth-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getSignInError } from "~/lib/utils";
import type { emailSignInSchema, signInSchema } from "~/lib/validation";
import { SignInForm } from "./form";

export function SignInDialog() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(getSignInError(error), {
        icon: <TriangleAlertIcon />,
      });
    }
  }, [searchParams]);

  const signInMutation = useMutation({
    mutationFn: async (values: z.infer<typeof signInSchema>) => {
      await signIn("credentials", {
        ...values,
        redirectTo: "/drive",
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
              disabled={isPending}
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
