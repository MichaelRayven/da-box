import type { File, Folder } from "~/lib/interface";

export const mockFiles: File[] = [
  {
    id: "10",
    name: "Profile Picture.jpg",
    type: "file",
    size: "3.2 MB",
    parentId: "3",
    url: "#",
    modified: "2023-06-01",
    owner: "John Doe",
  },
  {
    id: "11",
    name: "Screenshot.png",
    type: "file",
    size: "1.1 MB",
    parentId: "3",
    url: "#",
    modified: "2023-06-01",
    owner: "John Doe",
  },
  {
    id: "12",
    name: "Presentation.pptx",
    type: "file",
    size: "5.2 MB",
    parentId: "2",
    url: "#",
    modified: "2023-06-01",
    owner: "John Doe",
  },
  {
    id: "13",
    name: "Backup.zip",
    type: "file",
    size: "45 MB",
    parentId: "root",
    url: "#",
    modified: "2023-01-01",
    owner: "John Doe",
  },
];

export const mockFolders: Folder[] = [
  {
    id: "root",
    name: "root",
    type: "folder",
    parentId: null,
    owner: "John Doe",
  },
  {
    id: "2",
    name: "Vacation 2023",
    type: "folder",
    parentId: "root",
    owner: "John Doe",
  },
  {
    id: "3",
    name: "Photos",
    type: "folder",
    parentId: "2",
    owner: "John Doe",
  },
  {
    id: "4",
    name: "Videos",
    type: "folder",
    parentId: "2",
    owner: "John Doe",
  },
  {
    id: "5",
    name: "Working Documents",
    type: "folder",
    parentId: "root",
    owner: "John Doe",
  },
  {
    id: "1",
    name: "Documents",
    type: "folder",
    parentId: "root",
    owner: "John Doe",
  },
];
