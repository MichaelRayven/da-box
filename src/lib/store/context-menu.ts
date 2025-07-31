import { create } from "zustand";
import type { ItemType } from "../interface";

interface UseContextMenuStore {
  selectedItem: ItemType | null;

  isDeleteOpen: boolean;
  isRenameOpen: boolean;
  isShareOpen: boolean;

  setSelectedFile: (file: ItemType | null) => void;

  openDeleteDialog: (file: ItemType) => void;
  closeDeleteDialog: () => void;

  openRenameDialog: (file: ItemType) => void;
  closeRenameDialog: () => void;

  openShareDialog: (file: ItemType) => void;
  closeShareDialog: () => void;
}

export const useContextMenuStore = create<UseContextMenuStore>((set) => ({
  selectedItem: null,

  isDeleteOpen: false,
  isRenameOpen: false,
  isShareOpen: false,

  setSelectedFile: (file) => set({ selectedItem: file }),

  openDeleteDialog: (file) => set({ selectedItem: file, isDeleteOpen: true }),

  closeDeleteDialog: () => set({ isDeleteOpen: false }),

  openRenameDialog: (file) => set({ selectedItem: file, isRenameOpen: true }),

  closeRenameDialog: () => set({ isRenameOpen: false }),

  openShareDialog: (file) => set({ selectedItem: file, isShareOpen: true }),

  closeShareDialog: () => set({ isShareOpen: false }),
}));
