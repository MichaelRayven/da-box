import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser } from "~/server/db/queries";

export default async function GoogleDriveClone() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root) {
    // Redirects to drive
    const folder = await onboardUser(session.user.id);
    if (!folder) throw new Error("Something went wrong!");

    return redirect(`/drive/folders/${folder.id}`);
  }

  const folder = root.folders.find((f) => f.name === "My Drive")!;
  return redirect(`/drive/folders/${folder.id}`);
}
