import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

export async function saveFilesToPublicUploads(files: File[]): Promise<string[]> {
  const urls: string[] = [];

  // Prefer Vercel Blob if configured
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const isVercel = !!process.env.VERCEL;
  if (blobToken) {
    for (const file of files) {
      const ext = path.extname(file.name) || "";
      const name = `${crypto.randomBytes(8).toString("hex")}${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const contentType = (file as any).type || undefined;
      const { url } = await put(name, new Blob([arrayBuffer], { type: contentType }), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        contentType,
      });
      urls.push(url);
    }
    return urls;
  }

  // In Vercel prod, the file system is read-only. Require Blob token there.
  if (isVercel) {
    throw new Error("Uploads are disabled without BLOB_READ_WRITE_TOKEN in production. Configure Vercel Blob and set BLOB_READ_WRITE_TOKEN.");
  }

  // Fallback to local FS when writable (useful for local dev only)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}
  for (const file of files) {
    const ext = path.extname(file.name) || "";
    const name = crypto.randomBytes(8).toString("hex") + ext;
    const dest = path.join(uploadsDir, name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(dest, Buffer.from(arrayBuffer));
    urls.push(`/uploads/${name}`);
  }
  return urls;
}



