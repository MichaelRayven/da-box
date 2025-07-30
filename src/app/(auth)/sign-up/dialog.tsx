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
import { SignUpForm } from "./form";

export function SignUpDialog() {
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
        Sign up using password <KeyRoundIcon className="size-6" />
      </Button>
    );
  };

  const renderMethodForm = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return <SignUpForm />;
    }

    return <EmailAuthForm />;
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
          <GoogleAuthForm />
          <GithubAuthForm />
          <span className="mt-4 text-center font-semibold">
            <Button
              className="p-0 text-base text-muted-foreground"
              variant="link"
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
