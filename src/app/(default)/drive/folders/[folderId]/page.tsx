import DriveContents from "~/app/(default)/_components/drive-contents";
import { getFiles, getFolders, getParentsForFolder } from "~/server/db/queries";

export default async function GoogleDriveClone({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params; // Promise indicates this is a dynamic route

  // Execute in parallel
  const [folders, files, parents] = await Promise.all([
    getFolders(folderId),
    getFiles(folderId),
    getParentsForFolder(folderId),
  ]);

  return <DriveContents folders={folders} files={files} parents={parents} />;
}
