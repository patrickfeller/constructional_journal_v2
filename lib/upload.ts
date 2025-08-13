import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function saveFilesToPublicUploads(files: File[]): Promise<string[]> {
  const urls: string[] = [];

  // Check if we're in Vercel production
  const isVercel = !!process.env.VERCEL;
  
  if (isVercel) {
    // In Vercel production, we need to use client-side uploads
    // For now, throw an error to guide the user
    throw new Error(
      "File uploads in production require client-side implementation. " +
      "Please implement client uploads using @vercel/blob/client or disable photo uploads temporarily."
    );
  }

  // Fallback to local FS for development
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



