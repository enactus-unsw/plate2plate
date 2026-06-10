"use client";

import { useEffect, useMemo, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 4;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

interface PhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  invalid?: boolean;
}

export function PhotoUpload({ files, onChange, invalid }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs for previews; revoked when files change or the component unmounts.
  const previews = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!next.some((f) => f.name === file.name && f.size === file.size)) {
        next.push(file);
      }
    }
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  const atLimit = files.length >= MAX_PHOTOS;

  return (
    <div className="mt-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-square overflow-hidden rounded-lg border border-p2p-border bg-p2p-surface-warm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object-URL preview, not a remote asset */}
            <img
              src={src}
              alt={`Food photo ${i + 1}`}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1.5 top-1.5 rounded-full bg-p2p-overlay p-1 text-white transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-white active:scale-95"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-p2p-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
          </div>
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-p2p-text-secondary transition-colors",
              "hover:border-p2p-primary hover:bg-p2p-primary-light hover:text-p2p-primary focus-visible:ring-2 focus-visible:ring-p2p-primary focus-visible:ring-offset-2 active:scale-[0.98]",
              invalid ? "border-p2p-red" : "border-p2p-border",
            )}
          >
            <ImagePlus className="size-6" aria-hidden="true" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-p2p-text-disabled">
        {files.length}/{MAX_PHOTOS} added · JPG, PNG, WebP or HEIC · up to 5 MB
        each. The first photo is the cover.
      </p>
    </div>
  );
}
