import { Button } from "~/components/ui/button";
import { SignInForm } from "./form";
import { signIn } from "~/server/auth";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="md:-mt-32 mx-auto flex w-full max-w-[400px] flex-col gap-8">
        <SignInForm />
        <span className="w-full flex items-center gap-4">
          <hr className="flex-1 h-px" /> or <hr className="flex-1 h-px" />
        </span>
        <div className="flex flex-col gap-4">
          <form
            className="w-full flex justify-center"
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <Button type="submit" variant="secondary" className="w-1/2">
              <Image
                src="https://authjs.dev/img/providers/github.svg"
                alt="Github logo"
                width={24}
                height={24}
              />
              Sign In with GitHub
            </Button>
          </form>
          <form
            className="w-full flex justify-center"
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button type="submit" variant="secondary" className="w-1/2">
              <Image
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google logo"
                width={24}
                height={24}
              />
              Sign In with Google
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
