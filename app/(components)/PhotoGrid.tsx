"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FullscreenPhotoViewer } from "./FullscreenPhotoViewer";

type Photo = {
  id: string | number;
  url: string | null;
  caption?: string | null;
};

export function PhotoGrid({ photos, className }: { photos: Photo[]; className?: string }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const candidates = useMemo(
    () => photos.filter((p) => p.url && p.url.trim() !== ""),
    [photos]
  );

  if (candidates.length === 0) return null;

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  // Convert photos to the format expected by FullscreenPhotoViewer
  const viewerPhotos = candidates.map(p => ({
    id: p.id,
    url: p.url!,
    caption: p.caption
  }));

  // For journal entries, show larger images with fewer columns
  const isJournal = className?.includes('journal') || className?.includes('mt-0');
  
  if (isJournal) {
    return (
      <>
        <div className={cn("space-y-3", className)}>
          {candidates.map((p, index) => (
            <PhotoItem 
              key={p.id} 
              url={p.url!} 
              alt={p.caption ?? ""} 
              size="large" 
              onClick={() => handlePhotoClick(index)}
            />
          ))}
        </div>
        <FullscreenPhotoViewer
          photos={viewerPhotos}
          initialIndex={selectedPhotoIndex}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
        />
      </>
    );
  }

  // Default grid layout for other uses
  return (
    <>
      <div className={cn("mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2", className)}>
        {candidates.map((p, index) => (
          <PhotoItem 
            key={p.id} 
            url={p.url!} 
            alt={p.caption ?? ""} 
            size="small" 
            onClick={() => handlePhotoClick(index)}
          />
        ))}
      </div>
      <FullscreenPhotoViewer
        photos={viewerPhotos}
        initialIndex={selectedPhotoIndex}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </>
  );
}

function PhotoItem({ 
  url, 
  alt, 
  size = "small", 
  onClick 
}: { 
  url: string; 
  alt: string; 
  size?: "small" | "large";
  onClick?: () => void;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) return null;

  if (size === "large") {
    return (
      <div 
        className="relative w-full aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onClick}
      >
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
    <div 
      className="relative aspect-square overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
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


