"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required"),
  hourlyRateDefault: z
    .union([z.coerce.number().positive().finite(), z.literal("")])
    .optional(),
});

export async function createCompany(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  const parsed = createCompanySchema.safeParse({
    name: formData.get("name"),
    hourlyRateDefault: formData.get("hourlyRateDefault"),
  });
  if (!parsed.success) {
    return;
  }
  const { name, hourlyRateDefault } = parsed.data;
  await db.company.create({
    data: {
      name,
      hourlyRateDefault:
        typeof hourlyRateDefault === "number" ? hourlyRateDefault : null,
      userId,
    },
  });
  revalidatePath("/companies");
}

export async function updateCompany(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  
  const id = String(formData.get("id"));
  if (!id) return;
  
  const parsed = createCompanySchema.safeParse({
    name: formData.get("name"),
    hourlyRateDefault: formData.get("hourlyRateDefault"),
  });
  if (!parsed.success) return;
  
  const { name, hourlyRateDefault } = parsed.data;

  await db.company.update({
    where: { id, userId } as any,
    data: {
      name,
      hourlyRateDefault:
        typeof hourlyRateDefault === "number" ? hourlyRateDefault : null,
    },
  });
  
  revalidatePath("/companies");
}

export async function deleteCompany(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  
  // Check if company has associated people
  const people = await db.person.findMany({
    where: { companyId: id, userId }
  });
  
  if (people.length > 0) {
    // If company has people, set companyId to null instead of deleting
    await db.person.updateMany({
      where: { companyId: id, userId },
      data: { companyId: null }
    });
  }
  
  // Delete the company
  await db.company.delete({ where: { id, userId } as any });
  revalidatePath("/companies");
}


