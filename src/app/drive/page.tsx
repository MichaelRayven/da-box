import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  files as filesSchema,
  folders as foldersSchema,
} from "~/server/db/schema";
import DriveContents from "../_components/drive-contents";

export default async function GoogleDriveClone() {
  const filesPromise = db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parent, 1));
  const foldersPromise = db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, 1));

  const [folders, files] = await Promise.all([foldersPromise, filesPromise]);

  return <DriveContents folders={folders} files={files} />;
}
