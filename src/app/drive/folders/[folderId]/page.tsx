import DriveContents from "~/app/_components/drive-contents";
import { getFiles, getFolders, getParentFolders } from "~/server/db/queries";

export default async function GoogleDriveClone({
	params,
}: {
	params: Promise<{ folderId: string }>;
}) {
	const { folderId } = await params; // Promise indicates this is a dynamic route
	const parsedFolderId = Number.parseInt(folderId);

	if (Number.isNaN(parsedFolderId)) {
		throw new Error("Invalid folder ID"); // TODO: Throw 404
	}

	// Execute in parallel
	const filesPromise = getFiles(parsedFolderId);
	const foldersPromise = getFolders(parsedFolderId);
	const parentsPromise = getParentFolders(parsedFolderId);

	const [folders, files, parents] = await Promise.all([
		foldersPromise,
		filesPromise,
		parentsPromise,
	]);

	return <DriveContents folders={folders} files={files} parents={parents} />;
}
