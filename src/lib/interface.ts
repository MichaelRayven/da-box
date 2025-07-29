import type { AdapterAccountType } from "next-auth/adapters";

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
  parent: string;
  modified: string;
  owner: string;
}

export interface Folder {
  id: string;
  name: string;
  type: "folder";
  parent: string | null;
  owner: string;
}

export type AccountType = AdapterAccountType | "credentials";

export type ActionResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
