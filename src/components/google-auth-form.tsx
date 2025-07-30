"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";

interface GoogleAuthFormProps {
  className?: string;
  isPending?: boolean;
}

export function GoogleAuthForm({ className, isPending }: GoogleAuthFormProps) {
  return (
    <form
      className="flex w-full justify-center"
      action={async () => {
        await signIn("google");
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
