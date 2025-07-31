import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser } from "~/server/db/queries";

export default async function GoogleDriveClone() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root.success) {
    // Redirects to drive
    const response = await onboardUser(session.user.id);
    if (!response.success) throw new Error("Something went wrong!");

    return redirect(`/drive/folders/${response.data}`);
  }

  return redirect(`/drive/folders/${root.data.id}`);
}
