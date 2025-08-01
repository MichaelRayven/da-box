"use client";

import { HardDrive, Home, Star, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { CreateObjectDropdown } from "~/components/create-object-dropdown";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-500">
        <HardDrive className="h-5 w-5 text-white" />
      </div>
      <h1 className="font-semibold text-xl">Drive</h1>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r ">
      <div className="p-4">
        <Logo className="mb-6" />

        <CreateObjectDropdown />

        <nav className="space-y-2">
          <Link href="/drive">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-3 size-4" />
              My Drive
            </Button>
          </Link>
          <Link href="/drive/shared">
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-3 size-4" />
              Shared with me
            </Button>
          </Link>
          <Link href="/drive/starred">
            <Button variant="ghost" className="w-full justify-start">
              <Star className="mr-3 size-4" />
              Starred
            </Button>
          </Link>
          <Link href="/drive/trash">
            <Button variant="ghost" className="w-full justify-start">
              <Trash2 className="mr-3 size-4" />
              Trash
            </Button>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
