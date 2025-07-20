"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { mockData } from "../_mock";

interface BreadcrumbProps {
  className?: string;
}

export default function Breadcrumbs({ className }: BreadcrumbProps) {
  // TODO: Put current folder in a provider
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentId = currentFolderId;

    while (currentId) {
      const folder = mockData.find((item) => item.id === currentId);
      if (folder) {
        breadcrumbs.unshift(folder);
        currentId = folder.parentId || null;
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
        onClick={() => setCurrentFolderId(null)}
        className="text-gray-300 hover:bg-gray-800"
      >
        My Drive
      </Button>
      {getBreadcrumbs().map((folder, index) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-2 text-gray-500">{">"}</span>
          <Button
            variant="ghost"
            onClick={() => setCurrentFolderId(folder.id)}
            className="text-gray-300 hover:bg-gray-800"
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
