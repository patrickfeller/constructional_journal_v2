"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().optional().or(z.literal("")),
});

export async function createPerson(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  const parsed = createPersonSchema.safeParse({
    name: formData.get("name"),
    companyId: formData.get("companyId"),
  });
  if (!parsed.success) {
    return;
  }
  const { name, companyId } = parsed.data;
  await db.person.create({
    data: {
      name,
      companyId: companyId || null,
      userId,
    },
  });
  revalidatePath("/people");
}

export async function updatePerson(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  
  const id = String(formData.get("id"));
  if (!id) return;
  
  const parsed = createPersonSchema.safeParse({
    name: formData.get("name"),
    companyId: formData.get("companyId"),
  });
  if (!parsed.success) return;
  
  const { name, companyId } = parsed.data;

  await db.person.update({
    where: { id, userId } as any,
    data: {
      name,
      companyId: companyId || null,
    },
  });
  
  revalidatePath("/people");
}

export async function deletePerson(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  
  // Check if person has associated time entries
  const timeEntries = await db.timeEntry.findMany({
    where: { personId: id, userId }
  });
  
  if (timeEntries.length > 0) {
    // If person has time entries, set personId to null instead of deleting
    await db.timeEntry.updateMany({
      where: { personId: id, userId },
      data: { personId: null }
    });
  }
  
  // Delete the person
  await db.person.delete({ where: { id, userId } as any });
  revalidatePath("/people");
}


