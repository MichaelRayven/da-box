import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { OnboardingDialog } from "./dialog";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.userId) return redirect("/sign-in");

  return (
    <main className="-mt-32 flex items-center justify-center md:h-screen">
      <OnboardingDialog
        defaultName={session.user.name ?? ""}
        defaultUsername={session.user.username}
        defaultAvatar={session.user.image ?? undefined}
      />
    </main>
  );
}
