"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "./ui/button";

export function GithubAuthForm() {
  return (
    <form
      className="flex w-full justify-center"
      action={async () => {
        await signIn("github");
      }}
    >
      <Button type="submit" variant="secondary" className="w-full">
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
