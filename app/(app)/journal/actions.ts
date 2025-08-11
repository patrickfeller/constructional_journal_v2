"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { saveFilesToPublicUploads } from "@/lib/upload";
import { revalidatePath } from "next/cache";

const schema = z.object({
  projectId: z.string().min(1),
  date: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

export async function createJournalEntry(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    projectId: formData.get("projectId"),
    date: formData.get("date"),
    title: formData.get("title"),
    notes: formData.get("notes") ?? undefined,
    tags: formData.get("tags") ?? undefined,
  });
  if (!parsed.success) return;
  const { projectId, date, title, notes, tags } = parsed.data;

  const files = formData.getAll("photos").filter((f) => f instanceof File) as File[];
  const urls = files.length ? await saveFilesToPublicUploads(files) : [];

  const demoUser = await db.user.findFirst({ where: { email: "demo@example.com" } });
  const userId = demoUser?.id ?? undefined;
  await db.journalEntry.create({
    data: {
      projectId,
      userId: userId!,
      date: new Date(date),
      title,
      notes: notes || null,
      tags: tags ? tryParseJson(tags) : undefined,
      photos: { create: urls.map((url) => ({ url })) },
    },
  });
  revalidatePath("/journal");
}

function tryParseJson(value?: string) {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

