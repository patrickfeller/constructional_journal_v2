import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserAccessibleProjects } from "@/lib/project-permissions";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all projects user has access to (owned + shared)
  const accessibleProjects = await getUserAccessibleProjects(userId);
  const accessibleProjectIds = accessibleProjects.map(p => p.id);

  // Fetch expenses from accessible projects
  const expenses = await db.expense.findMany({
    where: {
      projectId: { in: accessibleProjectIds }
    },
    include: {
      project: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true }
      }
    },
    orderBy: { date: "desc" }
  });

  return NextResponse.json(expenses);
}

