import { create } from "zustand";
import type { FileType } from "../interface";

interface UseContextMenuStore {
  selectedFile: FileType | null;

  isDeleteOpen: boolean;
  isRenameOpen: boolean;
  isShareOpen: boolean;

  setSelectedFile: (file: FileType | null) => void;

  openDeleteDialog: (file: FileType) => void;
  closeDeleteDialog: () => void;

  openRenameDialog: (file: FileType) => void;
  closeRenameDialog: () => void;

  openShareDialog: (file: FileType) => void;
  closeShareDialog: () => void;
}

export const useContextMenuStore = create<UseContextMenuStore>((set) => ({
  selectedFile: null,

  isDeleteOpen: false,
  isRenameOpen: false,
  isShareOpen: false,

  setSelectedFile: (file) => set({ selectedFile: file }),

  openDeleteDialog: (file) => set({ selectedFile: file, isDeleteOpen: true }),

  closeDeleteDialog: () => set({ isDeleteOpen: false }),

  openRenameDialog: (file) => set({ selectedFile: file, isRenameOpen: true }),

  closeRenameDialog: () => set({ isRenameOpen: false }),

  openShareDialog: (file) => set({ selectedFile: file, isShareOpen: true }),

  closeShareDialog: () => set({ isShareOpen: false }),
}));
