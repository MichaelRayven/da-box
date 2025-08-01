import { notFound, redirect } from "next/navigation";
import DriveContents from "~/components/drive-contents";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser, getTrashedForUser } from "~/server/db/queries";

export default async function TrashFolderPage() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root.success) {
    const rootFolderId = await onboardUser(session.user.id);
    return redirect(`/drive/folders/${rootFolderId}`);
  }

  const trashed = await getTrashedForUser(session.userId);

  if (!trashed.success) return notFound();

  // TODO: disable opening trashed folders
  return (
    <DriveContents
      crumbs={[{ name: "Trash", url: "/drive/trash" }]}
      files={trashed.data.files.map((f) => ({
        ...f,
        url: `/drive/files/${f.id}`,
      }))}
      folders={trashed.data.folders.map((f) => ({
        ...f,
        url: `/drive/folders/${f.id}`,
      }))}
    />
  );
}
