import Image from "next/image";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";
export const dynamic = "force-dynamic";
import { createJournalEntry } from "./actions";
import { PhotoGrid } from "@/components/PhotoGrid";

export default async function JournalListPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [projects, entries] = await Promise.all([
    db.project.findMany({ where: userId ? ({ userId } as any) : undefined, orderBy: { name: "asc" } }),
    db.journalEntry.findMany({ where: userId ? { userId } : undefined, include: { photos: true, project: true }, orderBy: { date: "desc" } }),
  ]);
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Journal</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <form action={createJournalEntry} className="grid gap-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <select name="projectId" aria-label="Project" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required>
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="date" name="date" aria-label="Date" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
            <input name="title" placeholder="Title" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
          </div>
          <textarea name="notes" aria-label="Notes" placeholder="Notes (Markdown supported)" className="border rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
          <input type="file" name="photos" aria-label="Photos" accept="image/*" multiple className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
          <button className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 w-fit">Add Entry</button>
        </form>
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Recent entries</h2>
        <ul className="space-y-4">
          {entries.map((e) => (
            <li key={e.id} className="border rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="text-sm text-gray-500 ml-4 flex-shrink-0">{new Date(e.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{e.project.name}</div>
                  {e.notes ? (
                    <div className="mt-2 text-sm text-card-foreground whitespace-pre-wrap break-words">
                      {e.notes}
                    </div>
                  ) : null}
                </div>
                <div className="md:col-span-1">
                  <PhotoGrid photos={e.photos} className="mt-0" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


