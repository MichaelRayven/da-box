import { LogInIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { signIn } from "~/server/auth";

export default function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <Button>
        <LogInIcon /> Sign In
      </Button>
    </form>
  );
}
