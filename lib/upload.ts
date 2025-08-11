import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function saveFilesToPublicUploads(files: File[]): Promise<string[]> {
  // On serverless (e.g., Vercel) the filesystem is read-only. In that case, skip saving
  // and return no URLs so the app can continue without crashing.
  if (process.env.VERCEL) {
    console.warn("File uploads are disabled on read-only runtime. Configure remote storage (e.g., S3/Vercel Blob). Returning empty list.");
    return [];
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name) || "";
    const name = crypto.randomBytes(8).toString("hex") + ext;
    const dest = path.join(uploadsDir, name);
    const arrayBuffer = await file.arrayBuffer();
    try {
      await fs.writeFile(dest, Buffer.from(arrayBuffer));
      urls.push(`/uploads/${name}`);
    } catch (err: any) {
      if (err && (err.code === "EROFS" || err.code === "EACCES")) {
        console.warn("File system not writable. Skipping file save. Configure remote storage.");
        return [];
      }
      throw err;
    }
  }
  return urls;
}



