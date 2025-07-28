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
    <main className="-mt-32 flex w-full items-center justify-center md:h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Sign out</CardTitle>
          <CardDescription>
            Please confirm sign out, on success you will be redirected to home.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end gap-2">
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
