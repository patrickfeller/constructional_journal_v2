"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const createPersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyId: z.string().optional().or(z.literal("")),
});

export async function createPerson(formData: FormData) {
  const parsed = createPersonSchema.safeParse({
    name: formData.get("name"),
    companyId: formData.get("companyId"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }
  const { name, companyId } = parsed.data;
  await db.person.create({
    data: {
      name,
      companyId: companyId || null,
    },
  });
  return { ok: true };
}


