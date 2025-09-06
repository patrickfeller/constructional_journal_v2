import { db } from '@/lib/db';
import { ProjectRole } from '@prisma/client';

/**
 * Utility functions for checking project permissions and access control
 */

export interface ProjectPermission {
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
  canManagePeople: boolean;
  canManageCompanies: boolean;
  role: ProjectRole | null;
}

/**
 * Check if a user has access to a project and what permissions they have
 */
export async function checkProjectPermissions(
  userId: string, 
  projectId: string
): Promise<ProjectPermission> {
  // Check if user is project owner (legacy way)
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { userId: true }
  });

  if (project?.userId === userId) {
    return {
      canView: true,
      canEdit: true,
      canManageMembers: true,
      canManagePeople: true,
      canManageCompanies: true,
      role: 'OWNER'
    };
  }

  // Check if user is a project member
  const membership = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    },
    select: { role: true }
  });

  if (!membership) {
    return {
      canView: false,
      canEdit: false,
      canManageMembers: false,
      canManagePeople: false,
      canManageCompanies: false,
      role: null
    };
  }

  const { role } = membership;

  return {
    canView: true,
    canEdit: role === 'OWNER' || role === 'EDITOR',
    canManageMembers: role === 'OWNER',
    canManagePeople: role === 'OWNER' || role === 'EDITOR',
    canManageCompanies: role === 'OWNER' || role === 'EDITOR',
    role
  };
}

/**
 * Get all projects that a user has access to
 */
export async function getUserAccessibleProjects(userId: string) {
  const [ownedProjects, memberProjects] = await Promise.all([
    // Projects owned by user (legacy)
    db.project.findMany({
      where: { userId },
      select: { 
        id: true, 
        name: true, 
        address: true, 
        active: true,
        createdAt: true,
        latitude: true,
        longitude: true 
      }
    }),
    // Projects where user is a member
    db.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          where: { userId },
          select: { role: true }
        }
      }
    })
  ]);

  // Combine and deduplicate
  const projectMap = new Map();
  
  // Add owned projects
  ownedProjects.forEach(project => {
    projectMap.set(project.id, {
      ...project,
      role: 'OWNER' as ProjectRole,
      isOwner: true
    });
  });

  // Add member projects (don't override owned projects)
  memberProjects.forEach(project => {
    if (!projectMap.has(project.id)) {
      projectMap.set(project.id, {
        id: project.id,
        name: project.name,
        address: project.address,
        active: project.active,
        createdAt: project.createdAt,
        latitude: project.latitude,
        longitude: project.longitude,
        role: project.members[0]?.role || 'VIEWER',
        isOwner: false
      });
    }
  });

  return Array.from(projectMap.values());
}

/**
 * Get project-scoped people that a user can access
 */
export async function getProjectPeople(userId: string, projectId: string) {
  const permissions = await checkProjectPermissions(userId, projectId);
  
  if (!permissions.canView) {
    return [];
  }

  return db.person.findMany({
    where: { projectId },
    include: {
      company: true,
      addedByUser: {
        select: { id: true, name: true }
      },
      sourcePersonalPerson: {
        select: { id: true, name: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Get project-scoped companies that a user can access
 */
export async function getProjectCompanies(userId: string, projectId: string) {
  const permissions = await checkProjectPermissions(userId, projectId);
  
  if (!permissions.canView) {
    return [];
  }

  return db.company.findMany({
    where: { projectId },
    include: {
      addedByUser: {
        select: { id: true, name: true }
      },
      sourcePersonalCompany: {
        select: { id: true, name: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

/**
 * Check if user can edit a specific journal entry
 */
export async function canEditJournalEntry(userId: string, entryId: string): Promise<boolean> {
  const entry = await db.journalEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, projectId: true }
  });

  if (!entry) return false;

  // Can edit if it's their own entry
  if (entry.userId === userId) return true;

  // Can edit if they're project owner
  const permissions = await checkProjectPermissions(userId, entry.projectId);
  return permissions.role === 'OWNER';
}

/**
 * Check if user can edit a specific time entry
 */
export async function canEditTimeEntry(userId: string, entryId: string): Promise<boolean> {
  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, projectId: true }
  });

  if (!entry) return false;

  // Can edit if it's their own entry
  if (entry.userId === userId) return true;

  // Can edit if they're project owner
  const permissions = await checkProjectPermissions(userId, entry.projectId);
  return permissions.role === 'OWNER';
}
