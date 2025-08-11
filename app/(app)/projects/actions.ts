"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const projectSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional().or(z.literal("")),
});

export async function createProject(formData: FormData): Promise<void> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") ?? undefined,
  });
  if (!parsed.success) return;
  const { name, address } = parsed.data;
  await db.project.create({ data: { name, address: address || null } });
  revalidatePath("/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  if (!id) return;
  await db.project.delete({ where: { id } });
  revalidatePath("/projects");
}



