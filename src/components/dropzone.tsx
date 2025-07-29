"use client";

import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface DropzoneProps {
  className?: string;
  hasError?: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export function Dropzone({
  className,
  hasError,
  onDrop,
  children = (
    <>
      <UploadIcon className="mb-8" />
      <p className="mb-2">Click to select files or drag and drop</p>
      <p className="text-sm">Support for multiple files</p>
    </>
  ),
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onDrop(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border-2 border-dashed p-8 text-center text-muted-foreground transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isDragging && "border-primary bg-muted",
        hasError && "border-destructive focus-visible:ring-destructive/20",
        !hasError &&
          !isDragging &&
          "cursor-pointer border-border hover:border-primary",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {children}
    </div>
  );
}
