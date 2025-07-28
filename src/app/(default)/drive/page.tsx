import { getRootFolderForUser } from "~/server/db/queries";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { onboardUser } from "~/server/db/mutations";

export default async function GoogleDriveClone() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root) {
    const rootFolderId = await onboardUser(session.user.id);
    return redirect(`/drive/folders/${rootFolderId}`);
  }

  return redirect(`/drive/folders/${root.id}`);
}
