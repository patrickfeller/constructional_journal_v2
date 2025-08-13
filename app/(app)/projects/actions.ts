"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const projectSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional().or(z.literal("")),
});

export async function createProject(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") ?? undefined,
  });
  if (!parsed.success) return;
  const { name, address } = parsed.data;
  await db.project.create({ data: { name, address: address || null, userId } });
  revalidatePath("/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  await db.project.delete({ where: { id, userId } as any });
  revalidatePath("/projects");
}



