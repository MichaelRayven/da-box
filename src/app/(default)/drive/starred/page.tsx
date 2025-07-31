import { notFound, redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser, getStarredForUser } from "~/server/db/queries";
import DriveContents from "../../_components/drive-contents";

export default async function StarredFolderPage() {
  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.user.id);

  if (!root.success) {
    const rootFolderId = await onboardUser(session.user.id);
    return redirect(`/drive/folders/${rootFolderId}`);
  }

  const starred = await getStarredForUser(session.userId);

  if (!starred.success) return notFound();

  return (
    <DriveContents
      crumbs={[{ name: "Starred", url: "/drive/starred" }]}
      files={starred.data.files.map((f) => ({
        ...f,
        url: `/drive/files/${f.id}`,
      }))}
      folders={starred.data.folders.map((f) => ({
        ...f,
        url: `/drive/folders/${f.id}`,
      }))}
    />
  );
}
