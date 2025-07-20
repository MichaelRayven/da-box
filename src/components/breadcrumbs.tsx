"use client";

import { Button } from "~/components/ui/button";
import { mockData } from "../app/_mock";
import { useParams, useRouter } from "next/navigation";

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumbs({ className }: BreadcrumbProps) {
  const router = useRouter();
  const { folderId: currentFolderId } = useParams<{
    folderId: string | undefined;
  }>();

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = mockData.find((item) => item.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  return (
    <div className={className}>
      {/* Breadcrumbs */}
      <Button
        variant="ghost"
        onClick={() => {
          router.push(`/drive`);
        }}
        className="text-gray-300 hover:bg-gray-800"
      >
        My Drive
      </Button>
      {getBreadcrumbs().map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-2 text-gray-500">{">"}</span>
          <Button
            variant="ghost"
            className="text-gray-300 hover:bg-gray-800"
            onClick={() => {
              router.push(`/drive/folders/${folder.id}`);
            }}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
