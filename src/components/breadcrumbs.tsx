import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import type { FolderType } from "~/lib/interface";
import type { folders } from "~/server/db/schema";

interface BreadcrumbProps {
  className?: string;
  breadcrumbs?: FolderType[];
}

export default function Breadcrumbs({
  breadcrumbs = [],
  className,
}: BreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((folder, index) => (
          <Fragment key={folder.id}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/drive/folders/${folder.id}`}
                  className="rounded-md px-4 py-2 transition-colors hover:bg-foreground/5"
                >
                  {folder.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
