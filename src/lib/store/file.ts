import { create } from "zustand";

interface FileType {
  id: string;
  name: string;
  // add other properties as needed
}

interface UseFileStore {
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

export const useFileStore = create<UseFileStore>((set) => ({
  selectedFile: null,

  isDeleteOpen: false,
  isRenameOpen: false,
  isShareOpen: false,

  setSelectedFile: (file) => set({ selectedFile: file }),

  openDeleteDialog: (file) => set({ selectedFile: file, isDeleteOpen: true }),

  closeDeleteDialog: () => set({ selectedFile: null, isDeleteOpen: false }),

  openRenameDialog: (file) => set({ selectedFile: file, isRenameOpen: true }),

  closeRenameDialog: () => set({ selectedFile: null, isRenameOpen: false }),

  openShareDialog: (file) => set({ selectedFile: file, isShareOpen: true }),

  closeShareDialog: () => set({ selectedFile: null, isShareOpen: false }),
}));
