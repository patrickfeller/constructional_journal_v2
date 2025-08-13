import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

function startOfDay(d: Date) { d.setHours(0,0,0,0); return d; }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate()+days); return x; }

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const now = new Date();
  const weekStart = startOfDay(addDays(new Date(now), -now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const baseWhere: any = userId ? { userId } : {};
  const [all, week, month, entriesCount] = await Promise.all([
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: baseWhere }),
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: { ...baseWhere, date: { gte: weekStart } } }),
    db.timeEntry.aggregate({ _sum: { durationMinutes: true }, where: { ...baseWhere, date: { gte: monthStart } } }),
    db.journalEntry.count({ where: userId ? { userId } : undefined }),
  ]);

  const toHours = (mins?: number | null) => ((mins ?? 0) / 60).toFixed(1);

  const [recentTime, recentJournal] = await Promise.all([
    db.timeEntry.findMany({
      where: baseWhere,
      include: { project: true, person: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
    db.journalEntry.findMany({
      where: userId ? { userId } : undefined,
      include: { project: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const activity = [
    ...recentTime.map((t) => ({
      id: `t-${t.id}`,
      date: t.date,
      title: `${t.project.name}`,
      detail: `${toHours(t.durationMinutes)}h${t.person ? ` — ${t.person.name}` : ""}`,
      kind: "time" as const,
    })),
    ...recentJournal.map((e) => ({
      id: `j-${e.id}`,
      date: e.date,
      title: e.title,
      detail: e.project.name,
      kind: "journal" as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toHours(week._sum.durationMinutes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toHours(month._sum.durationMinutes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              All-time hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toHours(all._sum.durationMinutes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Journal entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entriesCount}</div>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet. Create a project to get started.</p>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => (
                <li key={a.id} className="py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{a.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                    {new Date(a.date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
