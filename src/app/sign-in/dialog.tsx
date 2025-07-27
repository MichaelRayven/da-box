"use client";

import { KeyRoundIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmailAuthForm } from "~/components/email-auth-form";
import { GithubAuthForm } from "~/components/github-auth-form";
import { GoogleAuthForm } from "~/components/google-auth-form";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SignInForm } from "./form";

export function SignInDialog() {
  const [method, setMethod] = useState<"credentials" | "email">("credentials");

  const switchMethodButton = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <Button
          className="w-full"
          variant="secondary"
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
        onClick={() => setMethod("credentials")}
      >
        Sign in using password <KeyRoundIcon className="size-6" />
      </Button>
    );
  };

  const renderMethodForm = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return <SignInForm showSubmit={false} id="sign-in-form" />;
    }

    return <EmailAuthForm showSubmit={false} id="sign-in-form" />;
  };

  const renderSubmitButton = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <Button type="submit" className="w-full" form="sign-in-form">
          Sign in <KeyRoundIcon className="size-6" />
        </Button>
      );
    }

    return (
      <Button type="submit" className="w-full" form="sign-in-form">
        Continue <MailIcon className="size-6" />
      </Button>
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-3xl">
          Welcome to <br />
          Da Box
        </CardTitle>
      </CardHeader>
      <CardContent>{renderMethodForm(method)}</CardContent>
      <CardFooter className="flex-col gap-2">
        {renderSubmitButton(method)}
        <span className="flex w-full items-center gap-4">
          <hr className="h-px flex-1" /> or <hr className="h-px flex-1" />
        </span>
        {switchMethodButton(method)}
        <GoogleAuthForm />
        <GithubAuthForm />
        <span className="mt-4 font-semibold">
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
      </CardFooter>
    </Card>
  );
}
