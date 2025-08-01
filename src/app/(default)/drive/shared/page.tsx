import { notFound, redirect } from "next/navigation";
import DriveContents from "~/components/drive-contents";
import { getShared } from "~/server/actions";
import { auth } from "~/server/auth";
import { onboardUser } from "~/server/db/mutations";
import { getRootFolderForUser } from "~/server/db/queries";

export default async function SharedFolderPage() {
  const session = await auth();

  if (!session?.userId) return redirect("/sign-in");

  const root = await getRootFolderForUser(session.userId);

  if (!root.success) {
    await onboardUser(session.userId);
    return redirect("/drive/shared");
  }

  const shared = await getShared();
  if (!shared.success) return notFound();

  return (
    <DriveContents
      crumbs={[{ name: "Shared", url: "/drive/shared" }]}
      files={shared.data.files}
      folders={shared.data.folders}
    />
  );
}
