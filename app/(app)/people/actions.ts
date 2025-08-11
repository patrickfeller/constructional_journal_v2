"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().optional().or(z.literal("")),
});

export async function createPerson(formData: FormData): Promise<void> {
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
    },
  });
  revalidatePath("/people");
}


