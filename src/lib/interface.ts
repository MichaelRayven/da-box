export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "image" | "video" | "audio" | "archive";
  size?: string;
  modified: string;
  owner: string;
  shared?: boolean;
  starred?: boolean;
  parentId?: string;
  url?: string;
}
