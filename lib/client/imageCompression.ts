"use client";

import imageCompression, {
  type Options as ImageCompressionOptions,
} from "browser-image-compression";

const DEFAULT_MAX_SIZE_MB = 0.6; // ~600 KB target
const DEFAULT_MAX_DIMENSION = 1600; // pixels
const MIN_BYTES_TO_COMPRESS = 120 * 1024; // Skip tiny files (<120 KB)

export type CompressionOptions = Pick<
  ImageCompressionOptions,
  | "maxSizeMB"
  | "initialQuality"
  | "maxIteration"
  | "maxWidthOrHeight"
  | "useWebWorker"
  | "fileType"
>;

const defaultOptions: ImageCompressionOptions = {
  maxSizeMB: DEFAULT_MAX_SIZE_MB,
  maxWidthOrHeight: DEFAULT_MAX_DIMENSION,
  useWebWorker: true,
  initialQuality: 0.8,
  maxIteration: 8,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= MIN_BYTES_TO_COMPRESS) {
    return file;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const compressedBlob = await imageCompression(file, mergedOptions);

  if (compressedBlob.size >= file.size) {
    return file;
  }

  return new File([compressedBlob], file.name, {
    type: compressedBlob.type || file.type,
    lastModified: Date.now(),
  });
}

export async function compressImages(
  files: Iterable<File>,
  options?: CompressionOptions
): Promise<File[]> {
  const compressed: File[] = [];
  for (const file of files) {
    compressed.push(await compressImage(file, options));
  }
  return compressed;
}

