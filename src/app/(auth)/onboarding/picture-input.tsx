"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useRef } from "react";
import { Dropzone } from "~/components/dropzone";

type AvatarUploadProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value" | "ref"
> & {
  value?: File | string;
  onChange: (value: File | null) => void;
  ref?: (el: HTMLInputElement | null) => void;
};

export function PictureInput({
  value,
  onChange,
  disabled,
  ref,
  ...props
}: AvatarUploadProps) {
  const localRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    localRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const fileArray = Array.from(e.dataTransfer.files);
    onChange(fileArray[0]!);
  };

  const handleReset = () => {
    if (localRef.current) {
      localRef.current.value = "";
    }

    onChange(null);
  };

  const setRefs = (el: HTMLInputElement | null) => {
    localRef.current = el;
    ref?.(el);
  };

  const preview = value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div className="flex flex-col items-center gap-2">
      <Dropzone
        onClick={handleClick}
        onDrop={handleDrop}
        disabled={disabled}
        className="flex size-48 items-center justify-center overflow-hidden rounded-full p-0"
      >
        {preview ? (
          <img
            src={preview}
            // biome-ignore lint/a11y/noRedundantAlt: <explanation>
            alt="Profile picture preview"
            className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
          />
        ) : (
          <span className="px-2 text-center text-muted-foreground text-sm">
            Click to upload
          </span>
        )}
      </Dropzone>
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={setRefs}
        onChange={(e) => {
          const fileList = e.target.files;
          onChange(fileList?.[0] ?? null);
        }}
        disabled={disabled}
        {...props}
      />

      {preview && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          type="button"
          disabled={disabled}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
