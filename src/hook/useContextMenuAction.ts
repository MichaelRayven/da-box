import { useContextMenuStore } from "~/lib/store/context-menu";
import { toast } from "sonner";
import {
  favoriteFile,
  favoriteFolder,
  getFileDownloadUrl,
  restoreFile,
  restoreFolder,
  trashFile,
  trashFolder,
  unfavoriteFile,
  unfavoriteFolder,
} from "~/server/actions";
import type { ItemType } from "~/lib/interface";

export function useContextMenuAction(item: ItemType) {
  const { openRenameDialog, openShareDialog, openDeleteDialog } =
    useContextMenuStore();
  const isFile = item.type === "file";

  const handleShare = () => openShareDialog(item);
  const handleRename = () => openRenameDialog(item);
  const handleDelete = () => openDeleteDialog(item);
  const handleDownload = async () => {
    if (!isFile) return;
    const result = await getFileDownloadUrl(item.data.id);
    if (result.success) {
      const a = document.createElement("a");
      a.href = result.data.url;
      a.download = item.data.name;
      a.click();
    }
  };

  const handleTrash = async () => {
    const action = isFile ? trashFile : trashFolder;
    const restoreAction = isFile ? restoreFile : restoreFolder;

    toast.promise(
      async () => {
        const result = await action(item.data.id);
        if (!result.success) throw new Error(result.error);
        return result;
      },
      {
        loading: `Putting ${item.type} "${item.data.name}" into trash...`,
        success: `Put ${item.type} "${item.data.name}" into trash`,
        error: `Failed to put ${item.type} "${item.data.name}" into trash`,
        action: {
          label: "Undo",
          onClick: () => restoreAction(item.data.id),
        },
      },
    );
  };

  const handleRestore = async () => {
    const action = isFile ? restoreFile : restoreFolder;
    const result = await action(item.data.id);
    if (result.success) {
      toast.success(`Restored ${item.type} "${item.data.name}"`);
    } else {
      toast.error(`Failed to restore ${item.type} "${item.data.name}"`);
    }
  };

  const handleFavorite = async () => {
    const action = isFile ? favoriteFile : favoriteFolder;
    toast.promise(
      async () => {
        const result = await action(item.data.id);
        if (!result.success) throw new Error(result.error);
        return result;
      },
      {
        loading: `Adding ${item.type} "${item.data.name}" to favorites...`,
        success: `Added ${item.type} "${item.data.name}" to favorites`,
        error: `Failed to add ${item.type} "${item.data.name}" to favorites`,
        action: {
          label: "Remove",
          onClick: () =>
            (isFile ? unfavoriteFile : unfavoriteFolder)(item.data.id),
        },
      },
    );
  };

  const handleUnfavorite = async () => {
    const action = isFile ? unfavoriteFile : unfavoriteFolder;
    const result = await action(item.data.id);
    if (result.success) {
      toast.success(`Removed ${item.type} "${item.data.name}" from favorites`);
    } else {
      toast.error(
        `Failed to remove ${item.type} "${item.data.name}" from favorites`,
      );
    }
  };

  if (item.data.trashed) {
    return {
      restore: handleRestore,
      delete: handleDelete,
    };
  }

  return {
    share: handleShare,
    rename: handleRename,
    download: isFile ? handleDownload : undefined,
    favorite: handleFavorite,
    trash: handleTrash,
    unfavorite: handleUnfavorite,
  };
}
