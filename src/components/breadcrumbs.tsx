import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { folders_table } from "~/server/db/schema";

interface BreadcrumbProps {
  className?: string;
  breadcrumbs?: (typeof folders_table.$inferSelect)[];
}

export default function Breadcrumbs({
  breadcrumbs = [],
  className,
}: BreadcrumbProps) {
  return (
    <div className={className}>
      <Button
        variant="ghost"
        asChild
        className="text-gray-300 hover:bg-gray-800"
      >
        <Link href="/drive">My Drive</Link>
      </Button>
      {breadcrumbs.map((folder) => (
        <div key={folder.id} className="flex items-center">
          <span className="mx-2 text-gray-500">{">"}</span>
          <Button
            variant="ghost"
            asChild
            className="text-gray-300 hover:bg-gray-800"
          >
            <Link href={`/drive/folders/${folder.id}`}>{folder.name}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
