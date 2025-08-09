"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const projectSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional().or(z.literal("")),
});

export async function createProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const { name, address } = parsed.data;
  await db.project.create({ data: { name, address: address || null } });
  return { ok: true };
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };
  await db.project.delete({ where: { id } });
  return { ok: true };
}


