import { db } from "@/lib/db";
import { createProject, deleteProject } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectEditForm } from "./ProjectEditForm";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const projects = await db.project.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" } });
  
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <form action={createProject} className="grid gap-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <input 
              name="name" 
              placeholder="Project name" 
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
              required 
            />
            <div className="space-y-1">
              <input 
                name="address" 
                placeholder="Full address" 
                className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
                required 
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Include street, city, country (e.g., &quot;123 Main St, Vienna, Austria&quot;)
              </p>
            </div>
          </div>
          <button className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 w-fit">Add Project</button>
        </form>
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">All Projects</h2>
        <ul className="divide-y">
          {projects.map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                {p.address ? <div className="text-sm text-gray-500">{p.address}</div> : null}
                {(p.latitude && p.longitude) && (
                  <div className="text-xs text-gray-400">
                    📍 {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <ProjectEditForm project={p} />
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


