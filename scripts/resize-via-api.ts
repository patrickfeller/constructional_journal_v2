/**
 * Client script to call the server-side resize API
 * This avoids firewall issues by running the resize logic on Vercel's servers
 * 
 * Usage:
 *   npx tsx scripts/resize-via-api.ts [--dry-run] [--limit 10]
 */

interface CliOptions {
  dryRun: boolean;
  limit: number;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = { dryRun: false, limit: 10 };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--limit") {
      const next = args[i + 1];
      if (!next) {
        throw new Error("Missing value for --limit");
      }
      options.limit = parseInt(next, 10);
      i += 1;
    }
  }

  return options;
}

const options = parseArgs();

const MIGRATION_SECRET = process.env.MIGRATION_SECRET;
const API_URL = process.env.API_URL || 'http://localhost:3000';

if (!MIGRATION_SECRET) {
  console.error("MIGRATION_SECRET environment variable is required.");
  process.exit(1);
}

async function main() {
  console.log(`${options.dryRun ? '[DRY RUN] ' : ''}Resizing up to ${options.limit} blobs via API...`);
  console.log(`API URL: ${API_URL}/api/resize-blobs\n`);

  try {
    const response = await fetch(`${API_URL}/api/resize-blobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: MIGRATION_SECRET,
        limit: options.limit,
        dryRun: options.dryRun,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }

    const data = await response.json();

    console.log('\n=== SUMMARY ===');
    console.log(`Processed: ${data.summary.processed}`);
    console.log(`Optimized: ${data.summary.optimized}`);
    console.log(`Skipped: ${data.summary.skipped}`);
    console.log(`Errors: ${data.summary.errors}`);
    console.log(`Total saved: ${(data.summary.totalSaved / (1024 * 1024)).toFixed(2)} MB`);
    
    if (data.summary.dryRun) {
      console.log('\nDry run mode: no changes were made.');
    }

    console.log('\n=== DETAILS ===');
    data.results.forEach((result: any) => {
      const sizeStr = result.originalSize ? `${Math.round(result.originalSize / 1024)}KB` : 'unknown';
      const savedStr = result.savedBytes ? ` → ${Math.round(result.newSize / 1024)}KB (saved ${Math.round(result.savedBytes / 1024)}KB)` : '';
      console.log(`[${result.status}] ${result.pathname} (${sizeStr}${savedStr}) ${result.reason || ''}`);
    });

  } catch (error) {
    console.error('Failed to resize blobs:', error);
    process.exit(1);
  }
}

main();
