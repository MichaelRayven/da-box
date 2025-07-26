"use client";

import {
  Clock,
  HardDrive,
  Home,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export default function Sidebar() {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 border-r">
      <div className="p-4">
        <Logo className="mb-6" />

        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 w-full">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Untitled folder"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateFolderOpen(false)}>
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-3 h-4 w-4" />
            My Drive
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-3 h-4 w-4" />
            Shared with me
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Clock className="mr-3 h-4 w-4" />
            Recent
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Star className="mr-3 h-4 w-4" />
            Starred
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Trash2 className="mr-3 h-4 w-4" />
            Trash
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HardDrive className="mr-3 h-4 w-4" />
            Storage
          </Button>
        </nav>
      </div>
    </aside>
  );
}
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
