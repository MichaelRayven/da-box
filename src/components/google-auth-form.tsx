"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

interface GoogleAuthFormProps {
  className?: string;
  isPending?: boolean;
}

export function GoogleAuthForm({ className, isPending }: GoogleAuthFormProps) {
  return (
    <form
      className="flex w-full justify-center"
      action={async () => {
        await signIn("google", { redirectTo: "/drive" });
      }}
    >
      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className={cn("w-full", className)}
      >
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
