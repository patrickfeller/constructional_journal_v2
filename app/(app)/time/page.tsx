import { db } from "@/lib/db";
import { createManualTime } from "./actions";

export default async function TimePage() {
  const [projects, people, timeEntries] = await Promise.all([
    db.project.findMany({ orderBy: { name: "asc" } }),
    db.person.findMany({ orderBy: { name: "asc" } }),
    db.timeEntry.findMany({ include: { project: true, person: true }, orderBy: { date: "desc" } }),
  ]);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Time</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="font-medium mb-2">Manual entry</h2>
        <form action={createManualTime} className="grid sm:grid-cols-3 gap-2 items-end">
          <select name="projectId" aria-label="Project" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required>
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select name="personId" aria-label="Person" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800">
            <option value="">No person</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" name="date" aria-label="Date" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
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
          {timeEntries.map((t) => (
            <li key={t.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.project.name}</div>
                <div className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString()} — {t.durationMinutes} mins{t.person ? ` — ${t.person.name}` : ""}</div>
              </div>
              {t.notes ? <div className="text-sm text-muted-foreground">{t.notes}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


