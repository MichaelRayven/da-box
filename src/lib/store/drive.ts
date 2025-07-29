import { create } from "zustand";
import type { Folder, File } from "../interface";

type DriveState = {
  files: File[];
  folders: Folder[];

  initialize: (files: File[], folders: Folder[]) => void;
  addFile: (file: File) => void;
  renameFile: (id: string, newName: string) => void;
  removeFile: (id: string) => void;

  addFolder: (folder: Folder) => void;
  renameFolder: (id: string, newName: string) => void;
  removeFolder: (id: string) => void;
};

export const useDriveStore = create<DriveState>((set) => ({
  files: [],
  folders: [],

  initialize: (files, folders) => set({ files, folders }),

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  renameFile: (id, newName) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, name: newName } : file,
      ),
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),

  addFolder: (folder) =>
    set((state) => ({
      folders: [...state.folders, folder],
    })),

  renameFolder: (id, newName) =>
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, name: newName } : folder,
      ),
    })),

  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      files: state.files.filter((file) => file.parentId !== id), // optional: remove child files
    })),
}));
