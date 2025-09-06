"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkProjectPermissions } from "@/lib/project-permissions";

// Validation schemas
const inviteMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
});

const addPersonSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  hourlyRate: z.number().nullable(),
  companyId: z.string().nullable(),
});

const addCompanySchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  hourlyRateDefault: z.number().nullable(),
});

const transferItemsSchema = z.object({
  projectId: z.string().min(1),
  itemIds: z.array(z.string()).min(1),
  type: z.enum(["people", "companies"]),
});

const updatePersonSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  hourlyRate: z.number().nullable(),
  companyId: z.string().nullable(),
});

const updateCompanySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  hourlyRateDefault: z.number().nullable(),
});

/**
 * Invite a member to a project
 */
export async function inviteProjectMember(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = inviteMemberSchema.safeParse({
    projectId: formData.get("projectId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { projectId, email, role } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManageMembers) {
    return { success: false, error: "You don't have permission to manage members" };
  }

  try {
    // Check if user exists by email
    const targetUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!targetUser) {
      return { success: false, error: "User with this email doesn't exist in the system" };
    }

    // Check if user is already a member
    const existingMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id
        }
      }
    });

    if (existingMember) {
      return { success: false, error: "User is already a member of this project" };
    }

    // Create project member invitation
    await db.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role,
        invitedBy: userId,
        joinedAt: new Date(), // Auto-join for now, can be changed to pending invitations later
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to invite member:", error);
    return { success: false, error: "Failed to invite member" };
  }
}

/**
 * Add a person to a project
 */
export async function addProjectPerson(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = addPersonSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    hourlyRate: formData.get("hourlyRate") ? Number(formData.get("hourlyRate")) : null,
    companyId: formData.get("companyId") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { projectId, name, hourlyRate, companyId } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManagePeople) {
    return { success: false, error: "You don't have permission to manage people" };
  }

  try {
    // If companyId is provided, verify it belongs to this project
    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
        select: { projectId: true }
      });

      if (!company || company.projectId !== projectId) {
        return { success: false, error: "Invalid company selected" };
      }
    }

    await db.person.create({
      data: {
        name,
        hourlyRate,
        companyId,
        projectId,
        addedBy: userId,
        addedAt: new Date(),
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add person:", error);
    return { success: false, error: "Failed to add person" };
  }
}

/**
 * Add a company to a project
 */
export async function addProjectCompany(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = addCompanySchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    hourlyRateDefault: formData.get("hourlyRateDefault") ? Number(formData.get("hourlyRateDefault")) : null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { projectId, name, hourlyRateDefault } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManageCompanies) {
    return { success: false, error: "You don't have permission to manage companies" };
  }

  try {
    await db.company.create({
      data: {
        name,
        hourlyRateDefault,
        projectId,
        addedBy: userId,
        addedAt: new Date(),
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add company:", error);
    return { success: false, error: "Failed to add company" };
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const projectId = formData.get("projectId") as string;
  const memberUserId = formData.get("memberUserId") as string;

  if (!projectId || !memberUserId) {
    return { success: false, error: "Missing required data" };
  }

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManageMembers) {
    return { success: false, error: "You don't have permission to manage members" };
  }

  try {
    await db.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId
        }
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return { success: false, error: "Failed to remove member" };
  }
}

/**
 * Transfer personal items (people or companies) to a project
 */
export async function transferPersonalItemsToProject(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = transferItemsSchema.safeParse({
    projectId: formData.get("projectId"),
    itemIds: JSON.parse(formData.get("itemIds") as string || "[]"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { projectId, itemIds, type } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (type === "people" && !permissions.canManagePeople) {
    return { success: false, error: "You don't have permission to manage people" };
  }
  if (type === "companies" && !permissions.canManageCompanies) {
    return { success: false, error: "You don't have permission to manage companies" };
  }

  try {
    if (type === "people") {
      // Transfer personal people to project
      const personalPeople = await db.personalPerson.findMany({
        where: { 
          id: { in: itemIds },
          userId // Ensure user owns these items
        },
        include: { defaultCompany: true }
      });

      if (personalPeople.length !== itemIds.length) {
        return { success: false, error: "Some selected people were not found" };
      }

      // Create project people from personal people
      for (const personalPerson of personalPeople) {
        // Check if person with same name already exists in project
        const existingPerson = await db.person.findFirst({
          where: { 
            projectId,
            name: personalPerson.name
          }
        });

        if (existingPerson) {
          continue; // Skip if already exists
        }

        // Find corresponding project company if personal person has a default company
        let projectCompanyId = null;
        if (personalPerson.defaultCompany) {
          const projectCompany = await db.company.findFirst({
            where: {
              projectId,
              name: personalPerson.defaultCompany.name
            }
          });
          projectCompanyId = projectCompany?.id || null;
        }

        await db.person.create({
          data: {
            name: personalPerson.name,
            hourlyRate: personalPerson.hourlyRate,
            companyId: projectCompanyId,
            projectId,
            addedBy: userId,
            sourcePersonalPersonId: personalPerson.id,
            addedAt: new Date(),
          }
        });
      }
    } else if (type === "companies") {
      // Transfer personal companies to project
      const personalCompanies = await db.personalCompany.findMany({
        where: { 
          id: { in: itemIds },
          userId // Ensure user owns these items
        }
      });

      if (personalCompanies.length !== itemIds.length) {
        return { success: false, error: "Some selected companies were not found" };
      }

      // Create project companies from personal companies
      for (const personalCompany of personalCompanies) {
        // Check if company with same name already exists in project
        const existingCompany = await db.company.findFirst({
          where: { 
            projectId,
            name: personalCompany.name
          }
        });

        if (existingCompany) {
          continue; // Skip if already exists
        }

        await db.company.create({
          data: {
            name: personalCompany.name,
            hourlyRateDefault: personalCompany.hourlyRateDefault,
            projectId,
            addedBy: userId,
            sourcePersonalCompanyId: personalCompany.id,
            addedAt: new Date(),
          }
        });
      }
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to transfer items:", error);
    return { success: false, error: "Failed to transfer items" };
  }
}

/**
 * Update a project person
 */
export async function updateProjectPerson(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = updatePersonSchema.safeParse({
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    hourlyRate: formData.get("hourlyRate") ? Number(formData.get("hourlyRate")) : null,
    companyId: formData.get("companyId") || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { id, projectId, name, hourlyRate, companyId } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManagePeople) {
    return { success: false, error: "You don't have permission to manage people" };
  }

  try {
    // Verify the person belongs to this project
    const existingPerson = await db.person.findUnique({
      where: { id },
      select: { projectId: true }
    });

    if (!existingPerson || existingPerson.projectId !== projectId) {
      return { success: false, error: "Person not found in this project" };
    }

    // If companyId is provided, verify it belongs to this project
    if (companyId) {
      const company = await db.company.findUnique({
        where: { id: companyId },
        select: { projectId: true }
      });

      if (!company || company.projectId !== projectId) {
        return { success: false, error: "Invalid company selected" };
      }
    }

    await db.person.update({
      where: { id },
      data: {
        name,
        hourlyRate,
        companyId,
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update person:", error);
    return { success: false, error: "Failed to update person" };
  }
}

/**
 * Remove a project person
 */
export async function removeProjectPerson(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const personId = formData.get("personId") as string;
  const projectId = formData.get("projectId") as string;

  if (!personId || !projectId) {
    return { success: false, error: "Missing required data" };
  }

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManagePeople) {
    return { success: false, error: "You don't have permission to manage people" };
  }

  try {
    // Verify the person belongs to this project
    const existingPerson = await db.person.findUnique({
      where: { id: personId },
      select: { projectId: true }
    });

    if (!existingPerson || existingPerson.projectId !== projectId) {
      return { success: false, error: "Person not found in this project" };
    }

    await db.person.delete({
      where: { id: personId }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove person:", error);
    return { success: false, error: "Failed to remove person" };
  }
}

/**
 * Update a project company
 */
export async function updateProjectCompany(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = updateCompanySchema.safeParse({
    id: formData.get("id"),
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    hourlyRateDefault: formData.get("hourlyRateDefault") ? Number(formData.get("hourlyRateDefault")) : null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { id, projectId, name, hourlyRateDefault } = parsed.data;

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManageCompanies) {
    return { success: false, error: "You don't have permission to manage companies" };
  }

  try {
    // Verify the company belongs to this project
    const existingCompany = await db.company.findUnique({
      where: { id },
      select: { projectId: true }
    });

    if (!existingCompany || existingCompany.projectId !== projectId) {
      return { success: false, error: "Company not found in this project" };
    }

    await db.company.update({
      where: { id },
      data: {
        name,
        hourlyRateDefault,
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update company:", error);
    return { success: false, error: "Failed to update company" };
  }
}

/**
 * Remove a project company
 */
export async function removeProjectCompany(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const companyId = formData.get("companyId") as string;
  const projectId = formData.get("projectId") as string;

  if (!companyId || !projectId) {
    return { success: false, error: "Missing required data" };
  }

  // Check permissions
  const permissions = await checkProjectPermissions(userId, projectId);
  if (!permissions.canManageCompanies) {
    return { success: false, error: "You don't have permission to manage companies" };
  }

  try {
    // Verify the company belongs to this project
    const existingCompany = await db.company.findUnique({
      where: { id: companyId },
      select: { projectId: true }
    });

    if (!existingCompany || existingCompany.projectId !== projectId) {
      return { success: false, error: "Company not found in this project" };
    }

    // Check if any people are using this company
    const peopleUsingCompany = await db.person.count({
      where: { companyId }
    });

    if (peopleUsingCompany > 0) {
      return { success: false, error: `Cannot remove company. ${peopleUsingCompany} people are associated with it.` };
    }

    await db.company.delete({
      where: { id: companyId }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove company:", error);
    return { success: false, error: "Failed to remove company" };
  }
}
