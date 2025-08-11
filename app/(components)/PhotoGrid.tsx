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

  return (
    <div className={cn("mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2", className)}>
      {candidates.map((p) => (
        <PhotoItem key={p.id} url={p.url!} alt={p.caption ?? ""} />
      ))}
    </div>
  );
}

function PhotoItem({ url, alt }: { url: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored) return null;

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


