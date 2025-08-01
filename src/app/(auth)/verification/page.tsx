import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function SignOutPage() {
  return (
    <main className="-mt-32 flex w-full items-center justify-center md:h-screen">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="mb-4 text-3xl">Verification</CardTitle>
          <CardDescription className="text-base">
            Check your email! A sign in link has been sent to your email
            address.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-2">
          <Link href="/sign-in">
            <Button variant="outline" className="px-8">
              Back
            </Button>
          </Link>
          <Link href="/">
            <Button variant="default" className="px-8">
              Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
