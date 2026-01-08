/**
 * Test if we can download a single blob successfully
 */

import { list, head } from "@vercel/blob";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is required.");
    process.exit(1);
  }

  console.log("Getting first blob...");
  
  const result = await list({ limit: 1 });
  if (result.blobs.length === 0) {
    console.log("No blobs found");
    return;
  }

  const blob = result.blobs[0];
  console.log(`Testing download of: ${blob.pathname} (${Math.round(blob.size / 1024)}KB)`);

  const metadata = await head(blob.pathname);
  console.log(`Metadata URL: ${metadata.url}`);
  console.log(`Metadata downloadUrl: ${metadata.downloadUrl}`);

  // Try with authorization header
  console.log("\nTrying with Authorization header...");
  try {
    const response = await fetch(metadata.url, {
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✓ Successfully downloaded ${buffer.byteLength} bytes`);
    }
  } catch (error) {
    console.error("Failed with auth header:", error);
  }

  // Try without authorization (for public blobs)
  console.log("\nTrying public URL (no auth)...");
  try {
    const response = await fetch(metadata.url);
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log(`✓ Successfully downloaded ${buffer.byteLength} bytes`);
    }
  } catch (error) {
    console.error("Failed without auth:", error);
  }

  // Try downloadUrl if it exists
  if (metadata.downloadUrl) {
    console.log("\nTrying downloadUrl...");
    try {
      const response = await fetch(metadata.downloadUrl);
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        console.log(`✓ Successfully downloaded ${buffer.byteLength} bytes`);
      }
    } catch (error) {
      console.error("Failed with downloadUrl:", error);
    }
  }
}

main();
