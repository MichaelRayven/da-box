// export interface FileItem {
//   id: string;
//   name: string;
//   type: "folder" | "document" | "image" | "video" | "audio" | "archive";
//   size?: string;
//   modified: string;
//   owner: string;
//   shared?: boolean;
//   starred?: boolean;
//   parentId?: string;
//   url?: string;
// }

export interface File {
  id: string;
  name: string;
  type: "file";
  size: string;
  url: string;
  parentId: string;
  modified: string;
  owner: string;
}

export interface Folder {
  id: string;
  name: string;
  type: "folder";
  parentId: string | null;
  owner: string;
}
