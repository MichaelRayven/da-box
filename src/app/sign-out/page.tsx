import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { signOut } from "~/server/auth";

export default function SignOutPage() {
  return (
    <main className="flex items-center justify-center md:h-screen -mt-32">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign out</CardTitle>
          <CardDescription>
            Please confirm sign out, on success you will be redirected to home.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="outline">
            <Link href="/">Cancel</Link>
          </Button>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="destructive">Confirm</Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
