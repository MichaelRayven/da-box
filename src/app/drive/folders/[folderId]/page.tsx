import { eq } from "drizzle-orm";
import DriveContents from "~/app/_components/drive-contents";
import { db } from "~/server/db";
import {
  files as filesSchema,
  folders as foldersSchema,
} from "~/server/db/schema";

async function getParents(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;

  while (currentId !== null) {
    const folder: typeof foldersSchema.$inferSelect | undefined = (
      await db
        .select()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId))
    )[0];

    if (!folder) {
      throw new Error("Folder not found");
    }
    parents.unshift(folder);
    currentId = folder.parent;
  }

  return parents;
}

export default async function GoogleDriveClone({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params; // Promise indicates this is a dynamic route

  const parsedFolderId = parseInt(folderId);

  if (isNaN(parsedFolderId)) {
    throw new Error("Invalid folder ID"); // TODO: Throw 404
  }

  // Execute in parallel
  const filesPromise = db
    .select()
    .from(filesSchema)
    .where(eq(filesSchema.parent, parsedFolderId));

  const foldersPromise = db
    .select()
    .from(foldersSchema)
    .where(eq(foldersSchema.parent, parsedFolderId));

  const parentsPromise = getParents(parsedFolderId);

  const [folders, files, parents] = await Promise.all([
    foldersPromise,
    filesPromise,
    parentsPromise,
  ]);

  return <DriveContents folders={folders} files={files} parents={parents} />;
}
