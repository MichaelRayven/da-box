"use client";

import { Button } from "~/components/ui/button";
import {
  EmailSignInForm,
  GithubSignInForm,
  GoogleSignInForm,
  SignInForm,
} from "./form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { KeyRoundIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
          Sign in using email <MailIcon className="size-6" />
        </Button>
      );
    } else {
      return (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => setMethod("credentials")}
        >
          Sign in using password <KeyRoundIcon className="size-6" />
        </Button>
      );
    }
  };

  const renderMethodForm = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return <SignInForm showSubmit={false} id="sign-in-form" />;
    } else {
      return <EmailSignInForm showSubmit={false} id="sign-in-form" />;
    }
  };

  const renderSubmitButton = (method: "credentials" | "email") => {
    if (method === "credentials") {
      return (
        <Button type="submit" className="w-full" form="sign-in-form">
          Sign in <KeyRoundIcon className="size-6" />
        </Button>
      );
    } else {
      return (
        <Button type="submit" className="w-full" form="sign-in-form">
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
        <GoogleSignInForm />
        <GithubSignInForm />
        <span className="mt-4 font-semibold">
          <Button
            className="text-base text-muted-foreground p-0"
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
