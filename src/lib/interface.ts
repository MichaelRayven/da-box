import type { AdapterAccountType } from "next-auth/adapters";
import type {
  files as filesSchema,
  folders as foldersSchema,
} from "~/server/db/schema";

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

export type FileType = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  modified: Date | null;
  ownerId: string;
};

export type FolderType = {
  id: string;
  name: string;
  url: string;
  modified: Date | null;
  ownerId: string;
};

export type Crumb = {
  name: string;
  url: string;
};

export type AccountType = AdapterAccountType | "credentials";

export type Result<T> =
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
