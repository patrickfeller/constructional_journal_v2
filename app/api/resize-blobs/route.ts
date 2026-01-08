import { list, head, put } from "@vercel/blob";
import sharp from "sharp";
import { NextResponse } from "next/server";

// Protect this endpoint
const MIGRATION_SECRET = process.env.MIGRATION_SECRET;

interface ProcessResult {
  pathname: string;
  status: 'skipped' | 'optimized' | 'error';
  originalSize: number;
  newSize?: number;
  savedBytes?: number;
  reason?: string;
}

const maxDimension = 1600;
const targetBytes = 650_000;
const quality = 75;

type SupportedImageType = "image/jpeg" | "image/png" | "image/webp";

const supportedContentTypes: SupportedImageType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

async function processBlob(pathname: string): Promise<ProcessResult> {
  try {
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
      return {
        pathname,
        status: 'skipped',
        originalSize: metadata.size,
        reason: `Unsupported type: ${contentType || 'unknown'}`,
      };
    }

    const { url, size: originalSize } = metadata;

    if (originalSize <= targetBytes) {
      return {
        pathname,
        status: 'skipped',
        originalSize,
        reason: `Already small: ${Math.round(originalSize / 1024)}KB`,
      };
    }

    // Server-side fetch (no CORS/firewall issues)
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        pathname,
        status: 'error',
        originalSize,
        reason: `Download failed: ${response.status}`,
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    let pipeline = sharp(Buffer.from(arrayBuffer), { failOnError: false }).rotate();

    pipeline = pipeline.resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });

    // Keep original format
    const outputContentType: SupportedImageType = contentType as SupportedImageType;

    if (contentType === "image/png") {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (contentType === "image/webp") {
      pipeline = pipeline.webp({ quality });
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    const optimizedBuffer = await pipeline.toBuffer();

    if (optimizedBuffer.length >= originalSize) {
      return {
        pathname,
        status: 'skipped',
        originalSize,
        reason: 'No improvement possible',
      };
    }

    const savedBytes = originalSize - optimizedBuffer.length;

    // Upload optimized version
    await put(pathname, optimizedBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: outputContentType,
    });

    return {
      pathname,
      status: 'optimized',
      originalSize,
      newSize: optimizedBuffer.length,
      savedBytes,
    };
  } catch (error) {
    return {
      pathname,
      status: 'error',
      originalSize: 0,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: Request) {
  try {
    const { secret, limit = 10, dryRun = true } = await request.json();

    // Check authorization
    if (secret !== MIGRATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: ProcessResult[] = [];
    let processed = 0;

    // Get blobs
    const { blobs } = await list({ limit });

    for (const blob of blobs) {
      if (processed >= limit) break;
      
      if (!dryRun) {
        const result = await processBlob(blob.pathname);
        results.push(result);
      } else {
        // Dry run - just check what would happen
        const metadata = await head(blob.pathname);
        results.push({
          pathname: blob.pathname,
          status: metadata.size > targetBytes ? 'skipped' : 'skipped',
          originalSize: metadata.size,
          reason: metadata.size > targetBytes ? 'Would optimize' : 'Already small',
        });
      }
      
      processed++;
      
      // Small delay to avoid any rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const summary = {
      processed: results.length,
      optimized: results.filter(r => r.status === 'optimized').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      totalSaved: results.reduce((sum, r) => sum + (r.savedBytes || 0), 0),
      dryRun,
    };

    return NextResponse.json({
      summary,
      results,
    });
  } catch (error) {
    console.error('Resize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
