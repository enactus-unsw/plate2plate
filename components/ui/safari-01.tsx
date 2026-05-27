"use client";

import Image, { type StaticImageData } from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

interface Safari01Props {
  image?: StaticImageData | string;
  videoSrc?: string;
  url?: string;
  className?: string;
}

const Safari01: React.FC<Safari01Props> = ({ image, videoSrc, url, className }) => {
  return (
    <div
      className={cn(
        "w-full max-w-5xl overflow-hidden rounded-xl border border-[--color-border] bg-[--color-surface] shadow-card",
        className,
      )}
    >
      <div className="relative z-10 flex items-center border-b border-[--color-border-subtle] bg-[#f2f4f7] px-4 py-2">
        {/* Window controls (top-left) */}
        <div className="relative z-10 flex items-center space-x-2">
          {/* Subtle ring/shadow keeps dots visible on very light headers */}
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" />
        </div>

        {/* Center toolbar pill (hidden on mobile) */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-5 hidden w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 px-6 sm:block">
          <div className="flex h-5 w-full items-center justify-center rounded-full bg-[#e5e6ec] px-4 text-[10px] font-medium text-[#6b7280]">
            placeholder can add text
          </div>
        </div>

        {/* Spacer to keep left controls from overlapping the centered pill */}
        <div className="ml-auto h-4 w-4" aria-hidden="true" />
      </div>

      <div className="relative z-0 flex aspect-video items-center justify-center bg-[--color-surface-warm]">
        {videoSrc ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : image ? (
          <Image
            src={image}
            alt="Preview"
            width={800}
            height={450}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-sm text-[--color-text-secondary]">No preview</div>
        )}
      </div>
    </div>
  );
};

export default Safari01;
export type { Safari01Props };
