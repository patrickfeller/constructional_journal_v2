"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

const manualSchema = z.object({
  projectId: z.string().min(1),
  personId: z.string().optional().or(z.literal("")),
  date: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
  breakMinutes: z.coerce.number().int().nonnegative().default(0),
  notes: z.string().optional().or(z.literal("")),
});

export async function createManualTime(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  const parsed = manualSchema.safeParse({
    projectId: formData.get("projectId"),
    personId: formData.get("personId"),
    date: formData.get("date"),
    start: formData.get("start"),
    end: formData.get("end"),
    breakMinutes: formData.get("breakMinutes") ?? 0,
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return;
  const { projectId, personId, date, start, end, breakMinutes, notes } = parsed.data;

  const startAt = new Date(`${date}T${start}:00`);
  const endAt = new Date(`${date}T${end}:00`);
  const durationMinutes = Math.max(0, Math.round((endAt.getTime() - startAt.getTime()) / 60000) - breakMinutes);

  await db.timeEntry.create({
    data: {
      projectId,
      personId: personId || null,
      mode: "manual",
      date: new Date(date),
      startAt,
      endAt,
      breakMinutes,
      durationMinutes,
      notes: notes || null,
      userId,
    },
  });
  revalidatePath("/time");
}


