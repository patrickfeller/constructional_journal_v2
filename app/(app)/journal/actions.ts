"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  projectId: z.string().min(1),
  date: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  photoUrls: z.array(z.string()).optional(),
  weather: z.string().optional().or(z.literal("")),
});

export async function createJournalEntry(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  
  const parsed = schema.safeParse({
    projectId: formData.get("projectId"),
    date: formData.get("date"),
    title: formData.get("title"),
    notes: formData.get("notes") ?? undefined,
    tags: formData.get("tags") ?? undefined,
    photoUrls: formData.getAll("photoUrls"),
    weather: formData.get("weather") ?? undefined,
  });
  if (!parsed.success) return;
  const { projectId, date, title, notes, tags, photoUrls, weather } = parsed.data;

  await db.journalEntry.create({
    data: {
      projectId,
      userId,
      date: new Date(date),
      title,
      notes: notes || null,
      tags: tags ? tryParseJson(tags) : undefined,
      weather: weather ? tryParseJson(weather) : undefined,
      photos: photoUrls && photoUrls.length > 0 ? { create: photoUrls.map((url) => ({ url })) } : undefined,
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

export async function updateJournalEntry(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  
  const id = String(formData.get("id"));
  if (!id) return;
  
  const parsed = schema.safeParse({
    projectId: formData.get("projectId"),
    date: formData.get("date"),
    title: formData.get("title"),
    notes: formData.get("notes") ?? undefined,
    tags: formData.get("tags") ?? undefined,
    photoUrls: formData.getAll("photoUrls"),
    weather: formData.get("weather") ?? undefined,
  });
  if (!parsed.success) return;
  
  const { projectId, date, title, notes, tags, photoUrls, weather } = parsed.data;

  // Only delete existing photos if new photos are provided
  if (photoUrls && photoUrls.length > 0) {
    // Delete existing photos
    await db.photo.deleteMany({
      where: { journalEntryId: id }
    });
  }

  // Update the journal entry
  await db.journalEntry.update({
    where: { id, userId } as any,
    data: {
      projectId,
      date: new Date(date),
      title,
      notes: notes || null,
      tags: tags ? tryParseJson(tags) : undefined,
      weather: weather ? tryParseJson(weather) : undefined,
      // Only create new photos if they were provided, otherwise keep existing ones
      ...(photoUrls && photoUrls.length > 0 && {
        photos: { create: photoUrls.map((url) => ({ url })) }
      }),
    },
  });
  
  revalidatePath("/journal");
}

export async function deleteJournalEntry(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  
  // Delete associated photos first
  await db.photo.deleteMany({
    where: { journalEntryId: id }
  });
  
  // Delete the journal entry
  await db.journalEntry.delete({ where: { id, userId } as any });
  revalidatePath("/journal");
}

