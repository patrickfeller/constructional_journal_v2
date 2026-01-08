/**
 * One-off utility to downsize existing images stored in Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... npx tsx scripts/resize-blobs.ts [--prefix photos/] [--dry-run]
 *
 * Optional environment variables:
 *   RESIZE_MAX_DIMENSION   (number, default 1600)  // Max width/height in px
 *   RESIZE_TARGET_BYTES    (number, default 650000) // Only rewrite if larger
 *   RESIZE_QUALITY         (number, default 75)    // 1-100 quality for lossy formats
 *
 * Flags:
 *   --prefix <value>  Limit processing to blobs whose pathname starts with <value>
 *   --dry-run         Log actions without writing back to Vercel Blob
 *
 * Requirements:
 *   - BLOB_READ_WRITE_TOKEN must be set.
 *   - Installs `sharp` native dependency (already added via package.json).
 */

import { list, head, put } from "@vercel/blob";
import sharp from "sharp";

interface CliOptions {
  prefix?: string;
  dryRun: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = { dryRun: false };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--prefix") {
      const next = args[i + 1];
      if (!next) {
        throw new Error("Missing value for --prefix");
      }
      options.prefix = next;
      i += 1;
    }
  }

  return options;
}

const options = parseArgs();

const maxDimension =
  Number.parseInt(process.env.RESIZE_MAX_DIMENSION || "", 10) || 1600;
const targetBytes =
  Number.parseInt(process.env.RESIZE_TARGET_BYTES || "", 10) || 650_000;
const quality =
  Math.min(
    100,
    Math.max(1, Number.parseInt(process.env.RESIZE_QUALITY || "", 10) || 75)
  );

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is required.");
  process.exit(1);
}

type SupportedImageType = "image/jpeg" | "image/png" | "image/webp";

const supportedContentTypes: SupportedImageType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

async function* iterateBlobs(prefix?: string) {
  let cursor: string | undefined;
  do {
    const listOptions: any = {
      limit: 1000,
      cursor,
    };
    if (prefix) {
      listOptions.prefix = prefix;
    }
    
    const result = await list(listOptions);

    for (const blob of result.blobs) {
      yield blob;
    }

    cursor = result.cursor;
  } while (cursor);
}

async function processBlob(pathname: string, dryRun: boolean) {
  const metadata = await head(pathname);
  
  // Infer content type from file extension if undefined
  let contentType = metadata.contentType;
  if (!contentType) {
    const ext = pathname.toLowerCase().split('.').pop();
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';
  }
  
  if (!contentType || !supportedContentTypes.includes(contentType as SupportedImageType)) {
    console.log(`Skipping non-optimized type: ${pathname} (${contentType || 'unknown'})`);
    return { skipped: 1, updatedBytes: 0 };
  }

  const { url, size: originalSize } = metadata;

  if (!url) {
    console.warn(`No URL for ${pathname}, skipping.`);
    return { skipped: 1, updatedBytes: 0 };
  }

  if (originalSize <= targetBytes) {
    console.log(`Skipping small file (${Math.round(originalSize / 1024)}KB): ${pathname}`);
    return { skipped: 1, updatedBytes: 0 };
  }

  // Use the blob URL directly with authorization header
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });
  if (!response.ok) {
    console.error(`Failed to download ${pathname}: ${response.status} ${response.statusText}`);
    return { skipped: 1, updatedBytes: 0 };
  }

  const arrayBuffer = await response.arrayBuffer();
  let pipeline = sharp(Buffer.from(arrayBuffer), { failOnError: false }).rotate();

  pipeline = pipeline.resize({
    width: maxDimension,
    height: maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  // OPTION A: Keep original format for database consistency
  let outputContentType: SupportedImageType = contentType as SupportedImageType;

  if (contentType === "image/png") {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else if (contentType === "image/webp") {
    pipeline = pipeline.webp({ quality });
  } else {
    // jpeg
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  const optimizedBuffer = await pipeline.toBuffer();

  if (optimizedBuffer.length >= originalSize) {
    console.log(`No improvement for ${pathname} (${optimizedBuffer.length} >= ${originalSize}), skipping.`);
    return { skipped: 1, updatedBytes: 0 };
  }

  const savedBytes = originalSize - optimizedBuffer.length;

  console.log(
    `${dryRun ? "[dry-run] " : ""}Optimized ${pathname}: ${Math.round(
      originalSize / 1024
    )}KB → ${Math.round(optimizedBuffer.length / 1024)}KB (saved ${Math.round(
      savedBytes / 1024
    )}KB)`
  );

  if (!dryRun) {
    await put(pathname, optimizedBuffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: outputContentType,
    });
  }

  return { skipped: 0, updatedBytes: savedBytes };
}

async function main() {
  const summary = {
    processed: 0,
    skipped: 0,
    savedBytes: 0,
  };

  for await (const blob of iterateBlobs(options.prefix)) {
    summary.processed += 1;
    try {
      const result = await processBlob(blob.pathname, options.dryRun);
      summary.skipped += result.skipped;
      summary.savedBytes += result.updatedBytes;
      
      // Add delay to avoid triggering Vercel WAF rate limiting
      // Wait 200ms between blob operations
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to process ${blob.pathname}:`, error);
    }
  }

  console.log(
    `\nCompleted. Processed ${summary.processed} blobs.` +
      ` Skipped ${summary.skipped}.` +
      ` Saved ${(summary.savedBytes / (1024 * 1024)).toFixed(2)} MB.`
  );

  if (options.dryRun) {
    console.log("Dry run mode: no changes were written.");
  }
}

main().catch((error) => {
  console.error("Unexpected failure:", error);
  process.exit(1);
});

