"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useRef, useState } from "react";
import { avatarSchema } from "~/lib/validation";

type AvatarUploadProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value" | "ref"
> & {
  value?: FileList;
  onChange: (value: FileList) => void;
  ref?: (el: HTMLInputElement | null) => void;
};

export function AvatarUpload({
  value,
  onChange,
  ref,
  ...props
}: AvatarUploadProps) {
  const localRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = () => {
    localRef.current?.click();
  };

  const handleReset = () => {
    if (localRef.current) {
      localRef.current.value = "";
    }
    setPreview(null);
    onChange(new DataTransfer().files);
  };

  const setRefs = (el: HTMLInputElement | null) => {
    localRef.current = el;
    ref?.(el);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={setRefs}
        onChange={(e) => {
          const fileList = e.target.files;
          if (fileList?.[0]) {
            const { success, data } = avatarSchema.safeParse(fileList);
            if (success) {
              setPreview(URL.createObjectURL(data[0]));
            } else {
              setPreview(null);
            }
          }
          onChange(fileList!);
        }}
        {...props}
      />

      <button
        type="button"
        onClick={handleClick}
        aria-invalid={props["aria-invalid"]}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleClick();
        }}
        className="group flex size-48 items-center justify-center overflow-hidden rounded-full border hover:ring-3 hover:ring-ring focus:outline-none aria-invalid:border-destructive aria-invalid:ring-destructive/20"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
          />
        ) : (
          <span className="px-2 text-center text-muted-foreground text-sm">
            Click to upload
          </span>
        )}
      </button>

      {preview && (
        <Button variant="outline" size="sm" onClick={handleReset} type="button">
          Reset
        </Button>
      )}
    </div>
  );
}
