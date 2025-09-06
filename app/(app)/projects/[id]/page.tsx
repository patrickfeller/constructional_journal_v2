import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkProjectPermissions, getProjectPeople, getProjectCompanies } from "@/lib/project-permissions";
import { notFound, redirect } from "next/navigation";
import { ProjectMemberList } from "./ProjectMemberList";
import { ProjectPersonList } from "./ProjectPersonList";
import { ProjectCompanyList } from "./ProjectCompanyList";
import { TransferFromPersonalButton } from "./TransferFromPersonalButton";
import Link from "next/link";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const projectId = resolvedParams.id;
  
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    redirect('/auth');
  }
  
  // Check permissions first
  const permissions = await checkProjectPermissions(userId, projectId);
  
  if (!permissions.canView) {
    notFound();
  }
  
  // Get project details
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: { id: true, name: true, email: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          inviter: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  
  if (!project) {
    notFound();
  }
  
  // Get project-scoped people and companies
  const [projectPeople, projectCompanies] = await Promise.all([
    getProjectPeople(userId, projectId),
    getProjectCompanies(userId, projectId)
  ]);
  
  // Get user's personal lists for transfer functionality
  const [personalPeople, personalCompanies] = permissions.canManagePeople ? await Promise.all([
    db.personalPerson.findMany({
      where: { userId },
      include: { defaultCompany: true },
      orderBy: { name: 'asc' }
    }),
    db.personalCompany.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })
  ]) : [[], []];
  
  // Convert Decimal fields to numbers for client components
  const projectPeopleWithNumbers = projectPeople.map(person => ({
    ...person,
    hourlyRate: person.hourlyRate ? Number(person.hourlyRate) : null,
    company: person.company ? {
      ...person.company,
      hourlyRateDefault: person.company.hourlyRateDefault ? Number(person.company.hourlyRateDefault) : null
    } : null
  }));
  
  const projectCompaniesWithNumbers = projectCompanies.map(company => ({
    ...company,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null
  }));
  
  const personalPeopleWithNumbers = personalPeople.map(person => ({
    ...person,
    hourlyRate: person.hourlyRate ? Number(person.hourlyRate) : null,
    defaultCompany: person.defaultCompany ? {
      ...person.defaultCompany,
      hourlyRateDefault: person.defaultCompany.hourlyRateDefault ? Number(person.defaultCompany.hourlyRateDefault) : null
    } : null
  }));
  
  const personalCompaniesWithNumbers = personalCompanies.map(company => ({
    ...company,
    hourlyRateDefault: company.hourlyRateDefault ? Number(company.hourlyRateDefault) : null
  }));

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Project Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>→</span>
          <span>{project.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            {project.address && (
              <p className="text-muted-foreground">{project.address}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              permissions.role === 'OWNER' ? 'bg-green-100 text-green-800' :
              permissions.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {permissions.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Members */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <h2 className="font-medium mb-4">Project Members ({project.members.length + (project.owner ? 1 : 0)})</h2>
            <ProjectMemberList 
              project={project}
              members={project.members}
              canManageMembers={permissions.canManageMembers}
              currentUserId={userId}
            />
          </section>
        </div>

        {/* Project People */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Project People ({projectPeopleWithNumbers.length})</h2>
              {permissions.canManagePeople && personalPeopleWithNumbers.length > 0 && (
                <TransferFromPersonalButton
                  type="people"
                  projectId={projectId}
                  personalItems={personalPeopleWithNumbers}
                  existingItems={projectPeopleWithNumbers}
                />
              )}
            </div>
            <ProjectPersonList
              people={projectPeopleWithNumbers}
              companies={projectCompaniesWithNumbers}
              canEdit={permissions.canManagePeople}
              projectId={projectId}
            />
          </section>
        </div>

        {/* Project Companies */}
        <div className="space-y-4">
          <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Project Companies ({projectCompaniesWithNumbers.length})</h2>
              {permissions.canManageCompanies && personalCompaniesWithNumbers.length > 0 && (
                <TransferFromPersonalButton
                  type="companies"
                  projectId={projectId}
                  personalItems={personalCompaniesWithNumbers}
                  existingItems={projectCompaniesWithNumbers}
                />
              )}
            </div>
            <ProjectCompanyList
              companies={projectCompaniesWithNumbers}
              canEdit={permissions.canManageCompanies}
              projectId={projectId}
            />
          </section>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="rounded-2xl bg-card text-card-foreground shadow-sm p-4 border">
        <h2 className="font-medium mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link 
            href={`/journal?projectId=${projectId}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Journal Entry
          </Link>
          <Link 
            href={`/time?projectId=${projectId}`}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            Log Time
          </Link>
          <Link 
            href={`/dashboard?projectId=${projectId}`}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
          >
            View Analytics
          </Link>
        </div>
      </section>
    </main>
  );
}
