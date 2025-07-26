"use client";

import { KeyRoundIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SignUpForm } from "./form";
import { GoogleAuthForm } from "~/components/google-auth-form";
import { GithubAuthForm } from "~/components/github-auth-form";
import { useState } from "react";
import { EmailAuthForm } from "~/components/email-auth-form";

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
    } else {
      return (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => setMethod("credentials")}
        >
          Sign up using password <KeyRoundIcon className="size-6" />
        </Button>
      );
    }
  };

  const renderMethodForm = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return <SignUpForm showSubmit={false} id="sign-up-form" />;
    } else {
      return <EmailAuthForm showSubmit={false} id="sign-up-form" />;
    }
  };

  const renderSubmitButton = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <Button type="submit" className="w-full" form="sign-up-form">
          Create account <KeyRoundIcon className="size-6" />
        </Button>
      );
    } else {
      return (
        <Button type="submit" className="w-full" form="sign-up-form">
          Continue <MailIcon className="size-6" />
        </Button>
      );
    }
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
        <span className="w-full flex items-center gap-4">
          <hr className="flex-1 h-px" /> or <hr className="flex-1 h-px" />
        </span>
        {switchMethodButton(method)}
        <GoogleAuthForm />
        <GithubAuthForm />
        <span className="mt-4 font-semibold">
          <Button
            className="text-base text-muted-foreground p-0"
            variant="link"
            asChild
          >
            <Link href="/sign-in">
              Already have an account?{" "}
              <span className="text-foreground">Sign in!</span>
            </Link>
          </Button>
        </span>
      </CardFooter>
    </Card>
  );
}
