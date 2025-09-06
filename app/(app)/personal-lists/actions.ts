"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validation schemas
const personalPersonSchema = z.object({
  name: z.string().min(1),
  hourlyRate: z.number().nullable(),
  defaultCompanyId: z.string().nullable(),
  notes: z.string().nullable(),
});

const personalCompanySchema = z.object({
  name: z.string().min(1),
  hourlyRateDefault: z.number().nullable(),
  address: z.string().nullable(),
  notes: z.string().nullable(),
});

/**
 * Create a personal person entry
 */
export async function createPersonalPerson(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = personalPersonSchema.safeParse({
    name: formData.get("name"),
    hourlyRate: formData.get("hourlyRate") ? Number(formData.get("hourlyRate")) : null,
    defaultCompanyId: formData.get("defaultCompanyId") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { name, hourlyRate, defaultCompanyId, notes } = parsed.data;

  try {
    // If defaultCompanyId is provided, verify it belongs to this user
    if (defaultCompanyId) {
      const company = await db.personalCompany.findUnique({
        where: { id: defaultCompanyId },
        select: { userId: true }
      });

      if (!company || company.userId !== userId) {
        return { success: false, error: "Invalid company selected" };
      }
    }

    await db.personalPerson.create({
      data: {
        userId,
        name,
        hourlyRate,
        defaultCompanyId,
        notes,
      }
    });

    revalidatePath("/personal-lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to create personal person:", error);
    return { success: false, error: "Failed to create person" };
  }
}

/**
 * Create a personal company entry
 */
export async function createPersonalCompany(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = personalCompanySchema.safeParse({
    name: formData.get("name"),
    hourlyRateDefault: formData.get("hourlyRateDefault") ? Number(formData.get("hourlyRateDefault")) : null,
    address: formData.get("address") || null,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { name, hourlyRateDefault, address, notes } = parsed.data;

  try {
    await db.personalCompany.create({
      data: {
        userId,
        name,
        hourlyRateDefault,
        address,
        notes,
      }
    });

    revalidatePath("/personal-lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to create personal company:", error);
    return { success: false, error: "Failed to create company" };
  }
}

/**
 * Delete a personal person entry
 */
export async function deletePersonalPerson(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const personId = formData.get("personId") as string;

  if (!personId) {
    return { success: false, error: "Missing person ID" };
  }

  try {
    // Verify ownership before deletion
    const person = await db.personalPerson.findUnique({
      where: { id: personId },
      select: { userId: true }
    });

    if (!person || person.userId !== userId) {
      return { success: false, error: "Person not found or access denied" };
    }

    await db.personalPerson.delete({
      where: { id: personId }
    });

    revalidatePath("/personal-lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete personal person:", error);
    return { success: false, error: "Failed to delete person" };
  }
}

/**
 * Delete a personal company entry
 */
export async function deletePersonalCompany(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const companyId = formData.get("companyId") as string;

  if (!companyId) {
    return { success: false, error: "Missing company ID" };
  }

  try {
    // Verify ownership before deletion
    const company = await db.personalCompany.findUnique({
      where: { id: companyId },
      select: { userId: true }
    });

    if (!company || company.userId !== userId) {
      return { success: false, error: "Company not found or access denied" };
    }

    // Check if any personal people are using this company
    const peopleUsingCompany = await db.personalPerson.count({
      where: { defaultCompanyId: companyId }
    });

    if (peopleUsingCompany > 0) {
      return { success: false, error: `Cannot delete company. ${peopleUsingCompany} people are associated with it.` };
    }

    await db.personalCompany.delete({
      where: { id: companyId }
    });

    revalidatePath("/personal-lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete personal company:", error);
    return { success: false, error: "Failed to delete company" };
  }
}
