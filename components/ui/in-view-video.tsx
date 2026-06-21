"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InViewVideoProps {
  src: string;
  className?: string;
  playbackRate?: number;
}

/**
 * Native video that autoplays when scrolled into view and pauses when it
 * leaves the viewport. Keeps the browser's native controls (pause/rewind).
 */
const InViewVideo: React.FC<InViewVideoProps> = ({
  src,
  className,
  playbackRate = 1.5,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      src={src}
      muted
      loop
      playsInline
      controls
      controlsList="nodownload"
      onLoadedMetadata={(e) => {
        e.currentTarget.playbackRate = playbackRate;
      }}
    />
  );
};

export default InViewVideo;
