import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser } from "~/server/db/queries";

export default async function StarredFolderPage() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root) {
    const rootFolderId = await onboardUser(session.user.id);
    return redirect(`/drive/folders/${rootFolderId}`);
  }

  const folder = root.folders.find((f) => f.name === "Starred")!;

  return redirect(`/drive/folders/${folder.id}`);
}
