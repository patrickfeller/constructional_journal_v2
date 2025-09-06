import { db } from "@/lib/db";
import { DashboardTimeChart, type TimePoint } from "@/components/DashboardTimeChart";
import { DashboardFilters } from "@/components/DashboardFilters";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAccessibleProjects } from "@/lib/project-permissions";

function startOfDay(d: Date) { d.setHours(0,0,0,0); return d; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate()+days); return x; }

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ projectId?: string; personId?: string; companyId?: string }> }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const resolved = await searchParams;
  const now = new Date();
  const weekStart = startOfDay(addDays(new Date(now), -now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all projects user has access to (owned + shared)
  const accessibleProjects = await getUserAccessibleProjects(userId);
  const accessibleProjectIds = accessibleProjects.map(p => p.id);

  // Build base where clause that includes accessible projects
  const whereBase: any = userId ? {
    OR: [
      { userId }, // User's own entries
      { projectId: { in: accessibleProjectIds } } // Entries in accessible projects
    ]
  } : {};
  
  // Apply additional filters if provided
  if (resolved?.projectId) {
    whereBase.projectId = resolved.projectId;
    delete whereBase.OR; // When filtering by specific project, remove OR clause
  }
  if (resolved?.personId) whereBase.personId = resolved.personId;
  if (resolved?.companyId) whereBase.companyId = resolved.companyId;

  // Build journal where clause for journal entry count
  const journalWhereClause = userId ? {
    OR: [
      { userId }, // User's own entries
      { projectId: { in: accessibleProjectIds } } // Entries in accessible projects
    ]
  } : undefined;

  const [all, week, month, entriesCount] = await Promise.all([
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: whereBase }),
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: { ...whereBase, date: { gte: weekStart } } }),
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: { ...whereBase, date: { gte: monthStart } } }),
    db.journalEntry.count({ where: journalWhereClause }),
  ]);

  const toHours = (mins?: number | null) => ((mins ?? 0) / 60).toFixed(1);

  const hoursByProject = await db.timeEntry.groupBy({ by: ["projectId"], _sum: { durationMinutes: true }, where: whereBase });
  
  // Get people and companies from all accessible projects
  const peopleWhereClause = userId ? {
    OR: [
      { userId }, // User's legacy personal people (if any still exist)
      { projectId: { in: accessibleProjectIds } } // People in accessible projects
    ]
  } : undefined;

  const companiesWhereClause = userId ? {
    OR: [
      { userId }, // User's legacy personal companies (if any still exist)
      { projectId: { in: accessibleProjectIds } } // Companies in accessible projects
    ]
  } : undefined;

  const [projects, people, companies] = await Promise.all([
    // Return accessible projects with role information
    Promise.resolve(accessibleProjects),
    db.person.findMany({ where: peopleWhereClause, orderBy: { name: "asc" } }),
    db.company.findMany({ where: companiesWhereClause, orderBy: { name: "asc" } }),
  ]);
  const projectMap = new Map(projects.map(p => [p.id, p.name] as const));

  // Build daily time series for the last 30 days
  const since = addDays(new Date(now), -29);
  const entries = await db.timeEntry.findMany({
    where: { ...whereBase, date: { gte: startOfDay(new Date(since)) } },
    select: { date: true, durationMinutes: true },
    orderBy: { date: "asc" },
  });
  const byDay = new Map<string, number>();
  entries.forEach(e => {
    const key = startOfDay(new Date(e.date)).toISOString().slice(0,10);
    byDay.set(key, (byDay.get(key) ?? 0) + (e.durationMinutes ?? 0));
  });
  const series: TimePoint[] = Array.from({ length: 30 }).map((_, i) => {
    const d = addDays(new Date(since), i);
    const key = d.toISOString().slice(0,10);
    return { date: key.slice(5), hours: Math.round(((byDay.get(key) ?? 0) / 60) * 10) / 10 };
  });

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Hours this week" value={toHours(week._sum.durationMinutes)} />
        <Card label="Hours this month" value={toHours(month._sum.durationMinutes)} />
        <Card label="All-time hours" value={toHours(all._sum.durationMinutes)} />
        <Card label="Journal entries" value={String(entriesCount)} />
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Hours by project</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {hoursByProject.map(h => (
            <li key={h.projectId} className="border rounded-md p-3 flex items-center justify-between">
              <span>{projectMap.get(h.projectId) ?? h.projectId}</span>
              <span className="font-medium">{toHours(h._sum.durationMinutes)}h</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Time spent (last 30 days)</h2>
        <DashboardFilters
          projects={projects.map(p => ({ id: p.id, name: p.name }))}
          people={people.map(p => ({ id: p.id, name: p.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
          selected={{ projectId: resolved?.projectId, personId: resolved?.personId, companyId: resolved?.companyId }}
        />
        <DashboardTimeChart data={series} />
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
      <div className="text-sm/6 text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

// filters moved to DashboardFilters client component


