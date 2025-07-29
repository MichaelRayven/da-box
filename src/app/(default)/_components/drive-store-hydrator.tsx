"use client";

import { useEffect } from "react";
import { useDriveStore } from "~/lib/store/drive";
import type { File, Folder } from "~/lib/interface";

export default function DriveStoreHydrator({
  files,
  folders,
}: {
  files: File[];
  folders: Folder[];
}) {
  const initialize = useDriveStore((s) => s.initialize);

  useEffect(() => {
    initialize(files, folders);
  }, [files, folders, initialize]);

  return null; // No UI — purely for hydration
}
