"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  images: string[];
  title: string;
}

export function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const normalized = Array.isArray(images) ? images : [];

  if (normalized.length === 0) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src="/placeholder-food.png"
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, normalized.length - 1);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={normalized[safeIndex]}
          alt={`${title} photo ${safeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority={safeIndex === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {normalized.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(safeIndex - 1)}
              disabled={safeIndex === 0}
              aria-label="Previous photo"
              className="absolute left-3 cursor-pointer top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setSelectedIndex(safeIndex + 1)}
              disabled={safeIndex === normalized.length - 1}
              aria-label="Next photo"
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white">
              {safeIndex + 1} / {normalized.length}
            </div>
          </>
        )}
      </div>
      {normalized.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {normalized.map((url, idx) => (
            <button
              key={url}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                idx === safeIndex
                  ? "border-p2p-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
