import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { createManualTime, deleteTimeEntry } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TimeEditForm } from "./TimeEditForm";

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
        <form action={createManualTime} className="grid sm:grid-cols-3 gap-2 items-end">
          <select name="projectId" aria-label="Project" defaultValue={lastUsedEntry?.projectId || ""} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required>
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select name="personId" aria-label="Person" defaultValue={lastUsedEntry?.personId || ""} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800">
            <option value="">No person</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" name="date" aria-label="Date" defaultValue={today} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
          <div className="grid grid-cols-3 gap-2">
            <input type="time" name="start" aria-label="Start time" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
            <input type="time" name="end" aria-label="End time" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
            <input type="number" name="breakMinutes" min={0} aria-label="Break minutes" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" placeholder="Break (mins)" />
          </div>
          <input name="notes" placeholder="Notes (optional)" className="border rounded-md px-3 py-2 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
          <button className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">Save</button>
        </form>
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
                  <form action={deleteTimeEntry}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded">
                      Delete
                    </button>
                  </form>
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


