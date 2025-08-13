"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Photo = {
  id: string | number;
  url: string | null;
  caption?: string | null;
};

export function PhotoGrid({ photos, className }: { photos: Photo[]; className?: string }) {
  const candidates = useMemo(
    () => photos.filter((p) => p.url && p.url.trim() !== ""),
    [photos]
  );

  if (candidates.length === 0) return null;

  // For journal entries, show larger images with fewer columns
  const isJournal = className?.includes('journal') || className?.includes('mt-0');
  
  if (isJournal) {
    return (
      <div className={cn("space-y-3", className)}>
        {candidates.map((p) => (
          <PhotoItem key={p.id} url={p.url!} alt={p.caption ?? ""} size="large" />
        ))}
      </div>
    );
  }

  // Default grid layout for other uses
  return (
    <div className={cn("mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2", className)}>
      {candidates.map((p) => (
        <PhotoItem key={p.id} url={p.url!} alt={p.caption ?? ""} size="small" />
      ))}
    </div>
  );
}

function PhotoItem({ url, alt, size = "small" }: { url: string; alt: string; size?: "small" | "large" }) {
  const [errored, setErrored] = useState(false);

  if (errored) return null;

  if (size === "large") {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
          onLoad={() => { /* render once loaded; nothing needed */ }}
          onError={() => setErrored(true)}
        />
      </div>
    );
  }

  // Small size (default grid)
  return (
    <div className="relative aspect-square overflow-hidden rounded-md">
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 640px) 33vw, 16vw"
        className="object-cover"
        onLoad={() => { /* render once loaded; nothing needed */ }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}


