"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

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


