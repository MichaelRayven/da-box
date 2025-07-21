import { getFiles, getFolders } from "~/server/db/queries";
import DriveContents from "../_components/drive-contents";

export default async function GoogleDriveClone() {
  const filesPromise = getFiles(1);

  const foldersPromise = getFolders(1);

  const [folders, files] = await Promise.all([foldersPromise, filesPromise, ,]);

  return <DriveContents folders={folders} files={files} />;
}
