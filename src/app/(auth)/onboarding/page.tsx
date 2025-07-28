import { auth } from "~/server/auth";
import { OnboardingDialog } from "./dialog";

export default async function OnboardingPage() {
  const session = await auth();

  return (
    <main className="-mt-32 flex items-center justify-center md:h-screen">
      <OnboardingDialog
        defaultName={session?.user.name ?? ""}
        defaultUsername={session?.user.username}
      />
    </main>
  );
}
