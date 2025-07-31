import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser, getSharedWithUser } from "~/server/db/queries";
import DriveContents from "~/components/drive-contents";

export default async function SharedFolderPage() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root.success) {
    const rootFolderId = await onboardUser(session.user.id);
    return redirect(`/drive/folders/${rootFolderId}`);
  }

  const shared = await getSharedWithUser(session.userId);

  if (!shared.success) return notFound();

  return (
    <DriveContents
      crumbs={[{ name: "Shared", url: "/drive/shared" }]}
      files={shared.data.files.map((f) => ({
        ...f,
        url: `/drive/files/${f.id}`,
      }))}
      folders={shared.data.folders.map((f) => ({
        ...f,
        url: `/drive/shared/folders/${f.id}`,
      }))}
    />
  );
}
