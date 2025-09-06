import { db } from "@/lib/db";
import { createProject, deleteProject } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectEditForm } from "./ProjectEditForm";
import { ProjectForm } from "./ProjectForm";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { getUserAccessibleProjects } from "@/lib/project-permissions";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return <div>Please log in to view projects.</div>;
  }
  
  const projects = await getUserAccessibleProjects(userId);
  
  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <ProjectForm />
      </section>
      <section className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm p-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-2">My Projects ({projects.length})</h2>
        <ul className="divide-y">
          {projects.map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/projects/${p.id}`}
                    className="font-medium hover:text-blue-600 transition-colors"
                  >
                    {p.name}
                  </Link>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.role === 'OWNER' ? 'bg-green-100 text-green-800' :
                    p.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {p.role}
                  </span>
                </div>
                {p.address ? <div className="text-sm text-gray-500">{p.address}</div> : null}
                {(p.latitude && p.longitude) && (
                  <div className="text-xs text-gray-400">
                    📍 {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {p.role === 'OWNER' && (
                  <>
                    <ProjectEditForm project={p} />
                    <DeleteProjectButton projectId={p.id} projectName={p.name} />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No projects yet. Create your first project above!
          </div>
        )}
      </section>
    </main>
  );
}


