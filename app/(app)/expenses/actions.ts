"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canEditExpense } from "@/lib/project-permissions";

const expenseSchema = z.object({
  projectId: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().min(1),
  company: z.string().min(1),
  companyId: z.string().optional().or(z.literal("")),
  invoiceUrl: z.string().optional().or(z.literal("")),
  date: z.string().min(1),
});

export async function createExpense(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;

  const parsed = expenseSchema.safeParse({
    projectId: formData.get("projectId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    company: formData.get("company"),
    companyId: formData.get("companyId"),
    invoiceUrl: formData.get("invoiceUrl"),
    date: formData.get("date"),
  });

  if (!parsed.success) return;
  
  const { projectId, amount, description, company, companyId, invoiceUrl, date } = parsed.data;

  await db.expense.create({
    data: {
      projectId,
      userId,
      amount,
      description,
      company,
      companyId: companyId || null,
      invoiceUrl: invoiceUrl || null,
      date: new Date(date),
    },
  });

  revalidatePath("/expenses");
}

export async function updateExpense(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;

  const id = String(formData.get("id"));
  if (!id) return;

  // Check if user has permission to edit this expense
  const hasPermission = await canEditExpense(userId, id);
  if (!hasPermission) return;

  const parsed = expenseSchema.safeParse({
    projectId: formData.get("projectId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    company: formData.get("company"),
    companyId: formData.get("companyId"),
    invoiceUrl: formData.get("invoiceUrl"),
    date: formData.get("date"),
  });

  if (!parsed.success) return;

  const { projectId, amount, description, company, companyId, invoiceUrl, date } = parsed.data;

  await db.expense.update({
    where: { id },
    data: {
      projectId,
      amount,
      description,
      company,
      companyId: companyId || null,
      invoiceUrl: invoiceUrl || null,
      date: new Date(date),
    },
  });

  revalidatePath("/expenses");
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;

  // Check if user has permission to delete this expense
  const hasPermission = await canEditExpense(userId, id);
  if (!hasPermission) return;

  await db.expense.delete({ where: { id } });
  revalidatePath("/expenses");
}

