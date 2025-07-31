import { useContextMenuStore } from "~/lib/store/context-menu";
import { toast } from "sonner";
import {
  favoriteFile,
  favoriteFolder,
  getFileViewingUrl,
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

    const result = await getFileViewingUrl(item.data.id);
    if (result.success) {
      const a = document.createElement("a");
      a.href = result.data.url;
      a.download = item.data.name;
      a.click();
    }
  };

  const handleRestore = () => {
    const action = isFile ? restoreFile : restoreFolder;

    toast.promise(
      async () => {
        const result = await action(item.data.id);
        if (!result.success) throw new Error(result.error);
        return result;
      },
      {
        loading: `Restoring ${item.type} "${item.data.name}"...`,
        success: `Restored ${item.type} "${item.data.name}"`,
        error: (error: Error) =>
          error?.message ||
          `Failed to restore ${item.type} "${item.data.name}"`,
      },
    );
  };

  const handleTrash = () => {
    const action = isFile ? trashFile : trashFolder;

    toast.promise(
      async () => {
        const result = await action(item.data.id);
        if (!result.success) throw new Error(result.error);
        return result;
      },
      {
        loading: `Putting ${item.type} "${item.data.name}" into trash...`,
        success: `Put ${item.type} "${item.data.name}" into trash`,
        error: (error: Error) =>
          error?.message ||
          `Failed to put ${item.type} "${item.data.name}" into trash`,
        action: {
          label: "Undo",
          onClick: handleRestore,
        },
      },
    );
  };

  const handleUnfavorite = () => {
    const action = isFile ? unfavoriteFile : unfavoriteFolder;

    toast.promise(
      async () => {
        const result = await action(item.data.id);
        if (!result.success) throw new Error(result.error);
        return result;
      },
      {
        loading: `Removing ${item.type} "${item.data.name}" from favorites...`,
        success: `Removed ${item.type} "${item.data.name}" from favorites`,
        error: (error: Error) =>
          error?.message ||
          `Failed to remove ${item.type} "${item.data.name}" from favorites`,
      },
    );
  };

  const handleFavorite = () => {
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
          onClick: handleUnfavorite,
        },
      },
    );
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
    favorite: !item.data.starred ? handleFavorite : undefined,
    trash: handleTrash,
    unfavorite: item.data.starred ? handleUnfavorite : undefined,
  };
}
