import { notFound, redirect } from "next/navigation";
import DriveContents from "~/components/drive-contents";
import { getFiles, getFolders } from "~/server/actions";
import { auth } from "~/server/auth";
import { getParentsForFolder } from "~/server/db/queries";

export default async function GoogleDriveClone({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params; // Promise indicates this is a dynamic route

  const session = await auth();

  if (!session?.userId) return redirect("/sign-in");

  // Execute in parallel
  const [folders, files, parents] = await Promise.all([
    getFolders(folderId),
    getFiles(folderId),
    getParentsForFolder(folderId, session.userId),
  ]);

  if (!folders.success || !files.success || !parents.success) return notFound();

  console.log(parents.data);

  const crumbs = parents.data.map((f) => ({
    name: f.name,
    url: `/drive/folders/${f.id}`,
  }));

  crumbs.unshift({ name: "My Drive", url: "/drive" });

  return (
    <DriveContents crumbs={crumbs} files={files.data} folders={folders.data} />
  );
}
