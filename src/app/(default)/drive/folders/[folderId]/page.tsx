import { redirect } from "next/navigation";
import DriveContents from "~/app/(default)/_components/drive-contents";
import { auth } from "~/server/auth";
import { getFiles, getFolders, getParentsForFolder } from "~/server/db/queries";

export default async function GoogleDriveClone({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params; // Promise indicates this is a dynamic route

  const session = await auth();

  if (!session?.user.id) return redirect("/sign-in");

  // Execute in parallel
  const [folders, files, parents] = await Promise.all([
    getFolders(folderId),
    getFiles(folderId),
    getParentsForFolder(folderId),
  ]);

  return <DriveContents folders={folders} files={files} parents={parents} />;
}
