import { db } from "@/lib/db";
import { createProject, deleteProject } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectEditForm } from "./ProjectEditForm";
import { ProjectForm } from "./ProjectForm";
import { DeleteProjectButton } from "./DeleteProjectButton";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const projects = await db.project.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" } });
  
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <ProjectForm />
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
                <DeleteProjectButton projectId={p.id} projectName={p.name} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}


