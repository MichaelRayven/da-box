"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import Image from "next/image";

export function GoogleAuthForm() {
  return (
    <form
      className="w-full flex justify-center"
      action={async () => {
        await signIn("google");
      }}
    >
      <Button type="submit" variant="secondary" className="w-full">
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
