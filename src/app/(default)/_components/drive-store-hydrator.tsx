"use client";

import { useEffect } from "react";
import { useDriveStore } from "~/lib/store/drive";
import type { FileType, FolderType } from "~/lib/interface";

export default function DriveStoreHydrator({
  files,
  folders,
}: {
  files: FileType[];
  folders: FolderType[];
}) {
  const initialize = useDriveStore((s) => s.initialize);

  useEffect(() => {
    initialize(files, folders);
  }, [files, folders, initialize]);

  return null; // No UI — purely for hydration
}
