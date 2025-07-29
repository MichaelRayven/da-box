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

export type File = {
  id: string;
  name: string;
  size: number;
  key: string;
  type: string;
  hidden: boolean;
  parentId: string;
  ownerId: string;
  modified: Date | null;
  createdAt: Date | null;
};

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  modified: Date | null;
  createdAt: Date | null;
};

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

export interface PostgresError extends Error {
  cause: {
    code?: string;
    constraint?: string;
    detail?: string;
    table?: string;
    column?: string;
    schema?: string;
  };
}
