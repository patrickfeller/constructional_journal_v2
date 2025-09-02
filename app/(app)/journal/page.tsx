import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { deleteJournalEntry } from "./actions";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JournalForm } from "./JournalForm";
import { JournalEditForm } from "./JournalEditForm";
import { DeleteEntryButton } from "./DeleteEntryButton";
import ReactMarkdown from 'react-markdown';

export default async function JournalListPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const [projects, entries, lastUsedProject] = await Promise.all([
    db.project.findMany({ where: userId ? ({ userId } as any) : undefined, orderBy: { name: "asc" } }),
    db.journalEntry.findMany({ where: userId ? { userId } : undefined, include: { photos: true, project: true }, orderBy: { date: "desc" } }),
    // Get the last used project from the most recent journal entry
    db.journalEntry.findFirst({ 
      where: userId ? { userId } : undefined, 
      orderBy: { createdAt: "desc" },
      select: { projectId: true }
    }),
  ]);
  

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Journal</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <JournalForm projects={projects} today={today} lastUsedProjectId={lastUsedProject?.projectId} />
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Recent entries</h2>
        <ul className="space-y-6">
          {entries.map((e) => (
            <li key={e.id} className="border rounded-xl p-6 bg-white dark:bg-gray-800">
              {/* Header row: Project, Title, Date, and Action Buttons */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {e.project.name}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {e.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(e.date).toLocaleDateString()}
                    </div>
                    {/* Weather Display */}
                    {e.weather && typeof e.weather === 'object' && e.weather !== null && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>{(e.weather as any).icon || '🌡️'}</span>
                        <span>{(e.weather as any).temperature}°C</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <JournalEditForm entry={e} projects={projects} />
                    <DeleteEntryButton entryId={e.id} entryTitle={e.title} />
                  </div>
                </div>
              </div>
              
              {/* Content: Notes and Photos */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Notes column - takes up less space */}
                <div className="lg:col-span-3">
                  {e.notes ? (
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <ReactMarkdown>{e.notes}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 italic">
                      No notes
                    </div>
                  )}
                </div>
                
                {/* Photos column - takes up more space */}
                <div className="lg:col-span-2">
                  {e.photos && e.photos.length > 0 ? (
                    <PhotoGrid photos={e.photos} className="mt-0" />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 italic text-sm">
                      No photos
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


