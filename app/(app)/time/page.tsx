import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { createManualTime, deleteTimeEntry } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TimeEditForm } from "./TimeEditForm";
import { TimeForm } from "./TimeForm";
import { DeleteTimeButton } from "./DeleteTimeButton";

export default async function TimePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [projects, people, timeEntries, lastUsedEntry] = await Promise.all([
    db.project.findMany({ where: userId ? ({ userId } as any) : undefined, orderBy: { name: "asc" } }),
    db.person.findMany({ where: userId ? ({ userId } as any) : undefined, orderBy: { name: "asc" } }),
    db.timeEntry.findMany({ where: userId ? ({ userId } as any) : undefined, include: { project: true, person: true }, orderBy: { date: "desc" } }) as any,
    // Get the last used project and person from the most recent time entry
    db.timeEntry.findFirst({ 
      where: userId ? { userId } : undefined, 
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
                  <div className="font-medium">{t.project.name}</div>
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


