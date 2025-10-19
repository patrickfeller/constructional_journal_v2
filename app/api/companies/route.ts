import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAccessibleProjects } from "@/lib/project-permissions";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all projects user has access to
    const accessibleProjects = await getUserAccessibleProjects(userId);
    const accessibleProjectIds = accessibleProjects.map(p => p.id);

    // Get companies from all accessible projects
    const companiesWhereClause = {
      OR: [
        { userId }, // User's legacy personal companies (if any still exist)
        { projectId: { in: accessibleProjectIds } } // Companies in accessible projects
      ]
    };

    const companies = await db.company.findMany({
      where: companiesWhereClause,
      include: { 
        project: { select: { name: true } }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

