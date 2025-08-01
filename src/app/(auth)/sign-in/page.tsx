import { RedirectType, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { SignInDialog } from "./dialog";

export default async function SignInPage() {
  const session = await auth();

  if (session?.userId) return redirect("/drive", RedirectType.replace);

  return (
    <main className="-mt-32 flex w-full items-center justify-center md:h-screen">
      <SignInDialog />
    </main>
  );
}
