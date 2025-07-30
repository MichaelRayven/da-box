"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";

interface GithubAuthFormProps {
  className?: string;
  isPending?: boolean;
}

export function GithubAuthForm({ className, isPending }: GithubAuthFormProps) {
  return (
    <form
      className="flex w-full justify-center"
      action={async () => {
        await signIn("github", { redirectTo: "/drive" });
      }}
    >
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className={cn("w-full", className)}
      >
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
