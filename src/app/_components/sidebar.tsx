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

export default function Sidebar() {
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900 h-screen fixed left-0 top-0">
      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <HardDrive className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">Drive</h1>
        </div>

        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Folder
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name" className="text-white">
                  Folder Name
                </Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Untitled folder"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsCreateFolderOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <Home className="mr-3 h-4 w-4" />
            My Drive
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <Users className="mr-3 h-4 w-4" />
            Shared with me
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <Clock className="mr-3 h-4 w-4" />
            Recent
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <Star className="mr-3 h-4 w-4" />
            Starred
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <Trash2 className="mr-3 h-4 w-4" />
            Trash
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800"
          >
            <HardDrive className="mr-3 h-4 w-4" />
            Storage
          </Button>
        </nav>
      </div>
    </aside>
  );
}
