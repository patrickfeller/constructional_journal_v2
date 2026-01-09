/**
 * Delete blobs larger than a specified size
 * Usage: BLOB_READ_WRITE_TOKEN=... npx tsx scripts/delete-large-blobs.ts [--dry-run] [--min-size 650000]
 */

import { list, del } from "@vercel/blob";

interface CliOptions {
  dryRun: boolean;
  minSizeBytes: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = { dryRun: false, minSizeBytes: 650_000 };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--min-size") {
      const next = args[i + 1];
      if (!next) {
        throw new Error("Missing value for --min-size");
      }
      options.minSizeBytes = parseInt(next, 10);
      i += 1;
    }
  }

  return options;
}

const options = parseArgs();

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is required.");
  process.exit(1);
}

async function main() {
  console.log(`${options.dryRun ? '[DRY RUN] ' : ''}Listing blobs larger than ${Math.round(options.minSizeBytes / 1024)}KB...\n`);

  const blobsToDelete: { url: string; pathname: string; size: number }[] = [];
  let totalSize = 0;

  // List all blobs
  let cursor: string | undefined;
  do {
    const result = await list({ limit: 1000, cursor });

    for (const blob of result.blobs) {
      if (blob.size > options.minSizeBytes) {
        blobsToDelete.push(blob);
        totalSize += blob.size;
        console.log(`Found: ${blob.pathname} (${Math.round(blob.size / 1024)}KB)`);
      }
    }

    cursor = result.cursor;
  } while (cursor);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Found ${blobsToDelete.length} blobs larger than ${Math.round(options.minSizeBytes / 1024)}KB`);
  console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

  if (blobsToDelete.length === 0) {
    console.log('\nNo blobs to delete.');
    return;
  }

  if (options.dryRun) {
    console.log('\nDry run mode: no blobs were deleted.');
    return;
  }

  console.log('\nDeleting blobs...');
  let deleted = 0;
  let errors = 0;

  for (const blob of blobsToDelete) {
    try {
      await del(blob.url);
      deleted++;
      console.log(`✓ Deleted: ${blob.pathname}`);
    } catch (error) {
      errors++;
      console.error(`✗ Failed to delete ${blob.pathname}:`, error instanceof Error ? error.message : 'unknown error');
    }
  }

  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Deleted: ${deleted}`);
  console.log(`Errors: ${errors}`);
  console.log(`Freed: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error('Unexpected failure:', error);
  process.exit(1);
});
