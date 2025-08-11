import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function saveFilesToPublicUploads(files: File[]): Promise<string[]> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const urls: string[] = [];
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



