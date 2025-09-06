import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { createManualTime, deleteTimeEntry } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TimeEditForm } from "./TimeEditForm";
import { TimeForm } from "./TimeForm";
import { DeleteTimeButton } from "./DeleteTimeButton";
import { getUserAccessibleProjects } from "@/lib/project-permissions";

export default async function TimePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  // Get all projects user has access to (owned + shared)
  const accessibleProjects = await getUserAccessibleProjects(userId);
  const accessibleProjectIds = accessibleProjects.map(p => p.id);

  // Build where clause for time entries  
  const timeWhereClause = {
    OR: [
      { userId }, // User's own entries
      { projectId: { in: accessibleProjectIds } } // Entries in accessible projects
    ]
  };

  // Get people from all accessible projects
  const peopleWhereClause = {
    OR: [
      { userId }, // User's legacy personal people (if any still exist)
      { projectId: { in: accessibleProjectIds } } // People in accessible projects
    ]
  };

  const [projects, people, timeEntries, lastUsedEntry] = await Promise.all([
    // Return accessible projects with role information
    Promise.resolve(accessibleProjects),
    db.person.findMany({ 
      where: userId ? peopleWhereClause : undefined, 
      include: { project: { select: { name: true } } },
      orderBy: { name: "asc" } 
    }),
    db.timeEntry.findMany({ 
      where: userId ? timeWhereClause : undefined, 
      include: { 
        project: true, 
        person: true, 
        owner: { select: { name: true, id: true } } 
      }, 
      orderBy: { date: "desc" } 
    }) as any,
    // Get the last used project and person from the most recent time entry
    db.timeEntry.findFirst({ 
      where: userId ? timeWhereClause : undefined, 
      orderBy: { createdAt: "desc" },
      select: { projectId: true, personId: true }
    }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Time</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="font-medium mb-2">Manual entry</h2>
        <TimeForm projects={projects} people={people} today={today} lastUsedEntry={lastUsedEntry} />
      </section>
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-2">Recent time entries</h2>
        <ul className="divide-y divide-border">
          {timeEntries.map((t: any) => (
            <li key={t.id} className="py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">
                    {t.project.name}
                    {t.owner && t.owner.id !== userId && (
                      <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm font-normal">
                        by {t.owner.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()} — {t.durationMinutes} mins{t.person ? ` — ${t.person.name}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <TimeEditForm entry={t} projects={projects} people={people} />
                  <DeleteTimeButton entryId={t.id} projectName={t.project.name} duration={t.durationMinutes} />
                </div>
              </div>
              {t.notes ? <div className="text-sm text-muted-foreground">{t.notes}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


