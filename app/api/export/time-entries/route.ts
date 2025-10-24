import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserAccessibleProjects } from "@/lib/project-permissions";

function startOfDay(d: Date) { d.setHours(0,0,0,0); return d; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate()+days); return x; }

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    
    const projectId = searchParams.get("projectId");
    const personId = searchParams.get("personId");
    const companyId = searchParams.get("companyId");
    const timeline = searchParams.get("timeline") || "30";

    // Get accessible projects for user
    const accessibleProjects = await getUserAccessibleProjects(userId);
    const accessibleProjectIds = accessibleProjects.map(p => p.id);

    // Build where clause
    const whereBase: any = {
      OR: [
        { userId }, // User's own entries
        { projectId: { in: accessibleProjectIds } } // Entries in accessible projects
      ]
    };

    // Apply filters
    if (projectId) {
      whereBase.projectId = projectId;
      delete whereBase.OR; // When filtering by specific project, remove OR clause
    }
    if (personId) whereBase.personId = personId;
    if (companyId) whereBase.companyId = companyId;

    // Apply timeline filter
    if (timeline !== "all") {
      const days = parseInt(timeline);
      const startDate = addDays(new Date(), -days);
      whereBase.date = { gte: startOfDay(startDate) };
    }

    // Fetch time entries with related data
    const timeEntries = await db.timeEntry.findMany({
      where: whereBase,
      include: {
        project: true,
        person: {
          include: {
            company: true,
          }
        },
        company: true,
        owner: {
          select: {
            name: true,
            email: true,
          }
        },
      },
      orderBy: { date: "desc" },
    });

    // Generate CSV content
    const headers = [
      "Date",
      "Project",
      "Person", 
      "Company",
      "Duration (minutes)",
      "Duration (hours)",
      "Description",
      "Created By",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...timeEntries.map(entry => [
        entry.date.toISOString().split('T')[0], // Date
        entry.project?.name || "", // Project
        entry.person?.name || "", // Person
        entry.company?.name || entry.person?.company?.name || "", // Company (from time entry or person's company)
        entry.durationMinutes || 0, // Duration minutes
        ((entry.durationMinutes || 0) / 60).toFixed(2), // Duration hours
        `"${(entry.notes || "").replace(/"/g, '""')}"`, // Description (escaped)
        entry.owner?.name || entry.owner?.email || "", // Created By
        entry.createdAt.toISOString().split('T')[0] // Created At
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");

    // Generate filename with timestamp and filters
    const timestamp = new Date().toISOString().split('T')[0];
    const filterParts = [];
    if (projectId) filterParts.push("project");
    if (personId) filterParts.push("person");
    if (companyId) filterParts.push("company");
    const filterSuffix = filterParts.length > 0 ? `-${filterParts.join("-")}` : "";
    const timelineSuffix = timeline !== "30" ? `-${timeline}days` : "";
    
    const filename = `time-entries-${timestamp}${timelineSuffix}${filterSuffix}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
