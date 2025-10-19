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

    // Get people from all accessible projects
    const peopleWhereClause = {
      OR: [
        { userId }, // User's legacy personal people (if any still exist)
        { projectId: { in: accessibleProjectIds } } // People in accessible projects
      ]
    };

    const people = await db.person.findMany({
      where: peopleWhereClause,
      include: { 
        project: { select: { name: true } },
        company: { select: { name: true } }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

